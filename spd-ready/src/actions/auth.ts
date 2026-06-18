'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { MANAGER_ROLES, type AppRole } from '@/lib/dal/auth'

// Role-aware post-auth home: managers/supervisors/QA → oversight, techs → training.
function pathForRole(role: AppRole | null): string {
  if (role && MANAGER_ROLES.includes(role)) return '/competency'
  return '/student/dashboard'
}

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  if (!email || !password) redirect('/login?error=missing_fields')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/login?error=invalid_credentials')

  // Resolve role from the authoritative profiles table (not the JWT) so the
  // redirect is correct even if the access-token hook isn't enabled.
  let role: AppRole | null = null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    role = (profile?.role as AppRole | undefined) ?? null
  }

  revalidatePath('/', 'layout')
  redirect(pathForRole(role))
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) redirect('/reset-password?error=missing_email')

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email)
  // Always report success (don't leak whether an account exists).
  redirect('/reset-password?success=Check+your+email+for+a+reset+link.')
}
