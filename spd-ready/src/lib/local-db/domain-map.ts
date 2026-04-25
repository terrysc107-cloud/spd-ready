import type { TrackDomain } from './track-questions'
import type { LearningDomain, ConceptId } from './types'

// Per D-03 mapping
export function mapLegacyDomain(legacy: TrackDomain): LearningDomain {
  switch (legacy) {
    case 'INSTRUMENT_ID': return 'foundational'
    case 'COMPLIANCE_SAFETY': return 'foundational'
    case 'DECONTAMINATION': return 'decontamination'
    case 'PREPARATION': return 'iap'
    case 'STERILIZATION': return 'sterilization'
    case 'STERILITY_ASSURANCE': return 'sterilization'
    case 'STORAGE_DISTRIBUTION': return 'sterile_storage'
    case 'SPD_JUDGMENT': return 'spd_judgment'
  }
}

// Default concept lookup by question ID prefix (covers existing tq-* IDs)
export function defaultConceptForLegacyDomain(legacy: TrackDomain): ConceptId {
  switch (legacy) {
    case 'INSTRUMENT_ID': return 'concept-foundational-instrument-id'
    case 'COMPLIANCE_SAFETY': return 'concept-foundational-osha-bbp'
    case 'DECONTAMINATION': return 'concept-decon-manual-cleaning'
    case 'PREPARATION': return 'concept-iap-inspection'
    case 'STERILIZATION': return 'concept-steril-steam-cycle'
    case 'STERILITY_ASSURANCE': return 'concept-steril-bi-ci'
    case 'STORAGE_DISTRIBUTION': return 'concept-storage-event-related'
    case 'SPD_JUDGMENT': return 'concept-judgment-escalation'
  }
}
