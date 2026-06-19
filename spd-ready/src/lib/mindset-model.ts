// ============================================================
// SPD Ready — Mindset Model (v1, BETA)
//
// This is a VERSIONED, CONFIG-DRIVEN hypothesis about what makes a
// safe, survey-ready SPD technician's *judgment mindset*. It is NOT
// hardcoded truth. Every profile records the MODEL_VERSION that
// produced it, so thresholds can be tuned from real beta data
// (tech + manager feedback) without invalidating prior profiles or
// touching the pure derivation logic in dal/mindset-logic.ts.
//
// The 6 dimensions are grounded in the `judgment_type` tags already
// authored on the SPD_JUDGMENT scenario bank, so the demonstrated
// (situational-judgment) scores map to them with no lossy guesswork.
//
// "Beta — help us define the SPD standard." The archetypes are a
// starting point the industry co-creates through the feedback loop.
// ============================================================

export const MODEL_VERSION = 'v1-beta'

// The judgment_type tags present on the scenario bank (track-questions.ts).
export type JudgmentType =
  | 'safety_ownership'
  | 'moral_standard'
  | 'critical_thinking'
  | 'common_sense'
  | 'escalation'
  | 'accountability'
  | 'professionalism'
  | 'teamwork'

// The 6 mindset dimensions shown on the radar.
export type MindsetDimensionKey =
  | 'safety_ownership'
  | 'standards_discipline'
  | 'critical_thinking'
  | 'escalation'
  | 'accountability'
  | 'professionalism'

export type MindsetDimension = {
  key: MindsetDimensionKey
  label: string
  short: string
  description: string
  // judgment_type tags whose scenarios feed this dimension's demonstrated score
  judgmentTypes: JudgmentType[]
  // first-person Likert statement used to capture self-perception (1..5 agreement)
  selfStatement: string
}

export const MINDSET_DIMENSIONS: MindsetDimension[] = [
  {
    key: 'safety_ownership',
    label: 'Safety Ownership',
    short: 'Owns it',
    description: 'Takes personal ownership of patient-safety outcomes — even when it is not strictly "their" job.',
    judgmentTypes: ['safety_ownership'],
    selfStatement: 'When patient safety is at risk, I take personal ownership — even if it is not strictly my job.',
  },
  {
    key: 'standards_discipline',
    label: 'Standards Discipline',
    short: 'Holds the line',
    description: 'Holds sterilization and process standards under schedule pressure — does the right thing when no one is watching.',
    judgmentTypes: ['moral_standard'],
    selfStatement: 'I hold the line on sterilization and process standards, even under heavy schedule pressure.',
  },
  {
    key: 'critical_thinking',
    label: 'Critical Thinking',
    short: 'Reasons it out',
    description: 'Reasons through an off-normal situation to root cause instead of guessing or rushing past it.',
    judgmentTypes: ['critical_thinking', 'common_sense'],
    selfStatement: 'When something does not look right, I reason it through to the cause instead of guessing or rushing.',
  },
  {
    key: 'escalation',
    label: 'Escalation Judgment',
    short: 'Raises the flag',
    description: 'Knows when to stop and escalate rather than push a questionable tray forward.',
    judgmentTypes: ['escalation'],
    selfStatement: 'I know when to stop and escalate rather than push a questionable tray forward.',
  },
  {
    key: 'accountability',
    label: 'Accountability',
    short: 'Owns mistakes',
    description: 'Flags and owns mistakes out loud — transparency over self-protection.',
    judgmentTypes: ['accountability'],
    selfStatement: 'If I make a mistake, I flag it and own it — transparency matters more than protecting myself.',
  },
  {
    key: 'professionalism',
    label: 'Professional Collaboration',
    short: 'Steadies the team',
    description: 'Communicates respectfully and works as a team, keeping the department steady under pressure.',
    judgmentTypes: ['professionalism', 'teamwork'],
    selfStatement: 'I communicate respectfully and work as a team, even when the department is slammed.',
  },
]

export const MINDSET_DIMENSION_KEYS: MindsetDimensionKey[] = MINDSET_DIMENSIONS.map(d => d.key)

// Reverse lookup: judgment_type -> dimension key. (common_sense rolls into
// critical_thinking; teamwork rolls into professionalism.)
export const JUDGMENT_TYPE_TO_DIMENSION: Record<JudgmentType, MindsetDimensionKey> = (() => {
  const m = {} as Record<JudgmentType, MindsetDimensionKey>
  for (const dim of MINDSET_DIMENSIONS) {
    for (const jt of dim.judgmentTypes) m[jt] = dim.key
  }
  return m
})()

// ============================================================
// Archetypes — a tech-mindset "type" surfaced from the dimension scores.
// Each archetype has a signature dimension; the dominant dimension picks the
// archetype. Two special archetypes handle the all-low and balanced-high cases.
// Growth-framed, never punitive.
// ============================================================

export type ArchetypeId =
  | 'guardian'
  | 'standard_bearer'
  | 'investigator'
  | 'sentinel'
  | 'straight_shooter'
  | 'anchor'
  | 'all_rounder'
  | 'emerging'

export type MindsetArchetype = {
  id: ArchetypeId
  label: string
  tagline: string
  description: string
  emoji: string
  // the dimension whose dominance selects this archetype (null for the two special cases)
  signatureDimension: MindsetDimensionKey | null
}

export const MINDSET_ARCHETYPES: MindsetArchetype[] = [
  {
    id: 'guardian',
    label: 'The Guardian',
    tagline: 'Patient safety is personal — you stop the line.',
    description: 'You instinctively own patient-safety outcomes. When something is unsafe, you act on it rather than assuming someone else will. Grow by pairing that instinct with crisp escalation so the whole team moves with you.',
    emoji: '🛡️',
    signatureDimension: 'safety_ownership',
  },
  {
    id: 'standard_bearer',
    label: 'The Standard-Bearer',
    tagline: 'You hold the standard when no one is watching.',
    description: 'Process and sterility standards do not bend for you under pressure. You are the reason a tray is right. Grow by coaching peers on the "why" so the standard spreads beyond your own bench.',
    emoji: '⚖️',
    signatureDimension: 'standards_discipline',
  },
  {
    id: 'investigator',
    label: 'The Investigator',
    tagline: 'You dig past the symptom to the root cause.',
    description: 'When something is off-normal, you reason it through instead of guessing. You catch the problems checklists miss. Grow by documenting your reasoning so it becomes department knowledge, not just instinct.',
    emoji: '🔎',
    signatureDimension: 'critical_thinking',
  },
  {
    id: 'sentinel',
    label: 'The Sentinel',
    tagline: 'You raise the flag before a near-miss becomes an event.',
    description: 'You know exactly when to stop and escalate. You would rather ask than push a questionable load forward. Grow by building the judgment to handle more in the moment — so escalation is a tool, not a reflex.',
    emoji: '🚩',
    signatureDimension: 'escalation',
  },
  {
    id: 'straight_shooter',
    label: 'The Straight-Shooter',
    tagline: 'You own mistakes out loud so the team can fix them.',
    description: 'Transparency beats self-protection for you. You flag your own errors, which is exactly what a just-culture department needs. Grow by turning that honesty into prevention — catching the error before it ships.',
    emoji: '🎯',
    signatureDimension: 'accountability',
  },
  {
    id: 'anchor',
    label: 'The Anchor',
    tagline: 'You keep the team steady and communicating under pressure.',
    description: 'You are the calm, professional center when the department is slammed. People work better around you. Grow by channeling that steadiness into holding hard standards even when it creates friction.',
    emoji: '⚓',
    signatureDimension: 'professionalism',
  },
  {
    id: 'all_rounder',
    label: 'The All-Rounder',
    tagline: 'Strong, even judgment across the board.',
    description: 'No single spike — you bring balanced, dependable judgment across every dimension. That breadth is rare and exactly what charge roles need. Grow by deepening one signature strength to lead with.',
    emoji: '🧭',
    signatureDimension: null,
  },
  {
    id: 'emerging',
    label: 'The Emerging Technician',
    tagline: 'Building your judgment foundation — every scenario sharpens it.',
    description: 'You are early in building SPD judgment, and that is exactly what this is for. Each scenario you work pulls a real-world standard into reach. Your baseline is the starting line, not a verdict.',
    emoji: '🌱',
    signatureDimension: null,
  },
]

export const ARCHETYPE_BY_ID: Record<ArchetypeId, MindsetArchetype> = (() => {
  const m = {} as Record<ArchetypeId, MindsetArchetype>
  for (const a of MINDSET_ARCHETYPES) m[a.id] = a
  return m
})()

export const ARCHETYPE_BY_SIGNATURE: Partial<Record<MindsetDimensionKey, MindsetArchetype>> = (() => {
  const m: Partial<Record<MindsetDimensionKey, MindsetArchetype>> = {}
  for (const a of MINDSET_ARCHETYPES) if (a.signatureDimension) m[a.signatureDimension] = a
  return m
})()

// ============================================================
// Tunable thresholds — the knobs beta data turns. Live in config so the
// pure logic never hardcodes a number.
// ============================================================

export type MindsetModelConfig = {
  version: string
  // below this average demonstrated score → "Emerging" (growth-framed floor)
  emergingFloorAvg: number
  // at/above this average AND within balancedSpreadMax → "All-Rounder"
  balancedFloorAvg: number
  // max (top − bottom) dimension spread to count as "balanced"
  balancedSpreadMax: number
  // self-vs-demonstrated calibration bands (percentage points)
  calibration: {
    overconfidentAbovePp: number   // self exceeds demonstrated by more than this → overconfident
    underconfidentBelowPp: number  // self trails demonstrated by more than this → underconfident (modest)
  }
}

export const MINDSET_MODEL: MindsetModelConfig = {
  version: MODEL_VERSION,
  emergingFloorAvg: 45,
  balancedFloorAvg: 70,
  balancedSpreadMax: 18,
  calibration: {
    overconfidentAbovePp: 20,
    underconfidentBelowPp: 20,
  },
}
