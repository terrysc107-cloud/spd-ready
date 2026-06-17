'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { assignCompetencyAction } from '@/actions/competency'
import { Button } from '@/components/ui/button'

type Option = { id: string; label: string }

export function AssignForm({ templates, staff }: { templates: Option[]; staff: Option[] }) {
  const router = useRouter()
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '')
  const [staffId, setStaffId] = useState(staff[0]?.id ?? '')
  const [dueDate, setDueDate] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function submit() {
    setMsg(null)
    start(async () => {
      try {
        await assignCompetencyAction(templateId, staffId, dueDate || null)
        setMsg('Assigned ✓')
        router.refresh()
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Failed to assign')
      }
    })
  }

  return (
    <div className="space-y-4 max-w-md">
      <label className="block text-sm font-medium">
        Competency
        <select
          className="mt-1 w-full rounded-md border px-3 py-2 bg-white"
          value={templateId}
          onChange={e => setTemplateId(e.target.value)}
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium">
        Staff member
        <select
          className="mt-1 w-full rounded-md border px-3 py-2 bg-white"
          value={staffId}
          onChange={e => setStaffId(e.target.value)}
        >
          {staff.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium">
        Due date (optional)
        <input
          type="date"
          className="mt-1 w-full rounded-md border px-3 py-2 bg-white"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
      </label>

      <Button onClick={submit} disabled={pending || !templateId || !staffId}>
        {pending ? 'Assigning…' : 'Assign competency'}
      </Button>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  )
}
