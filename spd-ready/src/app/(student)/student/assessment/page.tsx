import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/dal/auth'
import { getStudentProfile } from '@/lib/dal/student'
import { getLatestInProgressAssessment, checkCooldown } from '@/lib/dal/assessment'
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
                    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </span>
              </p>
            )}
            <Link href="/student/results">
              <Button variant="outline" className="w-full">View Your Last Results</Button>
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
