'use server'

import { requireRole } from '@/lib/dal/auth'
import { issueCertificate } from '@/lib/dal/certificates'
import type { LearningDomain } from '@/lib/local-db/types'
import { revalidatePath } from 'next/cache'

export async function issueCertificateOnCompletionAction(params: {
  domain: LearningDomain
}): Promise<{ ok: true; certificate_id: string }> {
  const user = await requireRole('student')
  const cert = await issueCertificate({ studentUserId: user.id, domain: params.domain })
  revalidatePath('/student/profile')
  revalidatePath('/student/learning')
  return { ok: true, certificate_id: cert.id }
}
