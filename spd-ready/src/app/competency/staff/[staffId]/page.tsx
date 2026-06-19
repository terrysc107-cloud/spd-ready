import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getStaffMember, getDepartments } from '@/lib/dal/org'
import { getAssignmentsForStaff, getTemplates, getEvidenceReport } from '@/lib/dal/competency'
import { getMindsetProfileForStaff } from '@/lib/dal/mindset'
import { getOrgAudits } from '@/lib/dal/audits'
import { AUDIT_CATEGORY_BY_KEY } from '@/lib/audit-remediation'
import { MINDSET_DIMENSIONS, ARCHETYPE_BY_ID } from '@/lib/mindset-model'
import { PageHeader } from '@/components/ui/page-header'
import { StatusPill, type CompetencyStatus } from '@/components/ui/status-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { RadarChart } from '@/components/ui/radar-chart'
import { ManagerMindsetAdjust } from '@/components/competency/ManagerMindsetAdjust'
import { AuditForm } from '@/components/competency/AuditForm'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, BadgeCheckIcon, ClipboardListIcon, ShieldAlertIcon } from 'lucide-react'

const MINDSET_RADAR_LABELS = ['Safety', 'Standards', 'Thinking', 'Escalation', 'Accountability', 'Teamwork']

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

  const [assignments, templates, departments, allEvidence, mindset, allAudits] = await Promise.all([
    getAssignmentsForStaff(staffId),
    getTemplates(),
    getDepartments(),
    getEvidenceReport(),
    getMindsetProfileForStaff(staffId),
    getOrgAudits(),
  ])
  const staffAudits = allAudits.filter((a) => a.staff_id === staffId)
  const mindsetArchetype = mindset ? (ARCHETYPE_BY_ID[mindset.archetype] ?? null) : null
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
          <div className="divide-y rounded-xl bg-card shadow-card ring-1 ring-foreground/10">
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

      {/* Judgment & Mindset (Beta) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-base font-medium">Judgment &amp; Mindset</h2>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Beta</span>
        </div>
        {!mindset || !mindsetArchetype ? (
          <EmptyState icon={ClipboardListIcon} title="No judgment baseline yet" description="This tech has not taken the judgment baseline." />
        ) : (
          <div className="rounded-xl bg-card shadow-card ring-1 ring-foreground/10 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <RadarChart
                axes={MINDSET_RADAR_LABELS}
                series={[{ values: MINDSET_DIMENSIONS.map(d => mindset.dimensionScores[d.key] ?? 0), stroke: 'oklch(0.55 0.18 250)', fill: 'oklch(0.55 0.18 250 / 0.15)' }]}
                size={220}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{mindsetArchetype.emoji}</span>
                  <p className="font-bold">{mindsetArchetype.label}</p>
                </div>
                <p className="text-sm text-primary font-medium mt-0.5">{mindsetArchetype.tagline}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{mindsetArchetype.description}</p>
                {mindset.techFeedback && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Tech says this {mindset.techFeedback === 'fits' ? 'fits ✅' : mindset.techFeedback === 'partly' ? 'partly fits 🤔' : 'does not fit ❌'}
                    {mindset.techFeedbackNote ? ` — “${mindset.techFeedbackNote}”` : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="border-t border-border/60 pt-4">
              <ManagerMindsetAdjust
                staffId={staffId}
                derivedArchetypeId={mindset.archetype}
                initialArchetypeId={mindset.managerAdjustment?.archetype ?? null}
                initialNote={mindset.managerAdjustment?.note ?? null}
              />
            </div>
          </div>
        )}
      </section>

      {/* Audits & remediation */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-base font-medium flex items-center gap-2">
            <ShieldAlertIcon className="size-4 text-muted-foreground" /> Audits &amp; Remediation
          </h2>
          <Link href="/competency/audits" className="text-xs font-medium text-primary hover:underline">All audits →</Link>
        </div>
        <AuditForm staffId={staffId} staffName={staff.name ?? 'this tech'} />
        {staffAudits.length > 0 && (
          <div className="divide-y rounded-xl bg-card shadow-card ring-1 ring-foreground/10">
            {staffAudits.map((a) => {
              const cat = AUDIT_CATEGORY_BY_KEY[a.category]
              const done = a.status === 'closed'
              const remediated = a.assignment?.status === 'completed'
              return (
                <div key={a.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{cat?.label ?? a.category} <span className="text-xs font-normal text-muted-foreground">· {a.severity}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.finding}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold ${done ? 'text-[oklch(0.45_0.18_150)]' : remediated ? 'text-[oklch(0.55_0.18_80)]' : 'text-[oklch(0.42_0.15_200)]'}`}>
                    {done ? '✓ Closed' : remediated ? 'Awaiting sign-off' : a.module_title ? 'Assigned' : 'Open'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Evidence */}
      <section className="space-y-3">
        <h2 className="font-heading text-base font-medium">Signed-off evidence</h2>
        {evidence.length === 0 ? (
          <EmptyState icon={BadgeCheckIcon} title="No signed-off competencies yet" />
        ) : (
          <div className="divide-y rounded-xl bg-card shadow-card ring-1 ring-foreground/10">
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
