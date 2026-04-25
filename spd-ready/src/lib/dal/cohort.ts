import { cache } from 'react'
import { readStore } from '@/lib/local-db/store'
import { requireRole } from '@/lib/dal/auth'
import { getConceptMastery } from '@/lib/dal/mastery'
import { getAllDomainAssessments, likertToPct, deltaPp } from '@/lib/dal/likert'
import { LEARNING_DOMAINS, LEARNING_DOMAIN_META } from '@/lib/local-db/types'
import { ERROR_CATEGORIES, DOMAIN_ERROR_MAP } from '@/lib/local-db/error-categories'
import type { LearningDomain, ErrorCategory, ModuleAssignment } from '@/lib/local-db/types'

// OhioHealth/SpecialtyCare benchmarks (D-28)
export const ROI_BENCHMARKS = {
  savings_per_pp_usd: 158_000,
  cost_per_error_event_usd: 6_185,
  trained_site_error_reduction_pct: 40,
} as const

export const ROI_METHODOLOGY_FOOTNOTE = "Projected savings use the AVERAGE of cohort knowledge gain and cohort confidence gain (in percentage points), multiplied by the OhioHealth/SpecialtyCare benchmark of $158,000 per percentage-point system-wide. Single-site savings vary by implementation fidelity. Per-error-event cost ($6,185) is the published 2024-2025 case-study figure."

export type CohortRow = {
  member_id: string
  student_user_id: string
  first_name: string
  last_name: string
  email: string
  tier: number | null
  avg_mastery: number
  knowledge_delta_pp: number | null
  confidence_delta_pp: number | null
  modules_completed: number
  modules_assigned: number
  last_activity: string | null
  added_at: string
}

export const getCohortMembers = cache(async (): Promise<CohortRow[]> => {
  const user = await requireRole('hospital')
  const store = readStore()
  const memberships = store.hospital_cohort.filter(m => m.hospital_user_id === user.id)
  const rows: CohortRow[] = []
  for (const m of memberships) {
    const profile = store.student_profiles[m.student_user_id]
    const auth = store.users[m.student_user_id]
    const masteries = store.concept_mastery[m.student_user_id] ?? []
    const assessments = store.domain_assessments[m.student_user_id] ?? []
    const assignments = store.module_assignments.filter(a => a.hospital_user_id === user.id && a.student_user_id === m.student_user_id)
    const completed = assignments.filter(a => a.completed_at !== null).length

    const avgMastery = masteries.length > 0
      ? Math.round(masteries.reduce((s, x) => s + x.mastery_score, 0) / masteries.length)
      : 0

    const withBaseline = assessments
    const knowledgeDelta = withBaseline.length > 0
      ? Math.round(withBaseline.reduce((s, a) => s + deltaPp(a.knowledge_t0, a.knowledge_current), 0) / withBaseline.length)
      : null
    const confidenceDelta = withBaseline.length > 0
      ? Math.round(withBaseline.reduce((s, a) => s + deltaPp(a.confidence_t0, a.confidence_current), 0) / withBaseline.length)
      : null

    const lastActivity = masteries.length > 0
      ? masteries.map(x => x.last_reviewed_at).sort().reverse()[0]
      : null

    rows.push({
      member_id: m.id,
      student_user_id: m.student_user_id,
      first_name: profile?.first_name ?? '(no profile)',
      last_name: profile?.last_name ?? '',
      email: auth?.email ?? '',
      tier: profile?.readiness_tier ?? null,
      avg_mastery: avgMastery,
      knowledge_delta_pp: knowledgeDelta,
      confidence_delta_pp: confidenceDelta,
      modules_completed: completed,
      modules_assigned: assignments.length,
      last_activity: lastActivity,
      added_at: m.added_at,
    })
  }
  return rows.sort((a, b) => a.last_name.localeCompare(b.last_name))
})

export type CohortMemberDetail = {
  student_user_id: string
  first_name: string
  last_name: string
  email: string
  tier: number | null
  domain_breakdown: Array<{
    domain: LearningDomain
    label: string
    icon: string
    avg_mastery: number
    knowledge_t0_pct: number | null
    knowledge_current_pct: number | null
    confidence_t0_pct: number | null
    confidence_current_pct: number | null
    knowledge_delta_pp: number | null
    confidence_delta_pp: number | null
    concepts: Array<{ id: string; label: string; mastery_score: number }>
  }>
  assignments: ModuleAssignment[]
}

export const getCohortMemberDetail = cache(async (studentUserId: string): Promise<CohortMemberDetail | null> => {
  const user = await requireRole('hospital')
  const store = readStore()
  const membership = store.hospital_cohort.find(m => m.hospital_user_id === user.id && m.student_user_id === studentUserId)
  if (!membership) return null

  const profile = store.student_profiles[studentUserId]
  const auth = store.users[studentUserId]
  const masteries = await getConceptMastery(studentUserId)
  const assessments = await getAllDomainAssessments(studentUserId)
  const assignments = store.module_assignments
    .filter(a => a.hospital_user_id === user.id && a.student_user_id === studentUserId)
    .sort((a, b) => b.assigned_at.localeCompare(a.assigned_at))

  const domain_breakdown = LEARNING_DOMAINS.map(domain => {
    const meta = LEARNING_DOMAIN_META[domain]
    const ms = masteries.filter(m => m.domain === domain)
    const avg = ms.length > 0 ? Math.round(ms.reduce((s, m) => s + m.mastery_score, 0) / ms.length) : 0
    const a = assessments.find(x => x.domain === domain)
    return {
      domain,
      label: meta.label,
      icon: meta.icon,
      avg_mastery: avg,
      knowledge_t0_pct: a ? likertToPct(a.knowledge_t0) : null,
      knowledge_current_pct: a ? likertToPct(a.knowledge_current) : null,
      confidence_t0_pct: a ? likertToPct(a.confidence_t0) : null,
      confidence_current_pct: a ? likertToPct(a.confidence_current) : null,
      knowledge_delta_pp: a ? deltaPp(a.knowledge_t0, a.knowledge_current) : null,
      confidence_delta_pp: a ? deltaPp(a.confidence_t0, a.confidence_current) : null,
      concepts: ms.map(m => ({ id: m.concept_id, label: m.concept_id, mastery_score: m.mastery_score })),
    }
  })

  return {
    student_user_id: studentUserId,
    first_name: profile?.first_name ?? '(no profile)',
    last_name: profile?.last_name ?? '',
    email: auth?.email ?? '',
    tier: profile?.readiness_tier ?? null,
    domain_breakdown,
    assignments,
  }
})

export type CohortROI = {
  cohort_size: number
  avg_knowledge_delta_pp: number
  avg_confidence_delta_pp: number
  combined_pp_gain: number
  projected_savings_usd: number
  projected_error_reduction_pct: number
  per_error_category: Array<{
    category: ErrorCategory
    label: string
    projected_events_avoided: number
    projected_savings_usd: number
  }>
}

export const getCohortROI = cache(async (): Promise<CohortROI> => {
  const user = await requireRole('hospital')
  const store = readStore()
  const memberships = store.hospital_cohort.filter(m => m.hospital_user_id === user.id)

  let totalK = 0, totalC = 0, baseCount = 0
  for (const m of memberships) {
    const assessments = store.domain_assessments[m.student_user_id] ?? []
    for (const a of assessments) {
      totalK += deltaPp(a.knowledge_t0, a.knowledge_current)
      totalC += deltaPp(a.confidence_t0, a.confidence_current)
      baseCount++
    }
  }

  const avgK = baseCount > 0 ? Math.round(totalK / baseCount) : 0
  const avgC = baseCount > 0 ? Math.round(totalC / baseCount) : 0
  // Per D-28 (clarified): use AVERAGE of knowledge_pp and confidence_pp — NOT the SUM.
  // Summing would double-count the same training signal and inflate projected savings 2x.
  const combined = Math.round((avgK + avgC) / 2)

  const baselineEventsPerStudentPerYear = 12
  const totalBaselineEvents = memberships.length * baselineEventsPerStudentPerYear
  const reductionPct = Math.min(ROI_BENCHMARKS.trained_site_error_reduction_pct, Math.max(0, combined * 1.0))
  const eventsAvoided = Math.round(totalBaselineEvents * (reductionPct / 100))

  const domainTrained = new Set<LearningDomain>()
  for (const m of memberships) {
    const ms = store.concept_mastery[m.student_user_id] ?? []
    ms.forEach(x => domainTrained.add(x.domain))
  }
  const allCats = Array.from(new Set(Array.from(domainTrained).flatMap(d => DOMAIN_ERROR_MAP[d])))
  const perCat = allCats.length > 0 ? Math.floor(eventsAvoided / allCats.length) : 0

  const per_error_category = allCats.map(cat => ({
    category: cat,
    label: ERROR_CATEGORIES[cat].label,
    projected_events_avoided: perCat,
    projected_savings_usd: perCat * ROI_BENCHMARKS.cost_per_error_event_usd,
  }))

  return {
    cohort_size: memberships.length,
    avg_knowledge_delta_pp: avgK,
    avg_confidence_delta_pp: avgC,
    combined_pp_gain: combined,
    projected_savings_usd: combined * ROI_BENCHMARKS.savings_per_pp_usd,
    projected_error_reduction_pct: Math.round(reductionPct),
    per_error_category,
  }
})

export async function lookupStudentByEmail(email: string): Promise<{ user_id: string; first_name: string; last_name: string } | null> {
  const store = readStore()
  const auth = Object.values(store.users).find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'student')
  if (!auth) return null
  const profile = store.student_profiles[auth.id]
  return {
    user_id: auth.id,
    first_name: profile?.first_name ?? '(profile pending)',
    last_name: profile?.last_name ?? '',
  }
}
