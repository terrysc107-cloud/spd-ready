import { cn } from '@/lib/utils'

type ScoreRingProps = {
  score: number
  tier: 1 | 2 | 3
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const TIER_RING_COLOR = {
  1: 'var(--tier1)',
  2: 'var(--tier2)',
  3: 'var(--destructive)',
}

const SIZES = {
  sm: { outer: 'w-20 h-20', text: 'text-2xl', sub: 'text-[10px]', pad: '3px' },
  md: { outer: 'w-28 h-28', text: 'text-3xl', sub: 'text-xs', pad: '4px' },
  lg: { outer: 'w-36 h-36', text: 'text-4xl', sub: 'text-xs', pad: '5px' },
}

export function ScoreRing({
  score,
  tier,
  size = 'md',
  label = 'Readiness',
  className,
}: ScoreRingProps) {
  const ringColor = TIER_RING_COLOR[tier]
  const { outer, text, sub, pad } = SIZES[size]

  return (
    <div
      className={cn('rounded-full flex items-center justify-center', outer, className)}
      style={{
        background: `conic-gradient(${ringColor} ${score * 3.6}deg, var(--border) 0deg)`,
        padding: pad,
      }}
    >
      <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
        <p className={cn('font-bold leading-none tabular-nums', text)}>{score}%</p>
        <p className={cn('text-muted-foreground mt-1 font-medium', sub)}>{label}</p>
      </div>
    </div>
  )
}
