import * as React from "react"
import { cn } from "@/lib/utils"
import { toneClasses, type Tone } from "@/components/ui/status-pill"

// Raised metric card (E2). Used in the manager Overview metric row and the
// tech gamification row. Optional `delta` renders a small trend chip.
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "muted",
  hint,
  delta,
  className,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  tone?: Tone
  hint?: string
  delta?: { value: string; direction?: "up" | "down" | "flat" }
  className?: string
}) {
  const dir = delta?.direction ?? "flat"
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "flex flex-col gap-1 rounded-xl bg-card p-4 shadow-card ring-1 ring-foreground/10 transition-shadow",
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
      <span className="font-heading text-3xl font-bold tabular-nums tracking-tight">{value}</span>
      <div className="flex items-center gap-1.5">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
              dir === "up" && "bg-[oklch(0.96_0.04_150)] text-[oklch(0.45_0.18_150)]",
              dir === "down" && "bg-destructive/8 text-destructive",
              dir === "flat" && "bg-muted text-muted-foreground"
            )}
          >
            {dir === "up" ? "↑" : dir === "down" ? "↓" : "→"} {delta.value}
          </span>
        )}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  )
}
