import { cn } from "@/lib/utils"

type HeroBannerProps = {
  variant?: "aurora" | "default" | "tint"
  children: React.ReactNode
  className?: string
}

export function HeroBanner({ variant = "default", children, className }: HeroBannerProps) {
  if (variant === "aurora") {
    return (
      <div
        className={cn(
          "aurora relative overflow-hidden rounded-2xl px-8 py-12 text-white",
          className
        )}
      >
        {children}
      </div>
    )
  }

  if (variant === "tint") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-brand-50 border border-brand-100 px-8 py-12",
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card border border-border px-8 py-12",
        className
      )}
    >
      {children}
    </div>
  )
}
