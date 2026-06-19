import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getStudentProfile, getApplications } from '@/lib/dal/student'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  applied: 'secondary',
  under_review: 'outline',
  accepted: 'default',
  waitlisted: 'outline',
  rejected: 'destructive',
}

const STATUS_LABEL: Record<string, string> = {
  applied: 'Applied',
  under_review: 'Under Review',
  accepted: 'Accepted',
  waitlisted: 'Waitlisted',
  rejected: 'Not Selected',
}

function FitBar({ score }: { score: number | null }) {
  const pct = score ?? 0
  const color = pct >= 75 ? 'bg-green-500' : pct >= 55 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{pct}% fit</span>
    </div>
  )
}

export default async function ApplicationsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getStudentProfile()
  if (!profile?.profile_complete) redirect('/student/onboarding')

  const applications = await getApplications()

  return (
    <div className="py-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Applications</h1>
        <Link href="/student/openings">
          <Button variant="outline" size="sm">Browse Openings</Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">You have not applied to any externships yet.</p>
            {(profile.readiness_tier === 1 || profile.readiness_tier === 2) ? (
              <Link href="/student/openings">
                <Button>Browse Open Positions</Button>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete the readiness assessment and reach Tier 1 or Tier 2 to apply.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <Card key={app.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{app.externship_openings.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {app.externship_openings.hospital_profiles.site_name}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[app.status] ?? 'secondary'}>
                    {STATUS_LABEL[app.status] ?? app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <FitBar score={app.fit_score} />
                  <p className="text-xs text-muted-foreground">
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                {app.status === 'accepted' && (
                  <div className="mt-3 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                    Congratulations! You have been accepted. The site coordinator will be in touch.
                  </div>
                )}
                {app.status === 'rejected' && (
                  <div className="mt-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                    This application was not selected. Keep applying to other openings.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
