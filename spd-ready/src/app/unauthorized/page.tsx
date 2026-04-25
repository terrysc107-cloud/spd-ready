export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to view this page.
        </p>
        <a
          href="/login"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          Return to login
        </a>
      </div>
    </div>
  )
}
