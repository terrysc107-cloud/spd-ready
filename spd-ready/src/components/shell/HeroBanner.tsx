import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type HeroBannerProps = {
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  actions?: ReactNode
  aurora?: boolean
  className?: string
  children?: ReactNode
}

export function HeroBanner({
  eyebrow,
  title,
  subtitle,
  actions,
  aurora = false,
  className,
  children,
}: HeroBannerProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-8 text-white relative overflow-hidden',
        aurora ? 'aurora' : 'brand-gradient',
        className
      )}
    >
      <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10 pointer-events-none">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white blur-2xl" />
      </div>
      <div className="relative z-10">
        {eyebrow && (
          <p className="text-white/60 text-sm font-medium uppercase tracking-wide mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-white/70 mt-2 text-sm max-w-lg">{subtitle}</p>
        )}
        {actions && <div className="mt-4">{actions}</div>}
        {children}
      </div>
    </div>
  )
}
