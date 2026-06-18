import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/dal/auth'
import { getStudentProfile } from '@/lib/dal/student'
import { getLatestInProgressAssessment, checkCooldown } from '@/lib/dal/assessment'
import { ClockIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AssessmentEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ cooldown?: string; error?: string }>
}) {
  const params = await searchParams

  const user = await getAuthUser()
  if (!user) redirect('/login')

  // Profile gate — defense in depth layer 1 (UI layer)
  const profile = await getStudentProfile()
  if (!profile?.profile_complete) redirect('/student/onboarding')

  // Check cooldown
  const cooldown = await checkCooldown(user.id)

  if (!cooldown.allowed || params.cooldown) {
    const nextAt = cooldown.nextAttemptAt ?? (params.cooldown ? new Date(params.cooldown) : null)
    return (
      <div className="mx-auto max-w-lg py-8">
        <Card>
          <CardHeader>
            <span className="mb-1 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/20">
              <ClockIcon className="size-5" />
            </span>
            <CardTitle className="text-xl">Assessment cooldown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              You completed an assessment recently. To keep scores meaningful, there&apos;s a 24-hour
              waiting period between attempts.
            </p>
            {nextAt && (
              <div className="rounded-lg bg-muted/40 p-4 text-sm ring-1 ring-inset ring-foreground/5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Next attempt available
                </p>
                <p className="mt-1 font-heading font-semibold text-foreground">
                  {nextAt.toLocaleString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </p>
              </div>
            )}
            <Link href="/student/results" className="block">
              <Button variant="outline" className="w-full">View your last results</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Resume an in-progress attempt if there's one with unanswered questions
  const inProgress = await getLatestInProgressAssessment()
  if (inProgress && inProgress.response_count !== undefined && inProgress.response_count < 30) {
    redirect(`/student/assessment/${inProgress.id}/${inProgress.response_count + 1}`)
  }

  redirect('/student/assessment/start')
}
