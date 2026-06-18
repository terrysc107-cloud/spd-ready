import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  MODEL_VERSION,
  type MindsetDimensionKey,
  type ArchetypeId,
} from '@/lib/mindset-model'
import {
  deriveMindsetProfile,
  type DimensionScores,
  type JudgmentTally,
} from '@/lib/dal/mindset-logic'

// ============================================================
// Persistence (Supabase spd_ready.mindset_profiles). Rows keyed by
// staff_id = auth.users.id. RLS: owner full access; org managers read +
// write manager_adjustment. The T0 columns are the locked baseline; the
// non-T0 columns are the current (T1) values, recomputed on each retake.
// ============================================================

export type ManagerAdjustment = {
  archetype: ArchetypeId
  note: string
  by: string
  by_name: string | null
  at: string
}

export type MindsetProfile = {
  id: string
  staffId: string
  modelVersion: string
  // baseline (locked)
  dimensionScoresT0: DimensionScores
  archetypeT0: ArchetypeId
  demonstratedT0: DimensionScores
  selfPerception: Record<MindsetDimensionKey, number> | null
  calibrationGapT0: number | null
  coveredT0: MindsetDimensionKey[]
  // current (T1)
  dimensionScores: DimensionScores
  archetype: ArchetypeId
  demonstratedCurrent: DimensionScores
  // beta feedback
  techFeedback: 'fits' | 'partly' | 'no' | null
  techFeedbackNote: string | null
  techFeedbackAt: string | null
  managerAdjustment: ManagerAdjustment | null
  baselineAt: string
  computedAt: string
  updatedAt: string
}

type MindsetProfileRow = {
  id: string
  staff_id: string
  model_version: string
  dimension_scores_t0: DimensionScores
  archetype_t0: string
  demonstrated_t0: DimensionScores
  self_perception: Record<string, number> | null
  calibration_gap_t0: number | null
  covered_t0: string[]
  dimension_scores: DimensionScores
  archetype: string
  demonstrated_current: DimensionScores
  tech_feedback: 'fits' | 'partly' | 'no' | null
  tech_feedback_note: string | null
  tech_feedback_at: string | null
  manager_adjustment: ManagerAdjustment | null
  baseline_at: string
  computed_at: string
  updated_at: string
}

function mapRow(r: MindsetProfileRow): MindsetProfile {
  return {
    id: r.id,
    staffId: r.staff_id,
    modelVersion: r.model_version,
    dimensionScoresT0: r.dimension_scores_t0,
    archetypeT0: r.archetype_t0 as ArchetypeId,
    demonstratedT0: r.demonstrated_t0,
    selfPerception: (r.self_perception as Record<MindsetDimensionKey, number> | null) ?? null,
    calibrationGapT0: r.calibration_gap_t0,
    coveredT0: (r.covered_t0 ?? []) as MindsetDimensionKey[],
    dimensionScores: r.dimension_scores,
    archetype: r.archetype as ArchetypeId,
    demonstratedCurrent: r.demonstrated_current,
    techFeedback: r.tech_feedback,
    techFeedbackNote: r.tech_feedback_note,
    techFeedbackAt: r.tech_feedback_at,
    managerAdjustment: r.manager_adjustment,
    baselineAt: r.baseline_at,
    computedAt: r.computed_at,
    updatedAt: r.updated_at,
  }
}

// ── Reads ─────────────────────────────────────────────────────

export const getMindsetProfile = cache(async (userId: string): Promise<MindsetProfile | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mindset_profiles')
    .select('*')
    .eq('staff_id', userId)
    .eq('model_version', MODEL_VERSION)
    .maybeSingle<MindsetProfileRow>()
  return data ? mapRow(data) : null
})

// Manager view of a specific tech's profile (RLS scopes to the manager's org).
export async function getMindsetProfileForStaff(staffId: string): Promise<MindsetProfile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mindset_profiles')
    .select('*')
    .eq('staff_id', staffId)
    .eq('model_version', MODEL_VERSION)
    .maybeSingle<MindsetProfileRow>()
  return data ? mapRow(data) : null
}

// ── Writes ────────────────────────────────────────────────────

// Single write path for the judgment assessment. First submission LOCKS the
// baseline (T0); later submissions are check-ins that recompute current (T1),
// leaving T0 untouched — mirrors the domain_assessments T0/T1 pattern.
export async function recordJudgmentAssessment(
  userId: string,
  input: { tally: JudgmentTally; selfLikert?: Record<MindsetDimensionKey, number> | null }
): Promise<{ profile: MindsetProfile; isBaseline: boolean }> {
  const supabase = await createClient()
  const derivation = deriveMindsetProfile(input)
  const now = new Date().toISOString()

  const existing = await getMindsetProfile(userId)

  if (!existing) {
    const { data, error } = await supabase
      .from('mindset_profiles')
      .insert({
        staff_id: userId,
        model_version: derivation.modelVersion,
        // baseline = current at T0
        dimension_scores_t0: derivation.dimensionScores,
        archetype_t0: derivation.archetypeId,
        demonstrated_t0: derivation.dimensionScores,
        self_perception: input.selfLikert ?? null,
        calibration_gap_t0: derivation.calibration?.gapPp ?? null,
        covered_t0: derivation.covered,
        dimension_scores: derivation.dimensionScores,
        archetype: derivation.archetypeId,
        demonstrated_current: derivation.dimensionScores,
        baseline_at: now,
        computed_at: now,
        updated_at: now,
      })
      .select('*')
      .single<MindsetProfileRow>()
    if (error || !data) throw new Error(`recordJudgmentAssessment(insert) failed: ${error?.message ?? 'no row'}`)
    return { profile: mapRow(data), isBaseline: true }
  }

  // Check-in: update current (T1) only; T0 stays locked.
  const { data, error } = await supabase
    .from('mindset_profiles')
    .update({
      dimension_scores: derivation.dimensionScores,
      archetype: derivation.archetypeId,
      demonstrated_current: derivation.dimensionScores,
      computed_at: now,
      updated_at: now,
    })
    .eq('staff_id', userId)
    .eq('model_version', MODEL_VERSION)
    .select('*')
    .single<MindsetProfileRow>()
  if (error || !data) throw new Error(`recordJudgmentAssessment(update) failed: ${error?.message ?? 'no row'}`)
  return { profile: mapRow(data), isBaseline: false }
}

export async function saveTechFeedback(
  userId: string,
  value: 'fits' | 'partly' | 'no',
  note: string | null
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('mindset_profiles')
    .update({
      tech_feedback: value,
      tech_feedback_note: note,
      tech_feedback_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('staff_id', userId)
    .eq('model_version', MODEL_VERSION)
  if (error) throw new Error(`saveTechFeedback failed: ${error.message}`)
}

// Manager validates or adjusts a tech's archetype (like competency sign-off).
export async function saveManagerAdjustment(
  staffId: string,
  adjustment: ManagerAdjustment
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('mindset_profiles')
    .update({ manager_adjustment: adjustment, updated_at: new Date().toISOString() })
    .eq('staff_id', staffId)
    .eq('model_version', MODEL_VERSION)
  if (error) throw new Error(`saveManagerAdjustment failed: ${error.message}`)
}

// ── Beta aggregate (the buy-in evidence) ──────────────────────

export type MindsetAgreementStats = {
  total: number
  withFeedback: number
  fits: number
  partly: number
  no: number
  agreementRate: number | null // fits / withFeedback
  archetypeDistribution: { archetype: ArchetypeId; count: number }[]
}

// Org-scoped via RLS (mp_select restricts to the manager's org). Used by the
// "field agreement" Beta view that doubles as industry-buy-in evidence.
export async function getMindsetAgreementStats(): Promise<MindsetAgreementStats> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mindset_profiles')
    .select('archetype, tech_feedback')
    .eq('model_version', MODEL_VERSION)
    .returns<{ archetype: string; tech_feedback: 'fits' | 'partly' | 'no' | null }[]>()

  const rows = data ?? []
  const dist = new Map<string, number>()
  let fits = 0, partly = 0, no = 0, withFeedback = 0
  for (const r of rows) {
    dist.set(r.archetype, (dist.get(r.archetype) ?? 0) + 1)
    if (r.tech_feedback) {
      withFeedback++
      if (r.tech_feedback === 'fits') fits++
      else if (r.tech_feedback === 'partly') partly++
      else no++
    }
  }
  return {
    total: rows.length,
    withFeedback,
    fits,
    partly,
    no,
    agreementRate: withFeedback > 0 ? Math.round((fits / withFeedback) * 100) : null,
    archetypeDistribution: [...dist.entries()]
      .map(([archetype, count]) => ({ archetype: archetype as ArchetypeId, count }))
      .sort((a, b) => b.count - a.count),
  }
}
