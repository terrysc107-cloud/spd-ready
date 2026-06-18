'use server'

import { requireAuth, requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import {
  recordJudgmentAssessment,
  saveTechFeedback,
  saveManagerAdjustment,
} from '@/lib/dal/mindset'
import { tallyByJudgmentType } from '@/lib/dal/mindset-logic'
import { ARCHETYPE_BY_ID, type MindsetDimensionKey, type ArchetypeId } from '@/lib/mindset-model'
import { revalidatePath } from 'next/cache'

// Submit the judgment baseline (or a later check-in). Correctness per scenario
// is computed client-side from the question data already on the page and sent
// here — the same trust model the study-session action already uses.
export async function submitJudgmentBaselineAction(input: {
  answers: { judgmentType: string | null; correct: boolean }[]
  selfLikert: Record<MindsetDimensionKey, number>
}): Promise<{ ok: true; isBaseline: boolean }> {
  const user = await requireAuth()
  const tally = tallyByJudgmentType(input.answers)
  const { isBaseline } = await recordJudgmentAssessment(user.id, {
    tally,
    selfLikert: input.selfLikert,
  })
  revalidatePath('/student/mindset')
  revalidatePath('/student/dashboard')
  return { ok: true, isBaseline }
}

// Beta feedback tap: "Does this fit?" → fits | partly | no (+ optional note).
export async function submitMindsetFeedbackAction(input: {
  value: 'fits' | 'partly' | 'no'
  note?: string | null
}): Promise<{ ok: true }> {
  const user = await requireAuth()
  await saveTechFeedback(user.id, input.value, input.note?.trim() || null)
  revalidatePath('/student/mindset')
  return { ok: true }
}

// Manager validates/adjusts a tech's archetype.
export async function adjustMindsetArchetypeAction(input: {
  staffId: string
  archetype: ArchetypeId
  note?: string | null
}): Promise<{ ok: true }> {
  const manager = await requireAppRole(MANAGER_ROLES)
  if (!ARCHETYPE_BY_ID[input.archetype]) throw new Error('Unknown archetype')
  await saveManagerAdjustment(input.staffId, {
    archetype: input.archetype,
    note: input.note?.trim() || '',
    by: manager.id,
    by_name: manager.name,
    at: new Date().toISOString(),
  })
  revalidatePath(`/competency/staff/${input.staffId}`)
  return { ok: true }
}
