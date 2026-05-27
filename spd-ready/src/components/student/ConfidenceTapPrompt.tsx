'use client'

import { HelpCircle, Smile, Dumbbell } from '@/lib/icons'
import type { LucideIcon } from 'lucide-react'
import type { ConfidenceTap } from '@/lib/local-db/types'

const OPTIONS: { value: ConfidenceTap; label: string; Icon: LucideIcon }[] = [
  { value: 'not_sure', label: 'Not sure', Icon: HelpCircle },
  { value: 'pretty_sure', label: 'Pretty sure', Icon: Smile },
  { value: 'certain', label: 'Certain', Icon: Dumbbell },
]

type Props = {
  value: ConfidenceTap | null
  onSelect: (v: ConfidenceTap) => void
  disabled?: boolean
}

export function ConfidenceTapPrompt({ value, onSelect, disabled }: Props) {
  return (
    <div className="rounded-xl border-2 border-border bg-muted/30 p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">How confident are you?</p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            disabled={disabled}
            className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
              value === opt.value
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-background hover:border-primary/40'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <opt.Icon className="w-5 h-5 mx-auto mb-0.5" />
            <span className="block text-xs">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
