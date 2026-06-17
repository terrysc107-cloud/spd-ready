import { getCurrentUser } from '@/lib/dal/auth'
import { AppShell } from '@/components/shell/AppShell'

// Tech training surface. Still on demo auth for name display; the auth re-home
// to real Supabase happens in Phase 3. Role is fixed to 'tech' so the shell
// renders the training nav (no dead marketplace links).
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  return (
    <AppShell role="tech" name={user?.email ?? null} email={user?.email ?? null}>
      {children}
    </AppShell>
  )
}
