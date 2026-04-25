'use server'

import { requireRole } from '@/lib/dal/auth'
import { readStore, writeStore } from '@/lib/local-db/store'
import { applyAttempt } from '@/lib/dal/mastery'
import type { ConfidenceTap, ConceptId, LearningDomain } from '@/lib/local-db/types'
import { revalidatePath } from 'next/cache'

export async function recordAttemptAction(params: {
  questionId: string
  conceptId: ConceptId
  domain: LearningDomain
  correct: boolean
  partial: boolean
  confidenceTap: ConfidenceTap | null
}): Promise<{ ok: true }> {
  const user = await requireRole('student')

  // Persist confidence tap if provided
  if (params.confidenceTap) {
    const store = readStore()
    if (!store.confidence_taps[user.id]) store.confidence_taps[user.id] = {}
    store.confidence_taps[user.id][params.questionId] = params.confidenceTap
    writeStore(store)
  }

  await applyAttempt({
    userId: user.id,
    conceptId: params.conceptId,
    domain: params.domain,
    questionId: params.questionId,
    correct: params.correct,
    partial: params.partial,
    confidenceTap: params.confidenceTap,
  })

  revalidatePath('/student/learning')
  return { ok: true }
}
