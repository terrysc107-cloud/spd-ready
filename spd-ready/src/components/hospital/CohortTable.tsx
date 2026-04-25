import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { KnowledgeConfidenceDelta } from '@/components/student/KnowledgeConfidenceDelta'
import type { CohortRow } from '@/lib/dal/cohort'

export function CohortTable({ rows }: { rows: CohortRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No students in your cohort yet. Add a student by email above.</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Tier</th>
            <th className="px-4 py-3">Mastery</th>
            <th className="px-4 py-3">Δ Knowledge / Confidence</th>
            <th className="px-4 py-3">Modules</th>
            <th className="px-4 py-3">Last Activity</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(r => (
            <tr key={r.member_id}>
              <td className="px-4 py-3">
                <p className="font-semibold">{r.first_name} {r.last_name}</p>
                <p className="text-xs text-muted-foreground">{r.email}</p>
              </td>
              <td className="px-4 py-3">
                {r.tier ? <Badge>Tier {r.tier}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-3 tabular-nums font-semibold">{r.avg_mastery}%</td>
              <td className="px-4 py-3">
                <KnowledgeConfidenceDelta knowledgeDelta={r.knowledge_delta_pp} confidenceDelta={r.confidence_delta_pp} />
              </td>
              <td className="px-4 py-3 tabular-nums text-xs">{r.modules_completed} / {r.modules_assigned}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {r.last_activity ? new Date(r.last_activity).toLocaleDateString() : '—'}
              </td>
              <td className="px-4 py-3">
                <Link href={`/hospital/cohort/${r.student_user_id}`} className="text-sm font-semibold text-primary hover:underline">
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
