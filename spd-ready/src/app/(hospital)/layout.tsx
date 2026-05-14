import { AppShell } from '@/components/shell/AppShell'
import { getCurrentUser } from '@/lib/dal/auth'

export default async function HospitalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const userInitials = user?.email ? user.email[0].toUpperCase() : '?'

  return (
    <AppShell variant="hospital" userInitials={userInitials} userName={user?.email} width="wide">
      {children}
    </AppShell>
  )
}
