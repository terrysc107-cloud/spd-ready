import Link from 'next/link'
import { requireAuth } from '@/lib/dal/auth'
import { getAssignmentsForStaff, getTemplates } from '@/lib/dal/competency'
import { PageHeader } from '@/components/ui/page-header'
import { StatusPill, type CompetencyStatus } from '@/components/ui/status-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { BadgeCheckIcon } from 'lucide-react'

export default async function MyCompetenciesPage() {
  const user = await requireAuth()
  const [assignments, templates] = await Promise.all([
    getAssignmentsForStaff(user.id),
    getTemplates(),
  ])
  const tmplName = new Map(templates.map((t) => [t.id, t.name]))

  return (
    <div className="space-y-6">
      <PageHeader
        title="My competencies"
        description="Train to raise your mastery — your readiness feeds each competency automatically."
      />

      {assignments.length === 0 ? (
        <EmptyState
          icon={BadgeCheckIcon}
          title="No competencies assigned yet"
          description="When your manager assigns a competency, it appears here. Keep training in the meantime."
          action={
            <Link href="/student/learning">
              <Button size="sm" variant="outline">Go to training</Button>
            </Link>
          }
        />
      ) : (
        <div className="divide-y rounded-xl bg-card shadow-sm ring-1 ring-foreground/10">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{tmplName.get(a.template_id) ?? 'Competency'}</p>
                {a.due_date && <p className="text-xs text-muted-foreground">Due {a.due_date}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusPill status={a.status as CompetencyStatus} />
                <Link href="/student/learning">
                  <Button size="sm" variant="ghost">Train</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
