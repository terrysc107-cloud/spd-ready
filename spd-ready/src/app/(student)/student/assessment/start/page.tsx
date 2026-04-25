import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { getStudentProfile } from '@/lib/dal/student'
import { startAssessmentAction } from '@/actions/student'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AssessmentStartPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Profile gate — defense in depth layer 2 (both page AND Server Action check this)
  const profile = await getStudentProfile()
  if (!profile?.profile_complete) redirect('/student/onboarding')

  return (
    <div className="py-8 max-w-lg mx-auto space-y-4">
      <Link href="/student/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        <span>Dashboard</span>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Readiness Assessment</CardTitle>
          <CardDescription>30 questions across 6 sterile processing domains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This assessment evaluates your readiness across technical knowledge, situational
            judgment, process discipline, behavioral fit, instrument familiarity, and reliability.
          </p>
          <div className="rounded-md bg-muted/50 p-4 text-sm space-y-2">
            <p>
              <strong>30 questions</strong> — one per screen, multiple choice
            </p>
            <p>
              <strong>Resumable</strong> — close the browser and return where you left off
            </p>
            <p>
              <strong>24-hour cooldown</strong> — between attempts
            </p>
            <p>
              <strong>Results available immediately</strong> — after all 30 questions are answered
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <form action={startAssessmentAction} className="w-full">
            <Button type="submit" className="w-full">
              Begin Assessment
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
