import { AppShell } from '@/components/shell/AppShell'
import { getCurrentUser } from '@/lib/dal/auth'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const userInitials = user?.email ? user.email[0].toUpperCase() : '?'

  return (
    <AppShell variant="student" userInitials={userInitials} userName={user?.email}>
      {children}
    </AppShell>
  )
}
