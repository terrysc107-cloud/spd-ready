import { NavBar, type NavItem } from "./NavBar"

const STUDENT_NAV: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/assessment", label: "Assessment" },
  { href: "/student/study", label: "Study" },
  { href: "/student/openings", label: "Openings" },
  { href: "/student/profile", label: "Profile" },
]

const HOSPITAL_NAV: NavItem[] = [
  { href: "/hospital/dashboard", label: "Dashboard" },
  { href: "/hospital/candidates", label: "Candidates" },
  { href: "/hospital/openings", label: "Openings" },
  { href: "/hospital/cohort", label: "Cohort" },
  { href: "/hospital/profile", label: "Site Profile" },
]

type AppShellProps = {
  variant: "student" | "hospital"
  userInitials?: string
  userName?: string
  children: React.ReactNode
  /**
   * Pass `wide` to expand to 7xl for data-heavy hospital views.
   * Defaults to standard 6xl.
   */
  width?: "default" | "wide"
}

export function AppShell({
  variant,
  userInitials,
  userName,
  children,
  width = "default",
}: AppShellProps) {
  const isStudent = variant === "student"
  return (
    <div className="min-h-screen bg-background">
      <NavBar
        logoHref={isStudent ? "/student/dashboard" : "/hospital/dashboard"}
        navItems={isStudent ? STUDENT_NAV : HOSPITAL_NAV}
        userInitials={userInitials}
        userName={userName}
      />
      <main
        className={
          width === "wide"
            ? "max-w-7xl mx-auto px-4 sm:px-6 py-8"
            : "max-w-6xl mx-auto px-4 sm:px-6 py-8"
        }
      >
        {children}
      </main>
    </div>
  )
}
