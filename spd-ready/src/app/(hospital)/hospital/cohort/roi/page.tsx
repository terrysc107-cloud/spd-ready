import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile } from '@/lib/dal/hospital'
import { getCohortROI } from '@/lib/dal/cohort'
import { ROIProjection } from '@/components/hospital/ROIProjection'

export default async function CohortROIPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const profile = await getHospitalProfile()
  if (!profile?.profile_complete) redirect('/hospital/onboarding')

  const roi = await getCohortROI()

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-6">
      <Link href="/hospital/cohort" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <span>←</span><span>Cohort</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold">ROI Projection</h1>
        <p className="text-sm text-muted-foreground">
          Projected savings from your cohort&apos;s training, based on OhioHealth/SpecialtyCare benchmarks. All numbers are projections.
        </p>
      </div>

      <ROIProjection roi={roi} />
    </div>
  )
}
