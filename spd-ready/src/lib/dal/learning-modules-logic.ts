// Pure ranking logic for the adaptive "Recommended for you" module feed.
// NO Supabase / Next imports — unit-tested in tests/learning-modules-logic.test.ts.
//
// The thesis: techs are "fed info relevant to them and not all" — a tech weak
// at instrument inspection but strong in decon is ranked toward inspection
// modules. We score each module by how much it covers the tech's WEAKEST and
// DUE-for-review concepts (mastery gap), with a fallback to domain weakness for
// modules whose concepts the tech hasn't touched yet.
import type { LearningDomain } from '@/lib/local-db/types'

// One per concept the tech has a mastery row for (already recency-decayed).
export type MasterySignal = {
  concept_id: string
  domain: LearningDomain
  mastery_score: number // 0..100
  due: boolean // next_review_at <= now
}

export type RankableModule = {
  id: string
  domain: LearningDomain
  concept_ids: string[]
}

export type RankedModule<T> = {
  module: T
  score: number
  isDue: boolean // a covered concept is due for review
  matchedConceptIds: string[] // covered concepts the tech has mastery data for
}

const DUE_BONUS = 25
const UNTOUCHED_PRIORITY = 60 // brand-new content the tech has no data on
const REFRESH_DAMPEN = 0.6 // already-completed-but-due modules rank below fresh gaps

/**
 * Rank active modules for a tech by relevance to their weak/due concepts.
 * - Modules covering low-mastery concepts score highest.
 * - Due-for-review concepts add a bonus (spaced repetition surfacing).
 * - Already-completed modules are excluded UNLESS a covered concept is now due
 *   (then they resurface, dampened).
 * - Modules whose concepts the tech hasn't touched fall back to domain-average
 *   weakness, then to a neutral "new content" priority.
 */
export function rankModulesByWeakness<T extends RankableModule>(
  modules: T[],
  signals: MasterySignal[],
  completedModuleIds: Set<string> = new Set(),
  limit = 4,
): RankedModule<T>[] {
  const byConcept = new Map<string, MasterySignal>()
  const domainScores = new Map<LearningDomain, number[]>()
  for (const s of signals) {
    byConcept.set(s.concept_id, s)
    const arr = domainScores.get(s.domain) ?? []
    arr.push(s.mastery_score)
    domainScores.set(s.domain, arr)
  }
  const domainAvg = (d: LearningDomain): number | null => {
    const arr = domainScores.get(d)
    if (!arr || arr.length === 0) return null
    return arr.reduce((a, b) => a + b, 0) / arr.length
  }

  const ranked: RankedModule<T>[] = []
  for (const m of modules) {
    const matched = m.concept_ids.filter((c) => byConcept.has(c))
    const isDue = matched.some((c) => byConcept.get(c)!.due)
    const completed = completedModuleIds.has(m.id)
    // Skip completed modules unless a covered concept has come due again.
    if (completed && !isDue) continue

    let score: number
    if (matched.length > 0) {
      const gap =
        matched.reduce((sum, c) => {
          const sig = byConcept.get(c)!
          return sum + (100 - sig.mastery_score) + (sig.due ? DUE_BONUS : 0)
        }, 0) / matched.length
      score = gap + matched.length // slight breadth bonus for multi-concept coverage
    } else {
      const avg = domainAvg(m.domain)
      score = avg == null ? UNTOUCHED_PRIORITY : (100 - avg) * 0.5
    }
    if (completed) score *= REFRESH_DAMPEN

    ranked.push({ module: m, score, isDue, matchedConceptIds: matched })
  }

  ranked.sort((a, b) => b.score - a.score)
  return ranked.slice(0, limit)
}
