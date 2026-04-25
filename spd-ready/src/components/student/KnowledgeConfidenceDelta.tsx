type Props = {
  knowledgeDelta: number | null
  confidenceDelta: number | null
  variant?: 'inline' | 'block'
}

function fmt(d: number): string {
  const sign = d > 0 ? '+' : d < 0 ? '' : '±'
  return `${sign}${d} pp`
}

function color(d: number | null): string {
  if (d === null) return 'text-muted-foreground'
  if (d > 0) return 'text-[oklch(0.45_0.18_150)]'
  if (d < 0) return 'text-destructive'
  return 'text-muted-foreground'
}

export function KnowledgeConfidenceDelta({ knowledgeDelta, confidenceDelta, variant = 'inline' }: Props) {
  if (knowledgeDelta === null && confidenceDelta === null) {
    return <p className="text-xs text-muted-foreground">Complete a module to set your baseline</p>
  }
  if (variant === 'block') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Knowledge</p>
          <p className={`text-2xl font-bold tabular-nums ${color(knowledgeDelta)}`}>
            {knowledgeDelta === null ? '—' : fmt(knowledgeDelta)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Confidence</p>
          <p className={`text-2xl font-bold tabular-nums ${color(confidenceDelta)}`}>
            {confidenceDelta === null ? '—' : fmt(confidenceDelta)}
          </p>
        </div>
      </div>
    )
  }
  return (
    <p className="text-sm font-medium">
      <span className={color(knowledgeDelta)}>Knowledge {knowledgeDelta === null ? '—' : fmt(knowledgeDelta)}</span>
      <span className="text-muted-foreground">, </span>
      <span className={color(confidenceDelta)}>Confidence {confidenceDelta === null ? '—' : fmt(confidenceDelta)}</span>
    </p>
  )
}
