import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getOrgStaff } from '@/lib/dal/org'
import { getTemplates } from '@/lib/dal/competency'
import { AssignForm } from '@/components/competency/AssignForm'

export default async function AssignPage() {
  await requireAppRole(MANAGER_ROLES)
  const [staff, templates] = await Promise.all([getOrgStaff(), getTemplates()])

  const templateOpts = templates.map(t => ({ id: t.id, label: t.name }))
  const staffOpts = staff.map(s => ({ id: s.id, label: `${s.name ?? '—'} (${s.role})` }))

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Assign a competency</h1>
        <p className="text-muted-foreground text-sm">
          The staff member trains; the engine scores mastery and pre-fills the validation. You sign off.
        </p>
      </header>

      {templates.length === 0 || staff.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Need at least one active competency template and one staff member. Seed a demo org to try this.
        </p>
      ) : (
        <AssignForm templates={templateOpts} staff={staffOpts} />
      )}
    </div>
  )
}
