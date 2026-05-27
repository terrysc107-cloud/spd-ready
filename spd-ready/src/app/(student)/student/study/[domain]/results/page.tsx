import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { readStore } from '@/lib/local-db/store'
import { DOMAIN_META, type TrackDomain } from '@/lib/local-db/track-questions'
import { getDomainProgress } from '@/lib/dal/study'
import { Button } from '@/components/ui/button'
import { DomainIcon, Zap, Trophy, Flame } from '@/lib/icons'

export default async function StudyResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>
  searchParams: Promise<{ session?: string; xp?: string; streak?: string; mastery?: string; sm?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { domain } = await params
  const { session: sessionId, xp, streak: streakParam, mastery, sm } = await searchParams

  const xpEarned = xp ? parseInt(xp) : null
  const streak = streakParam ? parseInt(streakParam) : null
  const masteryUnlocked = mastery === '1'
  const streakMilestone = sm === '1'

  const domainKey = domain.toUpperCase() as TrackDomain
  const meta = DOMAIN_META[domainKey]
  if (!meta) redirect('/student/study')

  // Load session from store
  const store = readStore()
  const sessions = store.study_sessions[user.id] ?? []
  const session = sessionId
    ? sessions.find(s => s.id === sessionId)
    : sessions.filter(s => s.domain === domainKey).slice(-1)[0]

  if (!session) redirect('/student/study')

  const score = Math.round(session.score_pct)
  const readinessLabel =
    score >= 95 ? 'Advanced'
    : score >= 85 ? 'Ready'
    : score >= 70 ? 'Developing'
    : score >= 50 ? 'Building'
    : 'Needs Foundation'

  const readinessColor =
    score >= 85 ? 'text-tier1-fg'
    : score >= 70 ? 'text-tier1-fg'
    : score >= 50 ? 'text-tier2-fg'
    : 'text-destructive'

  const ringColor =
    score >= 85 ? 'var(--tier1)'
    : score >= 50 ? 'var(--tier2)'
    : 'var(--destructive)'

  const domainProgress = await getDomainProgress()
  const nextDomain = domainProgress.find(d => d.suggested && d.domain !== domainKey)
    ?? domainProgress.find(d => d.domain !== domainKey)

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* XP earned banner */}
      {xpEarned !== null && (
        <div className="rounded-xl bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-300 shrink-0" />
            <div>
              <p className="font-bold text-sm">+{xpEarned} XP earned</p>
              {masteryUnlocked && (
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Domain mastery unlocked!
                </p>
              )}
              {streakMilestone && streak !== null && (
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> {streak}-day streak milestone!
                </p>
              )}
            </div>
          </div>
          {streak !== null && (
            <div className="text-right">
              <p className="text-xs text-white/60">Streak</p>
              <p className="font-bold text-lg flex items-center justify-end gap-1">
                <Flame className="w-5 h-5 text-orange-300" /> {streak}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Score card */}
      <div className="rounded-2xl border-2 bg-card p-8 text-center space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5">
          <DomainIcon name={meta.icon} className="w-4 h-4" /> {meta.label} · Session Complete
        </p>

        {/* Score ring */}
        <div className="flex justify-center">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(${ringColor} ${score * 3.6}deg, var(--border) 0deg)`,
              padding: '4px',
            }}
          >
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
              <p className="text-3xl font-bold tabular-nums leading-none">{score}%</p>
              <p className="text-xs text-muted-foreground mt-1">Score</p>
            </div>
          </div>
        </div>

        <p className={`font-bold text-lg ${readinessColor}`}>{readinessLabel}</p>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3 text-center max-w-xs mx-auto pt-2">
          <div className="rounded-lg bg-tier1-bg p-3">
            <p className="text-2xl font-bold text-tier1-fg">{session.correct}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Correct</p>
          </div>
          <div className="rounded-lg bg-tier2-bg p-3">
            <p className="text-2xl font-bold text-tier2-fg">{session.partial}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Partial</p>
          </div>
          <div className="rounded-lg bg-destructive/5 p-3">
            <p className="text-2xl font-bold text-destructive">{session.wrong}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Missed</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Scoring: Correct = 100% · Partial = 50% · Missed = 0%
        </p>
      </div>

      {/* Suggested next */}
      {nextDomain && (
        <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-fg mb-1">Study next</p>
            <p className="font-bold text-sm flex items-center gap-1.5">
              <DomainIcon name={nextDomain.icon} className="w-4 h-4 text-accent-fg" /> {nextDomain.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {nextDomain.sessions_completed === 0
                ? 'Not started yet'
                : `Best: ${Math.round(nextDomain.best_score ?? 0)}%`}
            </p>
          </div>
          <Link href={`/student/study/${nextDomain.domain}`}>
            <Button size="sm">Start →</Button>
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/student/study/${domainKey}`} className="flex-1">
          <Button variant="outline" className="w-full">Retake This Domain</Button>
        </Link>
        <Link href="/student/study" className="flex-1">
          <Button variant="outline" className="w-full">All Domains</Button>
        </Link>
        <Link href="/student/dashboard" className="flex-1">
          <Button className="w-full">Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
