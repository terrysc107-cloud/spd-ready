// Audit deficiency category -> remediation module map (config, versioned/tunable
// like the mindset model). When a manager cites a tech for a category, the mapped
// module is auto-assigned for review + validation. Keep this EXPLICIT and aligned
// to the seeded module slugs — a wrong map silently feeds the wrong content.
import type { LearningDomain } from '@/lib/local-db/types'

export type AuditCategory =
  | 'ppe'
  | 'inspection'
  | 'documentation'
  | 'decon_technique'
  | 'biological_monitoring'
  | 'sterile_storage'
  | 'tray_assembly'
  | 'sterilizer_operation'

export type AuditCategoryMeta = {
  key: AuditCategory
  label: string
  moduleSlug: string // the remediation module (must match a learning_modules.slug)
  domain: LearningDomain
}

export const AUDIT_CATEGORIES: AuditCategoryMeta[] = [
  { key: 'ppe', label: 'PPE compliance', moduleSlug: 'decon-ppe-safety', domain: 'decontamination' },
  { key: 'decon_technique', label: 'Decontamination technique', moduleSlug: 'manual-cleaning', domain: 'decontamination' },
  { key: 'inspection', label: 'Instrument inspection', moduleSlug: 'instrument-inspection', domain: 'iap' },
  { key: 'tray_assembly', label: 'Tray assembly / count sheet', moduleSlug: 'tray-assembly-count-sheets', domain: 'iap' },
  { key: 'biological_monitoring', label: 'Biological / chemical monitoring', moduleSlug: 'biological-indicators-documentation', domain: 'sterilization' },
  { key: 'documentation', label: 'Documentation', moduleSlug: 'biological-indicators-documentation', domain: 'sterilization' },
  { key: 'sterilizer_operation', label: 'Sterilizer operation / loading', moduleSlug: 'cart-and-load-audits', domain: 'sterilization' },
  { key: 'sterile_storage', label: 'Sterile storage / handling', moduleSlug: 'sterile-storage-event-related', domain: 'sterile_storage' },
]

export const AUDIT_CATEGORY_BY_KEY: Record<AuditCategory, AuditCategoryMeta> = Object.fromEntries(
  AUDIT_CATEGORIES.map((c) => [c.key, c])
) as Record<AuditCategory, AuditCategoryMeta>

export const AUDIT_SEVERITIES = ['minor', 'major', 'critical'] as const
export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number]

export function remediationModuleSlug(category: AuditCategory): string | null {
  return AUDIT_CATEGORY_BY_KEY[category]?.moduleSlug ?? null
}
