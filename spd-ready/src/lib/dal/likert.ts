import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { DomainAssessment, LearningDomain } from '@/lib/local-db/types'

// ============================================================
// Persistence (Supabase spd_ready.domain_assessments)
// Rows keyed by staff_id = auth.users.id; mapped to the DomainAssessment
// type (user_id) at the boundary.
// ============================================================

type DomainAssessmentRow = {
  id: string
  staff_id: string
  domain: string
  knowledge_t0: number
  confidence_t0: number
  knowledge_current: number
  confidence_current: number
  t0_at: string
  updated_at: string
}

function mapRow(r: DomainAssessmentRow): DomainAssessment {
  return {
    id: r.id,
    user_id: r.staff_id,
    domain: r.domain as LearningDomain,
    knowledge_t0: r.knowledge_t0,
    confidence_t0: r.confidence_t0,
    knowledge_current: r.knowledge_current,
    confidence_current: r.confidence_current,
    t0_at: r.t0_at,
    updated_at: r.updated_at,
  }
}

export const getDomainAssessment = cache(async (userId: string, domain: LearningDomain): Promise<DomainAssessment | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('domain_assessments')
    .select('*')
    .eq('staff_id', userId)
    .eq('domain', domain)
    .maybeSingle<DomainAssessmentRow>()
  return data ? mapRow(data) : null
})

export const getAllDomainAssessments = cache(async (userId: string): Promise<DomainAssessment[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('domain_assessments')
    .select('*')
    .eq('staff_id', userId)
    .returns<DomainAssessmentRow[]>()
  return (data ?? []).map(mapRow)
})

// Per D-12: T0 locked on first attempt; if a row exists, T0 is NOT changed
export async function upsertDomainAssessmentT0(
  userId: string,
  domain: LearningDomain,
  knowledgeT0: number,
  confidenceT0: number
): Promise<DomainAssessment> {
  if (knowledgeT0 < 1 || knowledgeT0 > 5 || confidenceT0 < 1 || confidenceT0 > 5) {
    throw new Error('Likert values must be 1..5')
  }
  const supabase = await createClient()
  const existing = await getDomainAssessment(userId, domain)
  if (existing) return existing  // T0 locked

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('domain_assessments')
    .insert({
      staff_id: userId,
      domain,
      knowledge_t0: knowledgeT0,
      confidence_t0: confidenceT0,
      knowledge_current: knowledgeT0,
      confidence_current: confidenceT0,
      t0_at: now,
      updated_at: now,
    })
    .select('*')
    .single<DomainAssessmentRow>()
  if (error || !data) throw new Error(`upsertDomainAssessmentT0 failed: ${error?.message ?? 'no row'}`)
  return mapRow(data)
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
  const supabase = await createClient()
  const existing = await getDomainAssessment(userId, domain)
  if (!existing) {
    // First submission — T0 and T1 set together
    return upsertDomainAssessmentT0(userId, domain, knowledgeCurrent, confidenceCurrent)
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('domain_assessments')
    .update({
      knowledge_current: knowledgeCurrent,
      confidence_current: confidenceCurrent,
      updated_at: now,
    })
    .eq('staff_id', userId)
    .eq('domain', domain)
    .select('*')
    .single<DomainAssessmentRow>()
  if (error || !data) throw new Error(`updateDomainAssessmentT1 failed: ${error?.message ?? 'no row'}`)
  return mapRow(data)
}

// Helper: delta in percentage points (1 Likert point = 25pp on a 1..5 scale where 1=0%, 5=100%)
export function likertToPct(likert: number): number {
  return Math.round((likert - 1) / 4 * 100)
}

export function deltaPp(t0: number, t1: number): number {
  return likertToPct(t1) - likertToPct(t0)
}
