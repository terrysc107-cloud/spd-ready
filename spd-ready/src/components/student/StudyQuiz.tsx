'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { saveStudySessionAction, type SessionAnswers } from '@/actions/study'
import type { TrackQuestion, TrackDomain } from '@/lib/local-db/track-questions'
import { ConfidenceTapPrompt } from './ConfidenceTapPrompt'
import { LikertSelfAssessment } from './LikertSelfAssessment'
import { recordAttemptAction } from '@/actions/mastery'
import { getLearningDomain, getConceptId } from '@/lib/local-db/track-questions'
import type { ConfidenceTap } from '@/lib/local-db/types'

type Props = {
  domain: TrackDomain
  domainLabel: string
  questions: TrackQuestion[]
}

type AnswerState = 'correct' | 'partial' | 'wrong' | null

export function StudyQuiz({ domain, domainLabel, questions }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers] = useState<SessionAnswers>([])
  const [confTaps, setConfTaps] = useState<Record<string, ConfidenceTap | null>>({})
  const [showLikert, setShowLikert] = useState(false)
  const [resultsParams, setResultsParams] = useState<string | null>(null)

  const question = questions[currentIndex]
  const totalQuestions = questions.length
  const isLast = currentIndex === totalQuestions - 1

  const answerState: AnswerState = answered && selected
    ? selected === question.correct
      ? 'correct'
      : question.partial_credit && selected === question.partial_credit
      ? 'partial'
      : 'wrong'
    : null

  function handleSelect(choice: 'A' | 'B' | 'C' | 'D') {
    if (answered) return
    setSelected(choice)
  }

  async function handleSubmit() {
    if (!selected || answered) return
    const tap = confTaps[question.id] ?? null
    setAnswered(true)
    const isCorrect = selected === question.correct
    const isPartial = !isCorrect && question.partial_credit !== null && selected === question.partial_credit
    setAnswers(prev => [...prev, {
      questionId: question.id,
      selected,
      correct: question.correct,
      partial_credit: question.partial_credit,
    }])
    // Phase 6: record attempt for mastery engine
    await recordAttemptAction({
      questionId: question.id,
      conceptId: getConceptId(question),
      domain: getLearningDomain(question),
      correct: isCorrect,
      partial: isPartial,
      confidenceTap: tap,
    })
  }

  function handleNext() {
    if (isLast) {
      // Save session, then defer navigation until Likert is submitted
      const finalAnswers: SessionAnswers = [...answers]
      startTransition(async () => {
        const { sessionId, xpEarned, newStreak, masteryUnlocked, streakMilestone } = await saveStudySessionAction(domain, finalAnswers)
        const params = new URLSearchParams({
          session: sessionId,
          xp: String(xpEarned),
          streak: String(newStreak),
          ...(masteryUnlocked ? { mastery: '1' } : {}),
          ...(streakMilestone ? { sm: '1' } : {}),
        })
        setResultsParams(params.toString())
        setShowLikert(true)
        // Do NOT call router.push here — navigation happens in the LikertSelfAssessment.onComplete callback below.
      })
    } else {
      setCurrentIndex(i => i + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  function getOptionStyle(choice: 'A' | 'B' | 'C' | 'D') {
    if (!answered) {
      return selected === choice
        ? 'border-primary bg-primary/5 text-foreground'
        : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
    }
    // Show results
    if (choice === question.correct) {
      return 'border-[oklch(0.75_0.12_150)] bg-[oklch(0.96_0.04_150)] text-[oklch(0.35_0.15_150)]'
    }
    if (question.partial_credit && choice === question.partial_credit && selected === choice) {
      return 'border-[oklch(0.85_0.12_80)] bg-[oklch(0.98_0.03_80)] text-[oklch(0.45_0.15_80)]'
    }
    if (selected === choice) {
      return 'border-destructive/40 bg-destructive/5 text-destructive'
    }
    return 'border-border text-muted-foreground opacity-50'
  }

  const feedbackConfig = {
    correct: {
      bg: 'bg-[oklch(0.96_0.04_150)] border-[oklch(0.75_0.12_150)]',
      badge: 'bg-[oklch(0.55_0.18_150)] text-white',
      label: 'Correct',
      icon: '✅',
    },
    partial: {
      bg: 'bg-[oklch(0.98_0.03_80)] border-[oklch(0.85_0.12_80)]',
      badge: 'bg-[oklch(0.65_0.18_80)] text-white',
      label: 'Partial Credit',
      icon: '⚡',
    },
    wrong: {
      bg: 'bg-destructive/5 border-destructive/30',
      badge: 'bg-destructive text-white',
      label: 'Incorrect',
      icon: '❌',
    },
  }

  if (showLikert) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <LikertSelfAssessment
          domain={getLearningDomain(questions[0])}
          domainLabel={domainLabel}
          onComplete={() => router.push(`/student/study/${domain}/results?${resultsParams ?? ''}`)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      {/* Back button */}
      <button
        onClick={() => router.push('/student/study')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        <span>All Domains</span>
      </button>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-muted-foreground">{domainLabel}</span>
          <span className="text-muted-foreground tabular-nums">{currentIndex + 1} / {totalQuestions}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + (answered ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Difficulty badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
          question.difficulty === 'foundational'
            ? 'bg-primary/10 text-primary'
            : question.difficulty === 'intermediate'
            ? 'bg-[oklch(0.62_0.18_200)]/10 text-[oklch(0.42_0.15_200)]'
            : 'bg-[oklch(0.577_0.245_27)]/10 text-[oklch(0.40_0.18_27)]'
        }`}>
          {question.difficulty}
        </span>
      </div>

      {/* Question */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <p className="font-semibold text-base leading-relaxed">{question.question}</p>
        {/* Instrument image if available */}
        {question.image && (
          <div className="mt-4 flex justify-center">
            <div className="rounded-xl border-2 border-border bg-white p-4 inline-block">
              <img
                src={question.image}
                alt={`Instrument illustration for: ${question.question}`}
                className="w-40 h-56 object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Confidence tap (before answering) */}
      {!answered && (
        <ConfidenceTapPrompt
          value={confTaps[question.id] ?? null}
          onSelect={(v) => setConfTaps(prev => ({ ...prev, [question.id]: v }))}
        />
      )}

      {/* Answer choices */}
      <div className="space-y-3">
        {(['A', 'B', 'C', 'D'] as const).map(choice => (
          <button
            key={choice}
            onClick={() => handleSelect(choice)}
            disabled={answered}
            className={`w-full text-left rounded-xl border-2 px-4 py-3.5 text-sm transition-all ${getOptionStyle(choice)}`}
          >
            <span className="font-bold mr-3 text-muted-foreground">{choice}.</span>
            {question.options[choice]}
          </button>
        ))}
      </div>

      {/* Submit / Next */}
      {!answered ? (
        <Button
          onClick={handleSubmit}
          disabled={!selected || !confTaps[question.id]}
          size="lg"
          className="w-full"
        >
          Submit Answer
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Feedback panel */}
          {answerState && (
            <div className={`rounded-xl border-2 p-5 ${feedbackConfig[answerState].bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{feedbackConfig[answerState].icon}</span>
                <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${feedbackConfig[answerState].badge}`}>
                  {feedbackConfig[answerState].label}
                </span>
                {answerState === 'partial' && (
                  <span className="text-xs text-muted-foreground">+50% credit</span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{question.explanation}</p>
            </div>
          )}

          <Button
            onClick={handleNext}
            disabled={isPending}
            size="lg"
            className="w-full"
          >
            {isPending ? 'Saving...' : isLast ? 'See Results →' : 'Next Question →'}
          </Button>
        </div>
      )}
    </div>
  )
}
