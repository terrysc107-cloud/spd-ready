import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SparklesIcon } from 'lucide-react'
import { getAuthUser } from '@/lib/dal/auth'
import { getMindsetProfile } from '@/lib/dal/mindset'
import { deriveCalibration } from '@/lib/dal/mindset-logic'
import { MINDSET_DIMENSIONS, ARCHETYPE_BY_ID, MODEL_VERSION } from '@/lib/mindset-model'
import { Button } from '@/components/ui/button'
import { RadarChart } from '@/components/ui/radar-chart'
import { MindsetBetaFeedback } from '@/components/student/MindsetBetaFeedback'

const RADAR_LABELS = ['Safety', 'Standards', 'Thinking', 'Escalation', 'Accountability', 'Teamwork']

const CALIBRATION_COPY = {
  overconfident: { emoji: '⚠️', title: 'Confidence runs ahead of evidence', body: 'Your self-rating is higher than your scenario results. A cue to pressure-test your instincts against the standard.' },
  aligned: { emoji: '🎯', title: 'Well calibrated', body: 'Your self-view and your decisions line up. Calibrated judgment is exactly what a charge tech needs.' },
  underconfident: { emoji: '💪', title: 'Stronger than you think', body: 'Your decisions outperform your self-rating. Trust your judgment a little more.' },
}

export default async function MindsetPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getMindsetProfile(user.id)

  // No baseline yet → invite to take it.
  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10 text-center">
        <div className="rounded-2xl bg-card p-8 shadow-card ring-1 ring-border/70">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <SparklesIcon className="size-7" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight">Discover your tech mindset</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A short judgment baseline maps how you make decisions under pressure — and locks your starting point so you can watch it grow.
          </p>
        </div>
        <Link href="/student/baseline">
          <Button size="lg" className="w-full">Take the judgment baseline →</Button>
        </Link>
      </div>
    )
  }

  const archetype = ARCHETYPE_BY_ID[profile.archetype] ?? ARCHETYPE_BY_ID.emerging
  const managerArchetype = profile.managerAdjustment ? ARCHETYPE_BY_ID[profile.managerAdjustment.archetype] : null

  const current = MINDSET_DIMENSIONS.map(d => profile.dimensionScores[d.key] ?? 0)
  const baseline = MINDSET_DIMENSIONS.map(d => profile.demonstratedT0[d.key] ?? 0)
  const hasProgress = MINDSET_DIMENSIONS.some(d => (profile.dimensionScores[d.key] ?? 0) !== (profile.demonstratedT0[d.key] ?? 0))

  const calibration = profile.selfPerception
    ? deriveCalibration(profile.selfPerception, profile.demonstratedT0)
    : null

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Archetype hero */}
      <div className="rounded-2xl shadow-card ring-1 ring-border/70 bg-gradient-to-br from-[oklch(0.97_0.02_250)] to-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">Your Tech Mindset · Beta</span>
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">model {MODEL_VERSION}</span>
        </div>
        <div className="flex items-start gap-4">
          <span className="text-5xl leading-none">{archetype.emoji}</span>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{archetype.label}</h1>
            <p className="text-sm font-medium text-primary mt-0.5">{archetype.tagline}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">{archetype.description}</p>
        {managerArchetype && (
          <div className="mt-4 rounded-lg border border-[oklch(0.75_0.12_150)] bg-[oklch(0.96_0.04_150)] px-4 py-3">
            <p className="text-xs font-semibold text-[oklch(0.4_0.15_150)]">
              ✓ Your manager {managerArchetype.id === archetype.id ? 'validated this profile' : `sees you as ${managerArchetype.label}`}
            </p>
            {profile.managerAdjustment?.note && (
              <p className="text-xs text-[oklch(0.4_0.12_150)] mt-1 italic">“{profile.managerAdjustment.note}”</p>
            )}
          </div>
        )}
      </div>

      {/* Radar */}
      <div className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-border/70">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-lg font-semibold tracking-tight">Judgment dimensions</h2>
          {hasProgress && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-[oklch(0.55_0.18_250)]" />Now</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-[oklch(0.78_0.04_250)]" />Baseline</span>
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <RadarChart
            axes={RADAR_LABELS}
            series={[
              ...(hasProgress ? [{ values: baseline, stroke: 'oklch(0.78 0.04 250)', fill: 'transparent' }] : []),
              { values: current, stroke: 'oklch(0.55 0.18 250)', fill: 'oklch(0.55 0.18 250 / 0.15)' },
            ]}
            size={300}
          />
        </div>
        {/* Per-dimension bars + deltas */}
        <div className="space-y-2.5 mt-2">
          {MINDSET_DIMENSIONS.map(d => {
            const now = profile.dimensionScores[d.key] ?? 0
            const t0 = profile.demonstratedT0[d.key] ?? 0
            const delta = now - t0
            return (
              <div key={d.key} className="flex items-center gap-3">
                <span className="text-xs font-medium w-36 flex-shrink-0">{d.label}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-[oklch(0.55_0.18_250)]" style={{ width: `${now}%` }} />
                </div>
                <span className="text-xs font-bold tabular-nums w-9 text-right">{now}%</span>
                <span className={`text-xs font-semibold tabular-nums w-10 text-right ${
                  delta > 0 ? 'text-[oklch(0.45_0.18_150)]' : delta < 0 ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {delta > 0 ? `+${delta}` : delta < 0 ? delta : '—'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Calibration */}
      {calibration && (
        <div className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-border/70">
          <h2 className="font-heading text-lg font-semibold tracking-tight mb-3">Self-perception vs. demonstrated</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg bg-muted/40 p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">{calibration.selfAvgPct}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">How you rate yourself</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">{calibration.demonstratedAvgPct}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your scenario decisions</p>
            </div>
          </div>
          <div className="rounded-lg border border-border px-4 py-3 flex items-start gap-3">
            <span className="text-lg">{CALIBRATION_COPY[calibration.band].emoji}</span>
            <div>
              <p className="text-sm font-semibold">{CALIBRATION_COPY[calibration.band].title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{CALIBRATION_COPY[calibration.band].body}</p>
            </div>
          </div>
        </div>
      )}

      {/* Beta feedback */}
      <MindsetBetaFeedback initial={profile.techFeedback} initialNote={profile.techFeedbackNote} />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/student/study/SPD_JUDGMENT" className="flex-1">
          <Button variant="outline" size="lg" className="w-full">Train your judgment →</Button>
        </Link>
        <Link href="/student/baseline" className="flex-1">
          <Button variant="ghost" size="lg" className="w-full">Re-take check-in</Button>
        </Link>
      </div>
      <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
        Beta — these archetypes are a hypothesis the SPD field is co-creating. Your feedback shapes the standard.
      </p>
    </div>
  )
}
