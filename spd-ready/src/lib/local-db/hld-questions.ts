import type { TrackQuestion } from './track-questions'

/**
 * High-Level Disinfection (HLD) questions — Phase 6 content gap-fill.
 * Per D-05: ~10 new questions to support the OhioHealth case study's headline domain.
 * Sources paraphrased from AAMI ST91 and AORN scope reprocessing guidelines.
 *
 * Each question sets:
 *   - domain: 'STERILIZATION' (closest legacy enum, retained for compatibility)
 *   - learning_domain: 'high_level_disinfection' (Phase 6 framework)
 *   - concept_id: one of the four HLD concepts
 *   - error_categories: ['debris_found'] (HLD failures present as bioburden risk per DOMAIN_ERROR_MAP)
 */

// Phase 6 field extensions — added to TrackQuestion in 06-01.
// Declared locally for parallel-safe compilation in wave 1.
type HLDQuestion = TrackQuestion & {
  learning_domain?: string
  concept_id?: string
  error_categories?: string[]
  legacy_domain?: string
}

export const HLD_QUESTIONS: HLDQuestion[] = [
  // ─── concept-hld-chemical-sterilants (3 questions) ──────────────────────────

  {
    id: 'tq-hld-001',
    domain: 'STERILIZATION',
    learning_domain: 'high_level_disinfection',
    concept_id: 'concept-hld-chemical-sterilants',
    error_categories: ['debris_found'],
    difficulty: 'foundational',
    question:
      'Which chemical agent is most commonly used for high-level disinfection of flexible endoscopes in modern sterile processing departments?',
    options: {
      A: 'Hydrogen peroxide 3%',
      B: 'Ortho-phthalaldehyde (OPA)',
      C: 'Isopropyl alcohol 70%',
      D: 'Sodium hypochlorite',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'OPA is the predominant HLD agent for flexible endoscopes because of its rapid broad-spectrum microbicidal action at room temperature and lower vapor hazard compared to glutaraldehyde. Isopropyl alcohol and sodium hypochlorite are not approved for HLD of lumened patient-contact instruments per AAMI ST91.',
    real_world_standard: 'AAMI ST91',
  },

  {
    id: 'tq-hld-002',
    domain: 'STERILIZATION',
    learning_domain: 'high_level_disinfection',
    concept_id: 'concept-hld-chemical-sterilants',
    error_categories: ['debris_found'],
    difficulty: 'foundational',
    question:
      'Glutaraldehyde 2% is still used in some facilities for HLD. Which characteristic differentiates it from OPA as a practical concern in daily SPD operations?',
    options: {
      A: 'Glutaraldehyde is effective only at refrigerated temperatures',
      B: 'Glutaraldehyde has a stronger odor and higher vapor toxicity requiring ventilated areas',
      C: 'Glutaraldehyde cannot kill mycobacteria',
      D: 'Glutaraldehyde discolors instrument surfaces blue-gray',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'Glutaraldehyde is highly effective but has significant vapor toxicity that demands ventilated or enclosed processing areas and OSHA exposure monitoring. OPA largely replaced it in many facilities because OPA has negligible odor and lower inhalation risk. Both agents require MEC testing before use; neither discolors instruments blue-gray (OPA does stain skin and mucous membranes).',
    real_world_standard: 'AAMI ST91',
  },

  {
    id: 'tq-hld-003',
    domain: 'STERILIZATION',
    learning_domain: 'high_level_disinfection',
    concept_id: 'concept-hld-chemical-sterilants',
    error_categories: ['debris_found'],
    difficulty: 'intermediate',
    question:
      'Peracetic acid (PAA) is used for automated flexible endoscope reprocessors (AERs). Compared to OPA manual immersion, what is a defining advantage of PAA in an AER system?',
    options: {
      A: 'PAA can be reused indefinitely without concentration testing',
      B: 'PAA does not require a rinse step after HLD',
      C: 'PAA is a single-use liquid sterilant that decomposes into harmless byproducts, eliminating residual chemical exposure',
      D: 'PAA achieves HLD faster than OPA at room temperature for all scope types',
    },
    correct: 'C',
    partial_credit: 'D',
    explanation:
      "PAA in AER systems (e.g., Medivators Advantage Plus) is formulated as a single-use concentrate that degrades into acetic acid and water, so there is no buildup of toxic residue and no MEC monitoring between cycles. OPA is reusable but requires MEC testing; glutaraldehyde requires disposal tracking. PAA AERs still use a sterile-water rinse cycle per the device's IFU.",
    real_world_standard: 'AORN: Flexible Endoscopes',
  },

  // ─── concept-hld-mec-monitoring (3 questions) ────────────────────────────────

  {
    id: 'tq-hld-004',
    domain: 'STERILIZATION',
    learning_domain: 'high_level_disinfection',
    concept_id: 'concept-hld-mec-monitoring',
    error_categories: ['debris_found'],
    difficulty: 'foundational',
    question:
      'Before immersing a scope in an OPA bath, the technician must test the solution with a test strip. What is the purpose of this test?',
    options: {
      A: 'To confirm the bath temperature is within range',
      B: 'To verify the OPA concentration meets or exceeds the minimum effective concentration (MEC)',
      C: 'To check that the bath pH is neutral',
      D: 'To detect residual biofilm from the previous scope',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'Each time an HLD solution is reused, organic load and evaporation reduce its active concentration. MEC testing confirms the agent remains potent enough to kill vegetative bacteria, mycobacteria, fungi, and viruses. Per AAMI ST91, if the test strip reads below MEC, the solution must be discarded immediately regardless of the number of uses remaining.',
    real_world_standard: 'AAMI ST91',
  },

  {
    id: 'tq-hld-005',
    domain: 'STERILIZATION',
    learning_domain: 'high_level_disinfection',
    concept_id: 'concept-hld-mec-monitoring',
    error_categories: ['debris_found'],
    difficulty: 'intermediate',
    question:
      'A technician tests the OPA bath and the test strip changes to a color that falls between the "pass" and "fail" reference zones on the color chart. What is the correct action?',
    options: {
      A: 'Proceed — borderline results are still within manufacturer tolerance',
      B: 'Re-test with a second strip; if the result is still borderline, discard the solution',
      C: 'Add fresh OPA concentrate to raise the concentration and re-test',
      D: 'Discard the solution immediately — any ambiguous result requires replacement',
    },
    correct: 'D',
    partial_credit: 'B',
    explanation:
      "AAMI ST91 and most OPA manufacturers specify that only a clear \"pass\" result authorizes reuse. An ambiguous reading cannot be resolved by adding fresh concentrate (mixing ages and concentrations is not validated). The correct response is to discard the solution, prepare a fresh bath, and document the change per the department's log protocol.",
    real_world_standard: 'AAMI ST91',
  },

  {
    id: 'tq-hld-006',
    domain: 'STERILIZATION',
    learning_domain: 'high_level_disinfection',
    concept_id: 'concept-hld-mec-monitoring',
    error_categories: ['debris_found'],
    difficulty: 'advanced',
    question:
      'An SPD supervisor notices that the OPA bath is being tested only once per shift rather than before each use. The facility processes up to 15 scopes per shift. What is the specific risk this practice creates?',
    options: {
      A: 'The bath temperature will rise above the safe range with repeated use',
      B: "Scopes processed after the bath drops below MEC mid-shift receive inadequate disinfection without any record indicating which scopes are at risk",
      C: 'Test strip reagents degrade when used infrequently, producing false-pass results',
      D: 'The manufacturer warranty on the OPA solution is voided without per-use documentation',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'Per AAMI ST91, the bath must be tested immediately before each use because organic load accumulates with every processed scope. Once-per-shift testing means scopes processed after the concentration drops below MEC were inadequately treated — but there is no record identifying which patients may have been exposed. This is a patient safety and infection-prevention traceability failure, not merely a documentation issue.',
    real_world_standard: 'AAMI ST91',
  },

  // ─── concept-hld-contact-time (2 questions) ──────────────────────────────────

  {
    id: 'tq-hld-007',
    domain: 'STERILIZATION',
    learning_domain: 'high_level_disinfection',
    concept_id: 'concept-hld-contact-time',
    error_categories: ['debris_found'],
    difficulty: 'intermediate',
    question:
      'A flexible colonoscope completes manual cleaning in the decontamination area. The HLD bath contains OPA at 25°C. According to AAMI ST91, what is the minimum required full-immersion time for the scope to achieve high-level disinfection?',
    options: {
      A: '5 minutes',
      B: '8 minutes',
      C: '12 minutes',
      D: '20 minutes',
    },
    correct: 'C',
    partial_credit: 'B',
    explanation:
      "Per AAMI ST91 and OPA manufacturer labeling (e.g., Cidex OPA), the minimum contact time at 20–25°C is 12 minutes for high-level disinfection of flexible endoscopes. At elevated temperatures (e.g., 25°C in an AER) the time may be reduced per the validated IFU, but the 12-minute room-temperature standard is the default. Shorter exposures risk residual Mycobacterium and non-enveloped viruses.",
    real_world_standard: 'AAMI ST91',
  },

  {
    id: 'tq-hld-008',
    domain: 'STERILIZATION',
    learning_domain: 'high_level_disinfection',
    concept_id: 'concept-hld-contact-time',
    error_categories: ['debris_found'],
    difficulty: 'advanced',
    question:
      'A gastroscope is partially immersed in the OPA bath — the distal tip and working channel are submerged but 4 cm of the insertion tube near the control head remains above the solution line. The technician starts the 12-minute timer. At the end of the cycle, what is the correct assessment?',
    options: {
      A: 'HLD is complete — the working channel and tip are the highest-risk areas and they were fully immersed',
      B: 'HLD is incomplete — the entire scope must be submerged for the full contact time; the scope must be reprocessed',
      C: 'HLD is acceptable if the partially exposed section is wiped with an OPA-soaked cloth after immersion',
      D: 'HLD is complete — the vapor from the bath disinfects non-submerged surfaces over 12 minutes',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'AAMI ST91 and AORN guidelines require complete immersion of the entire scope, including all channels flushed with the HLD solution, for the full validated contact time. Partial immersion leaves exterior surfaces and any ports above the liquid line unprocessed. OPA vapor does not achieve HLD. The scope must be re-cleaned (if contamination is suspected) and fully reprocessed.',
    real_world_standard: 'AAMI ST91',
  },

  // ─── concept-hld-rinse-protocol (2 questions) ─────────────────────────────────

  {
    id: 'tq-hld-009',
    domain: 'STERILIZATION',
    learning_domain: 'high_level_disinfection',
    concept_id: 'concept-hld-rinse-protocol',
    error_categories: ['debris_found'],
    difficulty: 'foundational',
    question:
      'After completing the OPA HLD immersion cycle, what type of water must be used to rinse the flexible endoscope before it is considered safe for patient use?',
    options: {
      A: 'Tap water from a filtered faucet',
      B: 'Sterile water or critical-water (0.2-micron filtered) meeting AAMI ST91 specifications',
      C: 'Distilled water from a commercial jug',
      D: 'Reverse-osmosis water at any temperature',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      "Per AAMI ST91, post-HLD rinse water must be sterile or meet the 'critical water' standard (0.2-micron filtered, low-bioburden, low-endotoxin) to prevent recontamination after HLD. Tap water — even filtered — can introduce Pseudomonas, Legionella, and other waterborne organisms into freshly disinfected scopes. Distilled jug water is not validated to AAMI specifications.",
    real_world_standard: 'AAMI ST91',
  },

  {
    id: 'tq-hld-010',
    domain: 'STERILIZATION',
    learning_domain: 'high_level_disinfection',
    concept_id: 'concept-hld-rinse-protocol',
    error_categories: ['debris_found'],
    difficulty: 'intermediate',
    question:
      'Following the sterile-water rinse, a bronchoscope must be dried before storage. What is the recommended drying method and storage environment per AORN and AAMI ST91?',
    options: {
      A: 'Air-dry in a standard closed cabinet at room temperature for 30 minutes',
      B: 'Flush channels with 70% isopropyl alcohol, purge with forced medical-grade air, and hang vertically in a ventilated scope-storage cabinet',
      C: 'Blot exterior with sterile gauze and coil loosely in a sealed pouch',
      D: 'Flush channels with sterile water a second time to remove residual OPA, then air-dry horizontally',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'AAMI ST91 and AORN guidelines recommend flushing channels with 70% isopropyl alcohol followed by forced medical-grade air purging to remove residual moisture that supports Pseudomonas and Mycobacterium biofilm formation. Scopes must hang vertically (prevents pooling in channels) in a ventilated, dedicated scope-storage cabinet. Coiling in a sealed pouch traps moisture and creates high-risk biofilm conditions.',
    real_world_standard: 'AORN: Flexible Endoscopes',
  },
]
