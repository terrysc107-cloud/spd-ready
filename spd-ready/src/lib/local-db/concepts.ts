import type { ConceptId, LearningDomain } from './types'

export type Concept = {
  id: ConceptId
  domain: LearningDomain
  label: string
  description: string
}

// Full literal catalog — exactly 28 entries.
export const CONCEPT_CATALOG: Concept[] = [
  // foundational (5)
  { id: 'concept-foundational-instrument-id', domain: 'foundational', label: 'Instrument Identification', description: 'Names, uses, and inspection of common surgical instruments' },
  { id: 'concept-foundational-terminology', domain: 'foundational', label: 'Medical Terminology', description: 'Core terminology used across SPD, OR, and infection prevention' },
  { id: 'concept-foundational-aami-st79', domain: 'foundational', label: 'AAMI ST79 Overview', description: 'Comprehensive guide for steam sterilization and sterility assurance in healthcare' },
  { id: 'concept-foundational-osha-bbp', domain: 'foundational', label: 'OSHA Bloodborne Pathogens', description: 'Federal regulatory baseline for handling potentially infectious materials' },
  { id: 'concept-foundational-infection-control', domain: 'foundational', label: 'Infection Prevention Basics', description: 'Chain of infection, hand hygiene, PPE rationale, and standard precautions' },
  // decontamination (4)
  { id: 'concept-decon-ppe', domain: 'decontamination', label: 'PPE for Decontamination', description: 'Required protective equipment when handling soiled instruments' },
  { id: 'concept-decon-manual-cleaning', domain: 'decontamination', label: 'Manual Cleaning', description: 'Brushing, lumen flushing, and visual inspection at the sink' },
  { id: 'concept-decon-enzymatic-soak', domain: 'decontamination', label: 'Enzymatic Soaking', description: 'Pre-cleaning agents that break down bioburden before mechanical cleaning' },
  { id: 'concept-decon-ultrasonic', domain: 'decontamination', label: 'Ultrasonic Cleaning', description: 'Cavitation-based cleaning for hinged and lumened instruments' },
  // high_level_disinfection (4)
  { id: 'concept-hld-chemical-sterilants', domain: 'high_level_disinfection', label: 'Chemical Sterilants', description: 'OPA, glutaraldehyde, peracetic acid — properties, indications, hazards' },
  { id: 'concept-hld-mec-monitoring', domain: 'high_level_disinfection', label: 'MEC Monitoring', description: 'Minimum Effective Concentration testing, test strips, solution lifecycle' },
  { id: 'concept-hld-contact-time', domain: 'high_level_disinfection', label: 'Contact Time', description: 'Per-product immersion time at specified temperature; under-immersion consequences' },
  { id: 'concept-hld-rinse-protocol', domain: 'high_level_disinfection', label: 'Post-HLD Rinse Protocol', description: 'Sterile/filtered water rinse, drying, scope storage cabinet handling' },
  // iap (4)
  { id: 'concept-iap-inspection', domain: 'iap', label: 'Instrument Inspection', description: 'Magnification, function checks, and damage criteria before assembly' },
  { id: 'concept-iap-count-sheets', domain: 'iap', label: 'Count Sheets', description: 'Tray content verification using authoritative count sheets' },
  { id: 'concept-iap-peel-pouch', domain: 'iap', label: 'Peel Pouch Packaging', description: 'Correct sealing, orientation, and indicator placement for peel pouches' },
  { id: 'concept-iap-sequential-wrap', domain: 'iap', label: 'Sequential Wrap', description: 'Two-layer wrap technique with envelope/square folds and tamper-evident seals' },
  // sterilization (4)
  { id: 'concept-steril-steam-cycle', domain: 'sterilization', label: 'Steam Cycle Parameters', description: 'Temperature, pressure, exposure time, and dry time for standard steam cycles' },
  { id: 'concept-steril-prevac-vs-gravity', domain: 'sterilization', label: 'Pre-Vac vs Gravity', description: 'When each cycle type applies and the air-removal mechanism behind the difference' },
  { id: 'concept-steril-bi-ci', domain: 'sterilization', label: 'BI / CI Monitoring', description: 'Biological and chemical indicator placement, frequency, and release criteria' },
  { id: 'concept-steril-bowie-dick', domain: 'sterilization', label: 'Bowie-Dick Test', description: 'Daily air-removal test for pre-vac sterilizers and what failures imply' },
  // sterile_storage (3)
  { id: 'concept-storage-event-related', domain: 'sterile_storage', label: 'Event-Related Sterility', description: 'Sterility maintained until a packaging event compromises it (not time-based)' },
  { id: 'concept-storage-transport', domain: 'sterile_storage', label: 'Transport & Handling', description: 'Closed/covered transport carts, environmental control, contamination prevention' },
  { id: 'concept-storage-package-integrity', domain: 'sterile_storage', label: 'Package Integrity Inspection', description: 'Pre-use inspection for tears, wet sets, missing indicators, expiration' },
  // spd_judgment (4)
  { id: 'concept-judgment-escalation', domain: 'spd_judgment', label: 'Escalation', description: 'Knowing when and how to raise concerns up the chain of command' },
  { id: 'concept-judgment-safety-ownership', domain: 'spd_judgment', label: 'Safety Ownership', description: 'Acting on observed risks without being told — patient-safety-first mindset' },
  { id: 'concept-judgment-accountability', domain: 'spd_judgment', label: 'Accountability', description: 'Owning errors transparently; documenting and communicating early' },
  { id: 'concept-judgment-teamwork', domain: 'spd_judgment', label: 'Teamwork & Professional Standards', description: 'Cross-shift handoffs, OR-SPD communication, professional conduct under pressure' },
]

export function getConcept(id: ConceptId): Concept | undefined {
  return CONCEPT_CATALOG.find(c => c.id === id)
}

export function getConceptsForDomain(domain: LearningDomain): Concept[] {
  return CONCEPT_CATALOG.filter(c => c.domain === domain)
}
