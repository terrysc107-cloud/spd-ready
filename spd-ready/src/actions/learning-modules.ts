'use server'

import { requireAuth } from '@/lib/dal/auth'
import { recordModuleCompletion } from '@/lib/dal/learning-modules'
import { completeRemediationForModule } from '@/lib/dal/audits'
import { revalidatePath } from 'next/cache'

// Called when a tech finishes a module's check-for-understanding quiz.
// Persists the completion (system of record) and, if this module was an open
// remediation assignment, advances that assignment + its source audit.
export async function completeModuleAction(params: {
  moduleId: string
  scorePct: number
}): Promise<{ ok: true }> {
  const user = await requireAuth()

  await recordModuleCompletion({
    userId: user.id,
    moduleId: params.moduleId,
    scorePct: params.scorePct,
    completed: true,
  })

  // Close out any open remediation assignment for this module (audit loop).
  await completeRemediationForModule(user.id, params.moduleId)

  revalidatePath('/student/learning')
  revalidatePath('/student/dashboard')
  revalidatePath('/student/learning/modules')
  revalidatePath('/competency')
  return { ok: true }
}
