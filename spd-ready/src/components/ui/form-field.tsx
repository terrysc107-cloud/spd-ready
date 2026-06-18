import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Consistent field shell for every form: label (+ optional hint on the right),
// the control (children), helper text, and an error message. Keeps auth,
// onboarding, and the competency forms visually identical.
export function FormField({
  label,
  htmlFor,
  hint,
  helper,
  error,
  required,
  children,
  className,
}: {
  label?: string
  htmlFor?: string
  hint?: React.ReactNode
  helper?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || hint) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <Label htmlFor={htmlFor} className="text-sm font-medium">
              {label}
              {required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
          )}
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  )
}
