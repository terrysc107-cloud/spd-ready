'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { recordAttemptAction } from '@/actions/mastery'
import { completeModuleAction } from '@/actions/learning-modules'
import { getLearningDomain, getConceptId, type TrackQuestion } from '@/lib/local-db/track-questions'
import type { ConfidenceTap } from '@/lib/local-db/types'
import type { LearningModule, ModuleSection } from '@/lib/dal/learning-modules'

type Props = {
  module: LearningModule
  questions: TrackQuestion[]
  isRequired?: boolean // assigned remediation
}

type Stage = 'lesson' | 'quiz' | 'done'

// Convert a user-supplied media URL to a safe embeddable form. Only known video
// hosts (YouTube/Vimeo) become iframes; direct mp4/webm become <video>. Anything
// else is ignored (we never render an arbitrary cross-origin iframe).
function embedUrl(raw: string): { kind: 'iframe' | 'video'; src: string } | null {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  const host = u.hostname.replace(/^www\./, '')
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = u.searchParams.get('v')
    if (id) return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` }
  }
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1)
    if (id) return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` }
  }
  if (host === 'vimeo.com') {
    const id = u.pathname.split('/').filter(Boolean)[0]
    if (id && /^\d+$/.test(id)) return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` }
  }
  if (/\.(mp4|webm|ogg)$/i.test(u.pathname)) return { kind: 'video', src: raw }
  return null
}

function SectionMedia({ section }: { section: ModuleSection }) {
  const video = section.video_url ? embedUrl(section.video_url) : null
  return (
    <>
      {section.image_url && (
        <div className="mt-3 overflow-hidden rounded-xl border-2 border-border bg-white">
          {/* external links per project decision — plain img, no next/image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={section.image_url} alt={section.heading} className="w-full object-cover" />
        </div>
      )}
      {video?.kind === 'iframe' && (
        <div className="mt-3 aspect-video overflow-hidden rounded-xl border-2 border-border">
          <iframe
            src={video.src}
            title={section.heading}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        </div>
      )}
      {video?.kind === 'video' && (
        <video controls className="mt-3 w-full rounded-xl border-2 border-border" src={video.src} />
      )}
    </>
  )
}

export function ModuleViewer({ module, questions, isRequired }: Props) {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('lesson')
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isPending, startTransition] = useTransition()

  const hasQuiz = questions.length > 0
  const q = questions[idx]
  const isLast = idx === questions.length - 1

  async function submitAnswer() {
    if (!selected || answered || !q) return
    setAnswered(true)
    const isCorrect = selected === q.correct
    const isPartial = !isCorrect && q.partial_credit != null && selected === q.partial_credit
    if (isCorrect) setCorrectCount((c) => c + 1)
    else if (isPartial) setCorrectCount((c) => c + 0.5)
    // Feed the mastery -> competency spine, exactly like a study session.
    await recordAttemptAction({
      questionId: q.id,
      conceptId: getConceptId(q),
      domain: getLearningDomain(q),
      correct: isCorrect,
      partial: isPartial,
      confidenceTap: 'pretty_sure' as ConfidenceTap, // module checks aren't confidence-rated
    })
  }

  function nextQuestion() {
    if (isLast) {
      const scorePct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100
      startTransition(async () => {
        await completeModuleAction({ moduleId: module.id, scorePct })
        setStage('done')
      })
    } else {
      setIdx((i) => i + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  function finishLessonOnly() {
    startTransition(async () => {
      await completeModuleAction({ moduleId: module.id, scorePct: 100 })
      setStage('done')
    })
  }

  function optionStyle(choice: 'A' | 'B' | 'C' | 'D') {
    if (!answered) {
      return selected === choice
        ? 'border-primary bg-primary/5 text-foreground'
        : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
    }
    if (choice === q.correct) return 'border-[oklch(0.75_0.12_150)] bg-[oklch(0.96_0.04_150)] text-[oklch(0.35_0.15_150)]'
    if (q.partial_credit && choice === q.partial_credit && selected === choice)
      return 'border-[oklch(0.85_0.12_80)] bg-[oklch(0.98_0.03_80)] text-[oklch(0.45_0.15_80)]'
    if (selected === choice) return 'border-destructive/40 bg-destructive/5 text-destructive'
    return 'border-border text-muted-foreground opacity-50'
  }

  // ---- DONE ----
  if (stage === 'done') {
    const scorePct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-5">
        <div className="text-5xl">✅</div>
        <h2 className="text-2xl font-bold">Module complete</h2>
        <p className="text-muted-foreground">
          {hasQuiz ? `You scored ${scorePct}% on the check.` : 'Marked as reviewed.'} Your mastery and competency
          record have been updated.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={() => router.push('/student/learning')}>Back to Learning</Button>
          <Button variant="outline" onClick={() => router.push('/student/learning/modules')}>
            Browse modules
          </Button>
        </div>
      </div>
    )
  }

  // ---- QUIZ ----
  if (stage === 'quiz' && hasQuiz) {
    const answerState = answered && selected
      ? selected === q.correct
        ? 'correct'
        : q.partial_credit && selected === q.partial_credit
        ? 'partial'
        : 'wrong'
      : null
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-muted-foreground">Check for understanding</span>
            <span className="text-muted-foreground tabular-nums">{idx + 1} / {questions.length}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((idx + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-xl border-2 border-border bg-card p-6">
          <p className="font-semibold text-base leading-relaxed">{q.question}</p>
        </div>

        <div className="space-y-3">
          {(['A', 'B', 'C', 'D'] as const).map((choice) => (
            <button
              key={choice}
              onClick={() => !answered && setSelected(choice)}
              disabled={answered}
              className={`w-full text-left rounded-xl border-2 px-4 py-3.5 text-sm transition-all ${optionStyle(choice)}`}
            >
              <span className="font-bold mr-3 text-muted-foreground">{choice}.</span>
              {q.options[choice]}
            </button>
          ))}
        </div>

        {!answered ? (
          <Button onClick={submitAnswer} disabled={!selected} size="lg" className="w-full">Submit Answer</Button>
        ) : (
          <div className="space-y-4">
            {answerState && (
              <div className={`rounded-xl border-2 p-5 ${
                answerState === 'correct' ? 'bg-[oklch(0.96_0.04_150)] border-[oklch(0.75_0.12_150)]'
                : answerState === 'partial' ? 'bg-[oklch(0.98_0.03_80)] border-[oklch(0.85_0.12_80)]'
                : 'bg-destructive/5 border-destructive/30'
              }`}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2">
                  {answerState === 'correct' ? '✅ Correct' : answerState === 'partial' ? '⚡ Partial credit' : '❌ Incorrect'}
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">{q.explanation}</p>
              </div>
            )}
            <Button onClick={nextQuestion} disabled={isPending} size="lg" className="w-full">
              {isPending ? 'Saving…' : isLast ? 'Finish module →' : 'Next question →'}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // ---- LESSON ----
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <button
        onClick={() => router.push('/student/learning/modules')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>←</span><span>All modules</span>
      </button>

      <div>
        {isRequired && (
          <span className="inline-block mb-2 text-[11px] font-bold uppercase tracking-wide text-white bg-[oklch(0.577_0.245_27)] px-2 py-0.5 rounded-full">
            ⚠️ Required — assigned by your manager
          </span>
        )}
        <h1 className="text-2xl font-bold">{module.title}</h1>
        {module.summary && <p className="text-muted-foreground mt-2">{module.summary}</p>}
        {module.estimated_minutes != null && (
          <p className="text-xs text-muted-foreground mt-2">⏱ ~{module.estimated_minutes} min</p>
        )}
      </div>

      {module.objectives.length > 0 && (
        <div className="rounded-xl border-2 border-border bg-card p-5">
          <p className="font-semibold text-sm mb-2">What you&apos;ll be able to do</p>
          <ul className="space-y-1.5">
            {module.objectives.map((o, i) => (
              <li key={i} className="text-sm text-foreground/80 flex gap-2">
                <span className="text-primary">✓</span><span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {module.sections.map((s, i) => (
          <section key={i} className="space-y-2">
            <h2 className="font-bold text-base">{s.heading}</h2>
            {s.body.split('\n\n').map((para, j) => (
              <p key={j} className="text-sm leading-relaxed text-foreground/80">{para}</p>
            ))}
            <SectionMedia section={s} />
          </section>
        ))}
      </div>

      <div className="border-t border-border pt-6">
        {hasQuiz ? (
          <Button onClick={() => setStage('quiz')} size="lg" className="w-full">
            Start the check ({questions.length} question{questions.length === 1 ? '' : 's'}) →
          </Button>
        ) : (
          <Button onClick={finishLessonOnly} disabled={isPending} size="lg" className="w-full">
            {isPending ? 'Saving…' : 'Mark as reviewed →'}
          </Button>
        )}
      </div>
    </div>
  )
}
