import Link from 'next/link'
import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getOrgStaff, getMyOrg } from '@/lib/dal/org'
import { getEvidenceReport } from '@/lib/dal/competency'
import {
  getOrgReadinessSummary,
  getAssignmentsNeedingAttention,
} from '@/lib/dal/competency-overview'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { ProgressRing } from '@/components/ui/progress-ring'
import { StatusPill } from '@/components/ui/status-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import {
  UsersIcon,
  BadgeCheckIcon,
  ClockIcon,
  BellRingIcon,
  TriangleAlertIcon,
  InboxIcon,
  ArrowRightIcon,
} from 'lucide-react'

function fmtDate(iso: string): string {
  return iso.slice(0, 10)
}

export default async function CompetencyOverviewPage() {
  await requireAppRole(MANAGER_ROLES)

  const [org, staff] = await Promise.all([getMyOrg(), getOrgStaff()])
  const nameById = new Map(staff.map((s) => [s.id, s.name ?? '—']))
  const [summary, attention, evidence] = await Promise.all([
    getOrgReadinessSummary(staff.length),
    getAssignmentsNeedingAttention(nameById),
    getEvidenceReport(),
  ])

  const pct = summary.pctValidated
  const ringColor =
    pct >= 80 ? 'oklch(0.55 0.18 150)' : pct >= 50 ? 'oklch(0.65 0.18 80)' : 'oklch(0.577 0.245 27)'
  const recent = evidence.slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader
        gradient
        eyebrow={org?.name ?? 'Your department'}
        title="Department readiness"
        description="Train, validate, and prove competency — one verifiable record."
        actions={
          <div className="flex gap-2">
            <Link href="/competency/audits">
              <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">Audits</Button>
            </Link>
            <Link href="/competency/assign">
              <Button className="bg-white text-primary hover:bg-white/90">Assign competency</Button>
            </Link>
          </div>
        }
      />

      {/* Metric row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Staff" value={summary.staffTotal} icon={UsersIcon} tone="muted" />
        <StatCard label="Validated" value={summary.validated} icon={BadgeCheckIcon} tone="green" />
        <StatCard label="In training" value={summary.inTraining} icon={ClockIcon} tone="gold" />
        <StatCard label="Ready to sign off" value={summary.readyForValidation} icon={BellRingIcon} tone="accent" />
        <StatCard label="Overdue" value={summary.overdue} icon={TriangleAlertIcon} tone="red" />
      </div>

      {/* Readiness ring */}
      <div className="flex flex-col items-center gap-5 rounded-xl bg-card p-6 shadow-sm ring-1 ring-foreground/10 sm:flex-row sm:gap-8">
        <ProgressRing value={pct} label={`${pct}%`} sublabel="validated" size={128} color={ringColor} />
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-heading text-base font-medium">Survey readiness</h2>
          <p className="text-sm text-muted-foreground">
            {summary.totalAssignments === 0
              ? 'No competencies assigned yet. Assign one to start building the record.'
              : `${summary.validated} of ${summary.totalAssignments} assigned competencies validated` +
                (summary.readyForValidation > 0
                  ? ` · ${summary.readyForValidation} ready for your sign-off.`
                  : '.')}
          </p>
        </div>
      </div>

      {/* Needs attention */}
      <section className="space-y-3">
        <h2 className="font-heading text-base font-medium">Needs your attention</h2>
        {attention.length === 0 ? (
          <EmptyState
            icon={BadgeCheckIcon}
            title="Nothing waiting on you"
            description="When a tech finishes training or a competency goes overdue, it shows up here."
          />
        ) : (
          <div className="divide-y rounded-xl bg-card shadow-sm ring-1 ring-foreground/10">
            {attention.map((a) => (
              <div key={a.assignmentId} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.staffName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.templateName}
                    {a.reason === 'overdue' && a.dueDate ? ` · due ${a.dueDate}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusPill status={a.reason === 'ready' ? 'ready_for_validation' : 'overdue'} />
                  <Link href={`/competency/validate/${a.assignmentId}`}>
                    <Button size="sm" variant={a.reason === 'ready' ? 'default' : 'outline'}>
                      {a.reason === 'ready' ? 'Sign off' : 'Review'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent sign-offs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-medium">Recent sign-offs</h2>
          <Link
            href="/competency/report"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            All evidence <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="No evidence yet"
            description="Assign a competency, let the tech train, then sign off — records appear here."
            action={
              <Link href="/competency/assign">
                <Button size="sm" variant="outline">Assign competency</Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y rounded-xl bg-card shadow-sm ring-1 ring-foreground/10">
            {recent.map((r) => (
              <div key={r.record_id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.staff_name || '—'}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.template_name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusPill status={r.outcome === 'pass' ? 'validated' : 'failed'} />
                  <span className="font-mono text-xs text-muted-foreground">{fmtDate(r.signed_off_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
