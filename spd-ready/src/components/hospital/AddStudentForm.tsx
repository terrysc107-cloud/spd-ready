'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { addStudentToCohortAction } from '@/actions/cohort'

export function AddStudentForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function action(formData: FormData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const res = await addStudentToCohortAction(formData)
      if (!res.ok) setError(res.error ?? 'Failed to add student')
      else setSuccess(true)
    })
  }

  return (
    <form action={action} className="rounded-xl border-2 border-border bg-card p-5 space-y-3">
      <div>
        <p className="font-semibold text-sm">Add a student to your cohort</p>
        <p className="text-xs text-muted-foreground">Enter their registered email — they must have a SPD Ready student account.</p>
      </div>
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="student@example.com"
          className="flex-1 rounded-lg border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
        <Button type="submit" disabled={isPending}>{isPending ? 'Adding...' : 'Add'}</Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-[oklch(0.45_0.18_150)]">Student added.</p>}
    </form>
  )
}
