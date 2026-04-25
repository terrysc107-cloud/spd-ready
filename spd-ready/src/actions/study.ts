'use server'

import { requireRole } from '@/lib/dal/auth'
import { readStore, writeStore } from '@/lib/local-db/store'
import type { TrackDomain } from '@/lib/local-db/track-questions'
import type { StudySession, StreakData, XPRecord } from '@/lib/local-db/store'
import { revalidatePath } from 'next/cache'

export type SessionAnswers = {
  questionId: string
  selected: 'A' | 'B' | 'C' | 'D'
  correct: 'A' | 'B' | 'C' | 'D'
  partial_credit: 'A' | 'B' | 'C' | 'D' | null
}[]

const STREAK_MILESTONES = new Set([3, 7, 14, 30])

export async function saveStudySessionAction(
  domain: TrackDomain,
  answers: SessionAnswers
): Promise<{ sessionId: string; xpEarned: number; newStreak: number; masteryUnlocked: boolean; streakMilestone: boolean }> {
  const user = await requireRole('student')

  const total = answers.length
  let correct = 0
  let partial = 0
  let wrong = 0

  for (const a of answers) {
    if (a.selected === a.correct) correct++
    else if (a.partial_credit && a.selected === a.partial_credit) partial++
    else wrong++
  }

  const score_pct = total > 0 ? ((correct + partial * 0.5) / total) * 100 : 0

  const session: StudySession = {
    id: crypto.randomUUID(),
    user_id: user.id,
    domain,
    completed_at: new Date().toISOString(),
    total,
    correct,
    partial,
    wrong,
    score_pct,
  }

  const store = readStore()

  // Check domain sessions before pushing new one
  const existingSessions = store.study_sessions[user.id] ?? []
  const priorDomainSessions = existingSessions.filter(s => s.domain === domain)
  const isFirstDomainStudy = priorDomainSessions.length === 0
  const priorBestScore = priorDomainSessions.length > 0
    ? Math.max(...priorDomainSessions.map(s => s.score_pct))
    : null

  // Save session
  if (!store.study_sessions[user.id]) store.study_sessions[user.id] = []
  store.study_sessions[user.id].push(session)

  // --- Streak logic ---
  const today = new Date().toISOString().split('T')[0]
  const existingStreak: StreakData = store.streaks[user.id] ?? { current: 0, longest: 0, last_study_date: '' }

  let newCurrent = existingStreak.current
  if (existingStreak.last_study_date === today) {
    // Already studied today — streak unchanged
  } else {
    // Check if yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    if (existingStreak.last_study_date === yesterdayStr) {
      newCurrent = existingStreak.current + 1
    } else {
      newCurrent = 1
    }
  }
  const newLongest = Math.max(existingStreak.longest, newCurrent)
  const updatedStreak: StreakData = {
    current: newCurrent,
    longest: newLongest,
    last_study_date: today,
  }
  store.streaks[user.id] = updatedStreak

  // --- XP logic ---
  const existingXP: XPRecord = store.xp_records[user.id] ?? { total: 0, sessions_completed: 0, domains_mastered: [] }
  let xpEarned = 0

  // Per-answer XP
  xpEarned += correct * 10
  xpEarned += partial * 5

  // Session completion bonus
  xpEarned += 25

  // First time studying this domain bonus
  if (isFirstDomainStudy) {
    xpEarned += 50
  }

  // Domain mastery unlock
  const masteryUnlocked =
    score_pct >= 85 &&
    !existingXP.domains_mastered.includes(domain) &&
    (priorBestScore === null || priorBestScore < 85)

  if (masteryUnlocked) {
    xpEarned += 100
  }

  const updatedXP: XPRecord = {
    total: existingXP.total + xpEarned,
    sessions_completed: existingXP.sessions_completed + 1,
    domains_mastered: masteryUnlocked
      ? [...existingXP.domains_mastered, domain]
      : existingXP.domains_mastered,
  }
  store.xp_records[user.id] = updatedXP

  writeStore(store)

  revalidatePath('/student/study')
  revalidatePath('/student/dashboard')

  return {
    sessionId: session.id,
    xpEarned,
    newStreak: newCurrent,
    masteryUnlocked,
    streakMilestone: STREAK_MILESTONES.has(newCurrent),
  }
}
