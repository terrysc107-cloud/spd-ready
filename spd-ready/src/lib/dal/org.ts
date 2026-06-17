import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { AppRole } from '@/lib/dal/auth'

// ============================================================
// Org / staff DAL (Slice 1) — mirrors SPD Intel's lib/db/org.ts shapes.
// RLS scopes every query to the caller's organization.
// ============================================================

export type StaffMember = {
  id: string
  name: string | null
  role: AppRole
  department_id: string | null
}

export type Department = {
  id: string
  name: string
  code: string | null
}

export const getOrgStaff = cache(async (): Promise<StaffMember[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, name, role, department_id')
    .order('name')
    .returns<StaffMember[]>()
  return data ?? []
})

export const getDepartments = cache(async (): Promise<Department[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('departments')
    .select('id, name, code')
    .order('name')
    .returns<Department[]>()
  return data ?? []
})

export const getStaffMember = cache(async (staffId: string): Promise<StaffMember | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, name, role, department_id')
    .eq('id', staffId)
    .maybeSingle<StaffMember>()
  return data ?? null
})
