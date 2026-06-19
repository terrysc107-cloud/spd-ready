'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { submitJudgmentBaselineAction } from '@/actions/mindset'
import { MINDSET_DIMENSIONS, type MindsetDimensionKey } from '@/lib/mindset-model'
import type { TrackQuestion } from '@/lib/local-db/track-questions'

type Props = {
  questions: TrackQuestion[]
  isCheckin: boolean
}

type Choice = 'A' | 'B' | 'C' | 'D'
type Stage = 'intro' | 'self' | 'scenarios'

const AGREE_LABELS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']

export function JudgmentBaseline({ questions, isCheckin }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [stage, setStage] = useState<Stage>('intro')

  // self-perception (skipped on a check-in — T0 self-rating is locked)
  const [self, setSelf] = useState<Record<MindsetDimensionKey, number | null>>(
    () => Object.fromEntries(MINDSET_DIMENSIONS.map(d => [d.key, null])) as Record<MindsetDimensionKey, number | null>
  )
  const selfComplete = MINDSET_DIMENSIONS.every(d => self[d.key] !== null)

  // scenarios
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Choice>>({})
  const q = questions[idx]
  const selected = q ? answers[q.id] ?? null : null
  const isLast = idx === questions.length - 1
  const answeredCount = Object.keys(answers).length

  const selfLikert = useMemo(
    () => Object.fromEntries(MINDSET_DIMENSIONS.map(d => [d.key, self[d.key] ?? 3])) as Record<MindsetDimensionKey, number>,
    [self]
  )

  function finish() {
    const payload = questions.map(question => ({
      judgmentType: question.judgment_type ?? null,
      correct: answers[question.id] === question.correct,
    }))
    startTransition(async () => {
      await submitJudgmentBaselineAction({ answers: payload, selfLikert })
      router.push('/student/mindset')
    })
  }

  // ── Intro ───────────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="brand-gradient rounded-2xl p-8 text-white">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">Beta · SPD Standard</p>
          <h1 className="text-2xl font-bold">{isCheckin ? 'Judgment Check-In' : 'Your Judgment Baseline'}</h1>
          <p className="text-white/80 mt-2 text-sm leading-relaxed">
            {isCheckin
              ? 'Re-take the scenarios so we can measure how your judgment has grown since your baseline.'
              : 'Two short parts: first, how you see your own judgment; then a set of real SPD decision scenarios. Together they map your tech-mindset and lock your starting point.'}
          </p>
        </div>
        <div className="rounded-xl border-2 border-border bg-card p-6 space-y-3 text-sm">
          <Step n={1} title={isCheckin ? 'Decision scenarios' : 'Self-perception'} desc={isCheckin ? `${questions.length} situational-judgment scenarios.` : 'Rate 6 statements about how you work.'} />
          {!isCheckin && <Step n={2} title="Decision scenarios" desc={`${questions.length} situational-judgment scenarios — pick the safest call.`} />}
          <p className="text-xs text-muted-foreground pt-2">
            There is no time limit. Answer honestly — this is a mirror, not a test you can fail.
          </p>
        </div>
        <Button size="lg" className="w-full" onClick={() => setStage(isCheckin ? 'scenarios' : 'self')}>
          Begin →
        </Button>
      </div>
    )
  }

  // ── Self-perception ─────────────────────────────────────
  if (stage === 'self') {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Part 1 · Self-perception</p>
          <h2 className="text-xl font-bold mt-1">How do you see your own judgment?</h2>
          <p className="text-sm text-muted-foreground mt-1">No right answers — we compare this to your scenarios to spot blind spots.</p>
        </div>
        <div className="space-y-5">
          {MINDSET_DIMENSIONS.map(d => (
            <div key={d.key} className="rounded-xl border-2 border-border bg-card p-5">
              <p className="font-semibold text-sm leading-relaxed mb-3">{d.selfStatement}</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(nv => (
                  <button key={nv} type="button" onClick={() => setSelf(s => ({ ...s, [d.key]: nv }))}
                    className={`rounded-lg border-2 py-2 text-sm font-bold transition-all ${
                      self[d.key] === nv ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/40'
                    }`}>
                    {nv}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{AGREE_LABELS[0]}</span><span>{AGREE_LABELS[4]}</span>
              </div>
            </div>
          ))}
        </div>
        <Button size="lg" className="w-full" disabled={!selfComplete} onClick={() => setStage('scenarios')}>
          {selfComplete ? 'Continue to scenarios →' : 'Rate all 6 to continue'}
        </Button>
      </div>
    )
  }

  // ── Scenarios ───────────────────────────────────────────
  if (!q) return null
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-muted-foreground">Decision scenarios</span>
          <span className="text-muted-foreground tabular-nums">{idx + 1} / {questions.length}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((idx + (selected ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-xl border-2 border-border bg-card p-6">
        <p className="font-semibold text-base leading-relaxed">{q.question}</p>
      </div>

      <div className="space-y-3">
        {(['A', 'B', 'C', 'D'] as const).map(choice => (
          <button key={choice} onClick={() => setAnswers(a => ({ ...a, [q.id]: choice }))}
            className={`w-full text-left rounded-xl border-2 px-4 py-3.5 text-sm transition-all ${
              selected === choice
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
            }`}>
            <span className="font-bold mr-3 text-muted-foreground">{choice}.</span>
            {q.options[choice]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {idx > 0 && (
          <Button variant="outline" size="lg" onClick={() => setIdx(i => i - 1)} disabled={isPending}>← Back</Button>
        )}
        {!isLast ? (
          <Button size="lg" className="flex-1" disabled={!selected} onClick={() => setIdx(i => i + 1)}>
            Next →
          </Button>
        ) : (
          <Button size="lg" className="flex-1" disabled={!selected || answeredCount < questions.length || isPending} onClick={finish}>
            {isPending ? 'Building your profile…' : 'See my mindset profile →'}
          </Button>
        )}
      </div>
      {isLast && answeredCount < questions.length && (
        <p className="text-xs text-center text-muted-foreground">
          Answer every scenario to finish ({answeredCount}/{questions.length} done).
        </p>
      )}
    </div>
  )
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{n}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
