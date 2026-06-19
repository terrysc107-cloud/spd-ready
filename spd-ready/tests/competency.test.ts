// tests/competency.test.ts
// Pure-logic tests for the competency loop (no Supabase required).
import {
  deriveTrainingObservations,
  type TrainingItemInput,
} from '../src/lib/dal/competency-logic'

type Mastery = { concept_id: string; domain: string; mastery_score: number }

function item(partial: Partial<TrainingItemInput> & { id: string }): TrainingItemInput {
  return {
    id: partial.id,
    concept_id: partial.concept_id ?? null,
    domain: partial.domain ?? null,
    evidence_type: partial.evidence_type ?? 'either',
  }
}

describe('deriveTrainingObservations', () => {
  it('passes a concept-backed item when mastery >= threshold', () => {
    const masteries: Mastery[] = [{ concept_id: 'c-steam', domain: 'sterilization', mastery_score: 85 }]
    const items = [item({ id: 'i1', concept_id: 'c-steam', evidence_type: 'training' })]
    const obs = deriveTrainingObservations(masteries, items, 80)
    expect(obs).toHaveLength(1)
    expect(obs[0]).toEqual({ item_id: 'i1', result: 'pass', mastery_score: 85 })
  })

  it('fails a concept-backed item when mastery < threshold', () => {
    const masteries: Mastery[] = [{ concept_id: 'c-steam', domain: 'sterilization', mastery_score: 60 }]
    const items = [item({ id: 'i1', concept_id: 'c-steam', evidence_type: 'training' })]
    expect(deriveTrainingObservations(masteries, items, 80)[0].result).toBe('fail')
  })

  it('treats a missing concept as score 0 (fail)', () => {
    const items = [item({ id: 'i1', concept_id: 'c-missing', evidence_type: 'either' })]
    const obs = deriveTrainingObservations([], items, 80)
    expect(obs[0]).toEqual({ item_id: 'i1', result: 'fail', mastery_score: 0 })
  })

  it('averages domain-backed items across concepts in the domain', () => {
    const masteries: Mastery[] = [
      { concept_id: 'c1', domain: 'decontamination', mastery_score: 90 },
      { concept_id: 'c2', domain: 'decontamination', mastery_score: 70 },
      { concept_id: 'c3', domain: 'sterilization', mastery_score: 10 },
    ]
    const items = [item({ id: 'i1', domain: 'decontamination', evidence_type: 'training' })]
    const obs = deriveTrainingObservations(masteries, items, 80)
    expect(obs[0]).toEqual({ item_id: 'i1', result: 'pass', mastery_score: 80 }) // (90+70)/2
  })

  it('skips observation-only items (manager validates those)', () => {
    const items = [
      item({ id: 'i1', concept_id: 'c1', evidence_type: 'observation' }),
      item({ id: 'i2', concept_id: 'c1', evidence_type: 'training' }),
    ]
    const obs = deriveTrainingObservations([{ concept_id: 'c1', domain: 'd', mastery_score: 95 }], items, 80)
    expect(obs.map(o => o.item_id)).toEqual(['i2'])
  })

  it('skips items with no training backing (no concept, no domain)', () => {
    const items = [item({ id: 'i1', evidence_type: 'either' })]
    expect(deriveTrainingObservations([], items, 80)).toHaveLength(0)
  })
})
