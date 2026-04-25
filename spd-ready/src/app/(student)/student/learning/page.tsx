import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { getDomainSummaries, getDueReviewQueue, getAssignmentsForStudent } from '@/lib/dal/learning'
import { MasteryCard } from '@/components/student/MasteryCard'
import { AssignedModuleCard } from '@/components/student/AssignedModuleCard'
import { LEARNING_DOMAIN_META } from '@/lib/local-db/types'
import { getConcept } from '@/lib/local-db/concepts'

export default async function LearningDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [summaries, dueQueue, assignments] = await Promise.all([
    getDomainSummaries(),
    getDueReviewQueue(),
    getAssignmentsForStudent(),
  ])

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

      {assignments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Assigned by your coordinator</h2>
          {assignments.map(a => <AssignedModuleCard key={a.id} a={a} />)}
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
        <h2 className="text-lg font-semibold mb-4">Domains</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map(s => <MasteryCard key={s.domain} d={s} />)}
        </div>
      </section>
    </div>
  )
}
