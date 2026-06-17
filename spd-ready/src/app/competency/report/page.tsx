import { requireAppRole, MANAGER_ROLES } from '@/lib/dal/auth'
import { getEvidenceReport, type EvidenceRow } from '@/lib/dal/competency'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, type Column } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusPill } from '@/components/ui/status-pill'
import { PrintButton } from '@/components/competency/PrintButton'
import { FileTextIcon } from 'lucide-react'

export default async function ReportPage() {
  await requireAppRole(MANAGER_ROLES)
  const rows = await getEvidenceReport()

  const validated = rows.filter((r) => r.outcome === 'pass').length
  const staffCount = new Set(rows.map((r) => r.staff_id)).size

  const columns: Column<EvidenceRow>[] = [
    { key: 'staff', header: 'Staff', cell: (r) => <span className="font-medium">{r.staff_name || '—'}</span> },
    {
      key: 'comp',
      header: 'Competency',
      cell: (r) => (
        <span>
          {r.template_name}
          {r.training_score != null && (
            <span className="text-xs text-muted-foreground"> · {r.training_score}% training</span>
          )}
        </span>
      ),
    },
    { key: 'outcome', header: 'Outcome', cell: (r) => <StatusPill status={r.outcome === 'pass' ? 'validated' : 'failed'} /> },
    { key: 'by', header: 'Validated by', cell: (r) => <span className="text-muted-foreground">{r.validated_by_name || '—'}</span>, hideOnMobile: true },
    {
      key: 'method',
      header: 'Method',
      cell: (r) => <span className="text-muted-foreground capitalize">{r.validation_method?.replace(/_/g, ' ') ?? '—'}</span>,
      hideOnMobile: true,
    },
    { key: 'date', header: 'Date', cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.signed_off_at.slice(0, 10)}</span>, className: 'text-right' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Survey-ready evidence"
        description="Who was validated, on what, by whom, and when — the verifiable competency record."
        actions={rows.length > 0 ? <PrintButton /> : undefined}
      />

      {rows.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-xl bg-muted/50 px-4 py-3 text-sm">
          <span><span className="font-semibold tabular-nums">{validated}</span> validated competencies</span>
          <span><span className="font-semibold tabular-nums">{staffCount}</span> staff</span>
          <span className="text-muted-foreground">Filter and print for survey/accreditation.</span>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.record_id}
        empty={
          <EmptyState
            icon={FileTextIcon}
            title="No signed-off competencies yet"
            description="Assign a competency, let the tech train, and validate to populate this evidence packet."
          />
        }
      />
    </div>
  )
}
