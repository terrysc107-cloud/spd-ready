import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getConceptMastery } from '@/lib/dal/mastery'
import { deriveTrainingObservations, type TrainingObservation } from '@/lib/dal/competency-logic'

export { deriveTrainingObservations }
export type { TrainingObservation }

// ============================================================
// Competency DAL (Slice 1)
// The standardized loop: template -> assign -> training auto-feeds +
// manager validates -> a single verifiable competency_records row.
// ============================================================

export type CompetencyTemplate = {
  id: string
  org_id: string | null
  name: string
  description: string | null
  domain: string | null
  version: string
  status: 'draft' | 'active' | 'archived'
  pass_threshold: number
}

export type CompetencyItem = {
  id: string
  template_id: string
  label: string
  concept_id: string | null
  domain: string | null
  evidence_type: 'observation' | 'training' | 'either'
  weight: number
  item_order: number
}

export type CompetencyAssignment = {
  id: string
  org_id: string | null
  template_id: string
  staff_id: string
  assigned_by: string | null
  status: 'assigned' | 'in_training' | 'ready_for_validation' | 'validated' | 'failed' | 'expired'
  due_date: string | null
  assigned_at: string
}

export type EvidenceRow = {
  record_id: string
  staff_id: string
  staff_name: string
  template_name: string
  outcome: 'pass' | 'fail'
  training_score: number | null
  validated_by_name: string | null
  validation_method: string | null
  signed_off_at: string
}

// ------------------------------------------------------------
// Reads
// ------------------------------------------------------------
export const getTemplates = cache(async (): Promise<CompetencyTemplate[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competency_templates')
    .select('id, org_id, name, description, domain, version, status, pass_threshold')
    .eq('status', 'active')
    .order('name')
    .returns<CompetencyTemplate[]>()
  return data ?? []
})

export const getTemplateWithItems = cache(async (
  templateId: string
): Promise<{ template: CompetencyTemplate; items: CompetencyItem[] } | null> => {
  const supabase = await createClient()
  const { data: template } = await supabase
    .from('competency_templates')
    .select('id, org_id, name, description, domain, version, status, pass_threshold')
    .eq('id', templateId)
    .maybeSingle<CompetencyTemplate>()
  if (!template) return null
  const { data: items } = await supabase
    .from('competency_items')
    .select('id, template_id, label, concept_id, domain, evidence_type, weight, item_order')
    .eq('template_id', templateId)
    .order('item_order')
    .returns<CompetencyItem[]>()
  return { template, items: items ?? [] }
})

export const getAssignmentsForStaff = cache(async (staffId: string): Promise<CompetencyAssignment[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competency_assignments')
    .select('id, org_id, template_id, staff_id, assigned_by, status, due_date, assigned_at')
    .eq('staff_id', staffId)
    .order('assigned_at', { ascending: false })
    .returns<CompetencyAssignment[]>()
  return data ?? []
})

export const getAssignmentForValidation = cache(async (assignmentId: string): Promise<{
  assignment: CompetencyAssignment
  template: CompetencyTemplate
  items: CompetencyItem[]
  observations: { item_id: string; source: 'training' | 'manager'; result: 'pass' | 'fail' | 'na'; mastery_score: number | null }[]
} | null> => {
  const supabase = await createClient()
  const { data: assignment } = await supabase
    .from('competency_assignments')
    .select('id, org_id, template_id, staff_id, assigned_by, status, due_date, assigned_at')
    .eq('id', assignmentId)
    .maybeSingle<CompetencyAssignment>()
  if (!assignment) return null
  const tw = await getTemplateWithItems(assignment.template_id)
  if (!tw) return null
  const { data: observations } = await supabase
    .from('competency_observations')
    .select('item_id, source, result, mastery_score')
    .eq('assignment_id', assignmentId)
    .returns<{ item_id: string; source: 'training' | 'manager'; result: 'pass' | 'fail' | 'na'; mastery_score: number | null }[]>()
  return { assignment, template: tw.template, items: tw.items, observations: observations ?? [] }
})

// Evidence report: who was validated, on what, by whom, when.
export const getEvidenceReport = cache(async (): Promise<EvidenceRow[]> => {
  const supabase = await createClient()
  const { data: records } = await supabase
    .from('competency_records')
    .select('id, staff_id, template_name_snapshot, outcome, training_score, validated_by_name_snapshot, validation_method, signed_off_at')
    .order('signed_off_at', { ascending: false })
    .returns<{
      id: string
      staff_id: string
      template_name_snapshot: string
      outcome: 'pass' | 'fail'
      training_score: number | null
      validated_by_name_snapshot: string | null
      validation_method: string | null
      signed_off_at: string
    }[]>()
  if (!records?.length) return []

  // Resolve staff names in one query
  const staffIds = [...new Set(records.map(r => r.staff_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', staffIds)
    .returns<{ id: string; name: string | null }[]>()
  const nameById = new Map((profiles ?? []).map(p => [p.id, p.name ?? '']))

  return records.map(r => ({
    record_id: r.id,
    staff_id: r.staff_id,
    staff_name: nameById.get(r.staff_id) ?? '',
    template_name: r.template_name_snapshot,
    outcome: r.outcome,
    training_score: r.training_score,
    validated_by_name: r.validated_by_name_snapshot,
    validation_method: r.validation_method,
    signed_off_at: r.signed_off_at,
  }))
})

// ------------------------------------------------------------
// Auto-feed: training results -> competency_observations (source='training')
// Called after every recorded attempt. Runs as the staff member (RLS:
// techs may write training-source observations for their own assignments).
// ------------------------------------------------------------
export async function syncTrainingToCompetency(staffId: string): Promise<void> {
  const supabase = await createClient()
  const { data: assignments } = await supabase
    .from('competency_assignments')
    .select('id, template_id, status')
    .eq('staff_id', staffId)
    .in('status', ['assigned', 'in_training', 'ready_for_validation'])
    .returns<{ id: string; template_id: string; status: CompetencyAssignment['status'] }[]>()
  if (!assignments?.length) return

  const masteries = await getConceptMastery(staffId)

  for (const a of assignments) {
    const tw = await getTemplateWithItems(a.template_id)
    if (!tw) continue
    const obs = deriveTrainingObservations(masteries, tw.items, tw.template.pass_threshold)
    if (obs.length) {
      await supabase
        .from('competency_observations')
        .upsert(
          obs.map(o => ({
            assignment_id: a.id,
            item_id: o.item_id,
            source: 'training' as const,
            result: o.result,
            mastery_score: o.mastery_score,
          })),
          { onConflict: 'assignment_id,item_id,source' }
        )
    }

    // Status: all training-backed items passing -> ready_for_validation
    const trainingItems = tw.items.filter(
      i => i.evidence_type !== 'observation' && (i.concept_id || i.domain)
    )
    const passing = obs.filter(o => o.result === 'pass').length
    const allTrainingPass = trainingItems.length > 0 && passing >= trainingItems.length
    const nextStatus = allTrainingPass ? 'ready_for_validation' : 'in_training'
    if (a.status !== nextStatus) {
      await supabase.from('competency_assignments').update({ status: nextStatus }).eq('id', a.id)
    }
  }
}
