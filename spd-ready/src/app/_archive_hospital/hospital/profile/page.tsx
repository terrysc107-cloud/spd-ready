import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile } from '@/lib/dal/hospital'

// Reuse the onboarding form for editing — redirect there with existing data
export default async function HospitalProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getHospitalProfile()
  if (!profile?.profile_complete) redirect('/hospital/onboarding')

  redirect('/hospital/onboarding')
}
