"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/brand/Logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { MenuIcon, CloseIcon, LogOut, Settings } from "@/lib/icons"
import { signOutAction } from "@/actions/auth"
import { cn } from "@/lib/utils"

export type NavItem = { href: string; label: string }

type NavBarProps = {
  logoHref: string
  navItems: NavItem[]
  userInitials?: string
  userName?: string
}

export function NavBar({ logoHref, navItems, userInitials = "?", userName }: NavBarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Logo size="sm" href={logoHref} />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Primary navigation">
          {navItems.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label="User menu"
            >
              <Avatar>
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" sideOffset={8}>
              {userName && (
                <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={async () => { await signOutAction() }}
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <CloseIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1"
          aria-label="Mobile navigation"
        >
          {navItems.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
