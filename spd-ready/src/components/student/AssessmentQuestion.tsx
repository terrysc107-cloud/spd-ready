'use client'

import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { ArrowLeftIcon } from 'lucide-react'
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
        ? 'Saving…'
        : stepNum < totalSteps
          ? 'Next question →'
          : 'Submit assessment'}
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
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      {/* Back / Save & Exit */}
      <Link
        href="/student/dashboard"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Save &amp; exit</span>
      </Link>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span className="text-sm font-medium text-foreground">
            Question {stepNum}{' '}
            <span className="text-muted-foreground">of {totalSteps}</span>
          </span>
          <span className="font-heading text-sm font-semibold tabular-nums text-accent">
            {progressPct}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-xl bg-card p-6 shadow-card ring-1 ring-foreground/10 sm:p-7">
        <p className="mb-6 text-lg font-medium leading-relaxed">{questionText}</p>

        <form action={saveAnswerAction} className="space-y-3">
          {/* Hidden fields passed to Server Action */}
          <input type="hidden" name="assessmentId" value={assessmentId} />
          <input type="hidden" name="questionId" value={questionId} />
          <input type="hidden" name="step" value={stepNum} />

          {/* Radio options */}
          {OPTION_KEYS.map((key) => (
            <label
              key={key}
              className="group/opt flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition-all hover:border-accent/40 hover:bg-accent/[0.03] has-[:checked]:border-accent has-[:checked]:bg-accent/5 has-[:checked]:ring-1 has-[:checked]:ring-accent/40"
            >
              <input
                type="radio"
                name="answer"
                value={key}
                defaultChecked={existingAnswer === key}
                required
                className="peer sr-only"
              />
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted font-heading text-sm font-semibold text-muted-foreground transition-colors peer-checked:bg-accent peer-checked:text-accent-foreground group-has-[:checked]/opt:bg-accent group-has-[:checked]/opt:text-accent-foreground">
                {key}
              </span>
              <span className="text-sm leading-relaxed">{options[key]}</span>
            </label>
          ))}

          <div className="flex justify-end pt-4">
            <SubmitButton stepNum={stepNum} totalSteps={totalSteps} />
          </div>
        </form>
      </div>

      {stepNum < totalSteps && (
        <p className="text-center text-xs text-muted-foreground">
          Your answer is saved immediately — you can close this window and return later.
        </p>
      )}
    </div>
  )
}
