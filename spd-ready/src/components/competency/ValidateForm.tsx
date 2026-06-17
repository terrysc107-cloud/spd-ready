'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { validateCompetencyAction, type ManagerItemResult } from '@/actions/competency'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

export type ValidateItem = {
  id: string
  label: string
  evidence_type: 'observation' | 'training' | 'either'
  trainingResult: 'pass' | 'fail' | 'na' | null
  masteryScore: number | null
}

type Result = ManagerItemResult['result']
const RESULTS: Result[] = ['pass', 'fail', 'na']

const activeCls: Record<Result, string> = {
  pass: 'bg-[oklch(0.55_0.18_150)] text-white ring-transparent',
  fail: 'bg-destructive text-white ring-transparent',
  na: 'bg-muted text-foreground ring-border',
}

const selectCls =
  'mt-1.5 h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function ValidateForm({ assignmentId, items }: { assignmentId: string; items: ValidateItem[] }) {
  const router = useRouter()
  const { toast } = useToast()
  // Manager result prefilled from the training-derived result (engine feeds the default)
  const [results, setResults] = useState<Record<string, Result>>(
    Object.fromEntries(items.map((i) => [i.id, i.trainingResult ?? 'na']))
  )
  const [method, setMethod] = useState<'training_auto' | 'direct_observation' | 'audit'>('direct_observation')
  const [pending, start] = useTransition()

  function submit() {
    const perItem: ManagerItemResult[] = items.map((i) => ({ item_id: i.id, result: results[i.id] }))
    start(async () => {
      try {
        const res = await validateCompetencyAction(assignmentId, perItem, method)
        toast(`Signed off — ${res.outcome.toUpperCase()}`, res.outcome === 'pass' ? 'success' : 'error')
        router.refresh()
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Failed to sign off', 'error')
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="divide-y rounded-xl bg-card shadow-sm ring-1 ring-foreground/10">
        {items.map((i) => (
          <div key={i.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">{i.label}</p>
              <p className="text-xs text-muted-foreground">
                {i.evidence_type === 'observation'
                  ? 'Observation only'
                  : i.masteryScore != null
                    ? `Training mastery ${i.masteryScore}% → ${i.trainingResult ?? '—'}`
                    : 'No training data yet'}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {RESULTS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResults((prev) => ({ ...prev, [i.id]: r }))}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-medium capitalize ring-1 ring-inset transition-colors',
                    results[i.id] === r
                      ? activeCls[r]
                      : 'bg-card text-muted-foreground ring-border hover:bg-muted'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-xs">
        <Label htmlFor="vf-method">Validation method</Label>
        <select
          id="vf-method"
          className={selectCls}
          value={method}
          onChange={(e) => setMethod(e.target.value as typeof method)}
        >
          <option value="direct_observation">Direct observation</option>
          <option value="audit">Audit-based</option>
          <option value="training_auto">Accept training result</option>
        </select>
      </div>

      <Button onClick={submit} disabled={pending}>
        {pending ? 'Signing off…' : 'Sign off competency'}
      </Button>
    </div>
  )
}
