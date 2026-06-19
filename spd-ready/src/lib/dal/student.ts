import { cache } from 'react'
import { getAuthUser, requireAuth } from '@/lib/dal/auth'
import { createClient } from '@/lib/supabase/server'
import { readStore } from '@/lib/local-db/store'

// ── Types ────────────────────────────────────────────────────
export type StudentProfile = {
  id: string
  user_id: string
  first_name: string
  last_name: string
  city: string
  state: string
  travel_radius: number
  cert_status: string
  program_name: string
  expected_completion_date: string
  shift_availability: string[]
  transportation_reliable: boolean
  preferred_environment: string
  readiness_score: number | null
  readiness_tier: number | null
  strengths_json: string[] | null
  growth_areas_json: string[] | null
  profile_complete: boolean
  created_at: string
  updated_at: string
}

type StudentProfileRow = {
  staff_id: string
  first_name: string | null
  last_name: string | null
  city: string | null
  state: string | null
  travel_radius: number | null
  cert_status: string | null
  program_name: string | null
  expected_completion_date: string | null
  shift_availability: string[] | null
  transportation_reliable: boolean | null
  preferred_environment: string | null
  readiness_score: number | null
  readiness_tier: number | null
  strengths_json: string[] | null
  growth_areas_json: string[] | null
  profile_complete: boolean
  created_at: string
  updated_at: string
}

function mapProfile(r: StudentProfileRow): StudentProfile {
  return {
    id: r.staff_id,
    user_id: r.staff_id,
    first_name: r.first_name ?? '',
    last_name: r.last_name ?? '',
    city: r.city ?? '',
    state: r.state ?? '',
    travel_radius: r.travel_radius ?? 0,
    cert_status: r.cert_status ?? 'none',
    program_name: r.program_name ?? '',
    expected_completion_date: r.expected_completion_date ?? '',
    shift_availability: r.shift_availability ?? [],
    transportation_reliable: r.transportation_reliable ?? true,
    preferred_environment: r.preferred_environment ?? 'either',
    readiness_score: r.readiness_score,
    readiness_tier: r.readiness_tier,
    strengths_json: r.strengths_json,
    growth_areas_json: r.growth_areas_json,
    profile_complete: r.profile_complete,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }
}

export type StudentProfileInput = {
  first_name: string
  last_name: string
  city: string
  state: string
  travel_radius: number
  cert_status: string
  program_name: string
  expected_completion_date: string
  shift_availability: string[]
  transportation_reliable: boolean
  preferred_environment: string
}

export type ApplicationRow = {
  id: string
  opening_id: string
  status: 'applied' | 'under_review' | 'accepted' | 'waitlisted' | 'rejected'
  fit_score: number | null
  created_at: string
  externship_openings: {
    title: string
    hospital_profiles: {
      site_name: string
    }
  }
}

export const getStudentProfile = cache(async (): Promise<StudentProfile | null> => {
  const user = await getAuthUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('staff_id', user.id)
    .maybeSingle<StudentProfileRow>()
  return data ? mapProfile(data) : null
})

export const getApplications = cache(async (): Promise<ApplicationRow[]> => {
  const user = await getAuthUser()
  if (!user) return []
  const store = readStore()
  const apps = Object.values(store.applications).filter(a => a.student_user_id === user.id)
  return apps
    .map(app => {
      const opening = store.openings?.[app.externship_id]
      const hospital = opening ? store.hospital_profiles?.[opening.hospital_user_id] : undefined
      return {
        id: app.id,
        opening_id: app.externship_id,
        status: app.status,
        fit_score: app.fit_score,
        created_at: app.submitted_at,
        externship_openings: {
          title: opening?.title ?? 'Unknown Opening',
          hospital_profiles: { site_name: hospital?.site_name ?? 'Unknown Site' },
        },
      }
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
})

export async function upsertStudentProfile(input: StudentProfileInput): Promise<void> {
  const user = await requireAuth()
  const supabase = await createClient()
  // Only the demographic fields + profile_complete are written here; the
  // readiness columns are intentionally omitted so a profile edit never wipes
  // an existing readiness_score/tier (preserved on the ON CONFLICT update).
  const { error } = await supabase.from('student_profiles').upsert(
    {
      staff_id: user.id,
      first_name: input.first_name,
      last_name: input.last_name,
      city: input.city,
      state: input.state,
      travel_radius: input.travel_radius,
      cert_status: input.cert_status,
      program_name: input.program_name,
      expected_completion_date: input.expected_completion_date,
      shift_availability: input.shift_availability,
      transportation_reliable: input.transportation_reliable,
      preferred_environment: input.preferred_environment,
      profile_complete: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'staff_id' }
  )
  if (error) throw new Error(`Failed to save profile: ${error.message}`)
}

// Stamp the computed readiness onto the student's profile (called after an
// assessment is finalized). Leaves the demographic fields untouched.
export async function updateReadinessOnProfile(params: {
  readinessScore: number
  readinessTier: number
  strengths: string[]
  growthAreas: string[]
}): Promise<void> {
  const user = await requireAuth()
  const supabase = await createClient()
  const { error } = await supabase
    .from('student_profiles')
    .update({
      readiness_score: params.readinessScore,
      readiness_tier: params.readinessTier,
      strengths_json: params.strengths,
      growth_areas_json: params.growthAreas,
      updated_at: new Date().toISOString(),
    })
    .eq('staff_id', user.id)
  if (error) throw new Error(`Failed to save readiness: ${error.message}`)
}
