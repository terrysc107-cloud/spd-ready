// No 'use client' — pure display, no browser APIs needed

type CategoryScoreBarProps = {
  label: string       // Human-readable label (from CATEGORY_LABELS)
  score: number       // 0–100
  isStrength?: boolean
  isGrowthArea?: boolean
}

export function CategoryScoreBar({
  label,
  score,
  isStrength,
  isGrowthArea,
}: CategoryScoreBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(score)))

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          {label}
          {isStrength && (
            <span className="text-xs font-medium text-primary">Strength</span>
          )}
          {isGrowthArea && (
            <span className="text-xs font-medium text-amber-600">Growth Area</span>
          )}
        </span>
        <span className="tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${
            isStrength
              ? 'bg-primary'
              : isGrowthArea
                ? 'bg-amber-500'
                : 'bg-primary/60'
          }`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${pct}%`}
        />
      </div>
    </div>
  )
}
