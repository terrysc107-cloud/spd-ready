import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { readStore } from '@/lib/local-db/store'
import { seedDemoStudents } from '@/lib/local-db/seed-demo'
import { writeStore } from '@/lib/local-db/store'
import { TierBadge } from '@/components/student/TierBadge'
import { CategoryScoreBar } from '@/components/student/CategoryScoreBar'
import { CATEGORY_LABELS } from '@/lib/dal/scoring'

function EnvLabel(env: string): string {
  const map: Record<string, string> = {
    acute_care: 'Acute Care',
    ambulatory: 'Ambulatory / Outpatient',
    either: 'Either (flexible)',
  }
  return map[env] ?? env
}

function CertLabel(status: string): string {
  const map: Record<string, string> = {
    in_progress: 'Certification in progress',
    certified: 'Certified',
    none: 'No certification yet',
  }
  return map[status] ?? status
}

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { studentId } = await params

  // Load and (if needed) seed the store
  let store = readStore()
  const seeded = seedDemoStudents(store)
  if (seeded !== store) {
    writeStore(seeded)
    store = seeded
  }

  const profile = store.student_profiles[studentId]
  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium mb-2">Candidate not found</p>
        <Link href="/hospital/candidates" className="text-primary hover:underline text-sm">
          ← Back to Candidate Pipeline
        </Link>
      </div>
    )
  }

  // Latest completed assessment
  const assessments = Object.values(store.assessments)
    .filter(a => a.student_user_id === studentId && a.status === 'completed')
    .sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''))
  const latest = assessments[0] ?? null

  const judgmentSessions = (store.study_sessions[studentId] ?? []).filter(
    s => s.domain === 'SPD_JUDGMENT'
  )
  const judgmentScore = judgmentSessions.length > 0
    ? Math.max(...judgmentSessions.map(s => s.score_pct))
    : null

  const score = Math.round(profile.readiness_score ?? 0)
  const tier = (profile.readiness_tier ?? 3) as 1 | 2 | 3

  const ringColor =
    tier === 1
      ? 'oklch(0.55 0.18 150)'
      : tier === 2
        ? 'oklch(0.65 0.18 80)'
        : 'oklch(0.55 0.18 25)'

  const categories: Array<{ key: string; score: number | null }> = [
    { key: 'technical', score: latest?.technical_score ?? null },
    { key: 'situational', score: latest?.situational_score ?? null },
    { key: 'process', score: latest?.process_score ?? null },
    { key: 'behavior', score: latest?.behavior_score ?? null },
    { key: 'instrument', score: latest?.instrument_score ?? null },
    { key: 'reliability', score: latest?.reliability_score ?? null },
  ]

  const strengths = profile.strengths_json ?? []
  const growthAreas = profile.growth_areas_json ?? []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/hospital/candidates"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Candidate Pipeline
      </Link>

      {/* Header card */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Score ring */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(${ringColor} ${score * 3.6}deg, oklch(0.90 0.02 220) 0deg)`,
                padding: '4px',
              }}
            >
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                <p className="text-2xl font-bold tabular-nums">{score}%</p>
                <p className="text-xs text-muted-foreground">Readiness</p>
              </div>
            </div>
            <TierBadge tier={tier} size="default" />
          </div>

          {/* Identity */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {profile.city}, {profile.state}
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
              <div>
                <span className="text-muted-foreground">Program: </span>
                <span className="font-medium">{profile.program_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Certification: </span>
                <span className="font-medium">{CertLabel(profile.cert_status)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Expected completion: </span>
                <span className="font-medium">{profile.expected_completion_date}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Travel radius: </span>
                <span className="font-medium">{profile.travel_radius} miles</span>
              </div>
              <div>
                <span className="text-muted-foreground">Environment: </span>
                <span className="font-medium">{EnvLabel(profile.preferred_environment)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Transport reliable: </span>
                <span className="font-medium">{profile.transportation_reliable ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Shift availability: </span>
                <span className="font-medium capitalize">{profile.shift_availability.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Judgment readiness */}
      <div className={`rounded-xl border-2 p-5 flex items-center justify-between ${
        judgmentScore === null ? 'border-border bg-muted/20'
        : judgmentScore >= 75 ? 'border-[oklch(0.75_0.12_150)] bg-[oklch(0.96_0.04_150)]'
        : judgmentScore >= 55 ? 'border-[oklch(0.85_0.12_80)] bg-[oklch(0.98_0.03_80)]'
        : 'border-destructive/30 bg-destructive/5'
      }`}>
        <div>
          <p className="font-bold text-sm">🧠 Judgment Readiness Score</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {judgmentScore === null
              ? 'Student has not completed the judgment track yet'
              : judgmentScore >= 75
              ? 'Strong professional judgment and safety ownership'
              : judgmentScore >= 55
              ? 'Developing — may benefit from coaching on escalation or accountability'
              : 'Needs coaching — low scores on judgment scenarios'}
          </p>
          {judgmentScore !== null && judgmentScore < 75 && (
            <p className="text-xs font-medium text-[oklch(0.55_0.18_80)] mt-1">
              Recommend: review escalation, safety ownership, and accountability scenarios
            </p>
          )}
        </div>
        <p className={`text-3xl font-bold tabular-nums shrink-0 ${
          judgmentScore === null ? 'text-muted-foreground text-base'
          : judgmentScore >= 75 ? 'text-[oklch(0.45_0.18_150)]'
          : judgmentScore >= 55 ? 'text-[oklch(0.55_0.18_80)]'
          : 'text-destructive'
        }`}>
          {judgmentScore !== null ? `${Math.round(judgmentScore)}%` : '—'}
        </p>
      </div>

      {/* Category scores */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold text-base mb-4">Assessment Scores</h2>
        {latest ? (
          <div className="space-y-4">
            {categories.map(({ key, score: catScore }) => (
              <CategoryScoreBar
                key={key}
                label={CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] ?? key}
                score={catScore ?? 0}
                isStrength={strengths.includes(key)}
                isGrowthArea={growthAreas.includes(key)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No completed assessment on file.</p>
        )}
      </div>

      {/* Strengths & growth */}
      {(strengths.length > 0 || growthAreas.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {strengths.length > 0 && (
            <div className="rounded-xl border bg-white shadow-sm p-5">
              <h3 className="font-semibold text-sm text-primary mb-2">Top Strengths</h3>
              <ul className="space-y-1">
                {strengths.map(s => (
                  <li key={s} className="text-sm">
                    {CATEGORY_LABELS[s as keyof typeof CATEGORY_LABELS] ?? s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {growthAreas.length > 0 && (
            <div className="rounded-xl border bg-white shadow-sm p-5">
              <h3 className="font-semibold text-sm text-amber-600 mb-2">Growth Areas</h3>
              <ul className="space-y-1">
                {growthAreas.map(g => (
                  <li key={g} className="text-sm">
                    {CATEGORY_LABELS[g as keyof typeof CATEGORY_LABELS] ?? g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
