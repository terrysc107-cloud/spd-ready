// Lightweight dependency-free SVG radar (spider) chart. Presentational only —
// no client hooks, so it renders on the server. Supports 1–2 overlaid series
// (e.g. current judgment vs locked baseline, or demonstrated vs self-perception).

export type RadarSeries = {
  values: number[] // one per axis, 0..max
  stroke: string
  fill: string
  label?: string
}

type Props = {
  axes: string[] // short axis labels, clockwise from top
  series: RadarSeries[]
  size?: number
  max?: number
  className?: string
}

export function RadarChart({ axes, series, size = 280, max = 100, className }: Props) {
  const cx = size / 2
  const cy = size / 2
  const pad = 46 // room for labels
  const R = size / 2 - pad
  const n = axes.length
  const rings = [0.25, 0.5, 0.75, 1]

  // angle for axis i: start at top (-90°), go clockwise
  const angleFor = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180)
  const pointFor = (i: number, value: number) => {
    const r = (Math.max(0, Math.min(max, value)) / max) * R
    const a = angleFor(i)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  const polygon = (values: number[]) =>
    values.map((v, i) => { const p = pointFor(i, v); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={className} role="img"
      aria-label={`Radar chart across ${axes.join(', ')}`}>
      {/* grid rings */}
      {rings.map((ring, ri) => (
        <polygon key={ri}
          points={axes.map((_, i) => { const p = pointFor(i, ring * max); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')}
          fill="none" stroke="oklch(0.92 0.01 220)" strokeWidth={1} />
      ))}
      {/* spokes */}
      {axes.map((_, i) => { const p = pointFor(i, max); return (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="oklch(0.92 0.01 220)" strokeWidth={1} />
      )})}
      {/* series */}
      {series.map((s, si) => (
        <g key={si}>
          <polygon points={polygon(s.values)} fill={s.fill} stroke={s.stroke} strokeWidth={2} strokeLinejoin="round" />
          {s.values.map((v, i) => { const p = pointFor(i, v); return (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill={s.stroke} />
          )})}
        </g>
      ))}
      {/* axis labels */}
      {axes.map((label, i) => {
        const p = pointFor(i, max * 1.16)
        const a = angleFor(i)
        const cos = Math.cos(a)
        const anchor = Math.abs(cos) < 0.3 ? 'middle' : cos > 0 ? 'start' : 'end'
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle"
            className="fill-muted-foreground" style={{ fontSize: 10, fontWeight: 600 }}>
            {label}
          </text>
        )
      })}
    </svg>
  )
}
