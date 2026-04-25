'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/dal/auth'
import { upsertStudentProfile, getStudentProfile } from '@/lib/dal/student'
import {
  checkCooldown,
  createAssessment,
  saveAnswerToDb,
  getActiveQuestions,
  computeCategoryScores,
  finalizeAssessment,
} from '@/lib/dal/assessment'
import {
  computeReadinessScore,
  deriveReadinessTier,
  deriveStrengthsAndGrowth,
} from '@/lib/dal/scoring'
import { readStore, writeStore } from '@/lib/local-db/store'

type ActionState = { error?: string } | null

// ── Validation schema ─────────────────────────────────────────
const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2-letter abbreviation'),
  travel_radius: z.coerce.number().int().min(0).max(500),
  cert_status: z.enum(['none', 'in_progress', 'crcst', 'cis', 'other']),
  program_name: z.string().min(1, 'Program name is required'),
  expected_completion_date: z.string().min(1, 'Expected completion date is required'),
  shift_availability: z.string().min(1, 'At least one shift must be selected'),
  transportation_reliable: z.coerce.boolean(),
  preferred_environment: z.enum(['acute_care', 'ambulatory', 'either']),
})

// ── upsertStudentProfileAction ────────────────────────────────
// Used with useActionState — MUST have (prevState, formData) signature.
export async function upsertStudentProfileAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Role guard — redirects to /login if not authenticated, /unauthorized if wrong role
  await requireRole('student')

  const raw = {
    first_name: (formData.get('first_name') as string) ?? '',
    last_name: (formData.get('last_name') as string) ?? '',
    city: (formData.get('city') as string) ?? '',
    state: (formData.get('state') as string) ?? '',
    travel_radius: formData.get('travel_radius') ?? '0',
    cert_status: (formData.get('cert_status') as string) ?? 'none',
    program_name: (formData.get('program_name') as string) ?? '',
    expected_completion_date: (formData.get('expected_completion_date') as string) ?? '',
    // shift_availability comes as comma-separated string from hidden input
    shift_availability: (formData.get('shift_availability') as string) ?? '',
    transportation_reliable: formData.get('transportation_reliable') ?? 'true',
    preferred_environment: (formData.get('preferred_environment') as string) ?? 'either',
  }

  const validated = profileSchema.safeParse(raw)
  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors
    const firstError = Object.values(fieldErrors).flat()[0]
    return { error: firstError ?? 'Please check your entries and try again.' }
  }

  const { shift_availability, ...rest } = validated.data
  const shiftArray = shift_availability.split(',').map(s => s.trim()).filter(Boolean)

  try {
    await upsertStudentProfile({ ...rest, shift_availability: shiftArray })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to save profile.' }
  }

  revalidatePath('/', 'layout')
  redirect('/student/dashboard')
}

// ── startAssessmentAction ─────────────────────────────────────────────────────
// Called when student clicks "Start Assessment" on the entry gate page.
// Security: checks profile completion AND retake cooldown server-side — not just in UI.
// URL contract (locked): redirects to /student/assessment/${assessmentId}/1 on success.
export async function startAssessmentAction(): Promise<void> {
  const user = await requireRole('student')

  // Profile gate — defense in depth (UI also redirects, but Server Action is the security boundary)
  const profile = await getStudentProfile()
  if (!profile?.profile_complete) {
    redirect('/student/onboarding?error=profile_incomplete')
  }

  // Retake cooldown check — ASSESS-05
  const cooldown = await checkCooldown(user.id)
  if (!cooldown.allowed) {
    const nextAt = cooldown.nextAttemptAt?.toISOString() ?? ''
    redirect(`/student/assessment?cooldown=${encodeURIComponent(nextAt)}`)
  }

  const assessmentId = await createAssessment()
  redirect(`/student/assessment/${assessmentId}/1`)
}

// ── saveAnswerAction ──────────────────────────────────────────────────────────
// Called on every "Next" click in the assessment (via form action).
// CRITICAL: await all DB writes BEFORE redirect — redirect() throws and interrupts async ops.
// URL contract (locked): redirects to /student/assessment/${assessmentId}/${step+1} for steps 1-29,
// then calls submitAssessmentAction on step 30.
export async function saveAnswerAction(formData: FormData): Promise<void> {
  await requireRole('student')

  const assessmentId = formData.get('assessmentId') as string
  const questionId = formData.get('questionId') as string
  const selectedAnswer = formData.get('answer') as string
  const currentStep = parseInt(formData.get('step') as string, 10)

  if (!assessmentId || !questionId || !selectedAnswer) {
    redirect(`/student/assessment?error=missing_fields`)
  }

  // Load questions to get the scoring_key_json for this question
  const questions = await getActiveQuestions()
  const question = questions.find(q => q.id === questionId)

  if (!question) {
    redirect(`/student/assessment?error=question_not_found`)
  }

  // Write answer BEFORE redirect — redirect() throws and would interrupt the write (Pitfall 3)
  await saveAnswerToDb(assessmentId, questionId, selectedAnswer, question)

  if (currentStep >= 30) {
    // All questions answered — trigger scoring
    await submitAssessmentAction(assessmentId)
    return // submitAssessmentAction redirects to /student/results
  }

  redirect(`/student/assessment/${assessmentId}/${currentStep + 1}`)
}

// ── submitAssessmentAction ────────────────────────────────────────────────────
// Called internally by saveAnswerAction on the final step.
// Also callable directly for edge cases (e.g., retry after interrupted submit).
export async function submitAssessmentAction(assessmentId: string): Promise<void> {
  const user = await requireRole('student')

  // Count responses from local store — must be >= 30 before scoring
  const store = readStore()
  const responses = store.responses[assessmentId] ?? []
  if (responses.length < 30) {
    redirect(`/student/assessment?error=incomplete_assessment`)
  }

  const categoryScores = await computeCategoryScores(assessmentId)
  const overallScore = computeReadinessScore(categoryScores)
  const readinessTier = deriveReadinessTier(overallScore)
  const { strengths, growthAreas } = deriveStrengthsAndGrowth(categoryScores)

  await finalizeAssessment(assessmentId, categoryScores, overallScore)

  // Update student_profiles in local store
  const profile = store.student_profiles[user.id]
  if (profile) {
    store.student_profiles[user.id] = {
      ...profile,
      readiness_score: overallScore,
      readiness_tier: readinessTier,
      strengths_json: strengths,
      growth_areas_json: growthAreas,
      updated_at: new Date().toISOString(),
    }
    writeStore(store)
  }

  revalidatePath('/', 'layout')
  redirect('/student/results')
}
