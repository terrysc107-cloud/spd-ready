import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile } from '@/lib/dal/hospital'
import { getCohortMembers } from '@/lib/dal/cohort'
import { CohortTable } from '@/components/hospital/CohortTable'
import { AddStudentForm } from '@/components/hospital/AddStudentForm'
import { Button } from '@/components/ui/button'

export default async function CohortPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const profile = await getHospitalProfile()
  if (!profile?.profile_complete) redirect('/hospital/onboarding')

  const rows = await getCohortMembers()

  return (
    <div className="py-8 max-w-5xl mx-auto space-y-6">
      <Link href="/hospital/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <span>←</span><span>Dashboard</span>
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cohort</h1>
          <p className="text-sm text-muted-foreground">{rows.length} student{rows.length === 1 ? '' : 's'} in your training pipeline</p>
        </div>
        <Link href="/hospital/cohort/roi">
          <Button variant="outline">View ROI Projection →</Button>
        </Link>
      </div>

      <AddStudentForm />
      <CohortTable rows={rows} />
    </div>
  )
}
