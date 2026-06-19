'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { adjustMindsetArchetypeAction } from '@/actions/mindset'
import { MINDSET_ARCHETYPES, type ArchetypeId } from '@/lib/mindset-model'

type Props = {
  staffId: string
  derivedArchetypeId: ArchetypeId
  initialArchetypeId: ArchetypeId | null
  initialNote: string | null
}

export function ManagerMindsetAdjust({ staffId, derivedArchetypeId, initialArchetypeId, initialNote }: Props) {
  const [open, setOpen] = useState(false)
  const [archetype, setArchetype] = useState<ArchetypeId>(initialArchetypeId ?? derivedArchetypeId)
  const [note, setNote] = useState(initialNote ?? '')
  const [saved, setSaved] = useState(initialArchetypeId !== null)
  const [isPending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      await adjustMindsetArchetypeAction({ staffId, archetype, note })
      setSaved(true)
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <div className="flex items-center gap-3">
        {saved && <span className="text-xs font-medium text-[oklch(0.45_0.18_150)]">✓ Reviewed</span>}
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          {saved ? 'Update review' : 'Validate / adjust'}
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border-2 border-border bg-muted/30 p-4 space-y-3 w-full">
      <p className="text-sm font-semibold">Validate or adjust this tech&apos;s mindset</p>
      <select value={archetype} onChange={e => setArchetype(e.target.value as ArchetypeId)}
        className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm">
        {MINDSET_ARCHETYPES.map(a => (
          <option key={a.id} value={a.id}>
            {a.emoji} {a.label}{a.id === derivedArchetypeId ? ' (model)' : ''}
          </option>
        ))}
      </select>
      <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
        placeholder="Optional note — what you observe on the floor."
        className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm resize-none" />
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={isPending}>{isPending ? 'Saving…' : 'Save review'}</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
      </div>
    </div>
  )
}
