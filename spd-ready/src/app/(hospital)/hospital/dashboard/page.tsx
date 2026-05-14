import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile, getHospitalOpenings } from '@/lib/dal/hospital'
import { readStore } from '@/lib/local-db/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HeroBanner } from '@/components/shell/HeroBanner'
import { StatCard } from '@/components/data/StatCard'
import { EmptyState } from '@/components/shell/EmptyState'
import { Building2, ClipboardList, FolderOpen, Plus } from '@/lib/icons'

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

  const store = readStore()
  const allApps = Object.values(store.applications)
  const pendingCount = allApps.filter(
    a => openings.some(o => o.id === a.externship_id) && a.status === 'applied'
  ).length

  const openCount = openings.filter(o => o.status === 'open').length

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6">
      <HeroBanner
        eyebrow="Hospital Portal"
        title={profile.site_name}
        subtitle={`${profile.organization_name} · ${profile.city}, ${profile.state}`}
        actions={
          <Link href="/hospital/openings/new">
            <Button size="sm" variant="secondary" className="mt-1">+ New Opening</Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Building2 className="w-7 h-7 text-primary" />}
          value={openCount}
          label="Open Positions"
        />
        <StatCard
          icon={<ClipboardList className="w-7 h-7 text-tier2-fg" />}
          value={pendingCount}
          label="Pending Reviews"
        />
        <StatCard
          icon={<FolderOpen className="w-7 h-7 text-muted-foreground" />}
          value={openings.length}
          label="Total Openings"
        />
      </div>

      {/* Openings */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base">Externship Openings</h2>
          <Link href="/hospital/openings/new">
            <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1" /> New Opening</Button>
          </Link>
        </div>
        {openings.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="w-10 h-10" />}
            heading="No openings yet"
            body="Create your first externship opening to start receiving applications from qualified students."
            action={
              <Link href="/hospital/openings/new">
                <Button variant="outline">Create your first opening</Button>
              </Link>
            }
          />
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
      </div>
    </div>
  )
}
