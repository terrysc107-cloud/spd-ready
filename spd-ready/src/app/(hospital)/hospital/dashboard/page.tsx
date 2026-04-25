import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile, getHospitalOpenings } from '@/lib/dal/hospital'
import { readStore } from '@/lib/local-db/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open: 'default',
  closed: 'secondary',
  filled: 'outline',
}

export default async function HospitalDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getHospitalProfile()
  if (!profile?.profile_complete) redirect('/hospital/onboarding')

  const openings = await getHospitalOpenings()

  // Count pending applications across all openings
  const store = readStore()
  const allApps = Object.values(store.applications)
  const pendingCount = allApps.filter(
    a => openings.some(o => o.id === a.externship_id) && a.status === 'applied'
  ).length

  const openCount = openings.filter(o => o.status === 'open').length

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{profile.site_name}</h1>
        <p className="text-muted-foreground mt-1">{profile.organization_name} · {profile.city}, {profile.state}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{openCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Open Positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{pendingCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Pending Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{openings.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Openings</p>
          </CardContent>
        </Card>
      </div>

      {/* Openings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Externship Openings</CardTitle>
          <Link href="/hospital/openings/new">
            <Button size="sm">+ New Opening</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {openings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No openings yet.</p>
              <Link href="/hospital/openings/new">
                <Button className="mt-4" variant="outline">Create your first opening</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {openings.map(o => {
                const appCount = allApps.filter(a => a.externship_id === o.id).length
                const pendingApps = allApps.filter(a => a.externship_id === o.id && a.status === 'applied').length
                return (
                  <div key={o.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{o.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {o.shift} · {appCount} applicant{appCount !== 1 ? 's' : ''}
                        {pendingApps > 0 && (
                          <span className="ml-2 text-primary font-medium">{pendingApps} pending</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={STATUS_VARIANT[o.status] ?? 'secondary'}>{o.status}</Badge>
                      <Link href={`/hospital/openings/${o.id}`}>
                        <Button size="sm" variant="outline">View Candidates</Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
