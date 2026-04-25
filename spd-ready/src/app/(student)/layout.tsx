import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { signOutAction } from '@/actions/auth'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm">
        <Logo size="sm" href="/student/dashboard" />
        <div className="flex items-center gap-1 text-sm">
          {[
            { href: '/student/dashboard', label: 'Dashboard' },
            { href: '/student/assessment', label: 'Assessment' },
            { href: '/student/results', label: 'Results' },
            { href: '/student/openings', label: 'Openings' },
            { href: '/student/profile', label: 'Profile' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
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
      </nav>
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  )
}
