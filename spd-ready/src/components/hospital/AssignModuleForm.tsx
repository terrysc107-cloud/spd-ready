'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { assignModuleAction } from '@/actions/cohort'
import { LEARNING_DOMAINS, LEARNING_DOMAIN_META } from '@/lib/local-db/types'
import { DOMAIN_ERROR_MAP, ERROR_CATEGORIES } from '@/lib/local-db/error-categories'
import type { LearningDomain } from '@/lib/local-db/types'

export function AssignModuleForm({ studentUserId }: { studentUserId: string }) {
  const [domain, setDomain] = useState<LearningDomain>('foundational')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const reducedCategories = DOMAIN_ERROR_MAP[domain]

  async function action(formData: FormData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const res = await assignModuleAction(formData)
      if (!res.ok) setError(res.error ?? 'Failed to assign')
      else setSuccess(true)
    })
  }

  return (
    <form action={action} className="rounded-xl border-2 border-border bg-card p-5 space-y-4">
      <input type="hidden" name="student_user_id" value={studentUserId} />
      <div>
        <p className="font-semibold text-sm mb-1">Assign a module</p>
        <p className="text-xs text-muted-foreground">The student will see this at the top of their study list.</p>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Domain</label>
        <select
          name="domain"
          value={domain}
          onChange={e => setDomain(e.target.value as LearningDomain)}
          className="mt-1 w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm"
        >
          {LEARNING_DOMAINS.map(d => (
            <option key={d} value={d}>{LEARNING_DOMAIN_META[d].label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg bg-muted/40 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Completing this reduces:</p>
        <ul className="space-y-0.5">
          {reducedCategories.map(cat => (
            <li key={cat} className="text-sm">• {ERROR_CATEGORIES[cat].label} risk</li>
          ))}
        </ul>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note (optional)</label>
        <textarea
          name="note"
          rows={2}
          placeholder="e.g., 'Focus on the BI release criteria — we had a near-miss last week.'"
          className="mt-1 w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Due date (optional)</label>
        <input
          name="due_date"
          type="date"
          className="mt-1 w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <Button type="submit" disabled={isPending} size="lg" className="w-full">
        {isPending ? 'Assigning...' : 'Assign Module'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-[oklch(0.45_0.18_150)]">Module assigned.</p>}
    </form>
  )
}
