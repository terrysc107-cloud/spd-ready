import Link from 'next/link'
import { signOutAction } from '@/actions/auth'
import { Logo } from '@/components/brand/Logo'

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b px-6 py-3 flex items-center justify-between">
        <Logo href="/hospital/dashboard" size="sm" />
        <div className="flex items-center gap-6 text-sm">
          <Link href="/hospital/dashboard" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/hospital/candidates" className="text-muted-foreground hover:text-foreground">
            Candidates
          </Link>
          <Link href="/hospital/openings" className="text-muted-foreground hover:text-foreground">
            Openings
          </Link>
          <Link href="/hospital/profile" className="text-muted-foreground hover:text-foreground">
            Site Profile
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="text-muted-foreground hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <main className="p-6">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
