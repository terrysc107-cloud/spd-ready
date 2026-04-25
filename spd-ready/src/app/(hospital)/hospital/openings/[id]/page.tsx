import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile, getOpening, getCandidatesForOpening } from '@/lib/dal/hospital'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TierBadge } from '@/components/student/TierBadge'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  applied: 'secondary',
  under_review: 'outline',
  accepted: 'default',
  waitlisted: 'outline',
  rejected: 'destructive',
}

function FitScoreBar({ score }: { score: number | null }) {
  const pct = score ?? 0
  const color = pct >= 75 ? 'bg-green-500' : pct >= 55 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium tabular-nums w-9 text-right">{pct}%</span>
    </div>
  )
}

export default async function OpeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getHospitalProfile()
  if (!profile?.profile_complete) redirect('/hospital/onboarding')

  const opening = await getOpening(id)
  if (!opening || opening.hospital_user_id !== user.id) notFound()

  const candidates = await getCandidatesForOpening(id)

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/hospital/openings" className="text-sm text-muted-foreground hover:text-foreground">
            ← Openings
          </Link>
          <h1 className="text-2xl font-semibold mt-1">{opening.title}</h1>
          <p className="text-muted-foreground text-sm">
            {opening.shift} · {opening.start_date} → {opening.end_date} · {opening.slots} slot{opening.slots !== 1 ? 's' : ''}
          </p>
        </div>
        <Badge variant={opening.status === 'open' ? 'default' : 'secondary'}>{opening.status}</Badge>
      </div>

      {/* Requirements */}
      {opening.requirements.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Requirements</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {opening.requirements.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary">·</span> {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Candidate list */}
      <Card>
        <CardHeader>
          <CardTitle>
            Candidates
            <span className="ml-2 text-muted-foreground font-normal text-base">
              ({candidates.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No eligible candidates yet. Applications from Tier 1 and Tier 2 students will appear here.
            </p>
          ) : (
            <div className="divide-y">
              {candidates.map(({ application, student }) => (
                <div key={application.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {student.first_name} {student.last_name}
                        </span>
                        <TierBadge tier={(student.readiness_tier as 1 | 2 | 3) ?? 3} />
                        <Badge variant={STATUS_VARIANT[application.status] ?? 'secondary'} className="text-xs">
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {student.city}, {student.state} · {student.program_name}
                      </p>
                      <div className="mt-2 max-w-xs">
                        <p className="text-xs text-muted-foreground mb-1">Fit score</p>
                        <FitScoreBar score={application.fit_score} />
                      </div>
                    </div>
                    <Link href={`/hospital/openings/${id}/candidates/${application.id}`}>
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
