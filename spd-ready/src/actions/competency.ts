'use server'

import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { createClient } from '@/lib/supabase/server'
import { getAssignmentForValidation } from '@/lib/dal/competency'
import { revalidatePath } from 'next/cache'

// Manager assigns a competency template to a staff member.
export async function assignCompetencyAction(
  templateId: string,
  staffId: string,
  dueDate: string | null = null
): Promise<{ ok: true; assignmentId: string }> {
  const manager = await requireAppRole(MANAGER_ROLES)
  if (!manager.orgId) throw new Error('Manager has no organization')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('competency_assignments')
    .upsert(
      {
        org_id: manager.orgId,
        template_id: templateId,
        staff_id: staffId,
        assigned_by: manager.id,
        status: 'assigned',
        due_date: dueDate,
      },
      { onConflict: 'template_id,staff_id' }
    )
    .select('id')
    .single<{ id: string }>()
  if (error || !data) throw new Error(`assignCompetency failed: ${error?.message ?? 'no row'}`)

  revalidatePath('/competency')
  return { ok: true, assignmentId: data.id }
}

export type ManagerItemResult = { item_id: string; result: 'pass' | 'fail' | 'na'; note?: string | null }

// Manager validates and signs off. Writes manager-source observations,
// merges them with the training-source observations, and upserts the
// single verifiable competency_records row.
export async function validateCompetencyAction(
  assignmentId: string,
  perItemResults: ManagerItemResult[],
  method: 'training_auto' | 'direct_observation' | 'audit'
): Promise<{ ok: true; outcome: 'pass' | 'fail' }> {
  const manager = await requireAppRole(MANAGER_ROLES)
  if (!manager.orgId) throw new Error('Manager has no organization')
  const supabase = await createClient()

  const detail = await getAssignmentForValidation(assignmentId)
  if (!detail) throw new Error('Assignment not found')
  const { assignment, template, items, observations } = detail

  // Write manager-source observations (upsert one per item)
  if (perItemResults.length) {
    await supabase
      .from('competency_observations')
      .upsert(
        perItemResults.map(r => ({
          assignment_id: assignmentId,
          item_id: r.item_id,
          source: 'manager' as const,
          result: r.result,
          observed_by: manager.id,
          note: r.note ?? null,
        })),
        { onConflict: 'assignment_id,item_id,source' }
      )
  }

  // Merge: manager override wins, else training result. 'na' ignored for outcome.
  const managerById = new Map(perItemResults.map(r => [r.item_id, r.result]))
  const trainingById = new Map(
    observations.filter(o => o.source === 'training').map(o => [o.item_id, o.result])
  )
  let anyFail = false
  for (const item of items) {
    const final = managerById.get(item.id) ?? trainingById.get(item.id) ?? null
    if (final === 'fail') anyFail = true
  }
  const outcome: 'pass' | 'fail' = anyFail ? 'fail' : 'pass'

  // training_score = avg of training observation mastery scores
  const trainingScores = observations
    .filter(o => o.source === 'training' && o.mastery_score != null)
    .map(o => o.mastery_score as number)
  const trainingScore = trainingScores.length
    ? Math.round(trainingScores.reduce((s, n) => s + n, 0) / trainingScores.length)
    : null

  // Upsert the single competency_records row (assignment_id is unique)
  const { error: recErr } = await supabase
    .from('competency_records')
    .upsert(
      {
        org_id: assignment.org_id ?? manager.orgId,
        assignment_id: assignmentId,
        staff_id: assignment.staff_id,
        template_id: template.id,
        template_name_snapshot: template.name,
        outcome,
        training_score: trainingScore,
        validated_by: manager.id,
        validated_by_name_snapshot: manager.name,
        validation_method: method,
        signed_off_at: new Date().toISOString(),
      },
      { onConflict: 'assignment_id' }
    )
  if (recErr) throw new Error(`competency record write failed: ${recErr.message}`)

  await supabase
    .from('competency_assignments')
    .update({ status: outcome === 'pass' ? 'validated' : 'failed' })
    .eq('id', assignmentId)

  revalidatePath('/competency')
  return { ok: true, outcome }
}
