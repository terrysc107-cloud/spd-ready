"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  UsersIcon,
  ClipboardCheckIcon,
  FileCheckIcon,
  GraduationCapIcon,
  BookOpenIcon,
  BadgeCheckIcon,
  UserIcon,
  LogOutIcon,
} from "lucide-react"
import { Logo } from "@/components/brand/Logo"
import { signOutAction } from "@/actions/auth"
import { cn } from "@/lib/utils"
import type { AppRole } from "@/lib/dal/auth"

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> }

const MANAGER_NAV: NavItem[] = [
  { href: "/competency", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/competency/staff", label: "Staff", icon: UsersIcon },
  { href: "/competency/assign", label: "Assign", icon: ClipboardCheckIcon },
  { href: "/competency/report", label: "Evidence", icon: FileCheckIcon },
]

const TECH_NAV: NavItem[] = [
  { href: "/student/dashboard", label: "Home", icon: LayoutDashboardIcon },
  { href: "/student/learning", label: "Learning", icon: GraduationCapIcon },
  { href: "/student/study", label: "Study", icon: BookOpenIcon },
  { href: "/competency/my", label: "Competencies", icon: BadgeCheckIcon },
  { href: "/student/profile", label: "Profile", icon: UserIcon },
]

const MANAGER_ROLES: AppRole[] = ["supervisor", "manager", "director", "qa"]

function isActive(pathname: string, href: string): boolean {
  if (href === "/competency" || href === "/student/dashboard") return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

export function Sidebar({
  role,
  name,
  email,
}: {
  role: AppRole | null
  name: string | null
  email: string | null
}) {
  const pathname = usePathname()
  const isManager = !!role && MANAGER_ROLES.includes(role)
  const nav = isManager ? MANAGER_NAV : TECH_NAV
  const home = isManager ? "/competency" : "/student/dashboard"

  return (
    <>
      {/* Desktop rail */}
      <aside className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40 hidden w-60 flex-col lg:flex">
        <div className="px-5 py-5">
          <Logo size="sm" href={home} variant="light" />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "flex w-1 self-stretch rounded-full",
                    active ? "bg-sidebar-primary" : "bg-transparent"
                  )}
                />
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="border-sidebar-border border-t px-3 py-3">
          <div className="px-2 pb-2">
            <p className="truncate text-sm font-medium text-white">{name ?? email ?? "Signed in"}</p>
            {role && <p className="text-sidebar-foreground/60 text-xs capitalize">{role}</p>}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sidebar-foreground/70 hover:bg-sidebar-accent/50 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-white"
            >
              <LogOutIcon className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="bg-card sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <Logo size="sm" href={home} />
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium"
          >
            <LogOutIcon className="size-4" />
            Sign out
          </button>
        </form>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="bg-card/95 fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <span className="bg-primary absolute top-0 h-0.5 w-8 rounded-full" />
              )}
              <Icon className="size-5" />
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
