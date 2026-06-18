import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/dal/auth'
import { remediationModuleSlug, type AuditCategory, type AuditSeverity } from '@/lib/audit-remediation'

// ============================================================
// Audit -> Remediation DAL (Phase C). The defensible-hub loop:
// manager cites a deficiency -> matching module auto-assigned -> tech
// reviews + validates -> manager closes. All RLS-scoped to the org.
// ============================================================

export type Audit = {
  id: string
  org_id: string
  staff_id: string
  auditor_id: string | null
  audit_date: string
  area: string | null
  category: AuditCategory
  severity: AuditSeverity
  finding: string
  domain: string | null
  concept_id: string | null
  status: 'open' | 'remediation_assigned' | 'remediated' | 'closed'
  validated_by: string | null
  closed_at: string | null
  created_at: string
}

export type ModuleAssignmentRow = {
  id: string
  org_id: string
  module_id: string
  staff_id: string
  assigned_by: string | null
  reason: 'manager' | 'remediation' | 'baseline'
  source_audit_id: string | null
  status: 'assigned' | 'in_progress' | 'completed' | 'validated'
  due_date: string | null
  assigned_at: string
  completed_at: string | null
}

const OPEN_STATUSES = ['assigned', 'in_progress']

// ---- Tech-facing reads ----

// Is this module an open (assigned/in_progress) assignment for the tech?
export async function isModuleRequiredForStaff(staffId: string, moduleId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('module_assignments')
    .select('id')
    .eq('staff_id', staffId)
    .eq('module_id', moduleId)
    .in('status', OPEN_STATUSES)
    .limit(1)
  return (data?.length ?? 0) > 0
}

export type RequiredModule = {
  assignment_id: string
  module_id: string
  slug: string
  title: string
  reason: 'manager' | 'remediation' | 'baseline'
  due_date: string | null
  finding: string | null
}

// Open required modules for the tech (remediation + manual assigns), joined to
// the module + (if remediation) the audit finding. For the "⚠️ Required" surface.
export const getRequiredModulesForStaff = cache(async (staffId: string): Promise<RequiredModule[]> => {
  const supabase = await createClient()
  const { data: assigns } = await supabase
    .from('module_assignments')
    .select('id, module_id, reason, due_date, source_audit_id, status, assigned_at')
    .eq('staff_id', staffId)
    .in('status', OPEN_STATUSES)
    .order('assigned_at', { ascending: false })
    .returns<Pick<ModuleAssignmentRow, 'id' | 'module_id' | 'reason' | 'due_date' | 'source_audit_id' | 'status' | 'assigned_at'>[]>()
  if (!assigns || assigns.length === 0) return []

  const moduleIds = [...new Set(assigns.map((a) => a.module_id))]
  const auditIds = [...new Set(assigns.map((a) => a.source_audit_id).filter(Boolean))] as string[]

  const [{ data: modules }, { data: audits }] = await Promise.all([
    supabase.from('learning_modules').select('id, slug, title').in('id', moduleIds).returns<{ id: string; slug: string; title: string }[]>(),
    auditIds.length
      ? supabase.from('audits').select('id, finding').in('id', auditIds).returns<{ id: string; finding: string }[]>()
      : Promise.resolve({ data: [] as { id: string; finding: string }[] }),
  ])
  const modById = new Map((modules ?? []).map((m) => [m.id, m]))
  const auditById = new Map((audits ?? []).map((a) => [a.id, a]))

  return assigns
    .map((a) => {
      const mod = modById.get(a.module_id)
      if (!mod) return null
      return {
        assignment_id: a.id,
        module_id: a.module_id,
        slug: mod.slug,
        title: mod.title,
        reason: a.reason,
        due_date: a.due_date,
        finding: a.source_audit_id ? auditById.get(a.source_audit_id)?.finding ?? null : null,
      }
    })
    .filter((x): x is RequiredModule => x !== null)
})

// Tech completes a module -> advance any open remediation/assignment for it.
// (Updates only the assignment row, which the tech owns under RLS; the audit
//  sign-off stays manager-only and is closed separately.)
export async function completeRemediationForModule(staffId: string, moduleId: string): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('module_assignments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('staff_id', staffId)
    .eq('module_id', moduleId)
    .in('status', OPEN_STATUSES)
}

// ---- Manager-facing reads ----

export type AuditWithNames = Audit & {
  staff_name: string | null
  auditor_name: string | null
  validated_by_name: string | null
  assignment: Pick<ModuleAssignmentRow, 'id' | 'module_id' | 'status' | 'completed_at'> | null
  module_slug: string | null
  module_title: string | null
}

export const getOrgAudits = cache(async (): Promise<AuditWithNames[]> => {
  const supabase = await createClient()
  const { data: audits } = await supabase
    .from('audits')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Audit[]>()
  if (!audits || audits.length === 0) return []

  const personIds = [...new Set(audits.flatMap((a) => [a.staff_id, a.auditor_id, a.validated_by]).filter(Boolean))] as string[]
  const auditIds = audits.map((a) => a.id)

  const [{ data: people }, { data: assigns }] = await Promise.all([
    supabase.from('profiles').select('id, name').in('id', personIds).returns<{ id: string; name: string | null }[]>(),
    supabase.from('module_assignments').select('id, module_id, status, completed_at, source_audit_id').in('source_audit_id', auditIds)
      .returns<(Pick<ModuleAssignmentRow, 'id' | 'module_id' | 'status' | 'completed_at'> & { source_audit_id: string })[]>(),
  ])
  const nameById = new Map((people ?? []).map((p) => [p.id, p.name]))
  const assignByAudit = new Map((assigns ?? []).map((a) => [a.source_audit_id, a]))

  const moduleIds = [...new Set((assigns ?? []).map((a) => a.module_id))]
  const { data: modules } = moduleIds.length
    ? await supabase.from('learning_modules').select('id, slug, title').in('id', moduleIds).returns<{ id: string; slug: string; title: string }[]>()
    : { data: [] as { id: string; slug: string; title: string }[] }
  const modById = new Map((modules ?? []).map((m) => [m.id, m]))

  return audits.map((a) => {
    const assign = assignByAudit.get(a.id) ?? null
    const mod = assign ? modById.get(assign.module_id) : null
    return {
      ...a,
      staff_name: nameById.get(a.staff_id) ?? null,
      auditor_name: a.auditor_id ? nameById.get(a.auditor_id) ?? null : null,
      validated_by_name: a.validated_by ? nameById.get(a.validated_by) ?? null : null,
      assignment: assign,
      module_slug: mod?.slug ?? null,
      module_title: mod?.title ?? null,
    }
  })
})

// ---- Manager-facing writes (called from server actions) ----

// Create an audit citation and auto-assign the mapped remediation module.
export async function createAudit(params: {
  staffId: string
  category: AuditCategory
  severity: AuditSeverity
  area: string | null
  finding: string
}): Promise<{ ok: boolean; auditId?: string; assigned?: boolean; error?: string }> {
  const user = await getAuthUser()
  if (!user || !user.orgId) return { ok: false, error: 'No org context' }
  const supabase = await createClient()

  const { data: audit, error } = await supabase
    .from('audits')
    .insert({
      org_id: user.orgId,
      staff_id: params.staffId,
      auditor_id: user.id,
      category: params.category,
      severity: params.severity,
      area: params.area,
      finding: params.finding,
      status: 'open',
    })
    .select('id')
    .single<{ id: string }>()
  if (error || !audit) return { ok: false, error: error?.message ?? 'insert failed' }

  // Resolve + assign the remediation module.
  const slug = remediationModuleSlug(params.category)
  let assigned = false
  if (slug) {
    const { data: mod } = await supabase
      .from('learning_modules')
      .select('id')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle<{ id: string }>()
    if (mod) {
      // reuse an existing open assignment for this module+staff, else create one
      const { data: open } = await supabase
        .from('module_assignments')
        .select('id')
        .eq('staff_id', params.staffId)
        .eq('module_id', mod.id)
        .in('status', OPEN_STATUSES)
        .limit(1)
      if (!open || open.length === 0) {
        await supabase.from('module_assignments').insert({
          org_id: user.orgId,
          module_id: mod.id,
          staff_id: params.staffId,
          assigned_by: user.id,
          reason: 'remediation',
          source_audit_id: audit.id,
        })
      }
      assigned = true
      await supabase.from('audits').update({ status: 'remediation_assigned' }).eq('id', audit.id)
    }
  }
  return { ok: true, auditId: audit.id, assigned }
}

// Manager closes/signs off an audit (and validates the linked assignment if done).
export async function closeAudit(auditId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getAuthUser()
  if (!user) return { ok: false, error: 'Not authenticated' }
  const supabase = await createClient()

  const { error } = await supabase
    .from('audits')
    .update({ status: 'closed', validated_by: user.id, closed_at: new Date().toISOString() })
    .eq('id', auditId)
  if (error) return { ok: false, error: error.message }

  // mark a completed remediation assignment as validated
  await supabase
    .from('module_assignments')
    .update({ status: 'validated' })
    .eq('source_audit_id', auditId)
    .eq('status', 'completed')

  return { ok: true }
}
