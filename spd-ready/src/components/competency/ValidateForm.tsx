'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { validateCompetencyAction, type ManagerItemResult } from '@/actions/competency'
import { Button } from '@/components/ui/button'

export type ValidateItem = {
  id: string
  label: string
  evidence_type: 'observation' | 'training' | 'either'
  trainingResult: 'pass' | 'fail' | 'na' | null
  masteryScore: number | null
}

const RESULTS: ManagerItemResult['result'][] = ['pass', 'fail', 'na']

export function ValidateForm({ assignmentId, items }: { assignmentId: string; items: ValidateItem[] }) {
  const router = useRouter()
  // Manager result prefilled from the training-derived result (engine feeds the default)
  const [results, setResults] = useState<Record<string, ManagerItemResult['result']>>(
    Object.fromEntries(items.map(i => [i.id, i.trainingResult ?? 'na']))
  )
  const [method, setMethod] = useState<'training_auto' | 'direct_observation' | 'audit'>('direct_observation')
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function submit() {
    setMsg(null)
    const perItem: ManagerItemResult[] = items.map(i => ({ item_id: i.id, result: results[i.id] }))
    start(async () => {
      try {
        const res = await validateCompetencyAction(assignmentId, perItem, method)
        setMsg(`Signed off — outcome: ${res.outcome.toUpperCase()} ✓`)
        router.refresh()
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Failed to sign off')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border divide-y">
        {items.map(i => (
          <div key={i.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="font-medium text-sm">{i.label}</p>
              <p className="text-xs text-muted-foreground">
                {i.evidence_type === 'observation'
                  ? 'Observation only'
                  : i.masteryScore != null
                    ? `Training mastery: ${i.masteryScore}% → ${i.trainingResult ?? '—'}`
                    : 'No training data yet'}
              </p>
            </div>
            <div className="flex gap-1">
              {RESULTS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResults(prev => ({ ...prev, [i.id]: r }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize border transition-colors ${
                    results[i.id] === r
                      ? r === 'pass'
                        ? 'bg-green-600 text-white border-green-600'
                        : r === 'fail'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-muted text-foreground border-muted-foreground/30'
                      : 'bg-white text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <label className="block text-sm font-medium max-w-xs">
        Validation method
        <select
          className="mt-1 w-full rounded-md border px-3 py-2 bg-white"
          value={method}
          onChange={e => setMethod(e.target.value as typeof method)}
        >
          <option value="direct_observation">Direct observation</option>
          <option value="audit">Audit-based</option>
          <option value="training_auto">Accept training result</option>
        </select>
      </label>

      <Button onClick={submit} disabled={pending}>
        {pending ? 'Signing off…' : 'Sign off competency'}
      </Button>
      {msg && <p className="text-sm font-medium">{msg}</p>}
    </div>
  )
}
