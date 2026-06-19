'use server'

import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { createAudit, closeAudit } from '@/lib/dal/audits'
import { AUDIT_CATEGORY_BY_KEY, AUDIT_SEVERITIES, type AuditCategory, type AuditSeverity } from '@/lib/audit-remediation'
import { revalidatePath } from 'next/cache'

export async function createAuditAction(params: {
  staffId: string
  category: string
  severity: string
  area: string
  finding: string
}): Promise<{ ok: boolean; assigned?: boolean; error?: string }> {
  await requireAppRole(MANAGER_ROLES)

  if (!AUDIT_CATEGORY_BY_KEY[params.category as AuditCategory]) return { ok: false, error: 'Invalid category' }
  if (!AUDIT_SEVERITIES.includes(params.severity as AuditSeverity)) return { ok: false, error: 'Invalid severity' }
  if (!params.finding.trim()) return { ok: false, error: 'Finding is required' }

  const res = await createAudit({
    staffId: params.staffId,
    category: params.category as AuditCategory,
    severity: params.severity as AuditSeverity,
    area: params.area.trim() || null,
    finding: params.finding.trim(),
  })
  if (!res.ok) return { ok: false, error: res.error }

  revalidatePath('/competency/audits')
  revalidatePath(`/competency/staff/${params.staffId}`)
  return { ok: true, assigned: res.assigned }
}

export async function closeAuditAction(auditId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAppRole(MANAGER_ROLES)
  const res = await closeAudit(auditId)
  if (!res.ok) return { ok: false, error: res.error }
  revalidatePath('/competency/audits')
  return { ok: true }
}
