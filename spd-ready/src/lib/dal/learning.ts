import { cache } from 'react'
import { readStore } from '@/lib/local-db/store'
import { getCurrentUser } from '@/lib/dal/auth'
import { getConceptMastery, getDueForReview } from '@/lib/dal/mastery'
import { getAllDomainAssessments, likertToPct, deltaPp } from '@/lib/dal/likert'
import { LEARNING_DOMAINS, LEARNING_DOMAIN_META } from '@/lib/local-db/types'
import { getConceptsForDomain } from '@/lib/local-db/concepts'
import type { ConceptMastery, ModuleAssignment, DomainAssessment, LearningDomain } from '@/lib/local-db/types'

export type DomainSummary = {
  domain: LearningDomain
  label: string
  description: string
  icon: string
  concept_count: number
  mastered_count: number
  avg_mastery: number
  knowledge_t0_pct: number | null
  knowledge_current_pct: number | null
  confidence_t0_pct: number | null
  confidence_current_pct: number | null
  knowledge_delta_pp: number | null
  confidence_delta_pp: number | null
  has_baseline: boolean
}

export const getDomainSummaries = cache(async (): Promise<DomainSummary[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  const [masteries, assessments] = await Promise.all([
    getConceptMastery(user.id),
    getAllDomainAssessments(user.id),
  ])
  return LEARNING_DOMAINS.map(domain => buildSummary(domain, masteries, assessments))
})

function buildSummary(domain: LearningDomain, masteries: ConceptMastery[], assessments: DomainAssessment[]): DomainSummary {
  const meta = LEARNING_DOMAIN_META[domain]
  const concepts = getConceptsForDomain(domain)
  const domainMasteries = masteries.filter(m => m.domain === domain)
  const masteredCount = domainMasteries.filter(m => m.mastery_score >= 80).length
  const avgMastery = domainMasteries.length > 0
    ? Math.round(domainMasteries.reduce((sum, m) => sum + m.mastery_score, 0) / domainMasteries.length)
    : 0
  const a = assessments.find(x => x.domain === domain)
  return {
    domain,
    label: meta.label,
    description: meta.description,
    icon: meta.icon,
    concept_count: concepts.length,
    mastered_count: masteredCount,
    avg_mastery: avgMastery,
    knowledge_t0_pct: a ? likertToPct(a.knowledge_t0) : null,
    knowledge_current_pct: a ? likertToPct(a.knowledge_current) : null,
    confidence_t0_pct: a ? likertToPct(a.confidence_t0) : null,
    confidence_current_pct: a ? likertToPct(a.confidence_current) : null,
    knowledge_delta_pp: a ? deltaPp(a.knowledge_t0, a.knowledge_current) : null,
    confidence_delta_pp: a ? deltaPp(a.confidence_t0, a.confidence_current) : null,
    has_baseline: !!a,
  }
}

export const getDomainSummary = cache(async (domain: LearningDomain): Promise<DomainSummary | null> => {
  const user = await getCurrentUser()
  if (!user) return null
  const [masteries, assessments] = await Promise.all([
    getConceptMastery(user.id),
    getAllDomainAssessments(user.id),
  ])
  return buildSummary(domain, masteries, assessments)
})

export const getDomainConceptMastery = cache(async (domain: LearningDomain): Promise<ConceptMastery[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  const all = await getConceptMastery(user.id)
  return all.filter(m => m.domain === domain)
})

export const getDueReviewQueue = cache(async (): Promise<ConceptMastery[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  return getDueForReview(user.id)
})

export type AssignmentWithCoordinator = ModuleAssignment & {
  coordinator_name: string
  coordinator_org: string
}

export const getAssignmentsForStudent = cache(async (): Promise<AssignmentWithCoordinator[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  const store = readStore()
  const all = Object.values(store.module_assignments).filter(a => a.student_user_id === user.id && a.completed_at === null)
  return all
    .map(a => {
      const hospital = store.hospital_profiles[a.hospital_user_id]
      return {
        ...a,
        coordinator_name: hospital?.site_name ?? 'Hospital Coordinator',
        coordinator_org: hospital?.organization_name ?? '',
      }
    })
    .sort((a, b) => b.assigned_at.localeCompare(a.assigned_at))
})
