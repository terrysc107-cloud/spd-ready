import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "@/lib/icons"

type StatCardProps = {
  label: string
  value: string | number
  unit?: string
  trend?: "up" | "down" | "neutral"
  delta?: string
  /** Optional sparkline or mini-chart slot. */
  sparkline?: React.ReactNode
  className?: string
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  delta,
  sparkline,
  className,
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-success-500"
      : trend === "down"
        ? "text-danger-500"
        : "text-muted-foreground"

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-xs overflow-hidden",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>

      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-display font-semibold tracking-tight text-foreground">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground font-medium">{unit}</span>
          )}
        </div>

        {(trend || delta) && (
          <div className={cn("flex items-center gap-1 text-sm font-medium", trendColor)}>
            {TrendIcon && <TrendIcon className="size-4" />}
            {delta && <span>{delta}</span>}
          </div>
        )}
      </div>

      {sparkline && (
        <div className="h-10 w-full">{sparkline}</div>
      )}
    </div>
  )
}
