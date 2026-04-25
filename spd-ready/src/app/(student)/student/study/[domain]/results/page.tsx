import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { readStore } from '@/lib/local-db/store'
import { DOMAIN_META, type TrackDomain } from '@/lib/local-db/track-questions'
import { getDomainProgress } from '@/lib/dal/study'
import { Button } from '@/components/ui/button'

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
    score >= 85 ? 'text-[oklch(0.45_0.18_150)]'
    : score >= 70 ? 'text-[oklch(0.45_0.18_150)]'
    : score >= 50 ? 'text-[oklch(0.55_0.18_80)]'
    : 'text-destructive'

  const ringColor =
    score >= 85 ? 'oklch(0.55 0.18 150)'
    : score >= 50 ? 'oklch(0.65 0.18 80)'
    : 'oklch(0.577 0.245 27)'

  const domainProgress = await getDomainProgress()
  const nextDomain = domainProgress.find(d => d.suggested && d.domain !== domainKey)
    ?? domainProgress.find(d => d.domain !== domainKey)

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* XP earned banner */}
      {xpEarned !== null && (
        <div className="rounded-xl bg-[oklch(0.32_0.09_222)] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-bold text-sm">+{xpEarned} XP earned</p>
              {masteryUnlocked && <p className="text-xs text-white/70">🏆 Domain mastery unlocked!</p>}
              {streakMilestone && streak !== null && <p className="text-xs text-white/70">🔥 {streak}-day streak milestone!</p>}
            </div>
          </div>
          {streak !== null && (
            <div className="text-right">
              <p className="text-xs text-white/60">Streak</p>
              <p className="font-bold text-lg">🔥 {streak}</p>
            </div>
          )}
        </div>
      )}

      {/* Score card */}
      <div className="rounded-2xl border-2 bg-card p-8 text-center space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {meta.icon} {meta.label} · Session Complete
        </p>

        {/* Score ring */}
        <div className="flex justify-center">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(${ringColor} ${score * 3.6}deg, oklch(0.90 0.02 220) 0deg)`,
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
          <div className="rounded-lg bg-[oklch(0.96_0.04_150)] p-3">
            <p className="text-2xl font-bold text-[oklch(0.45_0.18_150)]">{session.correct}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Correct</p>
          </div>
          <div className="rounded-lg bg-[oklch(0.98_0.03_80)] p-3">
            <p className="text-2xl font-bold text-[oklch(0.55_0.18_80)]">{session.partial}</p>
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
        <div className="rounded-xl border-2 border-[oklch(0.62_0.18_200)]/30 bg-[oklch(0.62_0.18_200)]/5 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[oklch(0.42_0.15_200)] mb-1">Study next</p>
            <p className="font-bold text-sm">{nextDomain.icon} {nextDomain.label}</p>
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
