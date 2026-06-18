import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/dal/auth'
import { getStudentProfile } from '@/lib/dal/student'
import { getDomainProgress, getStreakData, getXPRecord, getJudgmentScore } from '@/lib/dal/study'
import { getMindsetProfile } from '@/lib/dal/mindset'
import { recommendModules } from '@/lib/dal/learning-modules'
import { getRequiredModulesForStaff } from '@/lib/dal/audits'
import { ARCHETYPE_BY_ID } from '@/lib/mindset-model'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/ui/section-header'

export default async function StudentDashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const [profile, domainProgress, streakData, xpRecord, judgmentScore, mindset, required, recommended] = await Promise.all([
    getStudentProfile(),
    getDomainProgress(),
    getStreakData(user.id),
    getXPRecord(user.id),
    getJudgmentScore(user.id),
    getMindsetProfile(user.id),
    getRequiredModulesForStaff(user.id),
    recommendModules(user.id, 2),
  ])
  const topReco = recommended.filter((m) => !required.some((r) => r.module_id === m.id))[0] ?? null
  const archetype = mindset ? (ARCHETYPE_BY_ID[mindset.archetype] ?? null) : null
  const score = profile?.readiness_score ? Math.round(profile.readiness_score) : null
  const tier = profile?.readiness_tier as 1 | 2 | 3 | null

  const tierConfig = {
    1: { label: 'Survey Ready', color: 'tier-1', bg: 'tier-1-bg', ring: 'oklch(0.55 0.18 150)' },
    2: { label: 'Ready with Support', color: 'tier-2', bg: 'tier-2-bg', ring: 'oklch(0.65 0.18 80)' },
    3: { label: 'Developing Readiness', color: 'tier-3', bg: 'tier-3-bg', ring: 'oklch(0.577 0.245 27)' },
  }
  const tc = tier ? tierConfig[tier] : null

  const stats = [
    { emoji: '🔥', value: streakData.current, label: 'Day streak' },
    { emoji: '⚡', value: xpRecord.total, label: 'Total XP' },
    { emoji: '🏆', value: xpRecord.domains_mastered.length, label: 'Domains mastered' },
  ]

  return (
    <div className="space-y-6 py-6">
      {/* Welcome header — the one gradient moment */}
      <div className="brand-gradient relative overflow-hidden rounded-2xl p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute top-1/2 right-8 size-48 -translate-y-1/2 rounded-full bg-white opacity-10 blur-2xl" />
        <div className="relative z-10">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/60">My training</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {profile?.first_name ? `Welcome back, ${profile.first_name} 👋` : 'Welcome to SPD Ready'}
          </h1>
          <p className="mt-2 text-sm text-white/70">
            {profile?.program_name
              ? `${profile.program_name} · ${profile.city}, ${profile.state}`
              : 'Complete your profile to get started.'}
          </p>
        </div>
      </div>

      {/* Gamification stat tiles */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center rounded-xl bg-card p-4 text-center shadow-card ring-1 ring-foreground/10"
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="mt-1 font-heading text-2xl font-bold tabular-nums tracking-tight">{s.value}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Primary: readiness / next action + quick actions */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Score / Assessment card */}
        <div
          className={`col-span-1 flex flex-col items-center justify-center rounded-xl border p-6 text-center shadow-card ${
            tc ? tc.bg : 'border-border bg-card'
          }`}
        >
          {score !== null && tier ? (
            <>
              <div
                className="relative mb-3 flex size-28 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${tc!.ring} ${score * 3.6}deg, oklch(0.92 0.01 220) 0deg)`,
                  padding: '4px',
                }}
              >
                <div className="flex size-full items-center justify-center rounded-full bg-card">
                  <div>
                    <p className="font-heading text-3xl font-bold leading-none">{score}%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Readiness</p>
                  </div>
                </div>
              </div>
              <p className={`font-heading text-sm font-semibold ${tc!.color}`}>Tier {tier} — {tc!.label}</p>
              <Link href="/student/results" className="mt-4 w-full">
                <Button variant="outline" size="sm" className="w-full">View full results</Button>
              </Link>
            </>
          ) : profile?.profile_complete ? (
            <>
              <div className="mb-3 flex size-28 items-center justify-center rounded-full border-4 border-dashed border-muted-foreground/20">
                <span className="text-4xl">📊</span>
              </div>
              <p className="text-sm font-semibold">Take your readiness assessment</p>
              <p className="mt-1 text-xs text-muted-foreground">30 questions · 6 domains · unlocks your tier</p>
              <Link href="/student/assessment" className="mt-4 w-full">
                <Button size="sm" className="w-full">Start assessment</Button>
              </Link>
            </>
          ) : (
            <>
              <div className="mb-3 flex size-28 items-center justify-center rounded-full border-4 border-dashed border-muted-foreground/20">
                <span className="text-4xl">👤</span>
              </div>
              <p className="text-sm font-semibold">Profile incomplete</p>
              <p className="mt-1 text-xs text-muted-foreground">Set up your profile to unlock the assessment</p>
              <Link href="/student/onboarding" className="mt-4 w-full">
                <Button size="sm" className="w-full">Complete profile</Button>
              </Link>
            </>
          )}
        </div>

        {/* Action cards */}
        <div className="col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: '🎓', title: 'Continue training', desc: 'Build mastery across the SPD domains — your training feeds competency automatically.', href: '/student/learning' },
            { icon: '✅', title: 'My competencies', desc: 'See the competencies your manager assigned and their validation status.', href: '/competency/my' },
            { icon: '📊', title: 'My results', desc: 'Review your readiness score and domain breakdown.', href: '/student/results' },
            { icon: '👤', title: 'Edit profile', desc: 'Update your details, certification status, and availability.', href: '/student/profile' },
          ].map(({ icon, title, desc, href }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-xl bg-card p-5 shadow-card ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-card-hover hover:ring-accent/30"
            >
              <span className="mb-3 text-2xl">{icon}</span>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              <span className="mt-4 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                Go →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Judgment + Mindset row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Judgment Readiness */}
        <div
          className={`flex items-center justify-between gap-4 rounded-xl border p-5 shadow-card ${
            judgmentScore === null
              ? 'border-border bg-card'
              : judgmentScore >= 75
                ? 'tier-1-bg'
                : judgmentScore >= 55
                  ? 'tier-2-bg'
                  : 'tier-3-bg'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🧠</span>
            <div>
              <p className="text-sm font-semibold">Judgment readiness</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {judgmentScore === null
                  ? 'Complete the SPD Judgment track to unlock your score'
                  : judgmentScore >= 75
                    ? 'Strong professional judgment — the standard your department needs'
                    : judgmentScore >= 55
                      ? 'Developing — continue the judgment track'
                      : 'Needs focus — work through the judgment scenarios'}
              </p>
            </div>
          </div>
          {judgmentScore !== null ? (
            <p
              className={`font-heading text-3xl font-bold tabular-nums ${
                judgmentScore >= 75 ? 'tier-1' : judgmentScore >= 55 ? 'tier-2' : 'tier-3'
              }`}
            >
              {Math.round(judgmentScore)}%
            </p>
          ) : (
            <Link href="/student/study/SPD_JUDGMENT">
              <Button size="sm" variant="outline">Start →</Button>
            </Link>
          )}
        </div>

        {/* Tech Mindset (Beta) */}
        <Link href={archetype ? '/student/mindset' : '/student/baseline'} className="group block">
          <div
            className={`flex h-full items-center justify-between gap-4 rounded-xl border p-5 shadow-card transition-all group-hover:-translate-y-0.5 group-hover:shadow-card-hover ${
              archetype ? 'border-[oklch(0.7_0.1_250)]/50 bg-[oklch(0.97_0.02_250)]' : 'border-dashed border-primary/30 bg-primary/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{archetype ? archetype.emoji : '🧭'}</span>
              <div>
                <p className="text-sm font-semibold">
                  {archetype ? archetype.label : 'Discover your tech mindset'}
                  <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-primary">Beta</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {archetype ? archetype.tagline : 'Map how you make decisions under pressure — and watch it grow.'}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
              {archetype ? 'View →' : 'Start →'}
            </span>
          </div>
        </Link>
      </div>

      {/* Required remediation modules (audit loop) */}
      {required.length > 0 && (
        <div className="space-y-2">
          {required.slice(0, 3).map((r) => (
            <Link key={r.assignment_id} href={`/student/learning/module/${r.slug}`} className="group block">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 shadow-card transition-all group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Required: {r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.finding ? `Cited: ${r.finding}` : 'Assigned by your manager'}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-destructive transition-transform group-hover:translate-x-0.5">Review →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Recommended next module (adaptive feed) */}
      {topReco && (
        <Link href={`/student/learning/module/${topReco.slug}`} className="group block">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-4 shadow-card ring-1 ring-foreground/10 transition-all group-hover:-translate-y-0.5 group-hover:shadow-card-hover group-hover:ring-accent/30">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Recommended: {topReco.title}</p>
                <p className="truncate text-xs text-muted-foreground">{topReco.recommendationReason}</p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">Start →</span>
          </div>
        </Link>
      )}

      {/* Tier progress bar */}
      {profile?.readiness_score != null && (
        <div className="space-y-3 rounded-xl bg-card p-5 shadow-card ring-1 ring-foreground/10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Tier progress</p>
            {profile.readiness_tier === 1 ? (
              <span className="text-xs font-bold tier-1">✅ Survey Ready</span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {profile.readiness_tier === 2
                  ? `${Math.max(0, 75 - Math.round(profile.readiness_score))}% to Tier 1`
                  : `${Math.max(0, 55 - Math.round(profile.readiness_score))}% to Tier 2`}
              </span>
            )}
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, profile.readiness_score)}%`,
                background:
                  profile.readiness_tier === 1
                    ? 'oklch(0.55 0.18 150)'
                    : profile.readiness_tier === 2
                      ? 'oklch(0.65 0.18 80)'
                      : 'oklch(0.577 0.245 27)',
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium tier-2">Tier 2 at 55%</span>
            <span className="font-medium tier-1">Tier 1 at 75%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Study Progress */}
      <div className="rounded-xl bg-card p-6 shadow-card ring-1 ring-foreground/10">
        <SectionHeader
          title="Study progress"
          description="7 domains · 70 questions"
          action={
            <Link href="/student/study">
              <Button variant="outline" size="sm">Study now →</Button>
            </Link>
          }
          className="mb-5"
        />
        <div className="space-y-3">
          {domainProgress.map((d) => {
            const s = d.best_score
            const barColor =
              s === null ? 'bg-muted' : s >= 85 ? 'bg-[oklch(0.55_0.18_150)]' : s >= 50 ? 'bg-[oklch(0.65_0.18_80)]' : 'bg-destructive'
            return (
              <Link key={d.domain} href={`/student/study/${d.domain}`} className="group block">
                <div className="flex items-center gap-3">
                  <span className="w-6 shrink-0 text-center text-base">{d.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="truncate text-xs font-medium transition-colors group-hover:text-primary">{d.label}</span>
                      <span className="ml-2 shrink-0 text-xs font-bold tabular-nums">
                        {s !== null ? `${Math.round(s)}%` : '—'}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: s !== null ? `${Math.min(s, 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                  {d.suggested && (
                    <span className="shrink-0 rounded-full bg-accent/10 px-1.5 py-0.5 text-xs font-semibold text-[oklch(0.42_0.15_200)]">Next</span>
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
