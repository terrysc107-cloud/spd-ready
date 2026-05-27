import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { getStudentProfile } from '@/lib/dal/student'
import { getLatestCompletedAssessment } from '@/lib/dal/assessment'
import { CATEGORY_LABELS } from '@/lib/dal/scoring'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Zap, BookOpen } from '@/lib/icons'
import { ScoreRing } from '@/components/data/ScoreRing'

const TIER_NEXT_STEPS: Record<1 | 2 | 3, { heading: string; steps: string[] }> = {
  1: {
    heading: 'You are eligible for externship placement.',
    steps: [
      'Browse open externship positions and apply.',
      'Your readiness profile is now visible to hospital coordinators.',
      'Maintain your skills — coordinators will review your category scores.',
    ],
  },
  2: {
    heading: 'You are eligible with coordinator-matched support.',
    steps: [
      'Apply to openings — your profile will be matched to sites offering mentorship.',
      'Review your growth areas before your externship begins.',
      'Retake the assessment after focused study to move to Tier 1.',
    ],
  },
  3: {
    heading: 'Focus on the areas below before applying.',
    steps: [
      'Review your growth areas with your program instructor.',
      'You can retake the assessment in 24 hours.',
      'Tier 3 students are not eligible for externship applications until reaching Tier 2 or higher.',
    ],
  },
}

const CATEGORY_IMPROVEMENT_NOTES: Record<string, string> = {
  technical:
    'Review sterilization science, Spaulding classification, and biological indicator protocols.',
  situational:
    'Practice applying standard procedures to real-world decontam and assembly scenarios.',
  process:
    'Study ANSI/AAMI ST79, traceability requirements, and recall procedures.',
  behavior:
    'Focus on professional accountability, clear shift communication, and policy compliance.',
  instrument:
    'Practice instrument identification, box-lock inspection, and preference card reading.',
  reliability:
    'Reinforce the impact of attendance on OR scheduling and patient safety.',
}

const TIER_BADGE_CLASSES = {
  1: 'text-tier1-fg border-tier1-border',
  2: 'text-tier2-fg border-tier2-border',
  3: 'text-destructive border-destructive/40',
}

const TIER_BG = {
  1: 'tier-1-bg',
  2: 'tier-2-bg',
  3: 'tier-3-bg',
}

export default async function ResultsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [profile, assessment] = await Promise.all([
    getStudentProfile(),
    getLatestCompletedAssessment(),
  ])

  if (!assessment || assessment.status !== 'completed') {
    redirect('/student/assessment')
  }

  const tier = ((profile?.readiness_tier ?? 3) as 1 | 2 | 3)
  const overallScore = Math.round(assessment.overall_score ?? 0)

  const categoryScores = {
    technical: assessment.technical_score ?? 0,
    situational: assessment.situational_score ?? 0,
    process: assessment.process_score ?? 0,
    behavior: assessment.behavior_score ?? 0,
    instrument: assessment.instrument_score ?? 0,
    reliability: assessment.reliability_score ?? 0,
  }

  const strengths: string[] = (profile?.strengths_json ?? []) as string[]
  const growthAreas: string[] = (profile?.growth_areas_json ?? []) as string[]
  const nextSteps = TIER_NEXT_STEPS[tier]

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6">
      {/* ── Credential Header ─── */}
      <div className={`rounded-2xl border-2 p-8 text-center relative overflow-hidden ${TIER_BG[tier]}`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">SPD Ready · Readiness Assessment</p>
          <div className="flex justify-center mb-5">
            <ScoreRing score={overallScore} tier={tier} size="lg" label="Overall Score" />
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-bold text-sm border-2 bg-white shadow-sm ${TIER_BADGE_CLASSES[tier]}`}>
            {tier === 1 ? <CheckCircle2 className="w-4 h-4" /> : tier === 2 ? <Zap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            Tier {tier} — {tier === 1 ? 'Placement Ready' : tier === 2 ? 'Ready with Support' : 'Developing Readiness'}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Category Breakdown ─── */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-bold text-base mb-5">Category Breakdown</h2>
        <div className="space-y-4">
          {(Object.keys(categoryScores) as (keyof typeof categoryScores)[]).map(key => {
            const pct = Math.round(categoryScores[key])
            const isStrength = strengths.includes(key)
            const isGrowth = growthAreas.includes(key)
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{CATEGORY_LABELS[key]}</span>
                    {isStrength && <span className="text-xs bg-tier1-bg text-tier1-fg border border-tier1-border rounded-full px-2 py-0.5 font-medium">Strength</span>}
                    {isGrowth && <span className="text-xs bg-tier2-bg text-tier2-fg border border-tier2-border rounded-full px-2 py-0.5 font-medium">Focus area</span>}
                  </div>
                  <span className="text-sm font-bold tabular-nums">{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: isStrength
                        ? 'var(--tier1)'
                        : isGrowth
                        ? 'var(--tier2)'
                        : 'var(--accent)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Strengths + Growth ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="rounded-xl border-2 tier-1-bg p-5">
          <h3 className="font-bold text-sm text-tier1-fg mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Top Strengths
          </h3>
          <div className="space-y-2">
            {strengths.length > 0 ? strengths.map(key => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium">{CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}</span>
                <span className="text-sm font-bold text-tier1-fg">{Math.round(categoryScores[key as keyof typeof categoryScores])}%</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">None recorded.</p>}
          </div>
        </div>
        <div className="rounded-xl border-2 tier-2-bg p-5">
          <h3 className="font-bold text-sm text-tier2-fg mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Growth Areas
          </h3>
          <div className="space-y-2">
            {growthAreas.length > 0 ? growthAreas.map(key => (
              <div key={key}>
                <p className="text-sm font-medium">{CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{CATEGORY_IMPROVEMENT_NOTES[key]}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">None recorded.</p>}
          </div>
        </div>
      </div>

      {/* ── Next Steps ─── */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-bold text-base mb-1">Next Steps</h2>
        <p className="text-sm text-muted-foreground mb-4">{nextSteps.heading}</p>
        <div className="space-y-2">
          {nextSteps.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center mt-0.5">{i + 1}</span>
              <span className="text-muted-foreground leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score formula */}
      <div className="rounded-xl border-2 border-border bg-muted/30 p-5 space-y-3">
        <p className="font-semibold text-sm">How your readiness score is calculated</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: 'Technical Knowledge', weight: '30%', reason: 'Foundation of every SPD task' },
            { label: 'Situational Judgment', weight: '25%', reason: 'Predicts behavior under pressure' },
            { label: 'Process Discipline', weight: '15%', reason: 'Workflow and quality consistency' },
            { label: 'Behavioral Fit', weight: '15%', reason: 'Coachability and professionalism' },
            { label: 'Instrument Familiarity', weight: '10%', reason: 'Identification and inspection' },
            { label: 'Reliability', weight: '5%', reason: 'Availability and dependability' },
          ].map(({ label, weight, reason }) => (
            <div key={label} className="flex items-start gap-2">
              <span className="font-bold text-primary w-8 shrink-0">{weight}</span>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground">{reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA / Retake ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        {tier !== 3 && (
          <Link href="/student/openings" className="w-full sm:w-auto">
            <Button className="w-full" size="lg">Browse Externship Openings →</Button>
          </Link>
        )}
        <Link href="/student/assessment" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full">Retake Assessment</Button>
        </Link>
        <Link href="/student/dashboard" className="w-full sm:w-auto">
          <Button variant="ghost" size="lg" className="w-full">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
