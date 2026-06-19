'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { assignCompetencyAction } from '@/actions/competency'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

type Option = { id: string; label: string }

const selectCls =
  'mt-1.5 h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function AssignForm({ templates, staff }: { templates: Option[]; staff: Option[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '')
  const [staffId, setStaffId] = useState(staff[0]?.id ?? '')
  const [dueDate, setDueDate] = useState('')
  const [pending, start] = useTransition()

  function submit() {
    start(async () => {
      try {
        await assignCompetencyAction(templateId, staffId, dueDate || null)
        toast('Competency assigned')
        router.refresh()
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Failed to assign', 'error')
      }
    })
  }

  return (
    <div className="max-w-md space-y-4">
      <div>
        <Label htmlFor="af-template">Competency</Label>
        <select id="af-template" className={selectCls} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="af-staff">Staff member</Label>
        <select id="af-staff" className={selectCls} value={staffId} onChange={(e) => setStaffId(e.target.value)}>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="af-due">Due date (optional)</Label>
        <input id="af-due" type="date" className={selectCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <Button onClick={submit} disabled={pending || !templateId || !staffId}>
        {pending ? 'Assigning…' : 'Assign competency'}
      </Button>
    </div>
  )
}
