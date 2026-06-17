import * as React from "react"
import { cn } from "@/lib/utils"
import { toneClasses, type Tone } from "@/components/ui/status-pill"

// Raised metric card (E2). Used in the manager Overview metric row and the
// tech gamification row.
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "muted",
  hint,
  className,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  tone?: Tone
  hint?: string
  className?: string
}) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "flex flex-col gap-1 rounded-xl bg-card p-4 shadow-sm ring-1 ring-foreground/10",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-lg ring-1 ring-inset",
              toneClasses[tone]
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <span className="text-3xl font-bold tabular-nums">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}
