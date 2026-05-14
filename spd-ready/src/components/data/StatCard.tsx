import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type StatCardProps = {
  icon: ReactNode
  value: string | number
  label: string
  className?: string
}

export function StatCard({ icon, value, label, className }: StatCardProps) {
  return (
    <div className={cn('rounded-xl border-2 bg-card p-4 text-center', className)}>
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-2xl font-bold tabular-nums mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}
