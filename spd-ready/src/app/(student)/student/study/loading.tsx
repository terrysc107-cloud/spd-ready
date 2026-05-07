export default function StudyLoading() {
  return (
    <div className="py-8 space-y-6 animate-pulse max-w-5xl mx-auto">
      <div className="h-10 w-48 bg-muted rounded" />
      <div className="rounded-2xl h-28 bg-muted" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-40 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  )
}
