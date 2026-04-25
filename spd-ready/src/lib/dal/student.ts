import { cache } from 'react'
import { getCurrentUser, requireRole } from '@/lib/dal/auth'
import { readStore, writeStore } from '@/lib/local-db/store'

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
  const user = await getCurrentUser()
  if (!user) return null
  const store = readStore()
  const profile = store.student_profiles[user.id]
  if (!profile) return null
  return { id: user.id, ...profile } as StudentProfile
})

export const getApplications = cache(async (): Promise<ApplicationRow[]> => {
  const user = await getCurrentUser()
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
  const user = await requireRole('student')
  const store = readStore()
  const now = new Date().toISOString()
  const existing = store.student_profiles[user.id]
  store.student_profiles[user.id] = {
    user_id: user.id,
    ...input,
    readiness_score: existing?.readiness_score ?? null,
    readiness_tier: existing?.readiness_tier ?? null,
    strengths_json: existing?.strengths_json ?? null,
    growth_areas_json: existing?.growth_areas_json ?? null,
    profile_complete: true,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  }
  writeStore(store)
}
