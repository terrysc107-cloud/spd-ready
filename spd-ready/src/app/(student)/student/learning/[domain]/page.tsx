import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { getDomainSummary, getDomainConceptMastery } from '@/lib/dal/learning'
import { getConceptsForDomain } from '@/lib/local-db/concepts'
import { LEARNING_DOMAINS, LEARNING_DOMAIN_META } from '@/lib/local-db/types'
import type { LearningDomain } from '@/lib/local-db/types'
import { KnowledgeConfidenceDelta } from '@/components/student/KnowledgeConfidenceDelta'

export default async function LearningDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { domain: domainSlug } = await params
  if (!LEARNING_DOMAINS.includes(domainSlug as LearningDomain)) notFound()
  const domain = domainSlug as LearningDomain

  const [summary, masteries] = await Promise.all([
    getDomainSummary(domain),
    getDomainConceptMastery(domain),
  ])
  if (!summary) notFound()

  const concepts = getConceptsForDomain(domain)
  const meta = LEARNING_DOMAIN_META[domain]

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6">
      <Link href="/student/learning" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <span>←</span><span>Learning</span>
      </Link>

      <div className="rounded-2xl border-2 border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{meta.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{meta.label}</h1>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <KnowledgeConfidenceDelta variant="block" knowledgeDelta={summary.knowledge_delta_pp} confidenceDelta={summary.confidence_delta_pp} />
        <div className="text-sm">
          <span className="font-semibold">{summary.avg_mastery}%</span>
          <span className="text-muted-foreground"> overall mastery · </span>
          <span className="font-semibold">{summary.mastered_count}/{summary.concept_count}</span>
          <span className="text-muted-foreground"> concepts mastered</span>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Concepts</h2>
        <ul className="space-y-2">
          {concepts.map(c => {
            const m = masteries.find(x => x.concept_id === c.id)
            const score = m?.mastery_score ?? 0
            const dueNow = m && new Date(m.next_review_at).getTime() <= Date.now()
            const color = score >= 80 ? 'oklch(0.55 0.18 150)' : score >= 50 ? 'oklch(0.65 0.18 80)' : 'oklch(0.577 0.245 27)'
            return (
              <li key={c.id} className="rounded-xl border-2 border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color }}>{score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
                </div>
                {dueNow && <p className="text-xs font-semibold text-[oklch(0.45_0.15_200)]">⏰ Due for review</p>}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
