import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStudentProfile } from '@/lib/dal/student'
import { getCurrentUser } from '@/lib/dal/auth'
import { OnboardingForm } from '@/components/student/OnboardingForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getCertificatesForStudent, getCEStats } from '@/lib/dal/certificates'
import { CertificateList } from '@/components/student/CertificateList'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getStudentProfile()
  if (!profile) redirect('/student/onboarding')

  const isEditing = params.edit === 'true'

  if (isEditing) {
    return (
      <div className="py-8">
        <h1 className="text-3xl font-semibold text-center mb-2">Edit Profile</h1>
        <p className="text-muted-foreground text-center mb-8">
          Update your profile — changes save immediately.
        </p>
        <OnboardingForm initialData={profile} />
      </div>
    )
  }

  const [certificates, ceStats] = await Promise.all([
    getCertificatesForStudent(user.id),
    getCEStats(user.id),
  ])

  return (
    <div className="py-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">My Profile</h1>
        <Link href="/student/profile?edit=true">
          <Button variant="outline">Edit Profile</Button>
        </Link>
      </div>

      {profile.readiness_tier && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Readiness Tier:</span>
          <Badge variant={
            profile.readiness_tier === 1 ? 'default' :
            profile.readiness_tier === 2 ? 'secondary' : 'destructive'
          }>
            Tier {profile.readiness_tier}
          </Badge>
          {profile.readiness_score && (
            <span className="text-sm text-muted-foreground ml-1">
              ({Math.round(profile.readiness_score)}% overall)
            </span>
          )}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Name</span><p className="font-medium">{profile.first_name} {profile.last_name}</p></div>
          <div><span className="text-muted-foreground">Location</span><p className="font-medium">{profile.city}, {profile.state}</p></div>
          <div><span className="text-muted-foreground">Travel Radius</span><p className="font-medium">{profile.travel_radius} miles</p></div>
          <div><span className="text-muted-foreground">Transportation</span><p className="font-medium">{profile.transportation_reliable ? 'Reliable' : 'Needs arrangement'}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Program & Certification</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Program</span><p className="font-medium">{profile.program_name}</p></div>
          <div><span className="text-muted-foreground">Expected Completion</span><p className="font-medium">{profile.expected_completion_date}</p></div>
          <div><span className="text-muted-foreground">Cert Status</span><p className="font-medium capitalize">{profile.cert_status.replace('_', ' ')}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Availability & Preferences</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Shift Availability</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {(profile.shift_availability ?? []).map(s => (
                <Badge key={s} variant="outline" className="capitalize">{s}</Badge>
              ))}
            </div>
          </div>
          <div><span className="text-muted-foreground">Preferred Environment</span><p className="font-medium capitalize">{profile.preferred_environment?.replace('_', ' ')}</p></div>
        </CardContent>
      </Card>

      {!profile.readiness_tier && (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm">
          <p className="font-medium text-primary">Ready to take the readiness assessment?</p>
          <p className="text-muted-foreground mt-1">Complete the 30-question assessment to receive your readiness score and tier placement.</p>
          <Link href="/student/assessment" className="mt-3 inline-block">
            <Button size="sm">Start Assessment</Button>
          </Link>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">🏅 Continuing Education</h2>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">{ceStats.total_credits}</p>
            <p className="text-xs text-muted-foreground">CE credits earned · {ceStats.count} certificate{ceStats.count === 1 ? '' : 's'}</p>
          </div>
        </div>
        <CertificateList certificates={certificates} />
      </section>
    </div>
  )
}
