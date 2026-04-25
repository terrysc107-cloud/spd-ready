import type { ErrorCategory, LearningDomain } from './types'

export type ErrorCategoryMeta = {
  key: ErrorCategory
  label: string
  description: string
  // Per D-28: $6,185 average cost per SPD error event (case study benchmark)
  cost_per_event_usd: number
}

export const ERROR_CATEGORIES: Record<ErrorCategory, ErrorCategoryMeta> = {
  missing_indicator: { key: 'missing_indicator', label: 'Missing Indicator', description: 'Chemical or biological indicator missing from a load', cost_per_event_usd: 6185 },
  debris_found: { key: 'debris_found', label: 'Debris Found', description: 'Visible bioburden after decontamination', cost_per_event_usd: 6185 },
  incorrect_assembly: { key: 'incorrect_assembly', label: 'Incorrect Assembly', description: 'Tray contents do not match count sheet or are assembled incorrectly', cost_per_event_usd: 6185 },
  no_locks: { key: 'no_locks', label: 'No Locks / Open Box Lock', description: 'Hinged instruments not opened for sterilization', cost_per_event_usd: 6185 },
  missing_load_sticker: { key: 'missing_load_sticker', label: 'Missing Load Sticker', description: 'Cycle traceability sticker missing from packaging', cost_per_event_usd: 6185 },
  wet_set: { key: 'wet_set', label: 'Wet Set', description: 'Visible moisture in sterile package compromises sterility', cost_per_event_usd: 6185 },
  wrapped_incorrectly: { key: 'wrapped_incorrectly', label: 'Wrapped Incorrectly', description: 'Sequential wrap or peel pouch sealed incorrectly', cost_per_event_usd: 6185 },
  cement_found: { key: 'cement_found', label: 'Cement Found', description: 'Bone cement residue not removed in decontamination', cost_per_event_usd: 6185 },
}

// Per D-22: Claude defines the domain → primary error categories mapping
export const DOMAIN_ERROR_MAP: Record<LearningDomain, ErrorCategory[]> = {
  foundational: ['missing_indicator', 'missing_load_sticker'],
  decontamination: ['debris_found', 'cement_found'],
  high_level_disinfection: ['debris_found'],
  iap: ['incorrect_assembly', 'no_locks', 'wrapped_incorrectly'],
  sterilization: ['missing_indicator', 'missing_load_sticker', 'wet_set'],
  sterile_storage: ['wet_set', 'wrapped_incorrectly'],
  spd_judgment: ['incorrect_assembly', 'missing_indicator'],
}
