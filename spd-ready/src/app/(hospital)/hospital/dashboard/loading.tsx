export default function HospitalDashboardLoading() {
  return (
    <div className="py-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-16 bg-muted rounded-xl" />
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      {/* Openings list */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  )
}
