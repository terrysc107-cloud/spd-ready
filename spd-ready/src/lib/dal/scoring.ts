// src/lib/dal/scoring.ts
// Pure TypeScript scoring utilities — no Supabase, no auth, no 'use server'.
// Imported by Server Actions in src/actions/student.ts and the assessment DAL.

export type CategoryScores = {
  technical: number    // 0–100
  situational: number  // 0–100
  process: number      // 0–100
  behavior: number     // 0–100  NOTE: maps from DB category value 'behavioral'
  instrument: number   // 0–100
  reliability: number  // 0–100
}

export type CategoryKey = keyof CategoryScores

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  technical: 'Technical Knowledge',
  situational: 'Situational Judgment',
  process: 'Process Discipline',
  behavior: 'Behavioral / Culture Fit',
  instrument: 'Instrument Familiarity',
  reliability: 'Reliability',
}

/**
 * Weighted overall readiness score.
 * Formula: technical*0.30 + situational*0.25 + process*0.15 + behavior*0.15 + instrument*0.10 + reliability*0.05
 */
export function computeReadinessScore(scores: CategoryScores): number {
  return (
    scores.technical   * 0.30 +
    scores.situational * 0.25 +
    scores.process     * 0.15 +
    scores.behavior    * 0.15 +
    scores.instrument  * 0.10 +
    scores.reliability * 0.05
  )
}

/**
 * Tier assignment based on overall score.
 * Tier 1 (Ready): >= 75
 * Tier 2 (Ready with Support): 55–74.99
 * Tier 3 (Not Ready Yet): < 55
 */
export function deriveReadinessTier(overallScore: number): 1 | 2 | 3 {
  if (overallScore >= 75) return 1
  if (overallScore >= 55) return 2
  return 3
}

/**
 * Derive top 2 strengths and bottom 2 growth areas from category scores.
 * Returns category keys (e.g. 'technical', 'behavior') not labels.
 */
export function deriveStrengthsAndGrowth(scores: CategoryScores): {
  strengths: CategoryKey[]
  growthAreas: CategoryKey[]
} {
  const sorted = (Object.entries(scores) as [CategoryKey, number][]).sort(
    ([, a], [, b]) => b - a
  )
  return {
    strengths: sorted.slice(0, 2).map(([k]) => k),
    growthAreas: sorted.slice(-2).map(([k]) => k),
  }
}

/**
 * Compute fit score (0–100) between a student and an externship opening.
 * Four dimensions:
 *   - Readiness tier (35%): Tier 1 = 100, Tier 2 = 65
 *   - Geography (25%): same state = 100, else 40
 *   - Schedule (25%): proportion of student's shifts that match opening shift
 *   - Environment (15%): preferred_environment vs facility_type match
 */
export function computeFitScore(params: {
  readiness_tier: number | null
  student_state: string
  hospital_state: string
  shift_availability: string[]
  opening_shift: string
  preferred_environment: string
  facility_type: string
}): number {
  const { readiness_tier, student_state, hospital_state, shift_availability, opening_shift, preferred_environment, facility_type } = params

  // Tier component
  const tierScore = readiness_tier === 1 ? 100 : readiness_tier === 2 ? 65 : 0

  // Geography component
  const geoScore = student_state.toUpperCase() === hospital_state.toUpperCase() ? 100 : 40

  // Schedule component — does the opening's shift appear in student availability?
  const shiftNormalized = opening_shift.toLowerCase()
  const shiftMatch = shift_availability.some(s => s.toLowerCase() === shiftNormalized || s.toLowerCase() === 'flexible')
  const schedScore = shiftMatch ? 100 : 30

  // Environment component
  let envScore = 60
  if (preferred_environment === 'either') {
    envScore = 80
  } else if (
    (preferred_environment === 'acute_care' && facility_type === 'acute_care') ||
    (preferred_environment === 'ambulatory' && (facility_type === 'ambulatory' || facility_type === 'other'))
  ) {
    envScore = 100
  } else {
    envScore = 40
  }

  const total = tierScore * 0.35 + geoScore * 0.25 + schedScore * 0.25 + envScore * 0.15
  return Math.round(total)
}
