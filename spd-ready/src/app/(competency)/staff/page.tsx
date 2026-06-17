import Link from 'next/link'
import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getOrgStaff, getDepartments } from '@/lib/dal/org'
import { Badge } from '@/components/ui/badge'

export default async function StaffPage() {
  await requireAppRole(MANAGER_ROLES)
  const [staff, departments] = await Promise.all([getOrgStaff(), getDepartments()])
  const deptName = new Map(departments.map(d => [d.id, d.name]))

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Staff</h1>
        <p className="text-muted-foreground text-sm">Everyone in your organization. Assign competencies and validate readiness.</p>
      </header>

      <div className="rounded-lg border divide-y bg-white">
        {staff.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">No staff yet. Seed a demo org or invite staff.</p>
        )}
        {staff.map(s => (
          <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="font-medium text-sm">{s.name ?? '—'}</p>
              <p className="text-xs text-muted-foreground">
                {deptName.get(s.department_id ?? '') ?? 'No department'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">{s.role}</Badge>
              <Link href="/competency/assign" className="text-xs font-medium text-primary hover:underline">
                Assign →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
