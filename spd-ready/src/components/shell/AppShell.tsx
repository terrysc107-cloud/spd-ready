import * as React from "react"
import { Sidebar } from "@/components/shell/Sidebar"
import { ToastProvider } from "@/components/ui/toast"
import type { AppRole } from "@/lib/dal/auth"

// Authenticated app shell: warm premium chrome (dark sidebar on desktop,
// bottom-tab bar on mobile) wrapping the page content. Toasts are mounted here
// so any page/form can surface action feedback.
export function AppShell({
  role,
  name,
  email,
  children,
}: {
  role: AppRole | null
  name: string | null
  email: string | null
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="bg-background min-h-screen">
        <Sidebar role={role} name={name} email={email} />
        <main className="lg:pl-60">
          <div className="mx-auto max-w-5xl px-4 pt-6 pb-24 sm:px-6 lg:pb-10">{children}</div>
        </main>
      </div>
    </ToastProvider>
  )
}
