'use server'

import { requireAuth } from '@/lib/dal/auth'
import { createClient } from '@/lib/supabase/server'
import { applyAttempt } from '@/lib/dal/mastery'
import { syncTrainingToCompetency } from '@/lib/dal/competency'
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
  const user = await requireAuth()

  // Persist confidence tap if provided
  if (params.confidenceTap) {
    const supabase = await createClient()
    await supabase
      .from('confidence_taps')
      .upsert(
        {
          staff_id: user.id,
          question_id: params.questionId,
          tap: params.confidenceTap,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'staff_id,question_id' }
      )
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

  // Auto-feed: training results flow into any active competency assignments
  // for this staff member (training half of the competency record).
  await syncTrainingToCompetency(user.id)

  revalidatePath('/learning')
  revalidatePath('/competency')
  return { ok: true }
}
