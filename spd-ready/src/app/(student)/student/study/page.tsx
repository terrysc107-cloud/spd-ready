import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, PinIcon, TrophyIcon, ZapIcon } from 'lucide-react'
import { getAuthUser } from '@/lib/dal/auth'
import { getDomainProgress, getXPRecord } from '@/lib/dal/study'
import { getAssignmentsForStudent } from '@/lib/dal/learning'
import { AssignedModuleCard } from '@/components/student/AssignedModuleCard'
import { Button } from '@/components/ui/button'

export default async function StudyPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const [domains, xpRecord, assignments] = await Promise.all([
    getDomainProgress(),
    getXPRecord(user.id),
    getAssignmentsForStudent(),
  ])
  const masteredDomains = xpRecord.domains_mastered

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <Link href="/student/dashboard" className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Dashboard</span>
      </Link>

      {/* Header — light monday style */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Study mode</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Choose your domain</h1>
        <p className="mt-2 max-w-lg text-[0.95rem] text-muted-foreground">
          Practice questions across 8 domains — get instant feedback and track your readiness.
        </p>
      </div>

      {assignments.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
            <PinIcon className="size-5 text-primary" /> Assigned by your manager
          </h2>
          {assignments.map((a) => <AssignedModuleCard key={a.id} a={a} />)}
        </section>
      )}

      {/* Suggested domain banner */}
      {(() => {
        const suggested = domains.find((d) => d.suggested)
        if (!suggested) return null
        return (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-card">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{suggested.icon}</span>
              <div>
                <p className="font-heading text-sm font-semibold">Suggested next: {suggested.label}</p>
                <p className="text-xs text-muted-foreground">
                  {suggested.sessions_completed === 0
                    ? 'You have not studied this domain yet'
                    : `Your best score: ${Math.round(suggested.best_score ?? 0)}% — keep improving`}
                </p>
              </div>
            </div>
            <Link href={`/student/study/${suggested.domain}`}>
              <Button size="sm">Start</Button>
            </Link>
          </div>
        )
      })()}

      {/* Domain grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((d) => {
          const score = d.best_score
          const scoreColor = score === null
            ? 'text-muted-foreground'
            : score >= 70 ? 'text-[oklch(0.45_0.18_150)]'
            : score >= 50 ? 'text-[oklch(0.55_0.18_80)]'
            : 'text-destructive'

          return (
            <Link key={d.domain} href={`/student/study/${d.domain}`} className="group block">
              <div className={`flex h-full flex-col gap-3 rounded-2xl bg-card p-5 shadow-card ring-1 transition-all group-hover:-translate-y-0.5 group-hover:shadow-card-hover ${d.suggested ? 'ring-primary/40' : 'ring-border/70'}`}>
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{d.icon}</span>
                  {score !== null && (
                    <span className={`text-sm font-bold tabular-nums ${scoreColor}`}>{Math.round(score)}%</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-heading text-sm font-semibold">{d.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{d.description}</p>
                </div>
                {/* Progress bar */}
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{d.sessions_completed} session{d.sessions_completed !== 1 ? 's' : ''}</span>
                    <span>{d.total_questions} questions</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: score !== null ? `${Math.min(score, 100)}%` : '0%',
                        background: score === null ? 'transparent'
                          : score >= 85 ? 'oklch(0.55 0.18 150)'
                          : score >= 50 ? 'oklch(0.65 0.18 80)'
                          : 'oklch(0.577 0.245 27)',
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {d.suggested && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Suggested</span>
                  )}
                  {masteredDomains.includes(d.domain) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.96_0.04_150)] px-2 py-0.5 text-xs font-bold text-[oklch(0.45_0.18_150)]">
                      <TrophyIcon className="size-3" /> Mastered
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ZapIcon className="size-3" /> 25+ XP
                  </span>
                  <span className="ml-auto text-xs font-semibold text-primary group-hover:underline">Start →</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
