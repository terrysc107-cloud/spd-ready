// Pure mindset-derivation logic — NO Supabase / Next imports, so it is
// unit-testable (see tests/mindset-logic.test.ts), mirroring scoring.ts and
// competency-logic.ts. All product judgment about *what the numbers mean*
// lives here + the versioned config in src/lib/mindset-model.ts.

import {
  MINDSET_DIMENSIONS,
  MINDSET_DIMENSION_KEYS,
  JUDGMENT_TYPE_TO_DIMENSION,
  ARCHETYPE_BY_SIGNATURE,
  ARCHETYPE_BY_ID,
  MINDSET_MODEL,
  type MindsetDimensionKey,
  type MindsetModelConfig,
  type JudgmentType,
  type MindsetArchetype,
} from '@/lib/mindset-model'

export type DimensionScores = Record<MindsetDimensionKey, number> // each 0..100

// Per-judgment_type tally from a scenario set (the SJT). total=0 means the set
// had no item for that type.
export type JudgmentTally = Record<string, { correct: number; total: number }>

// 1 Likert point on a 1..5 scale → percent (1=0%, 5=100%). Local + pure so this
// file stays free of the Supabase-importing likert DAL.
export function likertToPct(likert: number): number {
  return Math.round(((likert - 1) / 4) * 100)
}

export function pctDelta(t0: number, t1: number): number {
  return Math.round(t1 - t0)
}

// Aggregate a per-judgment_type tally into the 6 dimension scores (0..100).
// A dimension's score is the pooled correct/total across all its judgment_types.
// Dimensions with no items in the set score 0 (and are reported via coverage).
export function deriveDimensionScores(tally: JudgmentTally): DimensionScores {
  const out = {} as DimensionScores
  for (const dim of MINDSET_DIMENSIONS) {
    let correct = 0
    let total = 0
    for (const jt of dim.judgmentTypes) {
      const t = tally[jt]
      if (t) {
        correct += t.correct
        total += t.total
      }
    }
    out[dim.key] = total > 0 ? Math.round((correct / total) * 100) : 0
  }
  return out
}

// Which dimensions actually had scenario coverage in the set (for honesty in UI).
export function coveredDimensions(tally: JudgmentTally): MindsetDimensionKey[] {
  const out: MindsetDimensionKey[] = []
  for (const dim of MINDSET_DIMENSIONS) {
    const total = dim.judgmentTypes.reduce((s, jt) => s + (tally[jt]?.total ?? 0), 0)
    if (total > 0) out.push(dim.key)
  }
  return out
}

export function averageScore(scores: DimensionScores): number {
  const vals = MINDSET_DIMENSION_KEYS.map(k => scores[k])
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
}

export function scoreSpread(scores: DimensionScores): number {
  const vals = MINDSET_DIMENSION_KEYS.map(k => scores[k])
  return Math.max(...vals) - Math.min(...vals)
}

// The dominant dimension(s) = those tied for the top score.
export function dominantDimensions(scores: DimensionScores): MindsetDimensionKey[] {
  const max = Math.max(...MINDSET_DIMENSION_KEYS.map(k => scores[k]))
  return MINDSET_DIMENSION_KEYS.filter(k => scores[k] === max)
}

// Pick the archetype. Order: all-low → Emerging; balanced-high → All-Rounder;
// else the single dominant dimension's signature archetype (ties broken by the
// dimension display order, which is intentional priority: safety first).
export function deriveArchetype(
  scores: DimensionScores,
  config: MindsetModelConfig = MINDSET_MODEL
): MindsetArchetype {
  const avg = averageScore(scores)
  if (avg < config.emergingFloorAvg) return ARCHETYPE_BY_ID.emerging

  const spread = scoreSpread(scores)
  if (avg >= config.balancedFloorAvg && spread <= config.balancedSpreadMax) {
    return ARCHETYPE_BY_ID.all_rounder
  }

  const dom = dominantDimensions(scores)[0] // display-order priority on ties
  return ARCHETYPE_BY_SIGNATURE[dom] ?? ARCHETYPE_BY_ID.all_rounder
}

// Self-perception (Likert 1..5 per dimension) vs demonstrated (0..100 per
// dimension). Reuses the mastery engine's confidence-calibration idea at the
// profile level: a large positive gap = overconfident (a coaching signal).
export type CalibrationBand = 'overconfident' | 'aligned' | 'underconfident'

export type Calibration = {
  selfAvgPct: number
  demonstratedAvgPct: number
  gapPp: number // self − demonstrated, in percentage points
  band: CalibrationBand
}

export function deriveCalibration(
  selfLikert: Record<MindsetDimensionKey, number>,
  demonstrated: DimensionScores,
  config: MindsetModelConfig = MINDSET_MODEL
): Calibration {
  const selfPcts = MINDSET_DIMENSION_KEYS.map(k => likertToPct(selfLikert[k] ?? 3))
  const demoVals = MINDSET_DIMENSION_KEYS.map(k => demonstrated[k])
  const selfAvg = Math.round(selfPcts.reduce((s, v) => s + v, 0) / selfPcts.length)
  const demoAvg = Math.round(demoVals.reduce((s, v) => s + v, 0) / demoVals.length)
  const gap = selfAvg - demoAvg
  let band: CalibrationBand = 'aligned'
  if (gap > config.calibration.overconfidentAbovePp) band = 'overconfident'
  else if (gap < -config.calibration.underconfidentBelowPp) band = 'underconfident'
  return { selfAvgPct: selfAvg, demonstratedAvgPct: demoAvg, gapPp: gap, band }
}

// Full profile derivation. Pure: same inputs → same outputs (no clock, no IO).
export type MindsetProfileDerivation = {
  modelVersion: string
  dimensionScores: DimensionScores
  covered: MindsetDimensionKey[]
  archetypeId: string
  dominant: MindsetDimensionKey[]
  averageScore: number
  calibration: Calibration | null // null if no self-perception captured
}

export function deriveMindsetProfile(
  input: {
    tally: JudgmentTally
    selfLikert?: Record<MindsetDimensionKey, number> | null
  },
  config: MindsetModelConfig = MINDSET_MODEL
): MindsetProfileDerivation {
  const dimensionScores = deriveDimensionScores(input.tally)
  const archetype = deriveArchetype(dimensionScores, config)
  return {
    modelVersion: config.version,
    dimensionScores,
    covered: coveredDimensions(input.tally),
    archetypeId: archetype.id,
    dominant: dominantDimensions(dimensionScores),
    averageScore: averageScore(dimensionScores),
    calibration: input.selfLikert
      ? deriveCalibration(input.selfLikert, dimensionScores, config)
      : null,
  }
}

// Select a balanced scenario set for the baseline SJT: up to `perType` items
// of each judgment_type that maps into a dimension, preserving input order.
// Pure + generic so it stays testable and free of the question-bank import.
export function selectBalancedSet<T extends { judgment_type?: string | null }>(
  items: T[],
  perType: number
): T[] {
  const counts = new Map<string, number>()
  const out: T[] = []
  for (const it of items) {
    const jt = it.judgment_type
    if (!jt || !(jt in JUDGMENT_TYPE_TO_DIMENSION)) continue
    const n = counts.get(jt) ?? 0
    if (n >= perType) continue
    counts.set(jt, n + 1)
    out.push(it)
  }
  return out
}

// Helper: build a JudgmentTally from a flat list of answered scenarios, each
// carrying its judgment_type and whether it was answered correctly. Pure.
export function tallyByJudgmentType(
  answers: { judgmentType: string | null; correct: boolean }[]
): JudgmentTally {
  const out: JudgmentTally = {}
  for (const a of answers) {
    if (!a.judgmentType) continue
    // ignore tags that don't map into a dimension
    if (!(a.judgmentType in JUDGMENT_TYPE_TO_DIMENSION)) continue
    const key = a.judgmentType as JudgmentType
    if (!out[key]) out[key] = { correct: 0, total: 0 }
    out[key].total += 1
    if (a.correct) out[key].correct += 1
  }
  return out
}
