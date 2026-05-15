import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { signOutAction } from '@/actions/auth'

const NAV_LINKS = [
  { href: '/student/dashboard', label: 'Dashboard' },
  { href: '/student/assessment', label: 'Assessment' },
  { href: '/student/results', label: 'Results' },
  { href: '/student/learning', label: 'Learning' },
  { href: '/student/openings', label: 'Openings' },
  { href: '/student/profile', label: 'Profile' },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <Logo size="sm" href="/student/dashboard" />
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1 text-sm flex-wrap">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
            <div className="ml-3 border-l pl-3">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          {/* Mobile nav — compact icon row */}
          <div className="flex sm:hidden items-center gap-1 text-xs">
            {NAV_LINKS.slice(0, 4).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-2 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
            <form action={signOutAction}>
              <button
                type="submit"
                className="px-2 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                Out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="p-4 sm:p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  )
}
