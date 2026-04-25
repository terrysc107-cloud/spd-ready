import { cache } from 'react'
import { readStore, writeStore } from '@/lib/local-db/store'
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
// Input: prior calibration (0..100), current attempt's correct flag and confidence tap
// Rewards: (certain + correct) +6; (not_sure + wrong) +3; (pretty_sure + correct) +3; (pretty_sure + wrong) -1
// Penalty: (certain + wrong) -12 (2x weight per "specifics" block — high-conf+wrong is dangerous)
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

// Single-attempt mastery update. Reads-modifies-writes one ConceptMastery row.
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
  const store = readStore()
  const userMasteries = store.concept_mastery[userId] ?? []
  let row = userMasteries.find(m => m.concept_id === conceptId)
  const nowIso = new Date().toISOString()

  if (!row) {
    row = {
      id: crypto.randomUUID(),
      user_id: userId,
      concept_id: conceptId,
      domain,
      quiz_accuracy: 0,
      confidence_calibration: 50,  // neutral start
      spaced_repetition: 0,
      context_variety: 0,
      recency_decay: 100,
      mastery_score: 0,
      review_interval_days: 0,
      next_review_at: nowIso,
      last_reviewed_at: nowIso,
      attempts: 0,
      distinct_questions_seen: 0,
      updated_at: nowIso,
    }
    userMasteries.push(row)
  }

  // Update components
  const newAttempts = row.attempts + 1
  const credit = correct ? 1 : partial ? 0.5 : 0
  const newAccuracy = Math.round(((row.quiz_accuracy / 100) * row.attempts + credit) / newAttempts * 100)

  // Distinct questions for THIS concept — approximate by incrementing per attempt (D-10 v1 clarification)
  const newDistinct = row.distinct_questions_seen + 1
  const newVariety = Math.min(100, newDistinct * 10)  // 10 distinct questions = 100

  const treatAsCorrect = correct || partial
  const sr = advanceSpacedRepetition(row.review_interval_days || 0, treatAsCorrect)
  const newSrComponent = srComponent(sr.nextIntervalDays)

  const newCalibration = updateCalibration(row.confidence_calibration, correct, confidenceTap)
  const newRecency = 100  // just reviewed

  row.quiz_accuracy = newAccuracy
  row.confidence_calibration = newCalibration
  row.spaced_repetition = newSrComponent
  row.context_variety = newVariety
  row.recency_decay = newRecency
  row.review_interval_days = sr.nextIntervalDays
  row.next_review_at = sr.nextReviewAt
  row.last_reviewed_at = nowIso
  row.attempts = newAttempts
  row.distinct_questions_seen = newDistinct
  row.mastery_score = computeMasteryScore(row)
  row.updated_at = nowIso
  // Suppress unused locals lint
  void questionId

  store.concept_mastery[userId] = userMasteries
  writeStore(store)
  return row
}

// Read APIs

export const getConceptMastery = cache(async (userId: string): Promise<ConceptMastery[]> => {
  const store = readStore()
  const rows = store.concept_mastery[userId] ?? []
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
  return all.filter(m => new Date(m.next_review_at).getTime() <= now).sort((a, b) => a.next_review_at.localeCompare(b.next_review_at))
}
