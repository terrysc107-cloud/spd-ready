"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const TIER_COLORS = {
  1: "var(--tier-1)",
  2: "var(--tier-2)",
  3: "var(--tier-3)",
} as const

const TIER_LABELS = {
  1: "Tier 1 — Ready",
  2: "Tier 2 — Ready with support",
  3: "Tier 3 — Not ready yet",
} as const

const SIZES = {
  sm: { size: 96, r: 36, stroke: 6, fontSize: 20, labelSize: 9 },
  md: { size: 140, r: 54, stroke: 8, fontSize: 28, labelSize: 10 },
  lg: { size: 192, r: 76, stroke: 10, fontSize: 38, labelSize: 12 },
} as const

// Positions for tier threshold tick marks on the arc (55% and 75%)
const TIER_THRESHOLDS = [55, 75]

function scoreToAngle(score: number): number {
  // Arc starts at -90deg (top), goes clockwise 360deg for 100%
  return (score / 100) * 360 - 90
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

type ScoreRingProps = {
  score: number
  tier: 1 | 2 | 3
  label?: string
  size?: "sm" | "md" | "lg"
  animate?: boolean
  className?: string
}

export function ScoreRing({
  score,
  tier,
  label,
  size = "md",
  animate = true,
  className,
}: ScoreRingProps) {
  const { size: dim, r, stroke, fontSize, labelSize } = SIZES[size]
  const cx = dim / 2
  const cy = dim / 2
  const circumference = 2 * Math.PI * r
  const targetOffset = circumference * (1 - score / 100)
  const color = TIER_COLORS[tier]

  const arcRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const arc = arcRef.current
    if (!arc || !animate) return

    // Honour prefers-reduced-motion
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      arc.style.strokeDashoffset = String(targetOffset)
      return
    }

    // Animate from empty to filled
    arc.style.strokeDashoffset = String(circumference)
    arc.style.transition = "none"
    // Force reflow
    arc.getBoundingClientRect()
    arc.style.transition = `stroke-dashoffset 1.2s cubic-bezier(0.32, 0, 0.67, 1)`
    arc.style.strokeDashoffset = String(targetOffset)
  }, [score, animate, circumference, targetOffset])

  return (
    <figure
      className={cn("inline-flex flex-col items-center gap-2", className)}
      aria-label={`Score: ${score}%. ${TIER_LABELS[tier]}`}
      role="img"
    >
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        fill="none"
        aria-hidden="true"
      >
        {/* Track ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="var(--muted)"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Progress arc */}
        <circle
          ref={arcRef}
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : targetOffset}
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />

        {/* Tier threshold tick marks */}
        {TIER_THRESHOLDS.map((threshold) => {
          const angleDeg = (threshold / 100) * 360
          const outer = polarToCartesian(cx, cy, r + stroke / 2 + 3, angleDeg)
          const inner = polarToCartesian(cx, cy, r - stroke / 2 - 3, angleDeg)
          return (
            <line
              key={threshold}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--border)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          )
        })}

        {/* Score text */}
        <text
          x={cx}
          y={cy - fontSize * 0.1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight="600"
          fontFamily="var(--font-display), ui-serif, Georgia, serif"
          fill="var(--foreground)"
        >
          {score}
        </text>
        <text
          x={cx + fontSize * 0.35}
          y={cy - fontSize * 0.28}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={Math.round(fontSize * 0.45)}
          fontWeight="500"
          fill="var(--muted-foreground)"
        >
          %
        </text>
      </svg>

      {label && (
        <figcaption
          className="text-center font-medium text-muted-foreground"
          style={{ fontSize: labelSize }}
        >
          {label}
        </figcaption>
      )}
    </figure>
  )
}
