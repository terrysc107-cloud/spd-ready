'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { submitMindsetFeedbackAction } from '@/actions/mindset'

type Value = 'fits' | 'partly' | 'no'

const OPTIONS: { value: Value; label: string; emoji: string }[] = [
  { value: 'fits', label: 'Fits me', emoji: '✅' },
  { value: 'partly', label: 'Partly', emoji: '🤔' },
  { value: 'no', label: 'Not really', emoji: '❌' },
]

export function MindsetBetaFeedback({ initial, initialNote }: { initial: Value | null; initialNote: string | null }) {
  const [value, setValue] = useState<Value | null>(initial)
  const [note, setNote] = useState(initialNote ?? '')
  const [saved, setSaved] = useState(initial !== null)
  const [isPending, startTransition] = useTransition()

  function submit(v: Value) {
    setValue(v)
    startTransition(async () => {
      await submitMindsetFeedbackAction({ value: v, note })
      setSaved(true)
    })
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Beta · Help define the SPD standard</p>
        <p className="font-bold text-sm mt-1">Does this archetype fit you?</p>
        <p className="text-xs text-muted-foreground mt-0.5">Your answer tunes the model the whole field is co-creating.</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(o => (
          <button key={o.value} type="button" onClick={() => submit(o.value)} disabled={isPending}
            className={`rounded-lg border-2 py-2.5 text-sm font-semibold transition-all ${
              value === o.value ? 'border-primary bg-primary/15' : 'border-border bg-background hover:border-primary/40'
            }`}>
            <span className="mr-1">{o.emoji}</span>{o.label}
          </button>
        ))}
      </div>
      <textarea value={note} onChange={e => setNote(e.target.value)} onBlur={() => value && submit(value)}
        placeholder="Optional: what would describe you better?" rows={2}
        className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm resize-none focus:border-primary/50 focus:outline-none" />
      {saved && !isPending && <p className="text-xs text-[oklch(0.45_0.18_150)] font-medium">Thanks — recorded. ✓</p>}
    </div>
  )
}
