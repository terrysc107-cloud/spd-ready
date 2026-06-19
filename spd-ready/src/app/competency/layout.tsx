import { requireAuth } from '@/lib/dal/auth'
import { AppShell } from '@/components/shell/AppShell'

export default async function CompetencyLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()
  return (
    <AppShell role={user.role} name={user.name} email={user.email}>
      {children}
    </AppShell>
  )
}
