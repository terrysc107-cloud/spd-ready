import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { readStore } from '@/lib/local-db/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') redirect('/login')

  const store = readStore()

  const students = Object.values(store.users).filter(u => u.role === 'student')
  const hospitals = Object.values(store.users).filter(u => u.role === 'hospital')
  const profiles = Object.values(store.student_profiles)
  const assessments = Object.values(store.assessments).filter(a => a.status === 'completed')
  const openings = Object.values(store.openings)
  const applications = Object.values(store.applications)

  const tier1 = profiles.filter(p => p.readiness_tier === 1).length
  const tier2 = profiles.filter(p => p.readiness_tier === 2).length
  const tier3 = profiles.filter(p => p.readiness_tier === 3).length

  const accepted = applications.filter(a => a.status === 'accepted').length
  const waitlisted = applications.filter(a => a.status === 'waitlisted').length
  const rejected = applications.filter(a => a.status === 'rejected').length
  const pending = applications.filter(a => a.status === 'applied' || a.status === 'under_review').length

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform overview</p>
        </div>
        <form action="/api/seed" method="POST">
          <button
            type="submit"
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Reset &amp; seed demo data
          </button>
        </form>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{students.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{assessments.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Assessments Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{hospitals.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Hospital Sites</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{openings.filter(o => o.status === 'open').length}</p>
            <p className="text-sm text-muted-foreground mt-1">Open Positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier distribution */}
      <Card>
        <CardHeader><CardTitle>Student Tier Distribution</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Tier 1 — Ready', count: tier1, color: 'bg-green-500', variant: 'default' as const },
            { label: 'Tier 2 — Ready with Support', count: tier2, color: 'bg-amber-500', variant: 'secondary' as const },
            { label: 'Tier 3 — Not Ready Yet', count: tier3, color: 'bg-red-400', variant: 'destructive' as const },
          ].map(({ label, count, color }) => {
            const total = tier1 + tier2 + tier3 || 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium">{count} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Applications breakdown */}
      <Card>
        <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pending}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{accepted}</p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">{waitlisted + rejected}</p>
              <p className="text-sm text-muted-foreground">Waitlisted / Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent applications */}
      <Card>
        <CardHeader><CardTitle>Recent Applications</CardTitle></CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <div className="divide-y">
              {applications
                .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
                .slice(0, 10)
                .map(app => {
                  const studentProfile = store.student_profiles[app.student_user_id]
                  const opening = store.openings[app.externship_id]
                  const hospital = opening ? store.hospital_profiles[opening.hospital_user_id] : null
                  return (
                    <div key={app.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {studentProfile ? `${studentProfile.first_name} ${studentProfile.last_name}` : 'Unknown Student'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {opening?.title ?? 'Unknown Opening'} · {hospital?.site_name ?? ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{app.fit_score ?? '—'}% fit</span>
                        <Badge variant={
                          app.status === 'accepted' ? 'default' :
                          app.status === 'rejected' ? 'destructive' : 'secondary'
                        } className="text-xs">
                          {app.status.replace('_', ' ')}
                        </Badge>
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
