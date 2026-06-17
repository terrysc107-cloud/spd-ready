import * as React from "react"
import { cn } from "@/lib/utils"

// Conic-gradient progress ring (extracted from the tech dashboard so the same
// warm ring drives tech readiness and the manager readiness donut).
export function ProgressRing({
  value,
  size = 112,
  thickness = 8,
  color = "oklch(0.62 0.18 200)",
  track = "oklch(0.92 0.01 220)",
  label,
  sublabel,
  className,
}: {
  value: number // 0..100
  size?: number
  thickness?: number
  color?: string
  track?: string
  label?: React.ReactNode
  sublabel?: string
  className?: string
}) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div
      data-slot="progress-ring"
      className={cn("relative flex shrink-0 items-center justify-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${v * 3.6}deg, ${track} 0deg)`,
        padding: thickness,
      }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-card text-center">
        {label != null && (
          <span className="text-2xl leading-none font-bold tabular-nums">{label}</span>
        )}
        {sublabel && <span className="mt-1 text-xs text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  )
}
