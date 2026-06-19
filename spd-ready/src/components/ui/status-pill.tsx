import { cn } from "@/lib/utils"

// Universal status/severity scale — maps competency statuses to the app's tier
// color language so manager + tech surfaces read as one product.
export type CompetencyStatus =
  | "assigned"
  | "in_training"
  | "ready_for_validation"
  | "validated"
  | "failed"
  | "expired"
  | "overdue"

export type Tone = "green" | "gold" | "red" | "red-outline" | "accent" | "muted"

export const toneClasses: Record<Tone, string> = {
  green: "text-[oklch(0.45_0.18_150)] bg-[oklch(0.96_0.04_150)] ring-[oklch(0.75_0.12_150)]/50",
  gold: "text-[oklch(0.5_0.16_80)] bg-[oklch(0.98_0.03_80)] ring-[oklch(0.85_0.12_80)]/60",
  red: "text-destructive bg-destructive/8 ring-destructive/30",
  "red-outline": "text-destructive bg-transparent ring-destructive/40",
  accent: "text-[oklch(0.42_0.15_200)] bg-[oklch(0.62_0.18_200)]/12 ring-[oklch(0.62_0.18_200)]/30",
  muted: "text-muted-foreground bg-muted ring-border",
}

const statusConfig: Record<CompetencyStatus, { label: string; tone: Tone }> = {
  validated: { label: "Validated", tone: "green" },
  ready_for_validation: { label: "Ready to sign off", tone: "accent" },
  in_training: { label: "In training", tone: "gold" },
  assigned: { label: "Assigned", tone: "muted" },
  failed: { label: "Needs remediation", tone: "red" },
  expired: { label: "Expired", tone: "red-outline" },
  overdue: { label: "Overdue", tone: "red" },
}

export function StatusPill({
  status,
  className,
}: {
  status: CompetencyStatus
  className?: string
}) {
  const { label, tone } = statusConfig[status] ?? statusConfig.assigned
  return (
    <span
      data-slot="status-pill"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        toneClasses[tone],
        className
      )}
    >
      {label}
    </span>
  )
}
