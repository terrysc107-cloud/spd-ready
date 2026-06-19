import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStudentProfile } from '@/lib/dal/student'
import { getAuthUser } from '@/lib/dal/auth'
import { OnboardingForm } from '@/components/student/OnboardingForm'

export default async function OnboardingPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getStudentProfile()
  // If profile is already complete, redirect to profile view
  if (profile?.profile_complete) redirect('/student/profile')

  return (
    <div className="py-8">
      <Link href="/student/dashboard" className="group mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        <span>Dashboard</span>
      </Link>
      <h1 className="mb-2 text-center font-heading text-3xl font-semibold tracking-tight">Complete your profile</h1>
      <p className="mx-auto mb-8 max-w-md text-center text-sm text-muted-foreground">
        This profile is part of your competency record — your manager sees it alongside your training and validations.
      </p>
      <OnboardingForm initialData={profile} />
    </div>
  )
}
