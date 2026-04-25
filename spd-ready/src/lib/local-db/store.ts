import fs from 'fs'
import path from 'path'
import type { TrackDomain } from '@/lib/local-db/track-questions'
import type { DomainAssessment, ConceptMastery, ModuleAssignment, HospitalCohortMember, Certificate, ConfidenceTap } from '@/lib/local-db/types'

// On Vercel the project root is read-only — use /tmp instead
const IS_VERCEL = Boolean(process.env.VERCEL)
const DATA_DIR = IS_VERCEL
  ? '/tmp/.demo-data'
  : path.join(process.cwd(), '.demo-data')
const STORE_FILE = path.join(DATA_DIR, 'store.json')

// Pre-seeded demo accounts baked into the bundle so the exec demo
// works on Vercel even after a cold start wipes /tmp
const DEMO_SEED_USERS: Store['users'] = {
  'demo-hospital-001': { id: 'demo-hospital-001', email: 'coordinator@demo.com', password: '12345678', role: 'hospital' },
  'demo-student-login': { id: 'demo-student-login', email: 'student@demo.com', password: '12345678', role: 'student' },
}
const DEMO_SEED_HOSPITAL: Store['hospital_profiles'] = {
  'demo-hospital-001': {
    user_id: 'demo-hospital-001',
    organization_name: 'Metro Health System',
    site_name: 'Metro General Hospital — Sterile Processing',
    city: 'Chicago',
    state: 'IL',
    facility_type: 'acute_care',
    dept_size: 'large',
    case_volume: 'high',
    complexity_level: 'advanced',
    teaching_capacity: 'strong',
    preceptor_strength: 'strong',
    extern_slots: 4,
    scheduling_preferences: 'Days and evenings preferred',
    notes: 'Building a consistent extern pipeline through SPD Ready',
    profile_complete: true,
    created_at: '2025-04-01T10:00:00.000Z',
    updated_at: '2025-04-01T10:00:00.000Z',
  },
}

export type DemoUser = {
  id: string
  email: string
  password: string
  role: 'student' | 'hospital' | 'admin'
}

export type DemoStudentProfile = {
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

export type DemoAssessment = {
  id: string
  student_user_id: string
  status: 'in_progress' | 'completed'
  started_at: string
  submitted_at: string | null
  overall_score: number | null
  technical_score: number | null
  situational_score: number | null
  process_score: number | null
  behavior_score: number | null
  instrument_score: number | null
  reliability_score: number | null
}

export type DemoResponse = {
  assessment_id: string
  question_id: string
  selected_answer: string
  score: number
  category: string
}

export type DemoHospitalProfile = {
  user_id: string
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
  profile_complete: boolean
  created_at: string
  updated_at: string
}

export type DemoOpening = {
  id: string
  hospital_user_id: string
  title: string
  start_date: string
  end_date: string
  slots: number
  shift: string
  requirements: string[]
  status: 'open' | 'closed' | 'filled'
  created_at: string
  updated_at: string
}

export type DemoApplication = {
  id: string
  externship_id: string
  student_user_id: string
  fit_score: number | null
  status: 'applied' | 'under_review' | 'accepted' | 'waitlisted' | 'rejected'
  hospital_notes: string
  submitted_at: string
}

export type DemoFeedback = {
  id: string
  application_id: string
  attendance_score: number
  coachability_score: number
  professionalism_score: number
  communication_score: number
  quality_score: number
  recommended: boolean
  notes: string
  created_at: string
}

export type StudySession = {
  id: string
  user_id: string
  domain: TrackDomain
  completed_at: string
  total: number
  correct: number
  partial: number
  wrong: number
  score_pct: number // (correct + partial * 0.5) / total * 100
}

export type StreakData = {
  current: number      // current consecutive day streak
  longest: number      // all-time longest streak
  last_study_date: string // 'YYYY-MM-DD' format
}

export type XPRecord = {
  total: number
  sessions_completed: number
  domains_mastered: string[]  // domain keys where badge was earned
}

export type Store = {
  users: Record<string, DemoUser>
  student_profiles: Record<string, DemoStudentProfile>
  assessments: Record<string, DemoAssessment>
  responses: Record<string, DemoResponse[]>
  hospital_profiles: Record<string, DemoHospitalProfile>
  openings: Record<string, DemoOpening>
  applications: Record<string, DemoApplication>
  feedback: Record<string, DemoFeedback>
  study_sessions: Record<string, StudySession[]>
  streaks: Record<string, StreakData>    // keyed by user_id
  xp_records: Record<string, XPRecord>  // keyed by user_id
  // Phase 6: learning engine tables (D-32)
  domain_assessments: Record<string, DomainAssessment[]>          // by user_id
  concept_mastery: Record<string, ConceptMastery[]>               // by user_id
  confidence_taps: Record<string, Record<string, ConfidenceTap>>  // user_id -> question_id -> tap
  module_assignments: ModuleAssignment[]
  hospital_cohort: HospitalCohortMember[]
  certificates: Certificate[]
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function readStore(): Store {
  ensureDir()

  const base: Store = {
    users: { ...DEMO_SEED_USERS },
    student_profiles: {},
    assessments: {},
    responses: {},
    hospital_profiles: { ...DEMO_SEED_HOSPITAL },
    openings: {},
    applications: {},
    feedback: {},
    study_sessions: {},
    streaks: {},
    xp_records: {},
    domain_assessments: {},
    concept_mastery: {},
    confidence_taps: {},
    module_assignments: [],
    hospital_cohort: [],
    certificates: [],
  }

  if (!fs.existsSync(STORE_FILE)) return base

  try {
    const raw = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as Partial<Store>
    return {
      users: { ...DEMO_SEED_USERS, ...(raw.users ?? {}) },
      student_profiles: raw.student_profiles ?? {},
      assessments: raw.assessments ?? {},
      responses: raw.responses ?? {},
      hospital_profiles: { ...DEMO_SEED_HOSPITAL, ...(raw.hospital_profiles ?? {}) },
      openings: raw.openings ?? {},
      applications: raw.applications ?? {},
      feedback: raw.feedback ?? {},
      study_sessions: raw.study_sessions ?? {},
      streaks: raw.streaks ?? {},
      xp_records: raw.xp_records ?? {},
      domain_assessments: raw.domain_assessments ?? {},
      concept_mastery: raw.concept_mastery ?? {},
      confidence_taps: raw.confidence_taps ?? {},
      module_assignments: raw.module_assignments ?? [],
      hospital_cohort: raw.hospital_cohort ?? [],
      certificates: raw.certificates ?? [],
    }
  } catch {
    return base
  }
}

export function writeStore(store: Store): void {
  ensureDir()
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2))
}
