import { getAuthUser } from '@/lib/dal/auth'
import { AppShell } from '@/components/shell/AppShell'

// Tech training surface. Real Supabase auth; the shell renders the role-aware
// nav from the signed-in profile (techs get the training nav).
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  return (
    <AppShell role={user?.role ?? 'tech'} name={user?.name ?? null} email={user?.email ?? null}>
      {children}
    </AppShell>
  )
}
