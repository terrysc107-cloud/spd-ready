import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/dal/auth'
import { getDomainSummaries, getDueReviewQueue } from '@/lib/dal/learning'
import { recommendModules } from '@/lib/dal/learning-modules'
import { getRequiredModulesForStaff } from '@/lib/dal/audits'
import { MasteryCard } from '@/components/student/MasteryCard'
import { LEARNING_DOMAIN_META } from '@/lib/local-db/types'
import { getConcept } from '@/lib/local-db/concepts'

export default async function LearningDashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const [summaries, dueQueue, recommended, required] = await Promise.all([
    getDomainSummaries(),
    getDueReviewQueue(),
    recommendModules(user.id),
    getRequiredModulesForStaff(user.id),
  ])
  // don't double-show a required module in the recommended row
  const requiredIds = new Set(required.map((r) => r.module_id))
  const recos = recommended.filter((m) => !requiredIds.has(m.id))

  return (
    <div className="py-8 max-w-5xl mx-auto space-y-8">
      <Link href="/student/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <span>←</span><span>Dashboard</span>
      </Link>

      <div className="brand-gradient rounded-2xl p-8 text-white">
        <p className="text-white/60 text-sm font-medium uppercase tracking-wide mb-1">Learning</p>
        <h1 className="text-3xl font-bold">Your Mastery Map</h1>
        <p className="text-white/70 mt-2 text-sm max-w-lg">
          Across the OhioHealth-validated 6+1 domain framework. Mastery is maintained — keep practicing to retain it.
        </p>
      </div>

      {/* Required — assigned by your manager (remediation) */}
      {required.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-[oklch(0.577_0.245_27)]">⚠️</span> Required — assigned by your manager
          </h2>
          {required.map((r) => (
            <Link
              key={r.assignment_id}
              href={`/student/learning/module/${r.slug}`}
              className="block rounded-xl border-2 border-[oklch(0.577_0.245_27)]/40 bg-[oklch(0.577_0.245_27)]/5 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-base">{r.title}</p>
                  {r.finding && <p className="text-sm text-muted-foreground mt-1">Cited for: &ldquo;{r.finding}&rdquo;</p>}
                  {r.due_date && <p className="text-xs text-muted-foreground mt-1">Due {new Date(r.due_date).toLocaleDateString()}</p>}
                </div>
                <span className="shrink-0 text-sm font-semibold text-[oklch(0.45_0.18_27)]">Review &amp; validate →</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* Recommended for you — adaptive feed */}
      {recos.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recommended for you</h2>
            <Link href="/student/learning/modules" className="text-sm font-medium text-primary hover:underline">Browse all →</Link>
          </div>
          <p className="text-sm text-muted-foreground -mt-1">Based on your weak and due-for-review areas.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recos.map((m) => (
              <Link
                key={m.id}
                href={`/student/learning/module/${m.slug}`}
                className="rounded-xl border-2 border-border bg-card p-4 hover:shadow-md hover:border-primary/40 transition-all block"
              >
                <div className="flex items-center gap-2">
                  <span>{LEARNING_DOMAIN_META[m.domain].icon}</span>
                  <p className="font-semibold text-sm leading-snug">{m.title}</p>
                </div>
                {m.summary && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{m.summary}</p>}
                <p className="text-[11px] font-medium text-primary mt-2">{m.recommendationReason}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {dueQueue.length > 0 && (
        <section className="rounded-xl border-2 border-border bg-card p-5 space-y-3">
          <h2 className="text-lg font-semibold">⏰ Due for review ({dueQueue.length})</h2>
          <ul className="space-y-2">
            {dueQueue.slice(0, 5).map(m => {
              const c = getConcept(m.concept_id)
              return (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="font-medium">{c?.label ?? m.concept_id}</span>
                    <span className="text-muted-foreground"> · {LEARNING_DOMAIN_META[m.domain].label}</span>
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">Mastery {m.mastery_score}%</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Domains</h2>
          <Link href="/student/learning/modules" className="text-sm font-medium text-primary hover:underline">Learning modules →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map(s => <MasteryCard key={s.domain} d={s} />)}
        </div>
      </section>
    </div>
  )
}
