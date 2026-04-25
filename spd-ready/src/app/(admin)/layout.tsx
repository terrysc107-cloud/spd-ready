export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-sm">SPD Ready — Admin</span>
        <a href="/api/auth/signout" className="text-sm text-muted-foreground hover:text-foreground">
          Sign out
        </a>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
