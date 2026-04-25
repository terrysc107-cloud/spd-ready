import { cache } from 'react'
import { getCurrentUser } from '@/lib/dal/auth'
import { readStore } from '@/lib/local-db/store'
import { TRACK_QUESTIONS, DOMAIN_META, type TrackDomain } from '@/lib/local-db/track-questions'
import type { StudySession, StreakData, XPRecord } from '@/lib/local-db/store'

export type DomainProgress = {
  domain: TrackDomain
  label: string
  icon: string
  description: string
  total_questions: number
  sessions_completed: number
  best_score: number | null
  latest_score: number | null
  suggested: boolean // true = weakest domain or never studied
}

export const getDomainProgress = cache(async (): Promise<DomainProgress[]> => {
  const user = await getCurrentUser()
  const store = readStore()
  const sessions: StudySession[] = user ? (store.study_sessions[user.id] ?? []) : []

  const domains = Object.keys(DOMAIN_META) as TrackDomain[]

  return domains
    .map(domain => {
      const domainSessions = sessions.filter(s => s.domain === domain)
      const best = domainSessions.length > 0 ? Math.max(...domainSessions.map(s => s.score_pct)) : null
      const latest = domainSessions.length > 0 ? domainSessions[domainSessions.length - 1].score_pct : null
      const questionCount = TRACK_QUESTIONS.filter(q => q.domain === domain).length
      return {
        domain,
        label: DOMAIN_META[domain].label,
        icon: DOMAIN_META[domain].icon,
        description: DOMAIN_META[domain].description,
        total_questions: questionCount,
        sessions_completed: domainSessions.length,
        best_score: best,
        latest_score: latest,
        suggested: false, // set below
      }
    })
    .map((d, _, arr) => {
      // Mark suggested = domains never studied first, then lowest best_score
      const neverStudied = arr.filter(x => x.best_score === null)
      const suggested =
        neverStudied.length > 0
          ? neverStudied[0].domain
          : arr.reduce((a, b) => ((a.best_score ?? 0) < (b.best_score ?? 0) ? a : b)).domain
      return { ...d, suggested: d.domain === suggested }
    })
})

export const getStudySessions = cache(async (): Promise<StudySession[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  const store = readStore()
  return store.study_sessions[user.id] ?? []
})

export function getQuestionsForDomain(domain: TrackDomain): typeof TRACK_QUESTIONS {
  return TRACK_QUESTIONS.filter(q => q.domain === domain)
}

export async function getStreakData(userId: string): Promise<StreakData> {
  const store = readStore()
  return store.streaks[userId] ?? { current: 0, longest: 0, last_study_date: '' }
}

export async function getXPRecord(userId: string): Promise<XPRecord> {
  const store = readStore()
  return store.xp_records[userId] ?? { total: 0, sessions_completed: 0, domains_mastered: [] }
}

export async function getDomainMasteryBadges(userId: string): Promise<string[]> {
  const store = readStore()
  return store.xp_records[userId]?.domains_mastered ?? []
}

export async function getJudgmentScore(userId: string): Promise<number | null> {
  const store = readStore()
  const sessions = (store.study_sessions[userId] ?? []).filter(
    s => s.domain === 'SPD_JUDGMENT'
  )
  if (sessions.length === 0) return null
  return Math.max(...sessions.map(s => s.score_pct))
}
