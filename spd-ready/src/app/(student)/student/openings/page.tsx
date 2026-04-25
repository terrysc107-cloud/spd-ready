import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getStudentProfile } from '@/lib/dal/student'
import { getOpenOpenings } from '@/lib/dal/hospital'
import { readStore } from '@/lib/local-db/store'
import { applyToOpeningAction } from '@/actions/hospital'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function StudentOpeningsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; applied?: string }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getStudentProfile()
  if (!profile?.profile_complete) redirect('/student/onboarding')

  const tier = profile.readiness_tier ?? 3
  const canApply = tier === 1 || tier === 2

  const openings = await getOpenOpenings()

  // Find openings the student has already applied to
  const store = readStore()
  const myAppExternshipIds = new Set(
    Object.values(store.applications)
      .filter(a => a.student_user_id === user.id)
      .map(a => a.externship_id)
  )

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Open Externships</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {canApply
            ? 'Browse and apply to open externship positions.'
            : 'Complete your readiness assessment and reach Tier 1 or Tier 2 to apply.'}
        </p>
      </div>

      {params.error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {params.error}
        </div>
      )}
      {params.applied && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Application submitted successfully!
        </div>
      )}

      {openings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No open externship positions right now. Check back soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {openings.map(o => {
            const alreadyApplied = myAppExternshipIds.has(o.id)
            return (
              <Card key={o.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{o.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {o.hospital_site_name} · {o.hospital_city}, {o.hospital_state}
                      </p>
                    </div>
                    <Badge variant="default">Open</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground capitalize">
                      {o.shift} shift · {o.slots} slot{o.slots !== 1 ? 's' : ''} · Starts {o.start_date}
                    </p>
                    {alreadyApplied ? (
                      <Badge variant="secondary">Applied</Badge>
                    ) : canApply ? (
                      <form action={applyToOpeningAction}>
                        <input type="hidden" name="opening_id" value={o.id} />
                        <Button type="submit" size="sm">Apply</Button>
                      </form>
                    ) : (
                      <Button size="sm" disabled>Assessment Required</Button>
                    )}
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
