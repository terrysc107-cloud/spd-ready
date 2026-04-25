import Link from 'next/link'
import { KnowledgeConfidenceDelta } from './KnowledgeConfidenceDelta'
import type { DomainSummary } from '@/lib/dal/learning'

export function MasteryCard({ d }: { d: DomainSummary }) {
  const masteryColor =
    d.avg_mastery >= 80 ? 'oklch(0.55 0.18 150)' :
    d.avg_mastery >= 50 ? 'oklch(0.65 0.18 80)' :
    'oklch(0.577 0.245 27)'
  return (
    <Link href={`/student/learning/${d.domain}`} className="block group">
      <div className="rounded-xl border-2 border-border bg-card p-5 h-full flex flex-col gap-3 transition-all group-hover:shadow-md group-hover:border-primary/40">
        <div className="flex items-start justify-between">
          <span className="text-3xl">{d.icon}</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: masteryColor }}>
            {d.avg_mastery}%
          </span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">{d.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{d.description}</p>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${d.avg_mastery}%`, background: masteryColor }} />
        </div>
        <div className="text-xs text-muted-foreground">
          {d.mastered_count} / {d.concept_count} concepts mastered
        </div>
        <KnowledgeConfidenceDelta knowledgeDelta={d.knowledge_delta_pp} confidenceDelta={d.confidence_delta_pp} />
      </div>
    </Link>
  )
}
