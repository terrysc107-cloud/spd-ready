import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/dal/auth'
import {
  getActiveQuestions,
  getLatestInProgressAssessment,
  getResponseForQuestion,
} from '@/lib/dal/assessment'
import { AssessmentQuestion } from '@/components/student/AssessmentQuestion'

export default async function AssessmentStepPage({
  params,
}: {
  params: Promise<{ assessmentId: string; step: string }>
}) {
  const { assessmentId, step } = await params
  const stepNum = parseInt(step, 10)

  if (isNaN(stepNum) || stepNum < 1 || stepNum > 30) {
    redirect('/student/assessment')
  }

  const user = await getAuthUser()
  if (!user) redirect('/login')

  const questions = await getActiveQuestions()
  if (questions.length === 0) {
    redirect('/student/assessment?error=questions_not_seeded')
  }

  const question = questions[stepNum - 1]
  if (!question) redirect('/student/assessment')

  // Verify this assessment belongs to this user (RLS also enforces)
  const inProgress = await getLatestInProgressAssessment()
  if (!inProgress || inProgress.id !== assessmentId) {
    redirect('/student/assessment')
  }

  const existingResponse = await getResponseForQuestion(assessmentId, question.id)

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
