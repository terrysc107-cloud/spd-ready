import Link from 'next/link'
import { requireAuth } from '@/lib/dal/auth'
import { getAssignmentsForStaff, getTemplates } from '@/lib/dal/competency'
import { Badge } from '@/components/ui/badge'

const STATUS_LABEL: Record<string, string> = {
  assigned: 'Assigned',
  in_training: 'In training',
  ready_for_validation: 'Ready for validation',
  validated: 'Validated',
  failed: 'Needs remediation',
  expired: 'Expired',
}

export default async function MyCompetenciesPage() {
  const user = await requireAuth()
  const [assignments, templates] = await Promise.all([
    getAssignmentsForStaff(user.id),
    getTemplates(),
  ])
  const tmplName = new Map(templates.map(t => [t.id, t.name]))

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">My competencies</h1>
        <p className="text-muted-foreground text-sm">
          Train to raise your mastery — your readiness feeds each competency automatically.
        </p>
      </header>

      <div className="rounded-lg border divide-y bg-white">
        {assignments.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">No competencies assigned yet.</p>
        )}
        {assignments.map(a => (
          <div key={a.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="font-medium text-sm">{tmplName.get(a.template_id) ?? 'Competency'}</p>
              {a.due_date && <p className="text-xs text-muted-foreground">Due {a.due_date}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={a.status === 'validated' ? 'default' : 'secondary'}>
                {STATUS_LABEL[a.status] ?? a.status}
              </Badge>
              <Link href="/student/learning" className="text-xs font-medium text-primary hover:underline">
                Train →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
