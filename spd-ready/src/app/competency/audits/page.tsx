import Link from 'next/link'
import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getOrgAudits } from '@/lib/dal/audits'
import { AUDIT_CATEGORY_BY_KEY } from '@/lib/audit-remediation'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { CloseAuditButton } from '@/components/competency/CloseAuditButton'
import { ClipboardCheckIcon } from 'lucide-react'

const severityStyle: Record<string, string> = {
  minor: 'bg-muted text-muted-foreground',
  major: 'bg-[oklch(0.85_0.12_80)]/20 text-[oklch(0.45_0.15_80)]',
  critical: 'bg-destructive/10 text-destructive',
}

// Survey-ready record: who was cited, for what, remediation status, sign-off.
function remediationLabel(a: Awaited<ReturnType<typeof getOrgAudits>>[number]): { text: string; tone: string } {
  if (a.status === 'closed') return { text: 'Closed · signed off', tone: 'text-[oklch(0.45_0.18_150)]' }
  if (a.assignment?.status === 'completed') return { text: 'Remediated · awaiting sign-off', tone: 'text-[oklch(0.55_0.18_80)]' }
  if (a.assignment) return { text: 'Module assigned · in progress', tone: 'text-[oklch(0.42_0.15_200)]' }
  return { text: 'Open · no module', tone: 'text-muted-foreground' }
}

export default async function AuditsReportPage() {
  await requireAppRole(MANAGER_ROLES)
  const audits = await getOrgAudits()

  const open = audits.filter((a) => a.status !== 'closed')
  const closed = audits.filter((a) => a.status === 'closed')

  return (
    <div className="space-y-6">
      <Link href="/competency" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        ← Competency
      </Link>

      <PageHeader
        title="Audits & Remediation"
        eyebrow="Defensible record"
        description="Every citation, its auto-assigned remediation module, completion, and sign-off — the survey-ready trail of gaps and drift."
      />

      {audits.length === 0 ? (
        <EmptyState icon={ClipboardCheckIcon} title="No audits recorded" description="Record an audit from a staff member's detail page to start the remediation loop." />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-heading text-base font-medium">Open ({open.length})</h2>
            {open.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open audits — all remediated and signed off.</p>
            ) : (
              <div className="divide-y rounded-xl bg-card shadow-sm ring-1 ring-foreground/10">
                {open.map((a) => {
                  const rem = remediationLabel(a)
                  const cat = AUDIT_CATEGORY_BY_KEY[a.category]
                  return (
                    <div key={a.id} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{a.staff_name ?? '—'}</span>
                          <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${severityStyle[a.severity]}`}>{a.severity}</span>
                          <span className="text-xs text-muted-foreground">{cat?.label ?? a.category}</span>
                        </div>
                        <p className="text-sm text-foreground/80 mt-1">{a.finding}</p>
                        <p className={`text-xs mt-1 font-medium ${rem.tone}`}>
                          {rem.text}{a.module_title ? ` · ${a.module_title}` : ''}
                          {a.area ? ` · ${a.area}` : ''} · {a.audit_date}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {a.assignment?.status === 'completed' && <CloseAuditButton auditId={a.id} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {closed.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-heading text-base font-medium">Closed ({closed.length})</h2>
              <div className="divide-y rounded-xl bg-card shadow-sm ring-1 ring-foreground/10">
                {closed.map((a) => {
                  const cat = AUDIT_CATEGORY_BY_KEY[a.category]
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{a.staff_name ?? '—'} · <span className="font-normal text-muted-foreground">{cat?.label ?? a.category}</span></p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {a.finding} · signed off by {a.validated_by_name ?? '—'}{a.closed_at ? ` · ${a.closed_at.slice(0, 10)}` : ''}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-[oklch(0.45_0.18_150)]">✓ Closed</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
