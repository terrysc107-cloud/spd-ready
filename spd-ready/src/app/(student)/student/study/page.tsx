import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { getDomainProgress, getXPRecord } from '@/lib/dal/study'
import { getAssignmentsForStudent } from '@/lib/dal/learning'
import { AssignedModuleCard } from '@/components/student/AssignedModuleCard'
import { Button } from '@/components/ui/button'

export default async function StudyPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [domains, xpRecord, assignments] = await Promise.all([
    getDomainProgress(),
    getXPRecord(user.id),
    getAssignmentsForStudent(),
  ])
  const masteredDomains = xpRecord.domains_mastered

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-8">
      {/* Back to dashboard */}
      <Link href="/student/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        <span>Dashboard</span>
      </Link>

      {/* Header */}
      <div className="brand-gradient rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white blur-2xl" />
        </div>
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium uppercase tracking-wide mb-1">Study Mode</p>
          <h1 className="text-3xl font-bold">Choose Your Domain</h1>
          <p className="text-white/70 mt-2 text-sm max-w-lg">
            Practice questions across 8 domains — get instant feedback and track your readiness.
          </p>
        </div>
      </div>

      {assignments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">📌 Assigned by your coordinator</h2>
          {assignments.map(a => <AssignedModuleCard key={a.id} a={a} />)}
        </section>
      )}

      {/* Suggested domain banner */}
      {(() => {
        const suggested = domains.find(d => d.suggested)
        if (!suggested) return null
        return (
          <div className="rounded-xl border-2 border-[oklch(0.62_0.18_200)]/40 bg-[oklch(0.62_0.18_200)]/5 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{suggested.icon}</span>
              <div>
                <p className="font-semibold text-sm">Suggested next: {suggested.label}</p>
                <p className="text-xs text-muted-foreground">
                  {suggested.sessions_completed === 0
                    ? 'You have not studied this domain yet'
                    : `Your best score: ${Math.round(suggested.best_score ?? 0)}% — keep improving`}
                </p>
              </div>
            </div>
            <Link href={`/student/study/${suggested.domain}`}>
              <Button size="sm">Start →</Button>
            </Link>
          </div>
        )
      })()}

      {/* Domain grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map(d => {
          const score = d.best_score
          const scoreColor = score === null
            ? 'text-muted-foreground'
            : score >= 85 ? 'text-[oklch(0.45_0.18_150)]'
            : score >= 70 ? 'text-[oklch(0.45_0.18_150)]'
            : score >= 50 ? 'text-[oklch(0.55_0.18_80)]'
            : 'text-destructive'

          return (
            <Link key={d.domain} href={`/student/study/${d.domain}`} className="block group">
              <div className={`rounded-xl border-2 bg-card p-5 h-full flex flex-col gap-3 transition-all group-hover:shadow-md group-hover:border-primary/40 ${d.suggested ? 'border-[oklch(0.62_0.18_200)]/40' : 'border-border'}`}>
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{d.icon}</span>
                  {score !== null && (
                    <span className={`text-sm font-bold tabular-nums ${scoreColor}`}>
                      {Math.round(score)}%
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{d.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{d.description}</p>
                </div>
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{d.sessions_completed} session{d.sessions_completed !== 1 ? 's' : ''}</span>
                    <span>{d.total_questions} questions</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
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
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {d.suggested && (
                    <span className="text-xs font-semibold text-[oklch(0.45_0.15_200)] bg-[oklch(0.62_0.18_200)]/10 px-2 py-0.5 rounded-full">Suggested</span>
                  )}
                  {masteredDomains.includes(d.domain) && (
                    <span className="text-xs font-bold text-[oklch(0.45_0.18_150)] bg-[oklch(0.96_0.04_150)] px-2 py-0.5 rounded-full">
                      🏆 Mastered
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">⚡ 25+ XP</span>
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
