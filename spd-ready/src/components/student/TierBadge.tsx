import { Badge } from '@/components/ui/badge'

type Tier = 1 | 2 | 3

const TIER_CONFIG: Record<
  Tier,
  {
    label: string
    description: string
    variant: 'default' | 'secondary' | 'destructive'
  }
> = {
  1: {
    label: 'Tier 1 — Ready',
    description: 'Eligible for externship placement',
    variant: 'default',
  },
  2: {
    label: 'Tier 2 — Ready with Support',
    description: 'Eligible with coordinator-matched placement',
    variant: 'secondary',
  },
  3: {
    label: 'Tier 3 — Not Ready Yet',
    description: 'Review improvement path below',
    variant: 'destructive',
  },
}

type TierBadgeProps = {
  tier: Tier
  size?: 'default' | 'large'
}

export function TierBadge({ tier, size = 'default' }: TierBadgeProps) {
  const config = TIER_CONFIG[tier]
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <Badge
        variant={config.variant}
        className={size === 'large' ? 'px-4 py-2 text-base font-semibold' : ''}
      >
        {config.label}
      </Badge>
      {size === 'large' && (
        <span className="text-xs text-muted-foreground">{config.description}</span>
      )}
    </div>
  )
}
