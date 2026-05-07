import { Logo } from '@/components/brand/Logo'
import { NavLink } from '@/components/ui/nav-link'
import { signOutAction } from '@/actions/auth'

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
      <nav className="border-b bg-white sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm">
        <Logo href="/hospital/dashboard" size="sm" />
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
      <main className="p-6">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
