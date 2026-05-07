import { Logo } from '@/components/brand/Logo'
import { NavLink } from '@/components/ui/nav-link'
import { signOutAction } from '@/actions/auth'

const NAV_LINKS = [
  { href: '/student/dashboard', label: 'Dashboard' },
  { href: '/student/study', label: 'Study' },
  { href: '/student/learning', label: 'Mastery' },
  { href: '/student/assessment', label: 'Assessment' },
  { href: '/student/openings', label: 'Openings' },
  { href: '/student/applications', label: 'Applications' },
  { href: '/student/profile', label: 'Profile' },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm">
        <Logo size="sm" href="/student/dashboard" />
        <div className="flex items-center gap-1 text-sm">
          {NAV_LINKS.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} />
          ))}
          <div className="ml-3 border-l pl-3">
            <form action={signOutAction}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  )
}
