import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { getStudentProfile } from '@/lib/dal/student'
import { getLatestCompletedAssessment } from '@/lib/dal/assessment'
import { CATEGORY_LABELS } from '@/lib/dal/scoring'
import { Button } from '@/components/ui/button'

// Per-tier next steps copy
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

  // Tier is stored in student_profiles (not student_assessments — no readiness_tier column there)
  const tier = ((profile?.readiness_tier ?? 3) as 1 | 2 | 3)
  const overallScore = Math.round(assessment.overall_score ?? 0)

  // Build category scores from assessment row — column names are {category}_score
  const categoryScores = {
    technical: assessment.technical_score ?? 0,
    situational: assessment.situational_score ?? 0,
    process: assessment.process_score ?? 0,
    behavior: assessment.behavior_score ?? 0,
    instrument: assessment.instrument_score ?? 0,
    reliability: assessment.reliability_score ?? 0,
  }

  // Strengths and growth areas are written to student_profiles by submitAssessmentAction
  const strengths: string[] = (profile?.strengths_json ?? []) as string[]
  const growthAreas: string[] = (profile?.growth_areas_json ?? []) as string[]

  const nextSteps = TIER_NEXT_STEPS[tier]

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6">
      {/* ── Credential Header ─── */}
      <div className={`rounded-2xl border-2 p-8 text-center relative overflow-hidden ${
        tier === 1 ? 'tier-1-bg' : tier === 2 ? 'tier-2-bg' : 'tier-3-bg'
      }`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">SPD Ready · Readiness Assessment</p>
          {/* Score ring */}
          <div className="flex justify-center mb-5">
            <div
              className="w-36 h-36 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(${
                  tier === 1 ? 'oklch(0.55 0.18 150)' : tier === 2 ? 'oklch(0.65 0.18 80)' : 'oklch(0.577 0.245 27)'
                } ${overallScore * 3.6}deg, oklch(0.90 0.02 220) 0deg)`,
                padding: '5px',
                borderRadius: '50%',
              }}
            >
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                <p className="text-4xl font-bold leading-none tabular-nums">{overallScore}%</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Overall Score</p>
              </div>
            </div>
          </div>
          {/* Tier badge */}
          <div className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-bold text-sm border-2 bg-white shadow-sm ${
            tier === 1 ? 'text-[oklch(0.45_0.18_150)] border-[oklch(0.75_0.12_150)]' :
            tier === 2 ? 'text-[oklch(0.55_0.18_80)] border-[oklch(0.85_0.12_80)]' :
            'text-destructive border-destructive/40'
          }`}>
            {tier === 1 ? '✅' : tier === 2 ? '⚡' : '📚'}
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
                    {isStrength && <span className="text-xs bg-[oklch(0.96_0.04_150)] text-[oklch(0.45_0.18_150)] border border-[oklch(0.75_0.12_150)] rounded-full px-2 py-0.5 font-medium">Strength</span>}
                    {isGrowth && <span className="text-xs bg-[oklch(0.98_0.03_80)] text-[oklch(0.55_0.18_80)] border border-[oklch(0.85_0.12_80)] rounded-full px-2 py-0.5 font-medium">Focus area</span>}
                  </div>
                  <span className="text-sm font-bold tabular-nums">{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: isStrength
                        ? 'oklch(0.55 0.18 150)'
                        : isGrowth
                        ? 'oklch(0.65 0.18 80)'
                        : 'oklch(0.52 0.16 205)',
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
          <h3 className="font-bold text-sm text-[oklch(0.45_0.18_150)] mb-3 flex items-center gap-2">✅ Top Strengths</h3>
          <div className="space-y-2">
            {strengths.length > 0 ? strengths.map(key => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium">{CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}</span>
                <span className="text-sm font-bold text-[oklch(0.45_0.18_150)]">{Math.round(categoryScores[key as keyof typeof categoryScores])}%</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">None recorded.</p>}
          </div>
        </div>
        <div className="rounded-xl border-2 tier-2-bg p-5">
          <h3 className="font-bold text-sm text-[oklch(0.55_0.18_80)] mb-3 flex items-center gap-2">⚡ Growth Areas</h3>
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

      {/* Score formula explainer */}
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
