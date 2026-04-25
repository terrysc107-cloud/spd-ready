// tests/scoring.test.ts
import {
  computeReadinessScore,
  deriveReadinessTier,
  deriveStrengthsAndGrowth,
  type CategoryScores,
} from '../src/lib/dal/scoring'

describe('computeReadinessScore', () => {
  it('applies correct weights and returns overall score', () => {
    const scores: CategoryScores = {
      technical: 100,
      situational: 100,
      process: 100,
      behavior: 100,
      instrument: 100,
      reliability: 100,
    }
    expect(computeReadinessScore(scores)).toBeCloseTo(100, 5)
  })

  it('returns correct weighted result for mixed scores', () => {
    // technical:60*0.30 + situational:80*0.25 + process:70*0.15 + behavior:50*0.15 + instrument:90*0.10 + reliability:100*0.05
    // = 18 + 20 + 10.5 + 7.5 + 9 + 5 = 70
    const scores: CategoryScores = {
      technical: 60,
      situational: 80,
      process: 70,
      behavior: 50,
      instrument: 90,
      reliability: 100,
    }
    expect(computeReadinessScore(scores)).toBeCloseTo(70, 5)
  })

  it('returns 0 for all-zero scores', () => {
    const scores: CategoryScores = {
      technical: 0,
      situational: 0,
      process: 0,
      behavior: 0,
      instrument: 0,
      reliability: 0,
    }
    expect(computeReadinessScore(scores)).toBe(0)
  })
})

describe('deriveReadinessTier', () => {
  it('returns 1 (Ready) for score >= 75', () => {
    expect(deriveReadinessTier(75)).toBe(1)
    expect(deriveReadinessTier(100)).toBe(1)
    expect(deriveReadinessTier(75.01)).toBe(1)
  })

  it('returns 2 (Ready with support) for score 55–74.99', () => {
    expect(deriveReadinessTier(55)).toBe(2)
    expect(deriveReadinessTier(74.99)).toBe(2)
    expect(deriveReadinessTier(65)).toBe(2)
  })

  it('returns 3 (Not ready yet) for score < 55', () => {
    expect(deriveReadinessTier(54.99)).toBe(3)
    expect(deriveReadinessTier(0)).toBe(3)
    expect(deriveReadinessTier(54)).toBe(3)
  })

  it('returns 1 at exactly 75', () => {
    expect(deriveReadinessTier(75)).toBe(1)
  })

  it('returns 2 at exactly 55', () => {
    expect(deriveReadinessTier(55)).toBe(2)
  })
})

describe('deriveStrengthsAndGrowth', () => {
  it('returns top 2 categories as strengths and bottom 2 as growth areas', () => {
    const scores: CategoryScores = {
      technical: 90,
      situational: 85,
      process: 70,
      behavior: 60,
      instrument: 55,
      reliability: 40,
    }
    const result = deriveStrengthsAndGrowth(scores)
    expect(result.strengths).toHaveLength(2)
    expect(result.strengths[0]).toBe('technical')
    expect(result.strengths[1]).toBe('situational')
    expect(result.growthAreas).toHaveLength(2)
    expect(result.growthAreas).toContain('reliability')
    expect(result.growthAreas).toContain('instrument')
  })

  it('handles tied scores without throwing', () => {
    const scores: CategoryScores = {
      technical: 80,
      situational: 80,
      process: 80,
      behavior: 80,
      instrument: 80,
      reliability: 80,
    }
    const result = deriveStrengthsAndGrowth(scores)
    expect(result.strengths).toHaveLength(2)
    expect(result.growthAreas).toHaveLength(2)
  })
})
