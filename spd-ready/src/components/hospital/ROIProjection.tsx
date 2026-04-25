import { ROI_METHODOLOGY_FOOTNOTE } from '@/lib/dal/cohort'
import type { CohortROI } from '@/lib/dal/cohort'

const fmtUsd = (n: number) => `$${n.toLocaleString('en-US')}`

export function ROIProjection({ roi }: { roi: CohortROI }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-border bg-card p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Cohort size" value={String(roi.cohort_size)} />
          <Stat label="Avg Δ Knowledge" value={`${roi.avg_knowledge_delta_pp >= 0 ? '+' : ''}${roi.avg_knowledge_delta_pp} pp`} />
          <Stat label="Avg Δ Confidence" value={`${roi.avg_confidence_delta_pp >= 0 ? '+' : ''}${roi.avg_confidence_delta_pp} pp`} />
          <Stat label="Projected error reduction" value={`${roi.projected_error_reduction_pct}%`} />
        </div>
        <div className="border-t-2 border-border pt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Projected annual savings</p>
          <p className="text-4xl font-bold tabular-nums text-[oklch(0.45_0.18_150)]">{fmtUsd(roi.projected_savings_usd)}</p>
        </div>
      </div>

      {roi.per_error_category.length > 0 && (
        <div className="rounded-2xl border-2 border-border bg-card p-6 space-y-3">
          <h3 className="font-semibold">By error category (projected)</h3>
          <ul className="divide-y">
            {roi.per_error_category.map(c => (
              <li key={c.category} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.projected_events_avoided} events avoided</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-[oklch(0.45_0.18_150)]">{fmtUsd(c.projected_savings_usd)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground italic px-2">
        <span className="font-semibold not-italic">Methodology: </span>{ROI_METHODOLOGY_FOOTNOTE}
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
