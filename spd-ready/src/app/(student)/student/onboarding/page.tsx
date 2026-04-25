import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStudentProfile } from '@/lib/dal/student'
import { getCurrentUser } from '@/lib/dal/auth'
import { OnboardingForm } from '@/components/student/OnboardingForm'

export default async function OnboardingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getStudentProfile()
  // If profile is already complete, redirect to profile view
  if (profile?.profile_complete) redirect('/student/profile')

  return (
    <div className="py-8">
      <Link href="/student/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-6">
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        <span>Dashboard</span>
      </Link>
      <h1 className="text-3xl font-semibold text-center mb-2">Complete Your Profile</h1>
      <p className="text-muted-foreground text-center mb-8">
        This profile is your readiness credential — hospitals will review it alongside your assessment score.
      </p>
      <OnboardingForm initialData={profile} />
    </div>
  )
}
