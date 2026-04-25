import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile, getApplicationForCandidate } from '@/lib/dal/hospital'
import { updateApplicationStatusAction } from '@/actions/hospital'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TierBadge } from '@/components/student/TierBadge'
import { CategoryScoreBar } from '@/components/student/CategoryScoreBar'
import { CATEGORY_LABELS } from '@/lib/dal/scoring'
import Link from 'next/link'
import { readStore } from '@/lib/local-db/store'

function FitScoreBar({ score }: { score: number | null }) {
  const pct = score ?? 0
  const color = pct >= 75 ? 'bg-green-500' : pct >= 55 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-2xl font-bold tabular-nums">{pct}%</span>
    </div>
  )
}

const CERT_LABELS: Record<string, string> = {
  none: 'No certification',
  in_progress: 'In Progress',
  crcst: 'CRCST Certified',
  cis: 'CIS Certified',
  other: 'Other certification',
}

const ENV_LABELS: Record<string, string> = {
  acute_care: 'Acute Care',
  ambulatory: 'Ambulatory',
  either: 'No Preference',
}

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string; appId: string }>
}) {
  const { id: openingId, appId } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const hospitalProfile = await getHospitalProfile()
  if (!hospitalProfile?.profile_complete) redirect('/hospital/onboarding')

  const data = await getApplicationForCandidate(appId)
  if (!data) notFound()

  const { application, opening, student } = data
  if (!student || !opening || opening.hospital_user_id !== user.id) notFound()

  // Get assessment category scores from store
  const store = readStore()
  const assessments = Object.values(store.assessments).filter(
    a => a.student_user_id === student.user_id && a.status === 'completed'
  )
  const latestAssessment = assessments.sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''))[0]

  const categoryScores = latestAssessment ? {
    technical: latestAssessment.technical_score ?? 0,
    situational: latestAssessment.situational_score ?? 0,
    process: latestAssessment.process_score ?? 0,
    behavior: latestAssessment.behavior_score ?? 0,
    instrument: latestAssessment.instrument_score ?? 0,
    reliability: latestAssessment.reliability_score ?? 0,
  } : null

  const tier = (student.readiness_tier as 1 | 2 | 3) ?? 3
  const strengths: string[] = (student.strengths_json ?? []) as string[]
  const growthAreas: string[] = (student.growth_areas_json ?? []) as string[]

  const STATUS_ACTIONS: Array<{
    status: string
    label: string
    variant: 'default' | 'outline' | 'destructive' | 'secondary'
  }> = [
    { status: 'under_review', label: 'Mark Under Review', variant: 'secondary' },
    { status: 'accepted', label: 'Accept', variant: 'default' },
    { status: 'waitlisted', label: 'Waitlist', variant: 'outline' },
    { status: 'rejected', label: 'Reject', variant: 'destructive' },
  ]

  return (
    <div className="py-8 max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link href={`/hospital/openings/${openingId}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to {opening.title}
      </Link>

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {student.first_name} {student.last_name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {student.city}, {student.state} · {student.program_name}
          </p>
        </div>
        <TierBadge tier={tier} size="large" />
      </div>

      {/* Fit Score */}
      <Card>
        <CardHeader><CardTitle>Fit Score for This Opening</CardTitle></CardHeader>
        <CardContent>
          <FitScoreBar score={application.fit_score} />
          <p className="text-xs text-muted-foreground mt-2">
            Based on readiness tier, geography, schedule match, and environment preference.
          </p>
        </CardContent>
      </Card>

      {/* Readiness */}
      <Card>
        <CardHeader>
          <CardTitle>Readiness Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Overall Score</p>
              <p className="font-semibold text-lg">{Math.round(student.readiness_score ?? 0)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Certification</p>
              <p className="font-medium">{CERT_LABELS[student.cert_status] ?? student.cert_status}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Environment Preference</p>
              <p className="font-medium">{ENV_LABELS[student.preferred_environment] ?? student.preferred_environment}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Transportation</p>
              <p className="font-medium">{student.transportation_reliable ? 'Reliable' : 'Needs support'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Shift Availability</p>
              <p className="font-medium capitalize">{student.shift_availability.join(', ')}</p>
            </div>
          </div>

          {categoryScores && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium">Category Scores</p>
                {(Object.keys(categoryScores) as (keyof typeof categoryScores)[]).map(key => (
                  <CategoryScoreBar
                    key={key}
                    label={CATEGORY_LABELS[key]}
                    score={categoryScores[key]}
                    isStrength={strengths.includes(key)}
                    isGrowthArea={growthAreas.includes(key)}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Decision */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Decision
            <Badge variant="outline">{application.status.replace('_', ' ')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {application.hospital_notes && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              {application.hospital_notes}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {STATUS_ACTIONS.map(({ status, label, variant }) => (
              <form key={status} action={updateApplicationStatusAction}>
                <input type="hidden" name="app_id" value={application.id} />
                <input type="hidden" name="status" value={status} />
                <input type="hidden" name="opening_id" value={openingId} />
                <Button
                  type="submit"
                  size="sm"
                  variant={variant}
                  disabled={application.status === status}
                >
                  {label}
                </Button>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
