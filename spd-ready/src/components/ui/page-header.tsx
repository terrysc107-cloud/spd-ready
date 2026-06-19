import * as React from "react"
import { cn } from "@/lib/utils"

// Shared page header. `gradient` renders the warm brand-gradient hero (E3
// elevation) used at the top of the manager Overview; otherwise a restrained
// enterprise header.
export function PageHeader({
  title,
  description,
  actions,
  gradient = false,
  eyebrow,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  gradient?: boolean
  eyebrow?: string
  className?: string
}) {
  if (gradient) {
    return (
      <div
        data-slot="page-header"
        className={cn(
          "brand-gradient relative overflow-hidden rounded-2xl p-6 text-white sm:p-8",
          className
        )}
      >
        <div className="pointer-events-none absolute top-1/2 right-8 size-48 -translate-y-1/2 rounded-full bg-white opacity-10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && (
              <p className="mb-1 text-xs font-medium tracking-wide text-white/60 uppercase">{eyebrow}</p>
            )}
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            {description && <p className="mt-2 text-sm text-white/75 sm:text-[0.95rem]">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    )
  }

  return (
    <div
      data-slot="page-header"
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}
    >
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{eyebrow}</p>
        )}
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground sm:text-[0.95rem]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
