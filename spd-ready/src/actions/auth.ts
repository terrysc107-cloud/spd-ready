'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { readStore, writeStore } from '@/lib/local-db/store'

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  if (!email || !password) redirect('/login?error=missing_fields')

  const store = readStore()
  const user = Object.values(store.users).find(u => u.email === email)
  if (!user || user.password !== password) redirect('/login?error=invalid_credentials')

  const cookieStore = await cookies()
  cookieStore.set('demo_user', JSON.stringify(user), { path: '/', httpOnly: true, sameSite: 'lax' })

  revalidatePath('/', 'layout')
  if (user.role === 'hospital') redirect('/hospital/dashboard')
  else if (user.role === 'admin') redirect('/admin/dashboard')
  else redirect('/student/dashboard')
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as 'student' | 'hospital'

  if (!email || !password || !role) redirect('/register?error=missing_fields')
  if (!['student', 'hospital'].includes(role)) redirect('/register?error=invalid_role')

  const store = readStore()
  const exists = Object.values(store.users).find(u => u.email === email)
  if (exists) redirect('/register?error=email_already_registered')

  const userId = crypto.randomUUID()
  const user = { id: userId, email, password, role }
  store.users[userId] = user
  writeStore(store)

  const cookieStore = await cookies()
  cookieStore.set('demo_user', JSON.stringify(user), { path: '/', httpOnly: true, sameSite: 'lax' })

  revalidatePath('/', 'layout')
  if (role === 'hospital') redirect('/hospital/onboarding')
  else redirect('/student/onboarding')
}

export async function signOutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('demo_user')
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPasswordAction(formData: FormData) {
  redirect('/reset-password?success=Demo+mode:+no+password+reset+needed.')
}
