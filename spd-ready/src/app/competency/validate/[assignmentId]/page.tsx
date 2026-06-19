import { notFound } from 'next/navigation'
import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getAssignmentForValidation } from '@/lib/dal/competency'
import { getStaffMember } from '@/lib/dal/org'
import { ValidateForm, type ValidateItem } from '@/components/competency/ValidateForm'
import { PageHeader } from '@/components/ui/page-header'
import { StatusPill, type CompetencyStatus } from '@/components/ui/status-pill'

export default async function ValidatePage({
  params,
}: {
  params: Promise<{ assignmentId: string }>
}) {
  await requireAppRole(MANAGER_ROLES)
  const { assignmentId } = await params

  const detail = await getAssignmentForValidation(assignmentId)
  if (!detail) notFound()
  const { assignment, template, items, observations } = detail
  const staff = await getStaffMember(assignment.staff_id)

  const trainingByItem = new Map(
    observations.filter((o) => o.source === 'training').map((o) => [o.item_id, o])
  )

  const validateItems: ValidateItem[] = items.map((i) => {
    const t = trainingByItem.get(i.id)
    return {
      id: i.id,
      label: i.label,
      evidence_type: i.evidence_type,
      trainingResult: t?.result ?? null,
      masteryScore: t?.mastery_score ?? null,
    }
  })

  const prefilled = validateItems.filter((i) => i.trainingResult != null).length

  return (
    <div className="space-y-6">
      <PageHeader
        title={template.name}
        eyebrow={`Validating ${staff?.name ?? 'staff member'}`}
        description="Engine-derived results are pre-filled from the tech's training — override per item, then sign off."
        actions={<StatusPill status={assignment.status as CompetencyStatus} />}
      />

      {prefilled > 0 && (
        <div className="rounded-xl bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
          Engine pre-filled <span className="font-medium text-foreground tabular-nums">{prefilled}</span> of{' '}
          <span className="tabular-nums">{validateItems.length}</span> items from training mastery.
        </div>
      )}

      <ValidateForm assignmentId={assignmentId} items={validateItems} />
    </div>
  )
}
