import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, TriangleAlertIcon, ClockIcon } from 'lucide-react'
import { getAuthUser } from '@/lib/dal/auth'
import { getDomainSummaries, getDueReviewQueue } from '@/lib/dal/learning'
import { recommendModules } from '@/lib/dal/learning-modules'
import { getRequiredModulesForStaff } from '@/lib/dal/audits'
import { MasteryCard } from '@/components/student/MasteryCard'
import { SectionHeader } from '@/components/ui/section-header'
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
    <div className="mx-auto max-w-5xl space-y-8 py-8">
      <Link href="/student/dashboard" className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Dashboard</span>
      </Link>

      {/* Header — light monday style */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Learning</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Your mastery map</h1>
        <p className="mt-2 max-w-lg text-[0.95rem] text-muted-foreground">
          Across the OhioHealth-validated 6+1 domain framework. Mastery is maintained — keep practicing to retain it.
        </p>
      </div>

      {/* Required — assigned by your manager (remediation) */}
      {required.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
            <TriangleAlertIcon className="size-5 text-destructive" /> Required — assigned by your manager
          </h2>
          {required.map((r) => (
            <Link
              key={r.assignment_id}
              href={`/student/learning/module/${r.slug}`}
              className="block rounded-2xl border border-destructive/30 bg-destructive/5 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-heading text-base font-semibold">{r.title}</p>
                  {r.finding && <p className="mt-1 text-sm text-muted-foreground">Cited for: &ldquo;{r.finding}&rdquo;</p>}
                  {r.due_date && <p className="mt-1 text-xs text-muted-foreground">Due {new Date(r.due_date).toLocaleDateString()}</p>}
                </div>
                <span className="shrink-0 text-sm font-semibold text-destructive">Review &amp; validate →</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* Recommended for you — adaptive feed */}
      {recos.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Recommended for you"
            description="Based on your weak and due-for-review areas."
            actionHref="/student/learning/modules"
            actionLabel="Browse all"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recos.map((m) => (
              <Link
                key={m.id}
                href={`/student/learning/module/${m.slug}`}
                className="block rounded-2xl bg-card p-4 shadow-card ring-1 ring-border/70 transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{LEARNING_DOMAIN_META[m.domain].icon}</span>
                  <p className="font-heading text-sm font-semibold leading-snug">{m.title}</p>
                </div>
                {m.summary && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{m.summary}</p>}
                <p className="mt-2 text-[11px] font-semibold text-primary">{m.recommendationReason}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {dueQueue.length > 0 && (
        <section className="space-y-3 rounded-2xl bg-card p-5 shadow-card ring-1 ring-border/70">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
            <ClockIcon className="size-5 text-primary" /> Due for review ({dueQueue.length})
          </h2>
          <ul className="space-y-2">
            {dueQueue.slice(0, 5).map((m) => {
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
        <SectionHeader title="Domains" actionHref="/student/learning/modules" actionLabel="Learning modules" className="mb-4" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((s) => <MasteryCard key={s.domain} d={s} />)}
        </div>
      </section>
    </div>
  )
}
