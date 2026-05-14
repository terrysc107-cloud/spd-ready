import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon?: ReactNode
  heading: string
  body?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  heading,
  body,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed border-border px-8 py-16 text-center',
        className
      )}
    >
      {icon && (
        <div className="flex justify-center mb-4 text-muted-foreground/40">{icon}</div>
      )}
      <p className="font-semibold text-base">{heading}</p>
      {body && (
        <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
          {body}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
