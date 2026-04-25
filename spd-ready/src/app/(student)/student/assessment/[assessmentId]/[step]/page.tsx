import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import {
  getActiveQuestions,
  getLatestInProgressAssessment,
  getResponseForQuestion,
} from '@/lib/dal/assessment'
import { AssessmentQuestion } from '@/components/student/AssessmentQuestion'

export default async function AssessmentStepPage({
  params,
}: {
  params: Promise<{ assessmentId: string; step: string }>  // CRITICAL: params is Promise in Next.js 16
}) {
  // MUST await params before accessing — Next.js 16 breaking change
  const { assessmentId, step } = await params

  const stepNum = parseInt(step, 10)

  // Validate step bounds
  if (isNaN(stepNum) || stepNum < 1 || stepNum > 30) {
    redirect('/student/assessment')
  }

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Load all 30 questions (cached — single DB call per request cycle)
  const questions = await getActiveQuestions()
  if (questions.length === 0) {
    // Questions not seeded — redirect with error
    redirect('/student/assessment?error=questions_not_seeded')
  }

  const question = questions[stepNum - 1]
  if (!question) redirect('/student/assessment')

  // Verify this assessment belongs to this user (defense in depth; RLS also enforces)
  const inProgress = await getLatestInProgressAssessment()
  if (!inProgress || inProgress.id !== assessmentId) {
    // Assessment not found for this user or mismatch — restart
    redirect('/student/assessment')
  }

  // Load existing answer for pre-fill on resume
  const existingResponse = await getResponseForQuestion(assessmentId, question.id)

  // Build options object from options_json JSONB field
  // DEVIATION FROM PLAN: actual schema uses options_json (Record<string, string>)
  // not separate option_a/b/c/d columns
  const rawOptions = question.options_json ?? {}
  const options = {
    A: rawOptions['A'] ?? '',
    B: rawOptions['B'] ?? '',
    C: rawOptions['C'] ?? '',
    D: rawOptions['D'] ?? '',
  }

  return (
    <AssessmentQuestion
      assessmentId={assessmentId}
      questionId={question.id}
      questionText={question.prompt}
      options={options}
      stepNum={stepNum}
      totalSteps={30}
      existingAnswer={existingResponse?.selected_answer ?? null}
    />
  )
}
