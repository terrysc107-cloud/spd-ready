import { cache } from 'react'
import { readStore, writeStore } from '@/lib/local-db/store'
import type { DomainAssessment, LearningDomain } from '@/lib/local-db/types'

export const getDomainAssessment = cache(async (userId: string, domain: LearningDomain): Promise<DomainAssessment | null> => {
  const store = readStore()
  const list = store.domain_assessments[userId] ?? []
  return list.find(a => a.domain === domain) ?? null
})

export const getAllDomainAssessments = cache(async (userId: string): Promise<DomainAssessment[]> => {
  const store = readStore()
  return store.domain_assessments[userId] ?? []
})

// Per D-12: T0 locked on first attempt; if a row exists, knowledge_t0/confidence_t0 are NOT changed
export async function upsertDomainAssessmentT0(
  userId: string,
  domain: LearningDomain,
  knowledgeT0: number,
  confidenceT0: number
): Promise<DomainAssessment> {
  if (knowledgeT0 < 1 || knowledgeT0 > 5 || confidenceT0 < 1 || confidenceT0 > 5) {
    throw new Error('Likert values must be 1..5')
  }
  const store = readStore()
  const list = store.domain_assessments[userId] ?? []
  const existing = list.find(a => a.domain === domain)
  const now = new Date().toISOString()
  if (existing) {
    return existing  // T0 locked
  }
  const row: DomainAssessment = {
    id: crypto.randomUUID(),
    user_id: userId,
    domain,
    knowledge_t0: knowledgeT0,
    confidence_t0: confidenceT0,
    knowledge_current: knowledgeT0,
    confidence_current: confidenceT0,
    t0_at: now,
    updated_at: now,
  }
  list.push(row)
  store.domain_assessments[userId] = list
  writeStore(store)
  return row
}

// Per D-12: T1 (current) updates after every module completion
export async function updateDomainAssessmentT1(
  userId: string,
  domain: LearningDomain,
  knowledgeCurrent: number,
  confidenceCurrent: number
): Promise<DomainAssessment> {
  if (knowledgeCurrent < 1 || knowledgeCurrent > 5 || confidenceCurrent < 1 || confidenceCurrent > 5) {
    throw new Error('Likert values must be 1..5')
  }
  const store = readStore()
  const list = store.domain_assessments[userId] ?? []
  const existing = list.find(a => a.domain === domain)
  const now = new Date().toISOString()
  if (!existing) {
    // First time submission — both T0 and T1 set together
    return upsertDomainAssessmentT0(userId, domain, knowledgeCurrent, confidenceCurrent)
  }
  existing.knowledge_current = knowledgeCurrent
  existing.confidence_current = confidenceCurrent
  existing.updated_at = now
  store.domain_assessments[userId] = list
  writeStore(store)
  return existing
}

// Helper: delta in percentage points (1 Likert point = 25pp on a 1..5 scale where 1=0%, 5=100%)
export function likertToPct(likert: number): number {
  return Math.round((likert - 1) / 4 * 100)
}

export function deltaPp(t0: number, t1: number): number {
  return likertToPct(t1) - likertToPct(t0)
}
