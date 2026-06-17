import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// Manager-overview aggregates over competency_assignments (RLS org-scoped).
// Additive — no schema change. Pure tallying so they're cheap and cacheable.

type AssignmentRow = {
  id: string
  staff_id: string
  template_id: string
  status: string
  due_date: string | null
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function isOverdue(status: string, due: string | null): boolean {
  if (!due) return false
  if (status === 'validated' || status === 'failed' || status === 'expired') return false
  return due < todayISO()
}

const getOrgAssignmentsRaw = cache(async (): Promise<AssignmentRow[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competency_assignments')
    .select('id, staff_id, template_id, status, due_date')
    .returns<AssignmentRow[]>()
  return data ?? []
})

const getTemplateNameMap = cache(async (): Promise<Map<string, string>> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competency_templates')
    .select('id, name')
    .returns<{ id: string; name: string }[]>()
  return new Map((data ?? []).map((t) => [t.id, t.name]))
})

export type ReadinessSummary = {
  staffTotal: number
  validated: number
  inTraining: number
  readyForValidation: number
  assigned: number
  needsRemediation: number
  overdue: number
  totalAssignments: number
  pctValidated: number
}

export const getOrgReadinessSummary = cache(async (staffTotal: number): Promise<ReadinessSummary> => {
  const rows = await getOrgAssignmentsRaw()
  let validated = 0, inTraining = 0, ready = 0, assigned = 0, remediation = 0, overdue = 0
  for (const a of rows) {
    if (a.status === 'validated') validated++
    else if (a.status === 'in_training') inTraining++
    else if (a.status === 'ready_for_validation') ready++
    else if (a.status === 'assigned') assigned++
    else if (a.status === 'failed') remediation++
    if (isOverdue(a.status, a.due_date)) overdue++
  }
  const total = rows.length
  return {
    staffTotal,
    validated,
    inTraining,
    readyForValidation: ready,
    assigned,
    needsRemediation: remediation,
    overdue,
    totalAssignments: total,
    pctValidated: total ? Math.round((validated / total) * 100) : 0,
  }
})

export type AttentionItem = {
  assignmentId: string
  staffId: string
  staffName: string
  templateName: string
  reason: 'ready' | 'overdue'
  dueDate: string | null
}

export const getAssignmentsNeedingAttention = cache(
  async (staffNameById: Map<string, string>): Promise<AttentionItem[]> => {
    const [rows, tmplNames] = await Promise.all([getOrgAssignmentsRaw(), getTemplateNameMap()])
    const items: AttentionItem[] = []
    for (const a of rows) {
      const overdue = isOverdue(a.status, a.due_date)
      const ready = a.status === 'ready_for_validation'
      if (!overdue && !ready) continue
      items.push({
        assignmentId: a.id,
        staffId: a.staff_id,
        staffName: staffNameById.get(a.staff_id) ?? '—',
        templateName: tmplNames.get(a.template_id) ?? 'Competency',
        reason: ready ? 'ready' : 'overdue',
        dueDate: a.due_date,
      })
    }
    // ready-to-sign-off first, then overdue
    return items.sort((a, b) => (a.reason === b.reason ? 0 : a.reason === 'ready' ? -1 : 1))
  }
)

export type StaffRollup = {
  validated: number
  inTraining: number
  ready: number
  overdue: number
  total: number
}

export const getStaffCompetencyRollup = cache(async (): Promise<Map<string, StaffRollup>> => {
  const rows = await getOrgAssignmentsRaw()
  const map = new Map<string, StaffRollup>()
  for (const a of rows) {
    const r = map.get(a.staff_id) ?? { validated: 0, inTraining: 0, ready: 0, overdue: 0, total: 0 }
    r.total++
    if (a.status === 'validated') r.validated++
    else if (a.status === 'in_training') r.inTraining++
    else if (a.status === 'ready_for_validation') r.ready++
    if (isOverdue(a.status, a.due_date)) r.overdue++
    map.set(a.staff_id, r)
  }
  return map
})
