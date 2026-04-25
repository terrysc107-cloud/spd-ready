import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getStudentProfile } from '@/lib/dal/student'
import { getLatestInProgressAssessment, checkCooldown } from '@/lib/dal/assessment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AssessmentEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ cooldown?: string; error?: string }>
}) {
  const params = await searchParams

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Profile gate — defense in depth layer 1 (UI layer)
  const profile = await getStudentProfile()
  if (!profile?.profile_complete) redirect('/student/onboarding')

  // Check cooldown
  const cooldown = await checkCooldown(user.id)

  // If cooldown param is in URL (redirected from startAssessmentAction), show cooldown message
  if (!cooldown.allowed || params.cooldown) {
    const nextAt =
      cooldown.nextAttemptAt ?? (params.cooldown ? new Date(params.cooldown) : null)
    return (
      <div className="py-8 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Cooldown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You completed an assessment recently. To prevent score gaming, a 24-hour waiting
              period is required between attempts.
            </p>
            {nextAt && (
              <p className="text-sm font-medium">
                Next attempt available:{' '}
                <span className="text-foreground">
                  {nextAt.toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            )}
            <Link href="/student/results">
              <Button variant="outline" className="w-full">
                View Your Last Results
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if there is an in-progress assessment to resume
  const inProgress = await getLatestInProgressAssessment()
  if (
    inProgress &&
    inProgress.response_count !== undefined &&
    inProgress.response_count < 30
  ) {
    const nextStep = inProgress.response_count + 1
    redirect(`/student/assessment/${inProgress.id}/${nextStep}`)
  }

  // No in-progress — redirect to start confirmation
  redirect('/student/assessment/start')
}
