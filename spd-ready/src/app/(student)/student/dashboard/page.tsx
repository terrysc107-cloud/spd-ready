import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FlameIcon,
  ZapIcon,
  TrophyIcon,
  GraduationCapIcon,
  BadgeCheckIcon,
  BarChart3Icon,
  UserIcon,
  BrainIcon,
  SparklesIcon,
  TriangleAlertIcon,
  TargetIcon,
  ClipboardListIcon,
  ArrowRightIcon,
} from 'lucide-react'
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
    { icon: FlameIcon, value: streakData.current, label: 'Day streak', bg: 'bg-apricot' },
    { icon: ZapIcon, value: xpRecord.total, label: 'Total XP', bg: 'bg-sky' },
    { icon: TrophyIcon, value: xpRecord.domains_mastered.length, label: 'Domains mastered', bg: 'bg-lavender' },
  ]

  const actions = [
    { icon: GraduationCapIcon, title: 'Continue training', desc: 'Build mastery across the SPD domains — your training feeds competency automatically.', href: '/student/learning' },
    { icon: BadgeCheckIcon, title: 'My competencies', desc: 'See the competencies your manager assigned and their validation status.', href: '/competency/my' },
    { icon: BarChart3Icon, title: 'My results', desc: 'Review your readiness score and domain breakdown.', href: '/student/results' },
    { icon: UserIcon, title: 'Edit profile', desc: 'Update your details, certification status, and availability.', href: '/student/profile' },
  ]

  return (
    <div className="space-y-7 py-6">
      {/* Greeting — one headline moment, white canvas */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">My training</p>
        <h1 className="mt-2 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          {profile?.first_name ? (
            <>Welcome back, <span className="headline-gradient">{profile.first_name}</span></>
          ) : (
            'Welcome to SPD Ready'
          )}
        </h1>
        <p className="mt-3 text-[0.95rem] text-muted-foreground">
          {profile?.program_name
            ? `${profile.program_name} · ${profile.city}, ${profile.state}`
            : 'Complete your profile to get started.'}
        </p>
      </div>

      {/* Gamification — pastel feature tiles */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ icon: Icon, value, label, bg }) => (
          <div key={label} className={`rounded-2xl ${bg} p-4 sm:p-5`}>
            <Icon className="size-5 text-foreground/65" />
            <p className="mt-3 font-heading text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">{value}</p>
            <p className="mt-0.5 text-xs text-foreground/65 sm:text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Primary: readiness / next action + quick actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Score / Assessment card */}
        <div
          className={`col-span-1 flex flex-col items-center justify-center rounded-2xl border p-6 text-center shadow-card ${
            tc ? tc.bg : 'border-border bg-card'
          }`}
        >
          {score !== null && tier ? (
            <>
              <div
                className="relative mb-3 flex size-28 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${tc!.ring} ${score * 3.6}deg, #e7eaf0 0deg)`,
                  padding: '4px',
                }}
              >
                <div className="flex size-full items-center justify-center rounded-full bg-card">
                  <div>
                    <p className="font-heading text-3xl font-bold leading-none tabular-nums tracking-tight">{score}%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Readiness</p>
                  </div>
                </div>
              </div>
              <p className={`text-sm font-semibold ${tc!.color}`}>Tier {tier} — {tc!.label}</p>
              <Link href="/student/results" className="mt-4 w-full">
                <Button variant="outline" size="sm" className="w-full">View full results</Button>
              </Link>
            </>
          ) : profile?.profile_complete ? (
            <>
              <div className="mb-3 flex size-28 items-center justify-center rounded-full bg-secondary text-primary">
                <ClipboardListIcon className="size-10" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold">Take your readiness assessment</p>
              <p className="mt-1 text-xs text-muted-foreground">30 questions · 6 domains · unlocks your tier</p>
              <Link href="/student/assessment" className="mt-4 w-full">
                <Button size="sm" className="w-full">Start assessment</Button>
              </Link>
            </>
          ) : (
            <>
              <div className="mb-3 flex size-28 items-center justify-center rounded-full bg-secondary text-primary">
                <UserIcon className="size-10" strokeWidth={1.5} />
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
          {actions.map(({ icon: Icon, title, desc, href }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl bg-card p-5 shadow-card ring-1 ring-border/70 transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              <p className="font-heading text-base font-semibold">{title}</p>
              <p className="mt-1 flex-1 text-[0.8rem] leading-relaxed text-muted-foreground">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Go <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Judgment + Mindset row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Judgment Readiness */}
        <div
          className={`flex items-center justify-between gap-4 rounded-2xl border p-5 shadow-card ${
            judgmentScore === null
              ? 'border-border bg-card'
              : judgmentScore >= 75
                ? 'tier-1-bg'
                : judgmentScore >= 55
                  ? 'tier-2-bg'
                  : 'tier-3-bg'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-card/70 text-foreground/70 ring-1 ring-inset ring-border/60">
              <BrainIcon className="size-5" />
            </span>
            <div>
              <p className="font-heading text-base font-semibold">Judgment readiness</p>
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
              className={`font-heading text-3xl font-bold tabular-nums tracking-tight ${
                judgmentScore >= 75 ? 'tier-1' : judgmentScore >= 55 ? 'tier-2' : 'tier-3'
              }`}
            >
              {Math.round(judgmentScore)}%
            </p>
          ) : (
            <Link href="/student/study/SPD_JUDGMENT">
              <Button size="sm" variant="outline">Start</Button>
            </Link>
          )}
        </div>

        {/* Tech Mindset (Beta) */}
        <Link href={archetype ? '/student/mindset' : '/student/baseline'} className="group block">
          <div className="flex h-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
            <div className="flex items-center gap-3.5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <SparklesIcon className="size-5" />
              </span>
              <div>
                <p className="font-heading text-base font-semibold">
                  {archetype ? archetype.label : 'Discover your tech mindset'}
                  <span className="ml-2 rounded-full bg-secondary px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-primary">Beta</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {archetype ? archetype.tagline : 'Map how you make decisions under pressure — and watch it grow.'}
                </p>
              </div>
            </div>
            <ArrowRightIcon className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      {/* Required remediation modules (audit loop) */}
      {required.length > 0 && (
        <div className="space-y-2">
          {required.slice(0, 3).map((r) => (
            <Link key={r.assignment_id} href={`/student/learning/module/${r.slug}`} className="group block">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 shadow-card transition-all group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <TriangleAlertIcon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Required: {r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.finding ? `Cited: ${r.finding}` : 'Assigned by your manager'}
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-destructive">
                  Review <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Recommended next module (adaptive feed) */}
      {topReco && (
        <Link href={`/student/learning/module/${topReco.slug}`} className="group block">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-card ring-1 ring-border/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <TargetIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Recommended: {topReco.title}</p>
                <p className="truncate text-xs text-muted-foreground">{topReco.recommendationReason}</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
              Start <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      )}

      {/* Tier progress bar */}
      {profile?.readiness_score != null && (
        <div className="space-y-3 rounded-2xl bg-card p-5 shadow-card ring-1 ring-border/70">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Tier progress</p>
            {profile.readiness_tier === 1 ? (
              <span className="text-xs font-bold tier-1">Survey Ready</span>
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
      <div className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-border/70 sm:p-6">
        <SectionHeader
          title="Study progress"
          description="7 domains · 70 questions"
          action={
            <Link href="/student/study">
              <Button variant="outline" size="sm">Study now</Button>
            </Link>
          }
          className="mb-5"
        />
        <div className="space-y-3.5">
          {domainProgress.map((d) => {
            const s = d.best_score
            const dotColor =
              s === null ? 'bg-border' : s >= 85 ? 'bg-[oklch(0.55_0.18_150)]' : s >= 50 ? 'bg-[oklch(0.65_0.18_80)]' : 'bg-destructive'
            return (
              <Link key={d.domain} href={`/student/study/${d.domain}`} className="group block">
                <div className="flex items-center gap-3">
                  <span className={`size-2.5 shrink-0 rounded-full ${dotColor}`} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="truncate text-xs font-medium transition-colors group-hover:text-primary">{d.label}</span>
                      <span className="ml-2 shrink-0 text-xs font-semibold tabular-nums">
                        {s !== null ? `${Math.round(s)}%` : '—'}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${dotColor}`}
                        style={{ width: s !== null ? `${Math.min(s, 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                  {d.suggested && (
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">Next</span>
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
