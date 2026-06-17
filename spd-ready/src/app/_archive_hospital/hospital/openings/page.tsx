import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile, getHospitalOpenings } from '@/lib/dal/hospital'
import { readStore } from '@/lib/local-db/store'
import { updateOpeningStatusAction } from '@/actions/hospital'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open: 'default',
  closed: 'secondary',
  filled: 'outline',
}

export default async function OpeningsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getHospitalProfile()
  if (!profile?.profile_complete) redirect('/hospital/onboarding')

  const openings = await getHospitalOpenings()
  const store = readStore()

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Externship Openings</h1>
        <Link href="/hospital/openings/new">
          <Button>+ New Opening</Button>
        </Link>
      </div>

      {openings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No openings yet. Create one to start receiving candidates.</p>
            <Link href="/hospital/openings/new">
              <Button className="mt-4">Create Opening</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {openings.map(o => {
            const apps = Object.values(store.applications).filter(a => a.externship_id === o.id)
            const pending = apps.filter(a => a.status === 'applied').length
            const accepted = apps.filter(a => a.status === 'accepted').length
            return (
              <Card key={o.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{o.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {o.shift} · {o.slots} slot{o.slots !== 1 ? 's' : ''} · {o.start_date} → {o.end_date}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[o.status] ?? 'secondary'}>{o.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{apps.length} applicant{apps.length !== 1 ? 's' : ''}</span>
                      {pending > 0 && <span className="text-primary font-medium">{pending} pending</span>}
                      {accepted > 0 && <span className="text-green-600 font-medium">{accepted} accepted</span>}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/hospital/openings/${o.id}`}>
                        <Button size="sm" variant="outline">Candidates</Button>
                      </Link>
                      <form action={updateOpeningStatusAction}>
                        <input type="hidden" name="opening_id" value={o.id} />
                        <input type="hidden" name="status" value={o.status === 'open' ? 'closed' : 'open'} />
                        <Button size="sm" variant="ghost" type="submit">
                          {o.status === 'open' ? 'Close' : 'Reopen'}
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
