import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getAllCandidates } from '@/lib/dal/hospital'
import { TierBadge } from '@/components/student/TierBadge'

function ScoreMiniBar({ label, score, tier }: { label: string; score: number | null; tier: number }) {
  const pct = score != null ? Math.min(100, Math.max(0, Math.round(score))) : 0
  const barColor = tier === 1 ? 'bg-[oklch(0.55_0.18_150)]' : 'bg-[oklch(0.65_0.18_80)]'
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium">{score != null ? `${pct}%` : '—'}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-1.5 rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function CertStatusLabel({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    in_progress: { label: 'Cert in progress', className: 'bg-blue-50 text-blue-700' },
    certified: { label: 'Certified', className: 'bg-green-50 text-green-700' },
    none: { label: 'No cert yet', className: 'bg-muted text-muted-foreground' },
  }
  const cfg = map[status] ?? { label: status, className: 'bg-muted text-muted-foreground' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

export default async function CandidatePipelinePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const candidates = await getAllCandidates()

  const tier1 = candidates.filter(c => c.readiness_tier === 1)
  const tier2 = candidates.filter(c => c.readiness_tier === 2)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header banner */}
      <div className="brand-gradient rounded-xl px-8 py-6 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/hospital/dashboard"
              className="text-white/70 hover:text-white text-sm inline-flex items-center gap-1 mb-2"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Candidate Pipeline</h1>
            <p className="text-white/80 mt-0.5 text-sm">
              Ranked by readiness score · SPD Certification Program
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-lg bg-white/15 px-4 py-2 text-center">
              <p className="text-2xl font-bold">{tier1.length}</p>
              <p className="text-xs text-white/80">Tier 1 — Ready</p>
            </div>
            <div className="rounded-lg bg-white/15 px-4 py-2 text-center">
              <p className="text-2xl font-bold">{tier2.length}</p>
              <p className="text-xs text-white/80">Tier 2 — With Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate list */}
      {candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed px-8 py-16 text-center text-muted-foreground">
          No candidates yet. Students will appear here after completing their assessment.
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map(c => {
            const borderClass =
              c.readiness_tier === 1
                ? 'border-l-4 border-l-[oklch(0.55_0.18_150)]'
                : 'border-l-4 border-l-[oklch(0.65_0.18_80)]'
            const scoreColor =
              c.readiness_tier === 1
                ? 'text-[oklch(0.45_0.18_150)]'
                : 'text-[oklch(0.55_0.18_80)]'

            return (
              <div
                key={c.user_id}
                className={`rounded-xl border bg-white shadow-sm overflow-hidden ${borderClass}`}
              >
                <div className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: identity */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-base">
                          {c.first_name} {c.last_name}
                        </h2>
                        <CertStatusLabel status={c.cert_status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {c.city}, {c.state} · {c.program_name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.shift_availability.map(s => (
                          <span
                            key={s}
                            className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Center: score + tier */}
                    <div className="flex flex-col items-center gap-1.5 sm:px-6">
                      <p className={`text-3xl font-bold tabular-nums ${scoreColor}`}>
                        {Math.round(c.readiness_score)}%
                      </p>
                      <TierBadge tier={c.readiness_tier as 1 | 2 | 3} />
                      {c.judgment_score !== null && (
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">🧠 Judgment</p>
                          <p className={`text-sm font-bold tabular-nums ${
                            c.judgment_score >= 75 ? 'text-[oklch(0.45_0.18_150)]'
                            : c.judgment_score >= 55 ? 'text-[oklch(0.55_0.18_80)]'
                            : 'text-destructive'
                          }`}>{Math.round(c.judgment_score)}%</p>
                        </div>
                      )}
                    </div>

                    {/* Right: mini category bars */}
                    <div className="w-full sm:w-44 space-y-2">
                      <ScoreMiniBar label="Technical" score={c.technical_score} tier={c.readiness_tier} />
                      <ScoreMiniBar label="Situational" score={c.situational_score} tier={c.readiness_tier} />
                      <ScoreMiniBar label="Process" score={c.process_score} tier={c.readiness_tier} />
                    </div>
                  </div>

                  {/* Bottom: view profile button */}
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/hospital/candidates/${c.user_id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
