'use server'

import { requireRole } from '@/lib/dal/auth'
import { upsertDomainAssessmentT0, updateDomainAssessmentT1, getDomainAssessment } from '@/lib/dal/likert'
import type { LearningDomain } from '@/lib/local-db/types'
import { revalidatePath } from 'next/cache'

export async function submitLikertAction(params: {
  domain: LearningDomain
  knowledge: number  // 1..5
  confidence: number // 1..5
}): Promise<{ ok: true; isT0: boolean }> {
  const user = await requireRole('student')
  const existing = await getDomainAssessment(user.id, params.domain)
  if (!existing) {
    await upsertDomainAssessmentT0(user.id, params.domain, params.knowledge, params.confidence)
    revalidatePath('/student/learning')
    return { ok: true, isT0: true }
  }
  await updateDomainAssessmentT1(user.id, params.domain, params.knowledge, params.confidence)
  revalidatePath('/student/learning')
  return { ok: true, isT0: false }
}
