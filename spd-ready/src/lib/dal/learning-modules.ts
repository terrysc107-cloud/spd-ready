import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getConceptMastery } from '@/lib/dal/mastery'
import { rankModulesByWeakness, type MasterySignal } from '@/lib/dal/learning-modules-logic'
import type { LearningDomain } from '@/lib/local-db/types'

// ============================================================
// Learning Modules DAL (Phase A/B). Reads the global learning_modules
// content table (RLS: authenticated read active) + the staff-owned
// module_completions. recommendModules() is the adaptive feed: it ranks
// active modules against the tech's weakest/due concept mastery.
// ============================================================

export type ModuleSection = {
  heading: string
  body: string
  image_url?: string | null
  video_url?: string | null
}

export type LearningModule = {
  id: string
  slug: string
  domain: LearningDomain
  concept_ids: string[]
  title: string
  summary: string | null
  objectives: string[]
  sections: ModuleSection[]
  check_question_ids: string[]
  estimated_minutes: number | null
  difficulty: 'foundational' | 'intermediate' | 'advanced'
  status: string
}

export type ModuleCompletion = {
  id: string
  module_id: string
  staff_id: string
  started_at: string
  completed_at: string | null
  score_pct: number | null
}

type ModuleRow = {
  id: string
  slug: string
  domain: LearningDomain
  concept_ids: string[] | null
  title: string
  summary: string | null
  objectives: string[] | null
  sections: ModuleSection[] | null
  check_question_ids: string[] | null
  estimated_minutes: number | null
  difficulty: 'foundational' | 'intermediate' | 'advanced'
  status: string
}

function mapModule(r: ModuleRow): LearningModule {
  return {
    id: r.id,
    slug: r.slug,
    domain: r.domain,
    concept_ids: r.concept_ids ?? [],
    title: r.title,
    summary: r.summary,
    objectives: r.objectives ?? [],
    sections: r.sections ?? [],
    check_question_ids: r.check_question_ids ?? [],
    estimated_minutes: r.estimated_minutes,
    difficulty: r.difficulty,
    status: r.status,
  }
}

export const getActiveModules = cache(async (): Promise<LearningModule[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('learning_modules')
    .select('*')
    .eq('status', 'active')
    .order('domain')
    .returns<ModuleRow[]>()
  return (data ?? []).map(mapModule)
})

export const getModuleBySlug = cache(async (slug: string): Promise<LearningModule | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('learning_modules')
    .select('*')
    .eq('slug', slug)
    .maybeSingle<ModuleRow>()
  return data ? mapModule(data) : null
})

export const getModuleCompletions = cache(async (userId: string): Promise<ModuleCompletion[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('module_completions')
    .select('*')
    .eq('staff_id', userId)
    .returns<ModuleCompletion[]>()
  return data ?? []
})

// Upsert a tech's progress on a module. Called when the check quiz finishes
// (completed=true) so it lands as the system-of-record completion.
export async function recordModuleCompletion(params: {
  userId: string
  moduleId: string
  scorePct: number
  completed: boolean
}): Promise<void> {
  const { userId, moduleId, scorePct, completed } = params
  const supabase = await createClient()
  const nowIso = new Date().toISOString()
  await supabase.from('module_completions').upsert(
    {
      staff_id: userId,
      module_id: moduleId,
      score_pct: scorePct,
      completed_at: completed ? nowIso : null,
      updated_at: nowIso,
    },
    { onConflict: 'module_id,staff_id' }
  )
}

export type RecommendedModule = LearningModule & {
  recommendationReason: string
  isDue: boolean
  completed: boolean
}

// The adaptive feed. Ranks active modules by the tech's weakest/due concepts.
export const recommendModules = cache(async (userId: string, limit = 4): Promise<RecommendedModule[]> => {
  const [modules, masteries, completions] = await Promise.all([
    getActiveModules(),
    getConceptMastery(userId),
    getModuleCompletions(userId),
  ])
  if (modules.length === 0) return []

  const now = Date.now()
  const signals: MasterySignal[] = masteries.map((m) => ({
    concept_id: m.concept_id,
    domain: m.domain,
    mastery_score: m.mastery_score,
    due: new Date(m.next_review_at).getTime() <= now,
  }))
  const completedIds = new Set(completions.filter((c) => c.completed_at !== null).map((c) => c.module_id))

  const ranked = rankModulesByWeakness(modules, signals, completedIds, limit)
  const masteryByConcept = new Map(masteries.map((m) => [m.concept_id, m.mastery_score]))

  return ranked.map(({ module, isDue, matchedConceptIds }) => {
    let reason: string
    if (isDue) {
      reason = 'Due for review — keep this fresh'
    } else if (matchedConceptIds.length > 0) {
      // name the weakest matched concept's gap
      const weakest = matchedConceptIds
        .map((c) => masteryByConcept.get(c) ?? 0)
        .sort((a, b) => a - b)[0]
      reason = `Targets a weak area (mastery ${Math.round(weakest)}%)`
    } else {
      reason = 'Recommended next for your domain'
    }
    return {
      ...module,
      recommendationReason: reason,
      isDue,
      completed: completedIds.has(module.id),
    }
  })
})
