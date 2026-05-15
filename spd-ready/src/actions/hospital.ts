'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/dal/auth'
import { sendPlacementEmail } from '@/lib/email'
import { readStore } from '@/lib/local-db/store'
import {
  upsertHospitalProfile,
  createOpening,
  updateOpeningStatus,
  updateApplicationStatus,
  applyToOpening,
  submitFeedback,
} from '@/lib/dal/hospital'

// ── upsertHospitalProfileAction ───────────────────────────────

export async function upsertHospitalProfileAction(formData: FormData): Promise<void> {
  await requireRole('hospital')

  const facilityType = formData.get('facility_type') as 'acute_care' | 'ambulatory' | 'long_term' | 'other'
  const deptSize = formData.get('dept_size') as 'small' | 'medium' | 'large'
  const caseVolume = formData.get('case_volume') as 'low' | 'medium' | 'high'
  const complexityLevel = formData.get('complexity_level') as 'basic' | 'moderate' | 'advanced'
  const teachingCapacity = formData.get('teaching_capacity') as 'limited' | 'moderate' | 'strong'
  const preceptorStrength = formData.get('preceptor_strength') as 'limited' | 'moderate' | 'strong'

  await upsertHospitalProfile({
    organization_name: (formData.get('organization_name') as string) ?? '',
    site_name: (formData.get('site_name') as string) ?? '',
    city: (formData.get('city') as string) ?? '',
    state: (formData.get('state') as string) ?? '',
    facility_type: facilityType,
    dept_size: deptSize,
    case_volume: caseVolume,
    complexity_level: complexityLevel,
    teaching_capacity: teachingCapacity,
    preceptor_strength: preceptorStrength,
    extern_slots: parseInt((formData.get('extern_slots') as string) ?? '1', 10),
    scheduling_preferences: (formData.get('scheduling_preferences') as string) ?? '',
    notes: (formData.get('notes') as string) ?? '',
  })

  revalidatePath('/', 'layout')
  redirect('/hospital/dashboard')
}

// ── createOpeningAction ───────────────────────────────────────

export async function createOpeningAction(formData: FormData): Promise<void> {
  await requireRole('hospital')

  const requirementsRaw = (formData.get('requirements') as string) ?? ''
  const requirements = requirementsRaw
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  await createOpening({
    title: (formData.get('title') as string) ?? '',
    start_date: (formData.get('start_date') as string) ?? '',
    end_date: (formData.get('end_date') as string) ?? '',
    slots: parseInt((formData.get('slots') as string) ?? '1', 10),
    shift: (formData.get('shift') as string) ?? '',
    requirements,
  })

  revalidatePath('/hospital/openings')
  redirect('/hospital/openings')
}

// ── updateOpeningStatusAction ─────────────────────────────────

export async function updateOpeningStatusAction(formData: FormData): Promise<void> {
  await requireRole('hospital')
  const openingId = formData.get('opening_id') as string
  const status = formData.get('status') as 'open' | 'closed' | 'filled'
  if (!openingId || !status) return

  await updateOpeningStatus(openingId, status)
  revalidatePath('/hospital/openings')
  redirect('/hospital/openings')
}

// ── updateApplicationStatusAction ────────────────────────────

export async function updateApplicationStatusAction(formData: FormData): Promise<void> {
  await requireRole('hospital')
  const appId = formData.get('app_id') as string
  const status = formData.get('status') as 'applied' | 'under_review' | 'accepted' | 'waitlisted' | 'rejected'
  const openingId = formData.get('opening_id') as string
  const notes = (formData.get('notes') as string) ?? undefined

  if (!appId || !status) return
  await updateApplicationStatus(appId, status, notes)

  // Send email notification on terminal status changes (PLATFORM-02)
  if (status === 'accepted' || status === 'waitlisted' || status === 'rejected') {
    const store = readStore()
    const app = store.applications[appId]
    const opening = app ? store.openings[app.externship_id] : null
    const studentProfile = app ? store.student_profiles[app.student_user_id] : null
    const studentUser = app ? store.users[app.student_user_id] : null
    const hospitalProfile = opening ? store.hospital_profiles[opening.hospital_user_id] : null

    if (studentUser && studentProfile && opening && hospitalProfile) {
      await sendPlacementEmail({
        to: studentUser.email,
        studentName: studentProfile.first_name,
        status,
        openingTitle: opening.title,
        siteName: hospitalProfile.site_name,
      })
    }
  }

  revalidatePath(`/hospital/openings/${openingId}`)
  redirect(`/hospital/openings/${openingId}`)
}

// ── submitFeedbackAction ──────────────────────────────────────

export async function submitFeedbackAction(formData: FormData): Promise<void> {
  await requireRole('hospital')
  const appId = formData.get('app_id') as string
  const openingId = formData.get('opening_id') as string
  if (!appId) return

  await submitFeedback(appId, {
    attendance_score: parseInt((formData.get('attendance_score') as string) ?? '3', 10),
    coachability_score: parseInt((formData.get('coachability_score') as string) ?? '3', 10),
    professionalism_score: parseInt((formData.get('professionalism_score') as string) ?? '3', 10),
    communication_score: parseInt((formData.get('communication_score') as string) ?? '3', 10),
    quality_score: parseInt((formData.get('quality_score') as string) ?? '3', 10),
    recommended: formData.get('recommended') === 'true',
    notes: (formData.get('notes') as string) ?? '',
  })

  revalidatePath(`/hospital/openings/${openingId}/candidates/${appId}`)
  redirect(`/hospital/openings/${openingId}/candidates/${appId}?feedback=submitted`)
}

// ── applyToOpeningAction (student) ────────────────────────────

export async function applyToOpeningAction(formData: FormData): Promise<void> {
  await requireRole('student')
  const openingId = formData.get('opening_id') as string
  if (!openingId) redirect('/student/openings?error=missing_opening')

  const result = await applyToOpening(openingId)
  if (result.error) {
    redirect(`/student/openings?error=${encodeURIComponent(result.error)}`)
  }

  revalidatePath('/student/applications')
  redirect('/student/applications?applied=1')
}
