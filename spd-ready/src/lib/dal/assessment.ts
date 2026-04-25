import { cache } from 'react'
import { getCurrentUser, requireRole } from '@/lib/dal/auth'
import { readStore, writeStore } from '@/lib/local-db/store'
import { ASSESSMENT_QUESTIONS } from '@/lib/local-db/questions'
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

// ── Reads (cached) ────────────────────────────────────────────

export const getActiveQuestions = cache(async (): Promise<AssessmentQuestion[]> => {
  return ASSESSMENT_QUESTIONS
})

export const getLatestInProgressAssessment = cache(async (): Promise<StudentAssessment | null> => {
  const user = await getCurrentUser()
  if (!user) return null
  const store = readStore()
  const all = Object.values(store.assessments).filter(
    a => a.student_user_id === user.id && a.status === 'in_progress'
  )
  if (all.length === 0) return null
  const latest = all.sort((a, b) => b.started_at.localeCompare(a.started_at))[0]
  const responses = store.responses[latest.id] ?? []
  return { ...latest, created_at: latest.started_at, response_count: responses.length }
})

export const getLatestCompletedAssessment = cache(async (): Promise<StudentAssessment | null> => {
  const user = await getCurrentUser()
  if (!user) return null
  const store = readStore()
  const all = Object.values(store.assessments).filter(
    a => a.student_user_id === user.id && a.status === 'completed'
  )
  if (all.length === 0) return null
  return all.sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''))[0] as StudentAssessment
})

export const getResponseForQuestion = cache(async (
  assessmentId: string,
  questionId: string
): Promise<AssessmentResponse | null> => {
  const store = readStore()
  const responses = store.responses[assessmentId] ?? []
  const r = responses.find(r => r.question_id === questionId)
  if (!r) return null
  return {
    id: `${assessmentId}-${questionId}`,
    assessment_id: assessmentId,
    question_id: questionId,
    selected_answer: r.selected_answer,
    score: r.score,
    created_at: new Date().toISOString(),
  }
})

// ── Cooldown check ────────────────────────────────────────────

export async function checkCooldown(userId: string): Promise<{ allowed: boolean; nextAttemptAt?: Date }> {
  const store = readStore()
  const completed = Object.values(store.assessments).filter(
    a => a.student_user_id === userId && a.status === 'completed' && a.submitted_at
  )
  if (completed.length === 0) return { allowed: true }
  const latest = completed.sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''))[0]
  const submittedAt = new Date(latest.submitted_at!)
  const cooldownEnd = new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000)
  if (new Date() < cooldownEnd) return { allowed: false, nextAttemptAt: cooldownEnd }
  return { allowed: true }
}

// ── Writes ────────────────────────────────────────────────────

export async function createAssessment(): Promise<string> {
  const user = await requireRole('student')
  const store = readStore()
  const id = crypto.randomUUID()
  store.assessments[id] = {
    id,
    student_user_id: user.id,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    submitted_at: null,
    overall_score: null,
    technical_score: null,
    situational_score: null,
    process_score: null,
    behavior_score: null,
    instrument_score: null,
    reliability_score: null,
  }
  store.responses[id] = []
  writeStore(store)
  return id
}

export async function saveAnswerToDb(
  assessmentId: string,
  questionId: string,
  selectedAnswer: string,
  question: AssessmentQuestion
): Promise<void> {
  await requireRole('student')
  const scoreMap = question.scoring_key_json.score_map
  const score = scoreMap[selectedAnswer] ?? 0
  const store = readStore()
  if (!store.responses[assessmentId]) store.responses[assessmentId] = []
  const existing = store.responses[assessmentId].findIndex(r => r.question_id === questionId)
  const entry = { assessment_id: assessmentId, question_id: questionId, selected_answer: selectedAnswer, score, category: question.category }
  if (existing >= 0) {
    store.responses[assessmentId][existing] = entry
  } else {
    store.responses[assessmentId].push(entry)
  }
  writeStore(store)
}

export async function computeCategoryScores(assessmentId: string): Promise<CategoryScores> {
  const store = readStore()
  const responses = store.responses[assessmentId] ?? []
  const byCategory: Record<string, number[]> = {}
  for (const r of responses) {
    const cat = r.category
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(r.score)
  }
  const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) * 100 : 0
  return {
    technical:   avg(byCategory['technical']   ?? []),
    situational: avg(byCategory['situational'] ?? []),
    process:     avg(byCategory['process']     ?? []),
    behavior:    avg(byCategory['behavioral']  ?? []),
    instrument:  avg(byCategory['instrument']  ?? []),
    reliability: avg(byCategory['reliability'] ?? []),
  }
}

export async function finalizeAssessment(
  assessmentId: string,
  categoryScores: CategoryScores,
  overallScore: number
): Promise<void> {
  const user = await requireRole('student')
  const store = readStore()
  if (!store.assessments[assessmentId]) throw new Error('Assessment not found')
  store.assessments[assessmentId] = {
    ...store.assessments[assessmentId],
    status: 'completed',
    submitted_at: new Date().toISOString(),
    overall_score: overallScore,
    technical_score: categoryScores.technical,
    situational_score: categoryScores.situational,
    process_score: categoryScores.process,
    behavior_score: categoryScores.behavior,
    instrument_score: categoryScores.instrument,
    reliability_score: categoryScores.reliability,
  }
  writeStore(store)
}
