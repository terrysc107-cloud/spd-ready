import { notFound } from 'next/navigation'
import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getAssignmentForValidation } from '@/lib/dal/competency'
import { getStaffMember } from '@/lib/dal/org'
import { ValidateForm, type ValidateItem } from '@/components/competency/ValidateForm'
import { Badge } from '@/components/ui/badge'

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
    observations.filter(o => o.source === 'training').map(o => [o.item_id, o])
  )

  const validateItems: ValidateItem[] = items.map(i => {
    const t = trainingByItem.get(i.id)
    return {
      id: i.id,
      label: i.label,
      evidence_type: i.evidence_type,
      trainingResult: t?.result ?? null,
      masteryScore: t?.mastery_score ?? null,
    }
  })

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{template.name}</h1>
          <Badge variant="secondary" className="capitalize">{assignment.status.replace(/_/g, ' ')}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Validating <span className="font-medium text-foreground">{staff?.name ?? 'staff member'}</span>.
          Engine-derived results are pre-filled — override per item, then sign off.
        </p>
      </header>

      <ValidateForm assignmentId={assignmentId} items={validateItems} />
    </div>
  )
}
