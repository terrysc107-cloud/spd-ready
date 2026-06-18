// tests/learning-modules-logic.test.ts
// Pure-logic tests for the adaptive module feed (no Supabase required).
import {
  rankModulesByWeakness,
  type MasterySignal,
  type RankableModule,
} from '../src/lib/dal/learning-modules-logic'

const MOD_INSPECT: RankableModule = { id: 'm-inspect', domain: 'iap', concept_ids: ['concept-iap-inspection'] }
const MOD_DECON: RankableModule = { id: 'm-decon', domain: 'decontamination', concept_ids: ['concept-decon-ppe'] }
const MOD_STERIL: RankableModule = { id: 'm-steril', domain: 'sterilization', concept_ids: ['concept-steril-bi-ci'] }

describe('rankModulesByWeakness', () => {
  it('ranks the module covering the weakest concept first', () => {
    const signals: MasterySignal[] = [
      { concept_id: 'concept-iap-inspection', domain: 'iap', mastery_score: 20, due: false }, // weak
      { concept_id: 'concept-decon-ppe', domain: 'decontamination', mastery_score: 90, due: false }, // strong
    ]
    const ranked = rankModulesByWeakness([MOD_DECON, MOD_INSPECT], signals)
    expect(ranked[0].module.id).toBe('m-inspect')
    expect(ranked[0].matchedConceptIds).toContain('concept-iap-inspection')
  })

  it('embodies the brief: weak instruments + strong decon => inspection over decon', () => {
    const signals: MasterySignal[] = [
      { concept_id: 'concept-iap-inspection', domain: 'iap', mastery_score: 30, due: false },
      { concept_id: 'concept-decon-ppe', domain: 'decontamination', mastery_score: 85, due: false },
    ]
    const ranked = rankModulesByWeakness([MOD_DECON, MOD_INSPECT], signals)
    const order = ranked.map((r) => r.module.id)
    expect(order.indexOf('m-inspect')).toBeLessThan(order.indexOf('m-decon'))
  })

  it('gives due-for-review concepts a bonus', () => {
    const signals: MasterySignal[] = [
      { concept_id: 'concept-iap-inspection', domain: 'iap', mastery_score: 60, due: true }, // due
      { concept_id: 'concept-decon-ppe', domain: 'decontamination', mastery_score: 55, due: false }, // slightly weaker but not due
    ]
    const ranked = rankModulesByWeakness([MOD_DECON, MOD_INSPECT], signals)
    expect(ranked[0].module.id).toBe('m-inspect')
    expect(ranked[0].isDue).toBe(true)
  })

  it('excludes already-completed modules that are not due', () => {
    const signals: MasterySignal[] = [
      { concept_id: 'concept-iap-inspection', domain: 'iap', mastery_score: 40, due: false },
    ]
    const ranked = rankModulesByWeakness([MOD_INSPECT], signals, new Set(['m-inspect']))
    expect(ranked).toHaveLength(0)
  })

  it('resurfaces a completed module when a covered concept comes due (dampened)', () => {
    const signals: MasterySignal[] = [
      { concept_id: 'concept-iap-inspection', domain: 'iap', mastery_score: 50, due: true },
    ]
    const ranked = rankModulesByWeakness([MOD_INSPECT], signals, new Set(['m-inspect']))
    expect(ranked).toHaveLength(1)
    expect(ranked[0].isDue).toBe(true)
  })

  it('falls back to neutral priority for untouched concepts and respects the limit', () => {
    const ranked = rankModulesByWeakness([MOD_INSPECT, MOD_DECON, MOD_STERIL], [], new Set(), 2)
    expect(ranked).toHaveLength(2)
    // all untouched => all get the same neutral score, none excluded
    expect(ranked.every((r) => r.matchedConceptIds.length === 0)).toBe(true)
  })

  it('prioritizes a weak touched concept over untouched new content', () => {
    const signals: MasterySignal[] = [
      { concept_id: 'concept-iap-inspection', domain: 'iap', mastery_score: 15, due: false },
    ]
    const ranked = rankModulesByWeakness([MOD_DECON, MOD_INSPECT], signals)
    expect(ranked[0].module.id).toBe('m-inspect') // gap 85 > untouched 60
  })
})
