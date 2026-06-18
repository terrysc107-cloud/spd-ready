'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createAuditAction } from '@/actions/audits'
import { AUDIT_CATEGORIES, AUDIT_SEVERITIES } from '@/lib/audit-remediation'

export function AuditForm({ staffId, staffName }: { staffId: string; staffName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState(AUDIT_CATEGORIES[0].key)
  const [severity, setSeverity] = useState<string>('minor')
  const [area, setArea] = useState('')
  const [finding, setFinding] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedMeta = AUDIT_CATEGORIES.find((c) => c.key === category)!

  function submit() {
    setMsg(null)
    if (!finding.trim()) { setMsg('Describe the finding.'); return }
    startTransition(async () => {
      const res = await createAuditAction({ staffId, category, severity, area, finding })
      if (!res.ok) { setMsg(res.error ?? 'Failed to record audit.'); return }
      setMsg(res.assigned ? '✅ Audit recorded — remediation module auto-assigned.' : '✅ Audit recorded (no module mapped).')
      setFinding(''); setArea('')
      router.refresh()
      setTimeout(() => { setOpen(false); setMsg(null) }, 1400)
    })
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Record audit
      </Button>
    )
  }

  return (
    <div className="space-y-4 rounded-xl bg-card p-5 shadow-card ring-1 ring-foreground/10">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold">Record an audit on {staffName}</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs font-medium space-y-1 block">
          <span className="text-muted-foreground">Deficiency category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-sm"
          >
            {AUDIT_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium space-y-1 block">
          <span className="text-muted-foreground">Severity</span>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-sm capitalize"
          >
            {AUDIT_SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <label className="text-xs font-medium space-y-1 block">
        <span className="text-muted-foreground">Area (optional)</span>
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="e.g. Decontam sink 2"
          className="w-full rounded-lg border border-input bg-card px-3 py-2 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-sm"
        />
      </label>

      <label className="text-xs font-medium space-y-1 block">
        <span className="text-muted-foreground">Finding</span>
        <textarea
          value={finding}
          onChange={(e) => setFinding(e.target.value)}
          rows={3}
          placeholder="What was observed and why it's out of standard…"
          className="w-full rounded-lg border border-input bg-card px-3 py-2 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-sm"
        />
      </label>

      <p className="text-xs text-muted-foreground">
        Auto-assigns the <span className="font-medium text-foreground">{selectedMeta.label}</span> remediation module
        for {staffName} to review and validate.
      </p>

      {msg && <p className="text-xs font-medium">{msg}</p>}

      <div className="flex justify-end gap-2">
        <Button onClick={submit} disabled={isPending}>{isPending ? 'Recording…' : 'Record audit'}</Button>
      </div>
    </div>
  )
}
