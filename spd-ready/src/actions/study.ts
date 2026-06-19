'use server'

import { requireAuth } from '@/lib/dal/auth'
import { createClient } from '@/lib/supabase/server'
import type { TrackDomain } from '@/lib/local-db/track-questions'
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
  const user = await requireAuth()
  const supabase = await createClient()

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

  // Prior performance in this domain (for first-study + mastery-unlock logic)
  const { data: priorRows } = await supabase
    .from('study_sessions')
    .select('score_pct')
    .eq('staff_id', user.id)
    .eq('domain', domain)
    .returns<{ score_pct: number }[]>()
  const priorDomainSessions = priorRows ?? []
  const isFirstDomainStudy = priorDomainSessions.length === 0
  const priorBestScore = priorDomainSessions.length > 0
    ? Math.max(...priorDomainSessions.map(s => s.score_pct))
    : null

  // Save the session
  const { data: inserted, error: insErr } = await supabase
    .from('study_sessions')
    .insert({
      staff_id: user.id,
      domain,
      completed_at: new Date().toISOString(),
      total,
      correct,
      partial,
      wrong,
      score_pct,
    })
    .select('id')
    .single<{ id: string }>()
  if (insErr || !inserted) throw new Error(`saveStudySession failed: ${insErr?.message ?? 'no row'}`)

  // --- Streak logic ---
  const today = new Date().toISOString().split('T')[0]
  const { data: streakRow } = await supabase
    .from('streaks')
    .select('current, longest, last_study_date')
    .eq('staff_id', user.id)
    .maybeSingle<{ current: number; longest: number; last_study_date: string | null }>()

  const existingStreak = {
    current: streakRow?.current ?? 0,
    longest: streakRow?.longest ?? 0,
    last_study_date: streakRow?.last_study_date ?? '',
  }

  let newCurrent = existingStreak.current
  if (existingStreak.last_study_date === today) {
    // Already studied today — streak unchanged
  } else {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    newCurrent = existingStreak.last_study_date === yesterdayStr ? existingStreak.current + 1 : 1
  }
  const newLongest = Math.max(existingStreak.longest, newCurrent)
  await supabase
    .from('streaks')
    .upsert(
      { staff_id: user.id, current: newCurrent, longest: newLongest, last_study_date: today },
      { onConflict: 'staff_id' }
    )

  // --- XP logic ---
  const { data: xpRow } = await supabase
    .from('xp_records')
    .select('total, sessions_completed, domains_mastered')
    .eq('staff_id', user.id)
    .maybeSingle<{ total: number; sessions_completed: number; domains_mastered: string[] }>()
  const existingXP = {
    total: xpRow?.total ?? 0,
    sessions_completed: xpRow?.sessions_completed ?? 0,
    domains_mastered: xpRow?.domains_mastered ?? [],
  }

  let xpEarned = 0
  xpEarned += correct * 10
  xpEarned += partial * 5
  xpEarned += 25 // session completion bonus
  if (isFirstDomainStudy) xpEarned += 50

  const masteryUnlocked =
    score_pct >= 85 &&
    !existingXP.domains_mastered.includes(domain) &&
    (priorBestScore === null || priorBestScore < 85)
  if (masteryUnlocked) xpEarned += 100

  await supabase
    .from('xp_records')
    .upsert(
      {
        staff_id: user.id,
        total: existingXP.total + xpEarned,
        sessions_completed: existingXP.sessions_completed + 1,
        domains_mastered: masteryUnlocked
          ? [...existingXP.domains_mastered, domain]
          : existingXP.domains_mastered,
      },
      { onConflict: 'staff_id' }
    )

  revalidatePath('/study')
  revalidatePath('/dashboard')

  return {
    sessionId: inserted.id,
    xpEarned,
    newStreak: newCurrent,
    masteryUnlocked,
    streakMilestone: STREAK_MILESTONES.has(newCurrent),
  }
}
