import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getStaffMember, getDepartments } from '@/lib/dal/org'
import { getAssignmentsForStaff, getTemplates, getEvidenceReport } from '@/lib/dal/competency'
import { PageHeader } from '@/components/ui/page-header'
import { StatusPill, type CompetencyStatus } from '@/components/ui/status-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, BadgeCheckIcon, ClipboardListIcon } from 'lucide-react'

const VALIDATABLE = new Set(['assigned', 'in_training', 'ready_for_validation'])

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ staffId: string }>
}) {
  await requireAppRole(MANAGER_ROLES)
  const { staffId } = await params

  const staff = await getStaffMember(staffId)
  if (!staff) notFound()

  const [assignments, templates, departments, allEvidence] = await Promise.all([
    getAssignmentsForStaff(staffId),
    getTemplates(),
    getDepartments(),
    getEvidenceReport(),
  ])
  const tmplName = new Map(templates.map((t) => [t.id, t.name]))
  const deptName = new Map(departments.map((d) => [d.id, d.name]))
  const evidence = allEvidence.filter((e) => e.staff_id === staffId)

  return (
    <div className="space-y-6">
      <Link
        href="/competency/staff"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" /> Staff
      </Link>

      <PageHeader
        title={staff.name ?? '—'}
        eyebrow={`${staff.role} · ${deptName.get(staff.department_id ?? '') ?? 'No department'}`}
        description="Assigned competencies, training progress, and signed-off evidence."
        actions={
          <Link href="/competency/assign">
            <Button variant="outline">Assign competency</Button>
          </Link>
        }
      />

      {/* Assigned competencies */}
      <section className="space-y-3">
        <h2 className="font-heading text-base font-medium">Competencies</h2>
        {assignments.length === 0 ? (
          <EmptyState
            icon={ClipboardListIcon}
            title="No competencies assigned"
            description="Assign a competency template to start this tech's record."
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
                  {VALIDATABLE.has(a.status) && (
                    <Link href={`/competency/validate/${a.id}`}>
                      <Button size="sm" variant={a.status === 'ready_for_validation' ? 'default' : 'outline'}>
                        {a.status === 'ready_for_validation' ? 'Sign off' : 'Validate'}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Evidence */}
      <section className="space-y-3">
        <h2 className="font-heading text-base font-medium">Signed-off evidence</h2>
        {evidence.length === 0 ? (
          <EmptyState icon={BadgeCheckIcon} title="No signed-off competencies yet" />
        ) : (
          <div className="divide-y rounded-xl bg-card shadow-sm ring-1 ring-foreground/10">
            {evidence.map((e) => (
              <div key={e.record_id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.template_name}</p>
                  <p className="text-xs text-muted-foreground">
                    by {e.validated_by_name || '—'}
                    {e.validation_method ? ` · ${e.validation_method.replace(/_/g, ' ')}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusPill status={e.outcome === 'pass' ? 'validated' : 'failed'} />
                  <span className="font-mono text-xs text-muted-foreground">{e.signed_off_at.slice(0, 10)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
