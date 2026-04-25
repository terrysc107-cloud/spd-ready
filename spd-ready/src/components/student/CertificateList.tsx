import { LEARNING_DOMAIN_META } from '@/lib/local-db/types'
import type { Certificate } from '@/lib/local-db/types'

export function CertificateList({ certificates }: { certificates: Certificate[] }) {
  if (certificates.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No certificates yet — complete a learning module to earn your first.</p>
      </div>
    )
  }
  return (
    <ul className="divide-y rounded-xl border-2 border-border bg-card overflow-hidden">
      {certificates.map(c => {
        const meta = LEARNING_DOMAIN_META[c.domain]
        return (
          <li key={c.id} className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{meta.icon}</span>
              <div>
                <p className="font-semibold text-sm">{meta.label}</p>
                <p className="text-xs text-muted-foreground">
                  Issued {new Date(c.issued_at).toLocaleDateString()} · {c.partner_issuer}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold tabular-nums text-primary">{c.ce_credits}</p>
              <p className="text-xs text-muted-foreground">CE credits</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
