import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getStudentProfile } from '@/lib/dal/student'
import { getDomainProgress, getStreakData, getXPRecord, getJudgmentScore } from '@/lib/dal/study'
import { Button } from '@/components/ui/button'

export default async function StudentDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [profile, domainProgress, streakData, xpRecord, judgmentScore] = await Promise.all([
    getStudentProfile(),
    getDomainProgress(),
    getStreakData(user.id),
    getXPRecord(user.id),
    getJudgmentScore(user.id),
  ])
  const score = profile?.readiness_score ? Math.round(profile.readiness_score) : null
  const tier = profile?.readiness_tier as 1 | 2 | 3 | null

  const tierConfig = {
    1: { label: 'Placement Ready', color: 'text-[oklch(0.45_0.18_150)]', bg: 'bg-[oklch(0.96_0.04_150)]', border: 'border-[oklch(0.75_0.12_150)]', ring: 'oklch(0.55_0.18_150)' },
    2: { label: 'Ready with Support', color: 'text-[oklch(0.55_0.18_80)]', bg: 'bg-[oklch(0.98_0.03_80)]', border: 'border-[oklch(0.85_0.12_80)]', ring: 'oklch(0.65_0.18_80)' },
    3: { label: 'Developing Readiness', color: 'text-destructive', bg: 'bg-destructive/5', border: 'border-destructive/30', ring: 'oklch(0.577_0.245_27)' },
  }

  const tc = tier ? tierConfig[tier] : null

  return (
    <div className="space-y-6 py-6">
      {/* Welcome header */}
      <div className="brand-gradient rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white blur-2xl" />
        </div>
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium uppercase tracking-wide mb-1">Student Portal</p>
          <h1 className="text-3xl font-bold">
            {profile?.first_name ? `Welcome back, ${profile.first_name} 👋` : 'Welcome to SPD Ready'}
          </h1>
          <p className="text-white/70 mt-2 text-sm">
            {profile?.program_name ? `${profile.program_name} · ${profile.city}, ${profile.state}` : 'Complete your profile to get started.'}
          </p>
        </div>
      </div>

      {/* Gamification stats row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Streak */}
        <div className="rounded-xl border-2 bg-card p-4 text-center">
          <p className="text-2xl">🔥</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{streakData.current}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Day streak</p>
        </div>
        {/* XP */}
        <div className="rounded-xl border-2 bg-card p-4 text-center">
          <p className="text-2xl">⚡</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{xpRecord.total}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total XP</p>
        </div>
        {/* Domains mastered */}
        <div className="rounded-xl border-2 bg-card p-4 text-center">
          <p className="text-2xl">🏆</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{xpRecord.domains_mastered.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Domains mastered</p>
        </div>
      </div>

      {/* Judgment Readiness */}
      <div className={`rounded-xl border-2 p-5 flex items-center justify-between gap-4 ${
        judgmentScore === null
          ? 'border-border bg-muted/30'
          : judgmentScore >= 75
          ? 'border-[oklch(0.75_0.12_150)] bg-[oklch(0.96_0.04_150)]'
          : judgmentScore >= 55
          ? 'border-[oklch(0.85_0.12_80)] bg-[oklch(0.98_0.03_80)]'
          : 'border-destructive/30 bg-destructive/5'
      }`}>
        <div className="flex items-center gap-4">
          <span className="text-3xl">🧠</span>
          <div>
            <p className="font-bold text-sm">Judgment Readiness Score</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {judgmentScore === null
                ? 'Complete the SPD Judgment track to unlock your score'
                : judgmentScore >= 75
                ? 'Strong professional judgment — coordinators take notice'
                : judgmentScore >= 55
                ? 'Developing — continue the judgment track'
                : 'Needs focus — work through the judgment scenarios'}
            </p>
          </div>
        </div>
        {judgmentScore !== null ? (
          <p className={`text-3xl font-bold tabular-nums ${
            judgmentScore >= 75 ? 'text-[oklch(0.45_0.18_150)]'
            : judgmentScore >= 55 ? 'text-[oklch(0.55_0.18_80)]'
            : 'text-destructive'
          }`}>
            {Math.round(judgmentScore)}%
          </p>
        ) : (
          <Link href="/student/study/SPD_JUDGMENT">
            <Button size="sm" variant="outline">Start →</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Score / Assessment card */}
        <div className={`col-span-1 rounded-xl border-2 p-6 ${tc ? `${tc.bg} ${tc.border}` : 'bg-card border-border'} flex flex-col items-center justify-center text-center`}>
          {score !== null && tier ? (
            <>
              {/* Score ring */}
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center relative mb-3"
                style={{
                  background: `conic-gradient(${tc!.ring} ${score * 3.6}deg, oklch(0.92 0.01 220) 0deg)`,
                  padding: '4px',
                }}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <div>
                    <p className="text-3xl font-bold leading-none">{score}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Readiness</p>
                  </div>
                </div>
              </div>
              <p className={`font-bold text-sm ${tc!.color}`}>Tier {tier} — {tc!.label}</p>
              <Link href="/student/results" className="mt-4 w-full">
                <Button variant="outline" size="sm" className="w-full">View Full Results</Button>
              </Link>
            </>
          ) : profile?.profile_complete ? (
            <>
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-muted-foreground/20 flex items-center justify-center mb-3">
                <span className="text-4xl">📊</span>
              </div>
              <p className="font-semibold text-sm">Not yet assessed</p>
              <p className="text-xs text-muted-foreground mt-1">Take the 30-question readiness assessment</p>
              <Link href="/student/assessment" className="mt-4 w-full">
                <Button size="sm" className="w-full">Start Assessment</Button>
              </Link>
            </>
          ) : (
            <>
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-muted-foreground/20 flex items-center justify-center mb-3">
                <span className="text-4xl">👤</span>
              </div>
              <p className="font-semibold text-sm">Profile incomplete</p>
              <p className="text-xs text-muted-foreground mt-1">Set up your profile to unlock the assessment</p>
              <Link href="/student/onboarding" className="mt-4 w-full">
                <Button size="sm" className="w-full">Complete Profile</Button>
              </Link>
            </>
          )}
        </div>

        {/* Action cards */}
        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: '🏥',
              title: 'Browse Openings',
              desc: 'View externship positions matched to your location and availability.',
              href: '/student/openings',
              disabled: !profile?.readiness_tier || profile.readiness_tier === 3,
            },
            {
              icon: '📁',
              title: 'My Applications',
              desc: 'Track the status of your externship applications.',
              href: '/student/applications',
              disabled: false,
            },
            {
              icon: '✏️',
              title: 'Edit Profile',
              desc: 'Update your location, availability, and certification status.',
              href: '/student/onboarding',
              disabled: false,
            },
            {
              icon: '📝',
              title: 'Retake Assessment',
              desc: 'Improve your score and move up a readiness tier.',
              href: '/student/assessment',
              disabled: !profile?.profile_complete,
            },
          ].map(({ icon, title, desc, href, disabled }) => (
            <div key={href} className={`rounded-xl border bg-card p-5 flex flex-col ${disabled ? 'opacity-50' : 'hover:shadow-md transition-shadow'}`}>
              <span className="text-2xl mb-3">{icon}</span>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-1 flex-1 leading-relaxed">{desc}</p>
              {!disabled && (
                <Link href={href} className="mt-4">
                  <Button variant="ghost" size="sm" className="px-0 text-primary font-semibold hover:bg-transparent hover:text-primary/70 h-auto">
                    Go →
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tier progress bar */}
      {profile?.readiness_score != null && (
        <div className="rounded-xl border-2 bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Tier Progress</p>
            {profile.readiness_tier === 1
              ? <span className="text-xs font-bold text-[oklch(0.45_0.18_150)]">✅ Placement Ready</span>
              : <span className="text-xs text-muted-foreground">
                  {profile.readiness_tier === 2
                    ? `${Math.max(0, 75 - Math.round(profile.readiness_score))}% to Tier 1`
                    : `${Math.max(0, 55 - Math.round(profile.readiness_score))}% to Tier 2`}
                </span>
            }
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (profile.readiness_score / 100) * 100)}%`,
                background: profile.readiness_tier === 1
                  ? 'oklch(0.55 0.18 150)'
                  : profile.readiness_tier === 2
                  ? 'oklch(0.65 0.18 80)'
                  : 'oklch(0.577 0.245 27)',
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="text-[oklch(0.55_0.18_80)] font-medium">Tier 2 at 55%</span>
            <span className="text-[oklch(0.45_0.18_150)] font-medium">Tier 1 at 75%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Study Progress */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-base">Study Progress</h2>
            <p className="text-xs text-muted-foreground mt-0.5">7 domains · 70 questions</p>
          </div>
          <Link href="/student/study">
            <Button variant="outline" size="sm">Study Now →</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {domainProgress.map(d => {
            const score = d.best_score
            const barColor = score === null
              ? 'bg-muted'
              : score >= 85
              ? 'bg-[oklch(0.55_0.18_150)]'
              : score >= 50
              ? 'bg-[oklch(0.65_0.18_80)]'
              : 'bg-destructive'

            return (
              <Link key={d.domain} href={`/student/study/${d.domain}`} className="block group">
                <div className="flex items-center gap-3">
                  <span className="text-base w-6 text-center flex-shrink-0">{d.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate group-hover:text-primary transition-colors">{d.label}</span>
                      <span className="text-xs font-bold tabular-nums ml-2 flex-shrink-0">
                        {score !== null ? `${Math.round(score)}%` : '—'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: score !== null ? `${Math.min(score, 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                  {d.suggested && (
                    <span className="flex-shrink-0 text-xs font-semibold text-[oklch(0.42_0.15_200)] bg-[oklch(0.62_0.18_200)]/10 px-1.5 py-0.5 rounded-full">Next</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
