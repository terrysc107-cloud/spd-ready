import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Branded shell for a form surface (auth, onboarding, competency forms).
// Renders a clean header (eyebrow + title + description), a standardized
// error banner, and the form body. Wrap a <form> around or inside as needed.
export function FormCard({
  title,
  description,
  eyebrow,
  error,
  footer,
  children,
  className,
}: {
  title?: string
  description?: string
  eyebrow?: string
  error?: string | null
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("w-full", className)}>
      {(title || description || eyebrow) && (
        <CardHeader>
          {eyebrow && (
            <p className="mb-1 text-xs font-medium tracking-wide text-accent uppercase">
              {eyebrow}
            </p>
          )}
          {title && <CardTitle className="text-xl">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive ring-1 ring-inset ring-destructive/20"
          >
            {error}
          </p>
        )}
        {children}
      </CardContent>
      {footer}
    </Card>
  )
}
