import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DemoUser } from '@/lib/local-db/store'

// ============================================================
// Real Supabase auth layer (spd_ready)
// Used by the repositioned learning engine and the (competency) routes.
// Roles come from the JWT app_role claim / spd_ready.profiles.
// Per CLAUDE.md: always getUser() server-side, never getSession().
// ============================================================

export type AppRole = 'tech' | 'supervisor' | 'manager' | 'director' | 'qa'

export const MANAGER_ROLES: AppRole[] = ['supervisor', 'manager', 'director', 'qa']

export type AuthUser = {
  id: string
  email: string | null
  role: AppRole | null
  orgId: string | null
  departmentId: string | null
  name: string | null
}

export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, department_id, name, role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email ?? null,
    role: (profile?.role as AppRole | undefined) ?? null,
    orgId: profile?.org_id ?? null,
    departmentId: profile?.department_id ?? null,
    name: profile?.name ?? null,
  }
})

export async function requireAuth(redirectTo = '/login'): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) redirect(redirectTo)
  return user
}

export async function requireAppRole(
  roles: AppRole[],
  redirectTo = '/unauthorized'
): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) redirect('/login')
  if (!user.role || !roles.includes(user.role)) redirect(redirectTo)
  return user
}

// ============================================================
// Legacy demo auth (cookie-based) — retained so archived marketplace
// code compiles during the transition. Do NOT use in new code.
// Remove once the archived (_archive) surfaces are deleted.
// ============================================================

export const getCurrentUser = cache(async (): Promise<DemoUser | null> => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('demo_user')?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as DemoUser
  } catch {
    return null
  }
})

export const getRole = cache(async (): Promise<'student' | 'hospital' | 'admin' | null> => {
  const user = await getCurrentUser()
  return user?.role ?? null
})

export async function requireRole(
  role: 'student' | 'hospital' | 'admin',
  redirectTo = '/unauthorized'
): Promise<DemoUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== role) redirect(redirectTo)
  return user
}
