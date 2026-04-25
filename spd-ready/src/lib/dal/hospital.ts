import { cache } from 'react'
import { getCurrentUser, requireRole } from '@/lib/dal/auth'
import { readStore, writeStore, DemoHospitalProfile, DemoOpening, DemoApplication } from '@/lib/local-db/store'
import { computeFitScore } from '@/lib/dal/scoring'
import { seedDemoStudents } from '@/lib/local-db/seed-demo'

// ── Types ────────────────────────────────────────────────────

export type HospitalProfileInput = {
  organization_name: string
  site_name: string
  city: string
  state: string
  facility_type: 'acute_care' | 'ambulatory' | 'long_term' | 'other'
  dept_size: 'small' | 'medium' | 'large'
  case_volume: 'low' | 'medium' | 'high'
  complexity_level: 'basic' | 'moderate' | 'advanced'
  teaching_capacity: 'limited' | 'moderate' | 'strong'
  preceptor_strength: 'limited' | 'moderate' | 'strong'
  extern_slots: number
  scheduling_preferences: string
  notes: string
}

export type OpeningInput = {
  title: string
  start_date: string
  end_date: string
  slots: number
  shift: string
  requirements: string[]
}

export type CandidateRow = {
  application: DemoApplication
  student: {
    user_id: string
    first_name: string
    last_name: string
    city: string
    state: string
    readiness_score: number | null
    readiness_tier: number | null
    strengths_json: string[] | null
    growth_areas_json: string[] | null
    cert_status: string
    program_name: string
    shift_availability: string[]
    preferred_environment: string
    transportation_reliable: boolean
  }
}

// ── Reads (cached) ────────────────────────────────────────────

export const getHospitalProfile = cache(async (): Promise<DemoHospitalProfile | null> => {
  const user = await getCurrentUser()
  if (!user) return null
  const store = readStore()
  return store.hospital_profiles[user.id] ?? null
})

export const getHospitalOpenings = cache(async (): Promise<DemoOpening[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  const store = readStore()
  return Object.values(store.openings)
    .filter(o => o.hospital_user_id === user.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
})

export const getOpening = cache(async (id: string): Promise<DemoOpening | null> => {
  const store = readStore()
  return store.openings[id] ?? null
})

export const getCandidatesForOpening = cache(async (openingId: string): Promise<CandidateRow[]> => {
  const store = readStore()
  const applications = Object.values(store.applications).filter(
    a => a.externship_id === openingId
  )
  const candidates: CandidateRow[] = []
  for (const app of applications) {
    const profile = store.student_profiles[app.student_user_id]
    if (!profile) continue
    // Only Tier 1 and Tier 2 appear in candidate list
    if (profile.readiness_tier === 3 || profile.readiness_tier === null) continue
    candidates.push({ application: app, student: profile })
  }
  // Sort by fit_score descending
  return candidates.sort((a, b) => (b.application.fit_score ?? 0) - (a.application.fit_score ?? 0))
})

export const getApplicationForCandidate = cache(async (appId: string): Promise<{
  application: DemoApplication
  opening: DemoOpening | null
  student: ReturnType<typeof readStore>['student_profiles'][string] | null
} | null> => {
  const store = readStore()
  const application = store.applications[appId]
  if (!application) return null
  const opening = store.openings[application.externship_id] ?? null
  const student = store.student_profiles[application.student_user_id] ?? null
  return { application, opening, student }
})

// ── Writes ────────────────────────────────────────────────────

export async function upsertHospitalProfile(input: HospitalProfileInput): Promise<void> {
  const user = await requireRole('hospital')
  const store = readStore()
  const now = new Date().toISOString()
  const existing = store.hospital_profiles[user.id]
  store.hospital_profiles[user.id] = {
    user_id: user.id,
    ...input,
    profile_complete: true,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  }
  writeStore(store)
}

export async function createOpening(input: OpeningInput): Promise<string> {
  const user = await requireRole('hospital')
  const store = readStore()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  store.openings[id] = {
    id,
    hospital_user_id: user.id,
    ...input,
    status: 'open',
    created_at: now,
    updated_at: now,
  }
  writeStore(store)
  return id
}

export async function updateOpeningStatus(
  openingId: string,
  status: 'open' | 'closed' | 'filled'
): Promise<void> {
  await requireRole('hospital')
  const store = readStore()
  const opening = store.openings[openingId]
  if (!opening) return
  store.openings[openingId] = { ...opening, status, updated_at: new Date().toISOString() }
  writeStore(store)
}

export async function updateApplicationStatus(
  appId: string,
  status: 'applied' | 'under_review' | 'accepted' | 'waitlisted' | 'rejected',
  notes?: string
): Promise<void> {
  await requireRole('hospital')
  const store = readStore()
  const app = store.applications[appId]
  if (!app) return
  store.applications[appId] = {
    ...app,
    status,
    hospital_notes: notes ?? app.hospital_notes,
  }
  writeStore(store)
}

// ── Hospital: all placement-ready candidates ─────────────────

export const getAllCandidates = cache(async (): Promise<Array<{
  user_id: string
  first_name: string
  last_name: string
  city: string
  state: string
  readiness_score: number
  readiness_tier: number
  technical_score: number | null
  situational_score: number | null
  process_score: number | null
  behavior_score: number | null
  instrument_score: number | null
  reliability_score: number | null
  cert_status: string
  program_name: string
  shift_availability: string[]
  preferred_environment: string
  transportation_reliable: boolean
  strengths_json: string[]
  growth_areas_json: string[]
  judgment_score: number | null
}>> => {
  // Require hospital role
  await requireRole('hospital')
  const store = readStore()

  // Seed demo students if none exist
  const seededStore = seedDemoStudents(store)
  if (seededStore !== store) writeStore(seededStore)

  // Get all profiles with tier 1 or 2, sorted by readiness_score desc
  const profiles = Object.values(seededStore.student_profiles)
    .filter(p => p.readiness_tier === 1 || p.readiness_tier === 2)
    .sort((a, b) => (b.readiness_score ?? 0) - (a.readiness_score ?? 0))

  // Merge with latest assessment scores
  return profiles.map(p => {
    const assessments = Object.values(seededStore.assessments).filter(
      a => a.student_user_id === p.user_id && a.status === 'completed'
    )
    const latest = assessments.sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''))[0]
    const judgmentSessions = (seededStore.study_sessions[p.user_id] ?? []).filter(
      s => s.domain === 'SPD_JUDGMENT'
    )
    const judgment_score = judgmentSessions.length > 0
      ? Math.max(...judgmentSessions.map(s => s.score_pct))
      : null
    return {
      user_id: p.user_id,
      first_name: p.first_name,
      last_name: p.last_name,
      city: p.city,
      state: p.state,
      readiness_score: p.readiness_score ?? 0,
      readiness_tier: p.readiness_tier ?? 3,
      technical_score: latest?.technical_score ?? null,
      situational_score: latest?.situational_score ?? null,
      process_score: latest?.process_score ?? null,
      behavior_score: latest?.behavior_score ?? null,
      instrument_score: latest?.instrument_score ?? null,
      reliability_score: latest?.reliability_score ?? null,
      cert_status: p.cert_status,
      program_name: p.program_name,
      shift_availability: p.shift_availability,
      preferred_environment: p.preferred_environment,
      transportation_reliable: p.transportation_reliable,
      strengths_json: p.strengths_json ?? [],
      growth_areas_json: p.growth_areas_json ?? [],
      judgment_score,
    }
  })
})

// ── Student-facing: get open openings ────────────────────────

export async function getOpenOpenings(): Promise<Array<DemoOpening & { hospital_site_name: string; hospital_city: string; hospital_state: string }>> {
  const store = readStore()
  const openings = Object.values(store.openings).filter(o => o.status === 'open')
  return openings.map(o => {
    const hp = store.hospital_profiles[o.hospital_user_id]
    return {
      ...o,
      hospital_site_name: hp?.site_name ?? 'Unknown',
      hospital_city: hp?.city ?? '',
      hospital_state: hp?.state ?? '',
    }
  }).sort((a, b) => b.created_at.localeCompare(a.created_at))
}

// ── Student-facing: apply to opening ────────────────────────

export async function applyToOpening(openingId: string): Promise<{ error?: string }> {
  const user = await requireRole('student')
  const store = readStore()

  const opening = store.openings[openingId]
  if (!opening || opening.status !== 'open') return { error: 'This opening is no longer available.' }

  // Check if already applied
  const alreadyApplied = Object.values(store.applications).some(
    a => a.externship_id === openingId && a.student_user_id === user.id
  )
  if (alreadyApplied) return { error: 'You have already applied to this opening.' }

  // Get student profile for fit score
  const profile = store.student_profiles[user.id]
  if (!profile?.profile_complete || !profile.readiness_score) {
    return { error: 'Complete your profile and readiness assessment before applying.' }
  }
  if ((profile.readiness_tier ?? 3) === 3) {
    return { error: 'Tier 3 students are not eligible to apply. Retake the assessment after focused study.' }
  }

  const hospital = store.hospital_profiles[opening.hospital_user_id]

  const fitScore = computeFitScore({
    readiness_tier: profile.readiness_tier,
    student_state: profile.state,
    hospital_state: hospital?.state ?? '',
    shift_availability: profile.shift_availability,
    opening_shift: opening.shift,
    preferred_environment: profile.preferred_environment,
    facility_type: hospital?.facility_type ?? '',
  })

  const id = crypto.randomUUID()
  store.applications[id] = {
    id,
    externship_id: openingId,
    student_user_id: user.id,
    fit_score: fitScore,
    status: 'applied',
    hospital_notes: '',
    submitted_at: new Date().toISOString(),
  }
  writeStore(store)
  return {}
}
