import { cache } from 'react'
import { readStore, writeStore } from '@/lib/local-db/store'
import type { Certificate, LearningDomain } from '@/lib/local-db/types'

// Per D-26: approximate CE credits, not real-world authoritative
export const CE_CREDITS_BY_DOMAIN: Record<LearningDomain, number> = {
  foundational: 2,
  decontamination: 3,
  high_level_disinfection: 3,
  iap: 2,
  sterilization: 2,
  sterile_storage: 1,
  spd_judgment: 1,
}

// Per D-25: 'SPD Ready Demo' for v1 — slot reserved for future partners
export const DEFAULT_PARTNER_ISSUER = 'SPD Ready Demo'

export async function issueCertificate(params: {
  studentUserId: string
  domain: LearningDomain
}): Promise<Certificate> {
  const { studentUserId, domain } = params
  const store = readStore()

  const cert: Certificate = {
    id: crypto.randomUUID(),
    student_user_id: studentUserId,
    domain,
    ce_credits: CE_CREDITS_BY_DOMAIN[domain],
    partner_issuer: DEFAULT_PARTNER_ISSUER,
    issued_at: new Date().toISOString(),
  }

  // Mark only the oldest open assignment for this domain as completed (D-18: 1:1 cert-to-assignment).
  // Use .find() (not .filter() + .forEach) so only ONE assignment is marked per certificate issuance.
  const openAssignments = store.module_assignments
    .filter(a => a.student_user_id === studentUserId && a.domain === domain && a.completed_at === null)
    .sort((a, b) => a.assigned_at.localeCompare(b.assigned_at))
  const oldestOpen = openAssignments.find(a => a.completed_at === null)
  if (oldestOpen) {
    const idx = store.module_assignments.findIndex(a => a.id === oldestOpen.id)
    if (idx !== -1) {
      store.module_assignments[idx] = { ...oldestOpen, completed_at: cert.issued_at }
    }
  }

  store.certificates.push(cert)

  // Single write — gather all mutations above, then persist exactly once.
  writeStore(store)
  return cert
}

export const getCertificatesForStudent = cache(async (studentUserId: string): Promise<Certificate[]> => {
  const store = readStore()
  return store.certificates
    .filter(c => c.student_user_id === studentUserId)
    .slice()
    .sort((a, b) => b.issued_at.localeCompare(a.issued_at))
})

export const getCEStats = cache(async (studentUserId: string): Promise<{ count: number; total_credits: number }> => {
  const certs = await getCertificatesForStudent(studentUserId)
  return {
    count: certs.length,
    total_credits: certs.reduce((sum, c) => sum + c.ce_credits, 0),
  }
})
