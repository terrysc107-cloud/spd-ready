import { cache } from 'react'
import { getAuthUser, requireAuth } from '@/lib/dal/auth'
import { createClient } from '@/lib/supabase/server'
import { getActiveAssessmentQuestions } from '@/lib/dal/questions'
import type { CategoryScores } from '@/lib/dal/scoring'

// ── Types ─────────────────────────────────────────────────────

export type AssessmentQuestion = {
  id: string
  category: string
  type: string
  prompt: string
  options_json: Record<string, string>
  scoring_key_json: {
    correct: string
    score_map: Record<string, number>
  }
  active: boolean
  created_at: string
}

export type StudentAssessment = {
  id: string
  student_user_id: string
  status: 'in_progress' | 'completed'
  started_at: string
  submitted_at: string | null
  overall_score: number | null
  technical_score: number | null
  situational_score: number | null
  process_score: number | null
  behavior_score: number | null
  instrument_score: number | null
  reliability_score: number | null
  created_at: string
  response_count?: number
}

export type AssessmentResponse = {
  id: string
  assessment_id: string
  question_id: string
  selected_answer: string | null
  score: number | null
  created_at: string
}

type AssessmentRow = {
  id: string
  staff_id: string
  status: 'in_progress' | 'completed'
  started_at: string
  submitted_at: string | null
  overall_score: number | null
  technical_score: number | null
  situational_score: number | null
  process_score: number | null
  behavior_score: number | null
  instrument_score: number | null
  reliability_score: number | null
  created_at: string
}

function mapAssessment(r: AssessmentRow, responseCount?: number): StudentAssessment {
  return {
    id: r.id,
    student_user_id: r.staff_id,
    status: r.status,
    started_at: r.started_at,
    submitted_at: r.submitted_at,
    overall_score: r.overall_score,
    technical_score: r.technical_score,
    situational_score: r.situational_score,
    process_score: r.process_score,
    behavior_score: r.behavior_score,
    instrument_score: r.instrument_score,
    reliability_score: r.reliability_score,
    created_at: r.created_at,
    ...(responseCount !== undefined ? { response_count: responseCount } : {}),
  }
}

// ── Reads (cached) ────────────────────────────────────────────

export const getActiveQuestions = cache(async (): Promise<AssessmentQuestion[]> => {
  return getActiveAssessmentQuestions()
})

export const getLatestInProgressAssessment = cache(async (): Promise<StudentAssessment | null> => {
  const user = await getAuthUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_assessments')
    .select('*')
    .eq('staff_id', user.id)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle<AssessmentRow>()
  if (!data) return null
  const { count } = await supabase
    .from('assessment_responses')
    .select('id', { count: 'exact', head: true })
    .eq('assessment_id', data.id)
  return mapAssessment(data, count ?? 0)
})

export const getLatestCompletedAssessment = cache(async (): Promise<StudentAssessment | null> => {
  const user = await getAuthUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_assessments')
    .select('*')
    .eq('staff_id', user.id)
    .eq('status', 'completed')
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle<AssessmentRow>()
  return data ? mapAssessment(data) : null
})

export const getResponseForQuestion = cache(async (
  assessmentId: string,
  questionId: string
): Promise<AssessmentResponse | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('assessment_responses')
    .select('id, assessment_id, question_id, selected_answer, score, created_at')
    .eq('assessment_id', assessmentId)
    .eq('question_id', questionId)
    .maybeSingle<AssessmentResponse>()
  return data ?? null
})

// ── Cooldown check ────────────────────────────────────────────

export async function checkCooldown(userId: string): Promise<{ allowed: boolean; nextAttemptAt?: Date }> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_assessments')
    .select('submitted_at')
    .eq('staff_id', userId)
    .eq('status', 'completed')
    .not('submitted_at', 'is', null)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ submitted_at: string }>()
  if (!data?.submitted_at) return { allowed: true }
  const cooldownEnd = new Date(new Date(data.submitted_at).getTime() + 24 * 60 * 60 * 1000)
  if (new Date() < cooldownEnd) return { allowed: false, nextAttemptAt: cooldownEnd }
  return { allowed: true }
}

// ── Writes ────────────────────────────────────────────────────

export async function createAssessment(): Promise<string> {
  const user = await requireAuth()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_assessments')
    .insert({ staff_id: user.id, status: 'in_progress' })
    .select('id')
    .single<{ id: string }>()
  if (error || !data) throw new Error(`Failed to create assessment: ${error?.message ?? 'no row'}`)
  return data.id
}

export async function saveAnswerToDb(
  assessmentId: string,
  questionId: string,
  selectedAnswer: string,
  question: AssessmentQuestion
): Promise<void> {
  await requireAuth()
  const supabase = await createClient()
  const score = question.scoring_key_json.score_map[selectedAnswer] ?? 0
  const { error } = await supabase.from('assessment_responses').upsert(
    {
      assessment_id: assessmentId,
      question_id: questionId,
      selected_answer: selectedAnswer,
      score,
      category: question.category,
    },
    { onConflict: 'assessment_id,question_id' }
  )
  if (error) throw new Error(`Failed to save answer: ${error.message}`)
}

export async function countResponses(assessmentId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('assessment_responses')
    .select('id', { count: 'exact', head: true })
    .eq('assessment_id', assessmentId)
  return count ?? 0
}

export async function computeCategoryScores(assessmentId: string): Promise<CategoryScores> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('assessment_responses')
    .select('category, score')
    .eq('assessment_id', assessmentId)
    .returns<{ category: string | null; score: number | null }[]>()
  const byCategory: Record<string, number[]> = {}
  for (const r of data ?? []) {
    const cat = r.category ?? 'technical'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(r.score ?? 0)
  }
  const avg = (arr: number[]) => (arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) * 100 : 0)
  return {
    technical:   avg(byCategory['technical']   ?? []),
    situational: avg(byCategory['situational'] ?? []),
    process:     avg(byCategory['process']     ?? []),
    behavior:    avg(byCategory['behavioral']  ?? []), // DB category value is 'behavioral'
    instrument:  avg(byCategory['instrument']  ?? []),
    reliability: avg(byCategory['reliability'] ?? []),
  }
}

export async function finalizeAssessment(
  assessmentId: string,
  categoryScores: CategoryScores,
  overallScore: number
): Promise<void> {
  await requireAuth()
  const supabase = await createClient()
  const { error } = await supabase
    .from('student_assessments')
    .update({
      status: 'completed',
      submitted_at: new Date().toISOString(),
      overall_score: overallScore,
      technical_score: categoryScores.technical,
      situational_score: categoryScores.situational,
      process_score: categoryScores.process,
      behavior_score: categoryScores.behavior,
      instrument_score: categoryScores.instrument,
      reliability_score: categoryScores.reliability,
    })
    .eq('id', assessmentId)
  if (error) throw new Error(`Failed to finalize assessment: ${error.message}`)
}
