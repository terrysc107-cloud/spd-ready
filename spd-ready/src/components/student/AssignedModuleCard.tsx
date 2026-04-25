import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LEARNING_DOMAIN_META } from '@/lib/local-db/types'
import type { AssignmentWithCoordinator } from '@/lib/dal/learning'
import type { LearningDomain } from '@/lib/local-db/types'

function studyRouteForDomain(d: LearningDomain): string {
  const map: Record<LearningDomain, string> = {
    foundational: 'INSTRUMENT_ID',
    decontamination: 'DECONTAMINATION',
    high_level_disinfection: 'HIGH_LEVEL_DISINFECTION',
    iap: 'PREPARATION',
    sterilization: 'STERILIZATION',
    sterile_storage: 'STORAGE_DISTRIBUTION',
    spd_judgment: 'SPD_JUDGMENT',
  }
  return `/student/study/${map[d]}`
}

export function AssignedModuleCard({ a }: { a: AssignmentWithCoordinator }) {
  const meta = LEARNING_DOMAIN_META[a.domain]
  return (
    <div className="rounded-xl border-2 border-[oklch(0.62_0.18_200)]/40 bg-[oklch(0.62_0.18_200)]/5 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[oklch(0.45_0.15_200)]">Assigned by {a.coordinator_name}</p>
            <p className="font-bold text-base mt-0.5">{meta.label}</p>
            {a.note && <p className="text-sm text-muted-foreground mt-1">&ldquo;{a.note}&rdquo;</p>}
          </div>
        </div>
        <Link href={studyRouteForDomain(a.domain)}>
          <Button size="sm">Start →</Button>
        </Link>
      </div>
      {a.due_date && (
        <p className="text-xs text-muted-foreground">Due {new Date(a.due_date).toLocaleDateString()}</p>
      )}
    </div>
  )
}
