'use server'

import { requireRole } from '@/lib/dal/auth'
import { readStore, writeStore } from '@/lib/local-db/store'
import type { LearningDomain } from '@/lib/local-db/types'
import { lookupStudentByEmail } from '@/lib/dal/cohort'
import { revalidatePath } from 'next/cache'

export async function addStudentToCohortAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const user = await requireRole('hospital')
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { ok: false, error: 'Email is required' }

  const found = await lookupStudentByEmail(email)
  if (!found) return { ok: false, error: 'Student must register first — no account found for that email.' }

  const store = readStore()
  const exists = store.hospital_cohort.some(
    m => m.hospital_user_id === user.id && m.student_user_id === found.user_id
  )
  if (exists) return { ok: false, error: 'Student is already in your cohort.' }

  store.hospital_cohort.push({
    id: crypto.randomUUID(),
    hospital_user_id: user.id,
    student_user_id: found.user_id,
    added_at: new Date().toISOString(),
  })
  writeStore(store)

  revalidatePath('/hospital/cohort')
  return { ok: true }
}

export async function assignModuleAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const user = await requireRole('hospital')
  const studentUserId = String(formData.get('student_user_id') ?? '')
  const domain = String(formData.get('domain') ?? '') as LearningDomain
  const note = String(formData.get('note') ?? '').trim()
  const dueRaw = String(formData.get('due_date') ?? '').trim()
  if (!studentUserId || !domain) return { ok: false, error: 'Missing student or domain' }

  const store = readStore()
  const membership = store.hospital_cohort.find(
    m => m.hospital_user_id === user.id && m.student_user_id === studentUserId
  )
  if (!membership) return { ok: false, error: 'Student not in your cohort' }

  store.module_assignments.push({
    id: crypto.randomUUID(),
    hospital_user_id: user.id,
    student_user_id: studentUserId,
    domain,
    note,
    due_date: dueRaw || null,
    assigned_at: new Date().toISOString(),
    completed_at: null,
  })
  writeStore(store)

  revalidatePath('/hospital/cohort')
  revalidatePath(`/hospital/cohort/${studentUserId}`)
  revalidatePath('/student/learning')
  revalidatePath('/student/study')
  return { ok: true }
}
