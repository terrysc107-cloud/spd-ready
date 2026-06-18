import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  TRACK_QUESTIONS,
  type TrackQuestion,
  type TrackDomain,
} from '@/lib/local-db/track-questions'
import { HLD_QUESTIONS } from '@/lib/local-db/hld-questions'
import { ASSESSMENT_QUESTIONS } from '@/lib/local-db/questions'
import type { LearningDomain, ConceptId, ErrorCategory } from '@/lib/local-db/types'
// type-only import (erased at runtime) — avoids a dal/assessment <-> dal/questions cycle
import type { AssessmentQuestion } from '@/lib/dal/assessment'

// ============================================================
// Single read boundary for the spd_ready.questions bank.
// Maps DB rows back to the existing TrackQuestion / AssessmentQuestion
// shapes so all downstream UI + the mastery engine are untouched.
// Every read falls back to the static TS bundle if the DB is empty/errors,
// so the app never hard-fails (e.g. a fresh environment before seeding).
// ============================================================

export const HLD_PSEUDO_DOMAIN = 'HIGH_LEVEL_DISINFECTION'

type QuestionRow = {
  id: string
  kind: 'study' | 'assessment'
  stem: string
  options: Record<string, string>
  correct: string | null
  partial_credit: string | null
  score_map: Record<string, number> | null
  explanation: string
  image: string | null
  category: string | null
  track_domain: TrackDomain | null
  learning_domain: LearningDomain | null
  concept_id: string | null
  difficulty: 'foundational' | 'intermediate' | 'advanced'
  judgment_type: string | null
  error_categories: string[] | null
  real_world_standard: string | null
  created_at: string
}

function mapStudy(row: QuestionRow): TrackQuestion {
  return {
    id: row.id,
    // HLD questions carry track_domain=null; the original bank used 'STERILIZATION'
    // as the "closest legacy enum". getLearningDomain() reads learning_domain first,
    // so this fallback is cosmetic for HLD.
    domain: (row.track_domain ?? 'STERILIZATION') as TrackDomain,
    difficulty: row.difficulty,
    question: row.stem,
    options: row.options as { A: string; B: string; C: string; D: string },
    correct: (row.correct ?? 'A') as 'A' | 'B' | 'C' | 'D',
    partial_credit: (row.partial_credit ?? null) as 'A' | 'B' | 'C' | 'D' | null,
    explanation: row.explanation,
    image: row.image ?? undefined,
    judgment_type: row.judgment_type ?? undefined,
    real_world_standard: row.real_world_standard ?? undefined,
    learning_domain: row.learning_domain ?? undefined,
    concept_id: (row.concept_id ?? undefined) as ConceptId | undefined,
    error_categories: (row.error_categories ?? undefined) as ErrorCategory[] | undefined,
  }
}

function mapAssessment(row: QuestionRow): AssessmentQuestion {
  return {
    id: row.id,
    category: row.category ?? 'technical',
    type: 'multiple_choice',
    prompt: row.stem,
    options_json: row.options,
    scoring_key_json: {
      correct: row.correct ?? 'A',
      score_map: row.score_map ?? {},
    },
    active: true,
    created_at: row.created_at,
  }
}

/**
 * Study-quiz question pool for a domain key (one of the 8 TrackDomains, or the
 * HIGH_LEVEL_DISINFECTION pseudo-domain). Mirrors the old quiz page's logic.
 */
export const getStudyQuestionsForDomain = cache(
  async (domainKey: string): Promise<TrackQuestion[]> => {
    const isHld = domainKey === HLD_PSEUDO_DOMAIN
    try {
      const supabase = await createClient()
      let query = supabase
        .from('questions')
        .select('*')
        .eq('kind', 'study')
        .eq('status', 'active')
      query = isHld
        ? query.eq('learning_domain', 'high_level_disinfection')
        : query.eq('track_domain', domainKey)
      const { data, error } = await query.returns<QuestionRow[]>()
      if (error) throw error
      if (data && data.length > 0) return data.map(mapStudy)
    } catch {
      // fall through to static
    }
    return isHld
      ? (HLD_QUESTIONS as TrackQuestion[])
      : TRACK_QUESTIONS.filter(q => q.domain === (domainKey as TrackDomain))
  }
)

/** Active readiness-assessment questions (the 6-category bank). */
export const getActiveAssessmentQuestions = cache(
  async (): Promise<AssessmentQuestion[]> => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('kind', 'assessment')
        .eq('status', 'active')
        .returns<QuestionRow[]>()
      if (error) throw error
      if (data && data.length > 0) return data.map(mapAssessment)
    } catch {
      // fall through to static
    }
    return ASSESSMENT_QUESTIONS
  }
)

/** Per-TrackDomain active study-question counts (for getDomainProgress). */
export const countStudyQuestionsByTrackDomain = cache(
  async (): Promise<Record<string, number>> => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('questions')
        .select('track_domain')
        .eq('kind', 'study')
        .eq('status', 'active')
        .returns<{ track_domain: string | null }[]>()
      if (error) throw error
      if (data && data.length > 0) {
        const counts: Record<string, number> = {}
        for (const r of data) {
          if (r.track_domain) counts[r.track_domain] = (counts[r.track_domain] ?? 0) + 1
        }
        return counts
      }
    } catch {
      // fall through to static
    }
    const counts: Record<string, number> = {}
    for (const q of TRACK_QUESTIONS) counts[q.domain] = (counts[q.domain] ?? 0) + 1
    return counts
  }
)
