import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getOrgStaff } from '@/lib/dal/org'
import { getTemplates } from '@/lib/dal/competency'
import { AssignForm } from '@/components/competency/AssignForm'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ClipboardListIcon } from 'lucide-react'

export default async function AssignPage() {
  await requireAppRole(MANAGER_ROLES)
  const [staff, templates] = await Promise.all([getOrgStaff(), getTemplates()])

  const templateOpts = templates.map((t) => ({ id: t.id, label: t.name }))
  const staffOpts = staff.map((s) => ({ id: s.id, label: `${s.name ?? '—'} (${s.role})` }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign a competency"
        description="The tech trains; the engine scores mastery and pre-fills the validation. You sign off."
      />

      {templates.length === 0 || staff.length === 0 ? (
        <EmptyState
          icon={ClipboardListIcon}
          title="Need a template and staff"
          description="At least one active competency template and one staff member are required. Seed a demo org to try this."
        />
      ) : (
        <Card>
          <CardContent>
            <AssignForm templates={templateOpts} staff={staffOpts} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
