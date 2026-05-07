export default function DashboardLoading() {
  return (
    <div className="space-y-6 py-6 animate-pulse">
      {/* Hero */}
      <div className="rounded-2xl h-32 bg-muted" />
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border-2 bg-muted h-24" />
        ))}
      </div>
      {/* Score + action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border-2 bg-muted h-52" />
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-muted h-36" />
          ))}
        </div>
      </div>
      {/* Study progress */}
      <div className="rounded-xl border bg-muted h-48" />
    </div>
  )
}
