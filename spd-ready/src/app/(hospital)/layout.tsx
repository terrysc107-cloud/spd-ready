import Link from 'next/link'
import { signOutAction } from '@/actions/auth'
import { Logo } from '@/components/brand/Logo'

const NAV_LINKS = [
  { href: '/hospital/dashboard', label: 'Dashboard' },
  { href: '/hospital/candidates', label: 'Candidates' },
  { href: '/hospital/openings', label: 'Openings' },
  { href: '/hospital/cohort', label: 'Cohort' },
  { href: '/hospital/profile', label: 'Site Profile' },
]

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <Logo href="/hospital/dashboard" size="sm" />
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4 text-sm">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors">
                {label}
              </Link>
            ))}
            <form action={signOutAction}>
              <button type="submit" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign out
              </button>
            </form>
          </div>
          {/* Mobile nav */}
          <div className="flex sm:hidden items-center gap-2 text-xs">
            {NAV_LINKS.slice(0, 3).map(({ href, label }) => (
              <Link key={href} href={href} className="px-2 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap">
                {label}
              </Link>
            ))}
            <form action={signOutAction}>
              <button type="submit" className="px-2 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
