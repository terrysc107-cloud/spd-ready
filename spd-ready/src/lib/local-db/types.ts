// Per D-01 + D-02: 6 industry-standard domains + SPD_JUDGMENT applied layer
export type LearningDomain =
  | 'foundational'
  | 'decontamination'
  | 'high_level_disinfection'
  | 'iap'
  | 'sterilization'
  | 'sterile_storage'
  | 'spd_judgment'

export const LEARNING_DOMAINS: LearningDomain[] = [
  'foundational',
  'decontamination',
  'high_level_disinfection',
  'iap',
  'sterilization',
  'sterile_storage',
  'spd_judgment',
]

export type LearningDomainMeta = {
  key: LearningDomain
  label: string
  description: string
  icon: string
}

export const LEARNING_DOMAIN_META: Record<LearningDomain, LearningDomainMeta> = {
  foundational: { key: 'foundational', label: 'Foundational Knowledge', description: 'Instrument ID, terminology, OSHA, AAMI ST79, infection prevention', icon: '📚' },
  decontamination: { key: 'decontamination', label: 'Decontamination', description: 'PPE, manual cleaning, enzymatics, ultrasonics, dirty-to-clean workflow', icon: '🧼' },
  high_level_disinfection: { key: 'high_level_disinfection', label: 'High-Level Disinfection', description: 'Chemical sterilants, MEC, contact time, scope reprocessing', icon: '🧪' },
  iap: { key: 'iap', label: 'Inspection, Assembly & Packaging', description: 'Inspection, count sheets, peel pouches, sequential wrap, tip protectors', icon: '📦' },
  sterilization: { key: 'sterilization', label: 'Sterilization', description: 'Steam, pre-vac, parameters, BIs, CIs, Bowie-Dick, release criteria', icon: '⚗️' },
  sterile_storage: { key: 'sterile_storage', label: 'Sterile Storage & Distribution', description: 'Event-related sterility, transport, stock rotation, package integrity', icon: '🏪' },
  spd_judgment: { key: 'spd_judgment', label: 'SPD Judgment', description: 'Applied judgment under pressure — accountability, escalation, safety ownership', icon: '🧠' },
}

// Per D-21: 8 error categories from OhioHealth case study
export type ErrorCategory =
  | 'missing_indicator'
  | 'debris_found'
  | 'incorrect_assembly'
  | 'no_locks'
  | 'missing_load_sticker'
  | 'wet_set'
  | 'wrapped_incorrectly'
  | 'cement_found'

// Concept identifier — flat namespace, e.g., 'concept-hld-mec-monitoring'
export type ConceptId = string

// New persistence rows
export type DomainAssessment = {
  id: string
  user_id: string
  domain: LearningDomain
  knowledge_t0: number  // 1..5 Likert (locked baseline)
  confidence_t0: number // 1..5
  knowledge_current: number  // 1..5 (T1, updated each module completion)
  confidence_current: number // 1..5
  t0_at: string  // ISO timestamp
  updated_at: string
}

export type ConceptMastery = {
  id: string
  user_id: string
  concept_id: ConceptId
  domain: LearningDomain
  // Component scores 0..100
  quiz_accuracy: number
  confidence_calibration: number
  spaced_repetition: number
  context_variety: number
  recency_decay: number
  // Composite (computed)
  mastery_score: number
  // Spaced repetition state
  review_interval_days: number  // current SM-2-like interval (1, 3, 7, 21, 60)
  next_review_at: string  // ISO timestamp
  last_reviewed_at: string
  attempts: number
  distinct_questions_seen: number
  updated_at: string
}

export type ModuleAssignment = {
  id: string
  hospital_user_id: string
  student_user_id: string
  domain: LearningDomain
  note: string
  due_date: string | null  // ISO date or null
  assigned_at: string
  completed_at: string | null
}

export type HospitalCohortMember = {
  id: string
  hospital_user_id: string
  student_user_id: string
  added_at: string
}

export type Certificate = {
  id: string
  student_user_id: string
  domain: LearningDomain
  ce_credits: number
  partner_issuer: string  // 'SPD Ready Demo' for v1; reserved for future partners (D-25)
  issued_at: string
}

// Per-question 3-state confidence tap (D-13) — recorded per quiz answer
export type ConfidenceTap = 'not_sure' | 'pretty_sure' | 'certain'
