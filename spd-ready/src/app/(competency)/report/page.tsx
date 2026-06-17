import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getEvidenceReport } from '@/lib/dal/competency'
import { Badge } from '@/components/ui/badge'

function fmt(iso: string): string {
  // Stable, locale-independent date (YYYY-MM-DD) for audit evidence
  return iso.slice(0, 10)
}

export default async function ReportPage() {
  await requireAppRole(MANAGER_ROLES)
  const rows = await getEvidenceReport()

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Survey evidence</h1>
        <p className="text-muted-foreground text-sm">
          Who was validated, on what, by whom, and when — the verifiable competency record.
        </p>
      </header>

      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1.4fr_0.7fr_1fr_0.9fr] gap-2 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
          <span>Staff</span><span>Competency</span><span>Outcome</span><span>Validated by</span><span>Date</span>
        </div>
        <div className="divide-y">
          {rows.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No signed-off competencies yet. Assign one, train, and validate to populate this report.
            </p>
          )}
          {rows.map(r => (
            <div key={r.record_id} className="grid grid-cols-[1.2fr_1.4fr_0.7fr_1fr_0.9fr] gap-2 px-4 py-3 text-sm items-center">
              <span className="font-medium">{r.staff_name || '—'}</span>
              <span>
                {r.template_name}
                {r.training_score != null && (
                  <span className="text-xs text-muted-foreground"> · {r.training_score}% training</span>
                )}
              </span>
              <span>
                <Badge variant={r.outcome === 'pass' ? 'default' : 'destructive'} className="capitalize">
                  {r.outcome}
                </Badge>
              </span>
              <span className="text-muted-foreground">{r.validated_by_name || '—'}</span>
              <span className="text-muted-foreground">{fmt(r.signed_off_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
