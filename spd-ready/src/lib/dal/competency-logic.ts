// Pure competency logic — NO Supabase / Next imports, so it is unit-testable
// (see tests/competency.test.ts), mirroring the pure scoring.ts pattern.

export type TrainingObservation = {
  item_id: string
  result: 'pass' | 'fail' | 'na'
  mastery_score: number
}

export type TrainingItemInput = {
  id: string
  concept_id: string | null
  domain: string | null
  evidence_type: 'observation' | 'training' | 'either'
}

export type MasteryInput = {
  concept_id: string
  domain: string
  mastery_score: number
}

// Map engine mastery -> per-item training pass/fail (the training half of
// competency). Concept-backed items use that concept's mastery; domain-backed
// items average mastery across the domain; observation-only items are skipped
// (a manager validates those).
export function deriveTrainingObservations(
  masteries: MasteryInput[],
  items: TrainingItemInput[],
  passThreshold: number
): TrainingObservation[] {
  const out: TrainingObservation[] = []
  for (const item of items) {
    if (item.evidence_type === 'observation') continue // manager-only item
    let score: number | null = null
    if (item.concept_id) {
      const m = masteries.find(x => x.concept_id === item.concept_id)
      score = m ? m.mastery_score : 0
    } else if (item.domain) {
      const dm = masteries.filter(x => x.domain === item.domain)
      score = dm.length ? Math.round(dm.reduce((s, x) => s + x.mastery_score, 0) / dm.length) : 0
    } else {
      continue // no training backing
    }
    out.push({ item_id: item.id, result: score >= passThreshold ? 'pass' : 'fail', mastery_score: score })
  }
  return out
}
