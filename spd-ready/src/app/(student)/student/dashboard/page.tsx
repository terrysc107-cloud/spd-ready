import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getStudentProfile } from '@/lib/dal/student'
import { getDomainProgress, getStreakData, getXPRecord, getJudgmentScore } from '@/lib/dal/study'
import { Button } from '@/components/ui/button'
import {
  Flame, Zap, Trophy, Brain, BarChart3, User,
  Building2, FolderOpen, Pencil, FileText, CheckCircle2,
} from '@/lib/icons'
import { DomainIcon } from '@/lib/icons'
import { HeroBanner } from '@/components/shell/HeroBanner'
import { StatCard } from '@/components/data/StatCard'
import { ScoreRing } from '@/components/data/ScoreRing'

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
    1: { label: 'Placement Ready', colorClass: 'text-tier1-fg', bgClass: 'bg-tier1-bg', borderClass: 'border-tier1-border' },
    2: { label: 'Ready with Support', colorClass: 'text-tier2-fg', bgClass: 'bg-tier2-bg', borderClass: 'border-tier2-border' },
    3: { label: 'Developing Readiness', colorClass: 'text-destructive', bgClass: 'bg-destructive/5', borderClass: 'border-destructive/30' },
  }

  const tc = tier ? tierConfig[tier] : null

  const judgmentBorder =
    judgmentScore === null ? 'border-border bg-muted/30'
    : judgmentScore >= 75 ? 'border-tier1-border bg-tier1-bg'
    : judgmentScore >= 55 ? 'border-tier2-border bg-tier2-bg'
    : 'border-destructive/30 bg-destructive/5'

  const judgmentTextColor =
    judgmentScore === null ? 'text-muted-foreground'
    : judgmentScore >= 75 ? 'text-tier1-fg'
    : judgmentScore >= 55 ? 'text-tier2-fg'
    : 'text-destructive'

  return (
    <div className="space-y-6 py-6">
      {/* Welcome header */}
      <HeroBanner
        aurora
        eyebrow="Student Portal"
        title={profile?.first_name ? `Welcome back, ${profile.first_name}` : 'Welcome to SPD Ready'}
        subtitle={
          profile?.program_name
            ? `${profile.program_name} · ${profile.city}, ${profile.state}`
            : 'Complete your profile to get started.'
        }
      />

      {/* Gamification stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Flame className="w-7 h-7 text-orange-500" />}
          value={streakData.current}
          label="Day streak"
        />
        <StatCard
          icon={<Zap className="w-7 h-7 text-yellow-500" />}
          value={xpRecord.total}
          label="Total XP"
        />
        <StatCard
          icon={<Trophy className="w-7 h-7 text-amber-500" />}
          value={xpRecord.domains_mastered.length}
          label="Domains mastered"
        />
      </div>

      {/* Judgment Readiness */}
      <div className={`rounded-xl border-2 p-5 flex items-center justify-between gap-4 ${judgmentBorder}`}>
        <div className="flex items-center gap-4">
          <Brain className="w-8 h-8 shrink-0 text-accent-fg" />
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
          <p className={`text-3xl font-bold tabular-nums ${judgmentTextColor}`}>
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
        <div className={`col-span-1 rounded-xl border-2 p-6 ${tc ? `${tc.bgClass} ${tc.borderClass}` : 'bg-card border-border'} flex flex-col items-center justify-center text-center`}>
          {score !== null && tier ? (
            <>
              <ScoreRing score={score} tier={tier} size="md" className="mb-3" />
              <p className={`font-bold text-sm ${tc!.colorClass}`}>Tier {tier} — {tc!.label}</p>
              <Link href="/student/results" className="mt-4 w-full">
                <Button variant="outline" size="sm" className="w-full">View Full Results</Button>
              </Link>
            </>
          ) : profile?.profile_complete ? (
            <>
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-muted-foreground/20 flex items-center justify-center mb-3">
                <BarChart3 className="w-10 h-10 text-muted-foreground/40" />
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
                <User className="w-10 h-10 text-muted-foreground/40" />
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
          {([
            {
              Icon: Building2,
              title: 'Browse Openings',
              desc: 'View externship positions matched to your location and availability.',
              href: '/student/openings',
              disabled: !profile?.readiness_tier || profile.readiness_tier === 3,
            },
            {
              Icon: FolderOpen,
              title: 'My Applications',
              desc: 'Track the status of your externship applications.',
              href: '/student/applications',
              disabled: false,
            },
            {
              Icon: Pencil,
              title: 'Edit Profile',
              desc: 'Update your location, availability, and certification status.',
              href: '/student/onboarding',
              disabled: false,
            },
            {
              Icon: FileText,
              title: 'Retake Assessment',
              desc: 'Improve your score and move up a readiness tier.',
              href: '/student/assessment',
              disabled: !profile?.profile_complete,
            },
          ] as const).map(({ Icon, title, desc, href, disabled }) => (
            <div key={href} className={`rounded-xl border bg-card p-5 flex flex-col ${disabled ? 'opacity-50' : 'hover:shadow-md transition-shadow'}`}>
              <Icon className="w-6 h-6 mb-3 text-primary" />
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
              ? <span className="inline-flex items-center gap-1 text-xs font-bold text-tier1-fg">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Placement Ready
                </span>
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
                  ? 'var(--tier1)'
                  : profile.readiness_tier === 2
                  ? 'var(--tier2)'
                  : 'var(--destructive)',
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="text-tier2-fg font-medium">Tier 2 at 55%</span>
            <span className="text-tier1-fg font-medium">Tier 1 at 75%</span>
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
              : score >= 85 ? 'bg-tier1'
              : score >= 50 ? 'bg-tier2'
              : 'bg-destructive'

            return (
              <Link key={d.domain} href={`/student/study/${d.domain}`} className="block group">
                <div className="flex items-center gap-3">
                  <DomainIcon name={d.icon} className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
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
                    <span className="flex-shrink-0 text-xs font-semibold text-accent-fg bg-accent/10 px-1.5 py-0.5 rounded-full">Next</span>
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
