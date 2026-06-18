import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/dal/auth'
import { TRACK_QUESTIONS, DOMAIN_META, type TrackDomain } from '@/lib/local-db/track-questions'
import { countStudyQuestionsByTrackDomain } from '@/lib/dal/questions'
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

type StudySessionRow = {
  id: string
  staff_id: string
  domain: string
  completed_at: string
  total: number
  correct: number
  partial: number
  wrong: number
  score_pct: number
}

function mapSession(r: StudySessionRow): StudySession {
  return {
    id: r.id,
    user_id: r.staff_id,
    domain: r.domain as TrackDomain,
    completed_at: r.completed_at,
    total: r.total,
    correct: r.correct,
    partial: r.partial,
    wrong: r.wrong,
    score_pct: r.score_pct,
  }
}

async function fetchSessions(staffId: string): Promise<StudySession[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('staff_id', staffId)
    .order('completed_at', { ascending: true })
    .returns<StudySessionRow[]>()
  return (data ?? []).map(mapSession)
}

export const getDomainProgress = cache(async (): Promise<DomainProgress[]> => {
  const user = await getAuthUser()
  const sessions: StudySession[] = user ? await fetchSessions(user.id) : []
  const questionCounts = await countStudyQuestionsByTrackDomain()

  const domains = Object.keys(DOMAIN_META) as TrackDomain[]

  return domains
    .map(domain => {
      const domainSessions = sessions.filter(s => s.domain === domain)
      const best = domainSessions.length > 0 ? Math.max(...domainSessions.map(s => s.score_pct)) : null
      const latest = domainSessions.length > 0 ? domainSessions[domainSessions.length - 1].score_pct : null
      const questionCount = questionCounts[domain] ?? 0
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
  const user = await getAuthUser()
  if (!user) return []
  return fetchSessions(user.id)
})

export function getQuestionsForDomain(domain: TrackDomain): typeof TRACK_QUESTIONS {
  return TRACK_QUESTIONS.filter(q => q.domain === domain)
}

export async function getStreakData(userId: string): Promise<StreakData> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('streaks')
    .select('current, longest, last_study_date')
    .eq('staff_id', userId)
    .maybeSingle<{ current: number; longest: number; last_study_date: string | null }>()
  return {
    current: data?.current ?? 0,
    longest: data?.longest ?? 0,
    last_study_date: data?.last_study_date ?? '',
  }
}

export async function getXPRecord(userId: string): Promise<XPRecord> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('xp_records')
    .select('total, sessions_completed, domains_mastered')
    .eq('staff_id', userId)
    .maybeSingle<{ total: number; sessions_completed: number; domains_mastered: string[] }>()
  return {
    total: data?.total ?? 0,
    sessions_completed: data?.sessions_completed ?? 0,
    domains_mastered: data?.domains_mastered ?? [],
  }
}

export async function getDomainMasteryBadges(userId: string): Promise<string[]> {
  const xp = await getXPRecord(userId)
  return xp.domains_mastered
}

export async function getJudgmentScore(userId: string): Promise<number | null> {
  const sessions = (await fetchSessions(userId)).filter(s => s.domain === 'SPD_JUDGMENT')
  if (sessions.length === 0) return null
  return Math.max(...sessions.map(s => s.score_pct))
}
