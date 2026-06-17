import Link from 'next/link'
import { requireAuth, MANAGER_ROLES } from '@/lib/dal/auth'
import { signOutAction } from '@/actions/auth'

export default async function CompetencyLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()
  const isManager = !!user.role && MANAGER_ROLES.includes(user.role)

  const links = isManager
    ? [
        { href: '/competency/staff', label: 'Staff' },
        { href: '/competency/assign', label: 'Assign' },
        { href: '/competency/report', label: 'Evidence' },
      ]
    : [{ href: '/competency/my', label: 'My Competencies' }]

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <span className="font-semibold">SPD Ready · Competency</span>
          <div className="flex items-center gap-1 text-sm flex-wrap">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                {label}
              </Link>
            ))}
            <div className="ml-3 border-l pl-3 text-muted-foreground">
              <span className="mr-3 text-xs">{user.name ?? user.email} · {user.role ?? 'no role'}</span>
              <form action={signOutAction} className="inline">
                <button type="submit" className="hover:text-foreground font-medium">Sign out</button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">{children}</main>
    </div>
  )
}
