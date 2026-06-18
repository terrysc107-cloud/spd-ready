// tests/mindset-logic.test.ts
// Pure-logic tests for the mindset model (no Supabase required), mirroring
// the scoring.ts / competency-logic.ts test pattern.
import {
  deriveDimensionScores,
  deriveArchetype,
  deriveCalibration,
  deriveMindsetProfile,
  dominantDimensions,
  coveredDimensions,
  averageScore,
  scoreSpread,
  tallyByJudgmentType,
  likertToPct,
  type DimensionScores,
  type JudgmentTally,
} from '../src/lib/dal/mindset-logic'
import { MINDSET_DIMENSION_KEYS, type MindsetDimensionKey } from '../src/lib/mindset-model'

// helper: build a full DimensionScores object from a partial (missing keys = 0)
function scores(partial: Partial<Record<MindsetDimensionKey, number>>): DimensionScores {
  const out = {} as DimensionScores
  for (const k of MINDSET_DIMENSION_KEYS) out[k] = partial[k] ?? 0
  return out
}

describe('likertToPct', () => {
  it('maps 1..5 onto 0..100', () => {
    expect(likertToPct(1)).toBe(0)
    expect(likertToPct(3)).toBe(50)
    expect(likertToPct(5)).toBe(100)
  })
})

describe('deriveDimensionScores', () => {
  it('pools correct/total across a dimension\'s judgment_types', () => {
    // critical_thinking dimension pools critical_thinking + common_sense
    const tally: JudgmentTally = {
      critical_thinking: { correct: 1, total: 2 },
      common_sense: { correct: 1, total: 2 },
    }
    const s = deriveDimensionScores(tally)
    expect(s.critical_thinking).toBe(50) // (1+1)/(2+2)
  })

  it('scores a single-type dimension directly', () => {
    const s = deriveDimensionScores({ safety_ownership: { correct: 3, total: 4 } })
    expect(s.safety_ownership).toBe(75)
  })

  it('scores 0 for dimensions with no items', () => {
    const s = deriveDimensionScores({})
    for (const k of MINDSET_DIMENSION_KEYS) expect(s[k]).toBe(0)
  })
})

describe('coveredDimensions', () => {
  it('reports only dimensions that had scenarios', () => {
    const covered = coveredDimensions({ escalation: { correct: 1, total: 1 } })
    expect(covered).toEqual(['escalation'])
  })
})

describe('averageScore / scoreSpread / dominantDimensions', () => {
  it('computes average and spread', () => {
    const s = scores({ safety_ownership: 100, professionalism: 40 })
    expect(scoreSpread(s)).toBe(100) // max 100, min 0 (uncovered dims)
    expect(averageScore(s)).toBe(Math.round((100 + 40) / 6))
  })

  it('returns all tied top dimensions as dominant', () => {
    const s = scores({ safety_ownership: 80, accountability: 80, escalation: 50 })
    expect(dominantDimensions(s).sort()).toEqual(['accountability', 'safety_ownership'])
  })
})

describe('deriveArchetype', () => {
  it('returns Emerging when the average is below the floor', () => {
    const s = scores({ safety_ownership: 40, standards_discipline: 30 })
    expect(deriveArchetype(s).id).toBe('emerging')
  })

  it('returns All-Rounder when scores are high and balanced', () => {
    const s = scores({
      safety_ownership: 80, standards_discipline: 78, critical_thinking: 82,
      escalation: 80, accountability: 76, professionalism: 84,
    })
    expect(deriveArchetype(s).id).toBe('all_rounder')
  })

  it('maps a dominant safety dimension to The Guardian', () => {
    const s = scores({
      safety_ownership: 95, standards_discipline: 60, critical_thinking: 55,
      escalation: 50, accountability: 58, professionalism: 52,
    })
    expect(deriveArchetype(s).id).toBe('guardian')
  })

  it('maps a dominant escalation dimension to The Sentinel', () => {
    const s = scores({
      safety_ownership: 60, standards_discipline: 55, critical_thinking: 55,
      escalation: 95, accountability: 50, professionalism: 52,
    })
    expect(deriveArchetype(s).id).toBe('sentinel')
  })

  it('breaks dominance ties by safety-first display order', () => {
    // safety_ownership and professionalism both 90; safety wins by order.
    // Other dims at 55 keep the average above the Emerging floor and the
    // spread (35) above the balanced threshold, so a signature archetype is chosen.
    const s = scores({
      safety_ownership: 90, professionalism: 90, standards_discipline: 55,
      critical_thinking: 55, escalation: 55, accountability: 55,
    })
    expect(deriveArchetype(s).id).toBe('guardian')
  })
})

describe('deriveCalibration', () => {
  const demonstrated = scores({
    safety_ownership: 50, standards_discipline: 50, critical_thinking: 50,
    escalation: 50, accountability: 50, professionalism: 50,
  })

  it('flags overconfidence when self far exceeds demonstrated', () => {
    const self = {
      safety_ownership: 5, standards_discipline: 5, critical_thinking: 5,
      escalation: 5, accountability: 5, professionalism: 5,
    } as Record<MindsetDimensionKey, number>
    const c = deriveCalibration(self, demonstrated)
    expect(c.selfAvgPct).toBe(100)
    expect(c.demonstratedAvgPct).toBe(50)
    expect(c.gapPp).toBe(50)
    expect(c.band).toBe('overconfident')
  })

  it('reports aligned when self and demonstrated are close', () => {
    const self = {
      safety_ownership: 3, standards_discipline: 3, critical_thinking: 3,
      escalation: 3, accountability: 3, professionalism: 3,
    } as Record<MindsetDimensionKey, number>
    expect(deriveCalibration(self, demonstrated).band).toBe('aligned') // 50 vs 50
  })

  it('reports underconfident when self trails demonstrated', () => {
    const self = {
      safety_ownership: 1, standards_discipline: 1, critical_thinking: 1,
      escalation: 1, accountability: 1, professionalism: 1,
    } as Record<MindsetDimensionKey, number>
    expect(deriveCalibration(self, demonstrated).band).toBe('underconfident') // 0 vs 50
  })
})

describe('tallyByJudgmentType', () => {
  it('counts correct/total per type and ignores unmapped/null tags', () => {
    const tally = tallyByJudgmentType([
      { judgmentType: 'safety_ownership', correct: true },
      { judgmentType: 'safety_ownership', correct: false },
      { judgmentType: 'teamwork', correct: true }, // maps into professionalism
      { judgmentType: null, correct: true },        // ignored
      { judgmentType: 'not_a_real_type', correct: true }, // ignored
    ])
    expect(tally.safety_ownership).toEqual({ correct: 1, total: 2 })
    expect(tally.teamwork).toEqual({ correct: 1, total: 1 })
    expect(tally.not_a_real_type).toBeUndefined()
  })
})

describe('deriveMindsetProfile', () => {
  it('produces a full derivation with archetype, dominance, and calibration', () => {
    const answers = [
      { judgmentType: 'safety_ownership', correct: true },
      { judgmentType: 'safety_ownership', correct: true },
      { judgmentType: 'escalation', correct: false },
      { judgmentType: 'professionalism', correct: true },
    ]
    const tally = tallyByJudgmentType(answers)
    const self = {
      safety_ownership: 4, standards_discipline: 3, critical_thinking: 3,
      escalation: 3, accountability: 3, professionalism: 4,
    } as Record<MindsetDimensionKey, number>
    const prof = deriveMindsetProfile({ tally, selfLikert: self })
    expect(prof.modelVersion).toBe('v1-beta')
    expect(prof.dimensionScores.safety_ownership).toBe(100)
    expect(prof.dimensionScores.escalation).toBe(0)
    expect(prof.covered.sort()).toEqual(['escalation', 'professionalism', 'safety_ownership'])
    expect(prof.calibration).not.toBeNull()
  })

  it('returns null calibration when no self-perception is captured', () => {
    const prof = deriveMindsetProfile({ tally: { safety_ownership: { correct: 1, total: 1 } } })
    expect(prof.calibration).toBeNull()
  })
})
