'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { submitLikertAction } from '@/actions/likert'
import type { LearningDomain } from '@/lib/local-db/types'

const KNOWLEDGE_LABELS = ['Not at all knowledgeable', 'Slightly', 'Moderately', 'Knowledgeable', 'Very knowledgeable']
const CONFIDENCE_LABELS = ['Not at all confident', 'Slightly', 'Moderately', 'Confident', 'Very confident']

type Props = {
  domain: LearningDomain
  domainLabel: string
  onComplete: () => void
}

function Scale({ label, labels, value, onChange }: { label: string; labels: string[]; value: number | null; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="font-semibold text-sm mb-3">{label}</p>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`rounded-lg border-2 py-2 text-sm font-bold transition-all ${
              value === n ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/40'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{labels[0]}</span>
        <span>{labels[4]}</span>
      </div>
    </div>
  )
}

export function LikertSelfAssessment({ domain, domainLabel, onComplete }: Props) {
  const [knowledge, setKnowledge] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const canSubmit = knowledge !== null && confidence !== null && !isPending

  function handleSubmit() {
    if (!canSubmit) return
    startTransition(async () => {
      await submitLikertAction({ domain, knowledge: knowledge!, confidence: confidence! })
      onComplete()
    })
  }

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Self-assessment · {domainLabel}</p>
        <h3 className="text-lg font-bold">How are you feeling about this domain?</h3>
        <p className="text-sm text-muted-foreground mt-1">Your honest answer locks your starting point and unlocks the growth chart.</p>
      </div>
      <Scale label="Knowledge" labels={KNOWLEDGE_LABELS} value={knowledge} onChange={setKnowledge} />
      <Scale label="Confidence" labels={CONFIDENCE_LABELS} value={confidence} onChange={setConfidence} />
      <Button onClick={handleSubmit} disabled={!canSubmit} size="lg" className="w-full">
        {isPending ? 'Saving...' : 'Submit & See Results →'}
      </Button>
    </div>
  )
}
