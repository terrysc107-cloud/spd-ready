import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// One consistent section title across the app — heading font, optional
// description, and an optional "view all" action (link or arbitrary node).
// Replaces the ad-hoc `<h2 className="font-heading ...">` repeated on pages.
export function SectionHeader({
  title,
  description,
  action,
  actionHref,
  actionLabel,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  actionHref?: string
  actionLabel?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="font-heading text-base font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action ??
        (actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-accent"
          >
            {actionLabel}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        ) : null)}
    </div>
  )
}
