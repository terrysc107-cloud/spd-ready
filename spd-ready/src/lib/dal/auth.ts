import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { DemoUser } from '@/lib/local-db/store'

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
