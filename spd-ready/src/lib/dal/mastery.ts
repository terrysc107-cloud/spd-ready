import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { ConceptMastery, ConceptId, LearningDomain, ConfidenceTap } from '@/lib/local-db/types'

export const MASTERY_WEIGHTS = {
  quiz_accuracy: 0.35,
  confidence_calibration: 0.25,
  spaced_repetition: 0.20,
  context_variety: 0.10,
  recency_decay: 0.10,
} as const

export const SR_INTERVALS_DAYS = [1, 3, 7, 21, 60] as const  // D-08
export const RECENCY_DECAY_DAYS = 90  // D-09

export function computeMasteryScore(m: Pick<ConceptMastery, 'quiz_accuracy' | 'confidence_calibration' | 'spaced_repetition' | 'context_variety' | 'recency_decay'>): number {
  const score =
    m.quiz_accuracy * MASTERY_WEIGHTS.quiz_accuracy +
    m.confidence_calibration * MASTERY_WEIGHTS.confidence_calibration +
    m.spaced_repetition * MASTERY_WEIGHTS.spaced_repetition +
    m.context_variety * MASTERY_WEIGHTS.context_variety +
    m.recency_decay * MASTERY_WEIGHTS.recency_decay
  return Math.round(Math.max(0, Math.min(100, score)))
}

// D-09: linear decay 100 → 0 over 90 days without review
export function computeRecencyDecay(lastReviewedAt: string, now: Date = new Date()): number {
  if (!lastReviewedAt) return 0
  const last = new Date(lastReviewedAt).getTime()
  const days = (now.getTime() - last) / (1000 * 60 * 60 * 24)
  if (days <= 0) return 100
  if (days >= RECENCY_DECAY_DAYS) return 0
  return Math.round(100 * (1 - days / RECENCY_DECAY_DAYS))
}

// D-07: confidence_calibration component update
// Rewards: (certain + correct) +6; (not_sure + wrong) +3; (pretty_sure + correct) +3; (pretty_sure + wrong) -1
// Penalty: (certain + wrong) -12 (high-conf+wrong is dangerous)
// Neutral: (not_sure + correct) 0
export function updateCalibration(prior: number, correct: boolean, tap: ConfidenceTap | null): number {
  let delta = 0
  if (tap === 'certain' && correct) delta = 6
  else if (tap === 'certain' && !correct) delta = -12
  else if (tap === 'pretty_sure' && correct) delta = 3
  else if (tap === 'pretty_sure' && !correct) delta = -1
  else if (tap === 'not_sure' && !correct) delta = 3
  else if (tap === 'not_sure' && correct) delta = 0
  return Math.max(0, Math.min(100, prior + delta))
}

// D-08: SR interval ladder. On correct answer, advance to next interval. On wrong, reset to 1d.
export function advanceSpacedRepetition(currentIntervalDays: number, correct: boolean): { nextIntervalDays: number; nextReviewAt: string } {
  let nextIntervalDays: number
  if (!correct) {
    nextIntervalDays = SR_INTERVALS_DAYS[0]  // reset to 1
  } else {
    const idx = SR_INTERVALS_DAYS.findIndex(d => d === currentIntervalDays)
    nextIntervalDays = idx === -1 ? SR_INTERVALS_DAYS[0] : SR_INTERVALS_DAYS[Math.min(idx + 1, SR_INTERVALS_DAYS.length - 1)]
  }
  const next = new Date(Date.now() + nextIntervalDays * 24 * 60 * 60 * 1000)
  return { nextIntervalDays, nextReviewAt: next.toISOString() }
}

// SR component score: maps current interval position to 0..100. Higher interval = stronger memory.
function srComponent(intervalDays: number): number {
  const idx = SR_INTERVALS_DAYS.findIndex(d => d === intervalDays)
  if (idx === -1) return 0
  return Math.round(((idx + 1) / SR_INTERVALS_DAYS.length) * 100)
}

// ============================================================
// Persistence (Supabase spd_ready.concept_mastery)
// Rows are keyed by staff_id = auth.users.id. The TS ConceptMastery
// type uses `user_id`; we map staff_id -> user_id at the boundary.
// ============================================================

type ConceptMasteryRow = {
  id: string
  staff_id: string
  concept_id: string
  domain: string
  quiz_accuracy: number
  confidence_calibration: number
  spaced_repetition: number
  context_variety: number
  recency_decay: number
  mastery_score: number
  review_interval_days: number
  next_review_at: string
  last_reviewed_at: string
  attempts: number
  distinct_questions_seen: number
  updated_at: string
}

function mapRow(r: ConceptMasteryRow): ConceptMastery {
  return {
    id: r.id,
    user_id: r.staff_id,
    concept_id: r.concept_id,
    domain: r.domain as LearningDomain,
    quiz_accuracy: r.quiz_accuracy,
    confidence_calibration: r.confidence_calibration,
    spaced_repetition: r.spaced_repetition,
    context_variety: r.context_variety,
    recency_decay: r.recency_decay,
    mastery_score: r.mastery_score,
    review_interval_days: r.review_interval_days,
    next_review_at: r.next_review_at,
    last_reviewed_at: r.last_reviewed_at,
    attempts: r.attempts,
    distinct_questions_seen: r.distinct_questions_seen,
    updated_at: r.updated_at,
  }
}

// Single-attempt mastery update. Read-modify-write one concept_mastery row.
export async function applyAttempt(params: {
  userId: string
  conceptId: ConceptId
  domain: LearningDomain
  questionId: string
  correct: boolean
  partial: boolean  // partial credit treated as correct=true for SR but accuracy=50%
  confidenceTap: ConfidenceTap | null
}): Promise<ConceptMastery> {
  const { userId, conceptId, domain, questionId, correct, partial, confidenceTap } = params
  const supabase = await createClient()
  const nowIso = new Date().toISOString()

  const { data: existing } = await supabase
    .from('concept_mastery')
    .select('*')
    .eq('staff_id', userId)
    .eq('concept_id', conceptId)
    .maybeSingle<ConceptMasteryRow>()

  // Seed defaults for a brand-new concept row
  const prior = existing ?? {
    quiz_accuracy: 0,
    confidence_calibration: 50,  // neutral start
    spaced_repetition: 0,
    context_variety: 0,
    recency_decay: 100,
    review_interval_days: 0,
    attempts: 0,
    distinct_questions_seen: 0,
  }

  const newAttempts = prior.attempts + 1
  const credit = correct ? 1 : partial ? 0.5 : 0
  const newAccuracy = Math.round(((prior.quiz_accuracy / 100) * prior.attempts + credit) / newAttempts * 100)

  const newDistinct = prior.distinct_questions_seen + 1
  const newVariety = Math.min(100, newDistinct * 10)  // 10 distinct questions = 100

  const treatAsCorrect = correct || partial
  const sr = advanceSpacedRepetition(prior.review_interval_days || 0, treatAsCorrect)
  const newSrComponent = srComponent(sr.nextIntervalDays)

  const newCalibration = updateCalibration(prior.confidence_calibration, correct, confidenceTap)
  const newRecency = 100  // just reviewed

  const components = {
    quiz_accuracy: newAccuracy,
    confidence_calibration: newCalibration,
    spaced_repetition: newSrComponent,
    context_variety: newVariety,
    recency_decay: newRecency,
  }

  const upsertRow = {
    staff_id: userId,
    concept_id: conceptId,
    domain,
    ...components,
    mastery_score: computeMasteryScore(components),
    review_interval_days: sr.nextIntervalDays,
    next_review_at: sr.nextReviewAt,
    last_reviewed_at: nowIso,
    attempts: newAttempts,
    distinct_questions_seen: newDistinct,
    updated_at: nowIso,
  }
  void questionId  // reserved for future per-question variety tracking

  const { data, error } = await supabase
    .from('concept_mastery')
    .upsert(upsertRow, { onConflict: 'staff_id,concept_id' })
    .select('*')
    .single<ConceptMasteryRow>()

  if (error || !data) throw new Error(`applyAttempt failed: ${error?.message ?? 'no row returned'}`)
  return mapRow(data)
}

// Read APIs

export const getConceptMastery = cache(async (userId: string): Promise<ConceptMastery[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('concept_mastery')
    .select('*')
    .eq('staff_id', userId)
    .returns<ConceptMasteryRow[]>()

  const rows = (data ?? []).map(mapRow)
  // Apply recency decay at read time (D-09: maintained, not completed)
  const now = new Date()
  return rows.map(r => {
    const decay = computeRecencyDecay(r.last_reviewed_at, now)
    if (decay === r.recency_decay) return r
    const updated = { ...r, recency_decay: decay }
    updated.mastery_score = computeMasteryScore(updated)
    return updated
  })
})

export async function getDueForReview(userId: string): Promise<ConceptMastery[]> {
  const all = await getConceptMastery(userId)
  const now = Date.now()
  return all
    .filter(m => new Date(m.next_review_at).getTime() <= now)
    .sort((a, b) => a.next_review_at.localeCompare(b.next_review_at))
}
