'use client'

import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { saveAnswerAction } from '@/actions/student'
import { Button } from '@/components/ui/button'

// Option keys in display order
const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const

type AssessmentQuestionProps = {
  assessmentId: string
  questionId: string
  questionText: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  stepNum: number
  totalSteps: number
  existingAnswer: string | null
}

function SubmitButton({
  stepNum,
  totalSteps,
}: {
  stepNum: number
  totalSteps: number
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending
        ? 'Saving...'
        : stepNum < totalSteps
          ? 'Next Question'
          : 'Submit Assessment'}
    </Button>
  )
}

export function AssessmentQuestion({
  assessmentId,
  questionId,
  questionText,
  options,
  stepNum,
  totalSteps,
  existingAnswer,
}: AssessmentQuestionProps) {
  const progressPct = Math.round((stepNum / totalSteps) * 100)

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Back / Save & Exit */}
      <Link
        href="/student/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        <span>Save &amp; Exit</span>
      </Link>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Question {stepNum} of {totalSteps}
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-base font-medium leading-relaxed mb-6">{questionText}</p>

        <form action={saveAnswerAction} className="space-y-3">
          {/* Hidden fields passed to Server Action */}
          <input type="hidden" name="assessmentId" value={assessmentId} />
          <input type="hidden" name="questionId" value={questionId} />
          <input type="hidden" name="step" value={stepNum} />

          {/* Radio options */}
          {OPTION_KEYS.map(key => (
            <label
              key={key}
              className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors"
            >
              <input
                type="radio"
                name="answer"
                value={key}
                defaultChecked={existingAnswer === key}
                required
                className="mt-0.5 shrink-0"
              />
              <span className="text-sm">
                <span className="font-medium mr-1">{key}.</span>
                {options[key]}
              </span>
            </label>
          ))}

          <div className="pt-4 flex justify-end">
            <SubmitButton stepNum={stepNum} totalSteps={totalSteps} />
          </div>
        </form>
      </div>

      {stepNum < totalSteps && (
        <p className="text-xs text-center text-muted-foreground">
          Your answer is saved immediately — you can close this window and return later.
        </p>
      )}
    </div>
  )
}
