// tests/assessment.test.ts
// Tests cooldown logic and submit count guard as pure functions.
// These do NOT require a Supabase connection.

// Cooldown math extracted for testing
function isCooldownActive(submittedAt: Date | null, now: Date): boolean {
  if (!submittedAt) return false
  const cooldownEnd = new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000)
  return now < cooldownEnd
}

function timeUntilNextAttempt(submittedAt: Date, now: Date): number {
  const cooldownEnd = new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000)
  return Math.max(0, cooldownEnd.getTime() - now.getTime())
}

describe('assessment cooldown logic', () => {
  const baseTime = new Date('2026-04-21T12:00:00Z')

  it('blocks retake when submitted_at is 1 hour ago', () => {
    const submittedAt = new Date(baseTime.getTime() - 1 * 60 * 60 * 1000) // 1h ago
    expect(isCooldownActive(submittedAt, baseTime)).toBe(true)
  })

  it('blocks retake when submitted_at is 23h 59m ago', () => {
    const submittedAt = new Date(baseTime.getTime() - (23 * 60 + 59) * 60 * 1000)
    expect(isCooldownActive(submittedAt, baseTime)).toBe(true)
  })

  it('allows retake when submitted_at is exactly 24h ago', () => {
    const submittedAt = new Date(baseTime.getTime() - 24 * 60 * 60 * 1000)
    expect(isCooldownActive(submittedAt, baseTime)).toBe(false)
  })

  it('allows retake when submitted_at is 25h ago', () => {
    const submittedAt = new Date(baseTime.getTime() - 25 * 60 * 60 * 1000)
    expect(isCooldownActive(submittedAt, baseTime)).toBe(false)
  })

  it('allows first attempt when submitted_at is null', () => {
    expect(isCooldownActive(null, baseTime)).toBe(false)
  })

  it('timeUntilNextAttempt returns positive ms when cooldown active', () => {
    const submittedAt = new Date(baseTime.getTime() - 1 * 60 * 60 * 1000)
    const remaining = timeUntilNextAttempt(submittedAt, baseTime)
    expect(remaining).toBeGreaterThan(0)
    // 24h - 1h = 23h remaining
    expect(remaining).toBeCloseTo(23 * 60 * 60 * 1000, -3)
  })

  it('timeUntilNextAttempt returns 0 when cooldown expired', () => {
    const submittedAt = new Date(baseTime.getTime() - 25 * 60 * 60 * 1000)
    expect(timeUntilNextAttempt(submittedAt, baseTime)).toBe(0)
  })
})

describe('submit count guard', () => {
  function canSubmitAssessment(responseCount: number): boolean {
    return responseCount >= 30
  }

  it('allows submit when exactly 30 responses exist', () => {
    expect(canSubmitAssessment(30)).toBe(true)
  })

  it('blocks submit when fewer than 30 responses exist', () => {
    expect(canSubmitAssessment(29)).toBe(false)
    expect(canSubmitAssessment(0)).toBe(false)
  })

  it('allows submit when more than 30 responses exist (edge case)', () => {
    // Should not happen in practice but must not crash
    expect(canSubmitAssessment(31)).toBe(true)
  })
})
