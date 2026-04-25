import type { Store } from '@/lib/local-db/store'

/**
 * Seeds 5 demo students designed to show the scoring formula in action.
 *
 * The headline demo moment: Devon Carter has the highest technical score on
 * the board (85%) but a 38% judgment score. SPD Ready catches what a resume never could.
 *
 * Idempotent — skips if demo-student-001 already has a tier.
 */
export function seedDemoStudents(store: Store): Store {
  if (store.student_profiles['demo-student-001']?.readiness_tier != null) {
    return store
  }

  const now = new Date().toISOString()

  // ── Users ────────────────────────────────────────────────────────────────────
  const newUsers: Store['users'] = {
    'demo-student-001': { id: 'demo-student-001', email: 'alex.rivera@demo.com',   password: '12345678', role: 'student' },
    'demo-student-002': { id: 'demo-student-002', email: 'jasmine.lee@demo.com',   password: '12345678', role: 'student' },
    'demo-student-003': { id: 'demo-student-003', email: 'devon.carter@demo.com',  password: '12345678', role: 'student' },
    'demo-student-004': { id: 'demo-student-004', email: 'maria.santos@demo.com',  password: '12345678', role: 'student' },
    'demo-student-005': { id: 'demo-student-005', email: 'chris.morgan@demo.com',  password: '12345678', role: 'student' },
  }

  // ── Student Profiles ─────────────────────────────────────────────────────────
  //
  // Formula: technical*0.30 + situational*0.25 + process*0.15 + behavior*0.15
  //          + instrument*0.10 + reliability*0.05
  //
  // Student 1 — Alex Rivera — Tier 1 — 82.5% overall, 85% judgment
  //   Strong across the board. Shows what a ready student looks like.
  //
  // Student 2 — Jasmine Lee — Tier 1 — 79.2% overall, 78% judgment
  //   Process and behavior strengths. Reliable, coachable, well-rounded.
  //
  // Student 3 — Devon Carter — Tier 2 — 67.6% overall, 38% JUDGMENT ← KEY
  //   Highest technical score on the board (85%). Every traditional metric
  //   says "hire Devon." The judgment score tells a different story.
  //   Devon knows the work but skips steps under pressure.
  //
  // Student 4 — Maria Santos — Tier 2 — 63.8% overall, 71% judgment
  //   Developing technical skills but strong professional judgment.
  //   Coachable — will improve fast with support.
  //
  // Student 5 — Chris Morgan — Tier 3 — 47.2% overall, 52% judgment
  //   Early stage. Needs foundational work across all domains.

  const newProfiles: Store['student_profiles'] = {
    'demo-student-001': {
      user_id: 'demo-student-001',
      first_name: 'Alex',
      last_name: 'Rivera',
      city: 'Chicago',
      state: 'IL',
      travel_radius: 25,
      cert_status: 'in_progress',
      program_name: 'SPD Certification Program',
      expected_completion_date: '2025-06-15',
      shift_availability: ['days', 'evenings'],
      transportation_reliable: true,
      preferred_environment: 'acute_care',
      // technical:88 * 0.30 = 26.4
      // situational:82 * 0.25 = 20.5
      // process:78   * 0.15 = 11.7
      // behavior:80  * 0.15 = 12.0
      // instrument:75* 0.10 =  7.5
      // reliability:88*0.05 =  4.4  → 82.5
      readiness_score: 82.5,
      readiness_tier: 1,
      strengths_json: ['technical', 'situational', 'reliability'],
      growth_areas_json: ['instrument'],
      profile_complete: true,
      created_at: now,
      updated_at: now,
    },
    'demo-student-002': {
      user_id: 'demo-student-002',
      first_name: 'Jasmine',
      last_name: 'Lee',
      city: 'Atlanta',
      state: 'GA',
      travel_radius: 20,
      cert_status: 'none',
      program_name: 'SPD Certification Program',
      expected_completion_date: '2025-05-30',
      shift_availability: ['days'],
      transportation_reliable: true,
      preferred_environment: 'acute_care',
      // technical:76 * 0.30 = 22.8
      // situational:79*0.25 = 19.75
      // process:82  * 0.15 = 12.3
      // behavior:85 * 0.15 = 12.75
      // instrument:70*0.10 =  7.0
      // reliability:92*0.05=  4.6  → 79.2
      readiness_score: 79.2,
      readiness_tier: 1,
      strengths_json: ['process', 'behavior', 'reliability'],
      growth_areas_json: ['instrument', 'technical'],
      profile_complete: true,
      created_at: now,
      updated_at: now,
    },
    'demo-student-003': {
      user_id: 'demo-student-003',
      first_name: 'Devon',
      last_name: 'Carter',
      city: 'Houston',
      state: 'TX',
      travel_radius: 30,
      cert_status: 'none',
      program_name: 'SPD Certification Program',
      expected_completion_date: '2025-07-01',
      shift_availability: ['days', 'evenings'],
      transportation_reliable: true,
      preferred_environment: 'either',
      // technical:85 * 0.30 = 25.5  ← highest technical on the board
      // situational:58*0.25 = 14.5
      // process:62  * 0.15 =  9.3
      // behavior:55 * 0.15 =  8.25
      // instrument:68*0.10 =  6.8
      // reliability:65*0.05=  3.25 → 67.6
      // judgment score: 38% ← the signal
      readiness_score: 67.6,
      readiness_tier: 2,
      strengths_json: ['technical', 'instrument'],
      growth_areas_json: ['situational', 'behavior', 'process'],
      profile_complete: true,
      created_at: now,
      updated_at: now,
    },
    'demo-student-004': {
      user_id: 'demo-student-004',
      first_name: 'Maria',
      last_name: 'Santos',
      city: 'Dallas',
      state: 'TX',
      travel_radius: 15,
      cert_status: 'none',
      program_name: 'SPD Certification Program',
      expected_completion_date: '2025-08-15',
      shift_availability: ['evenings', 'nights'],
      transportation_reliable: true,
      preferred_environment: 'ambulatory',
      // technical:63 * 0.30 = 18.9
      // situational:62*0.25 = 15.5
      // process:68  * 0.15 = 10.2
      // behavior:65 * 0.15 =  9.75
      // instrument:58*0.10 =  5.8
      // reliability:72*0.05=  3.6  → 63.75
      // judgment score: 71% ← strong judgment despite lower technical
      readiness_score: 63.75,
      readiness_tier: 2,
      strengths_json: ['process', 'behavior'],
      growth_areas_json: ['technical', 'instrument'],
      profile_complete: true,
      created_at: now,
      updated_at: now,
    },
    'demo-student-005': {
      user_id: 'demo-student-005',
      first_name: 'Chris',
      last_name: 'Morgan',
      city: 'Phoenix',
      state: 'AZ',
      travel_radius: 10,
      cert_status: 'none',
      program_name: 'SPD Certification Program',
      expected_completion_date: '2025-09-01',
      shift_availability: ['nights'],
      transportation_reliable: true,
      preferred_environment: 'either',
      // technical:46 * 0.30 = 13.8
      // situational:44*0.25 = 11.0
      // process:52  * 0.15 =  7.8
      // behavior:50 * 0.15 =  7.5
      // instrument:42*0.10 =  4.2
      // reliability:58*0.05=  2.9  → 47.2
      readiness_score: 47.2,
      readiness_tier: 3,
      strengths_json: ['process'],
      growth_areas_json: ['technical', 'situational', 'instrument', 'behavior'],
      profile_complete: true,
      created_at: now,
      updated_at: now,
    },
  }

  // ── Assessments ──────────────────────────────────────────────────────────────
  const newAssessments: Store['assessments'] = {
    'demo-assessment-001': {
      id: 'demo-assessment-001',
      student_user_id: 'demo-student-001',
      status: 'completed',
      started_at: '2025-04-10T09:00:00.000Z',
      submitted_at: '2025-04-10T09:32:00.000Z',
      overall_score: 82.5,
      technical_score: 88,
      situational_score: 82,
      process_score: 78,
      behavior_score: 80,
      instrument_score: 75,
      reliability_score: 88,
    },
    'demo-assessment-002': {
      id: 'demo-assessment-002',
      student_user_id: 'demo-student-002',
      status: 'completed',
      started_at: '2025-04-11T10:00:00.000Z',
      submitted_at: '2025-04-11T10:28:00.000Z',
      overall_score: 79.2,
      technical_score: 76,
      situational_score: 79,
      process_score: 82,
      behavior_score: 85,
      instrument_score: 70,
      reliability_score: 92,
    },
    'demo-assessment-003': {
      id: 'demo-assessment-003',
      student_user_id: 'demo-student-003',
      status: 'completed',
      started_at: '2025-04-12T14:00:00.000Z',
      submitted_at: '2025-04-12T14:30:00.000Z',
      overall_score: 67.6,
      technical_score: 85,   // ← highest technical
      situational_score: 58,
      process_score: 62,
      behavior_score: 55,
      instrument_score: 68,
      reliability_score: 65,
    },
    'demo-assessment-004': {
      id: 'demo-assessment-004',
      student_user_id: 'demo-student-004',
      status: 'completed',
      started_at: '2025-04-13T11:00:00.000Z',
      submitted_at: '2025-04-13T11:26:00.000Z',
      overall_score: 63.75,
      technical_score: 63,
      situational_score: 62,
      process_score: 68,
      behavior_score: 65,
      instrument_score: 58,
      reliability_score: 72,
    },
    'demo-assessment-005': {
      id: 'demo-assessment-005',
      student_user_id: 'demo-student-005',
      status: 'completed',
      started_at: '2025-04-14T08:00:00.000Z',
      submitted_at: '2025-04-14T08:24:00.000Z',
      overall_score: 47.2,
      technical_score: 46,
      situational_score: 44,
      process_score: 52,
      behavior_score: 50,
      instrument_score: 42,
      reliability_score: 58,
    },
  }

  // ── Judgment study sessions — baked in to show the two-score system ──────────
  // Devon (demo-student-003) has judgment 38% — the key demo contrast
  // Maria (demo-student-004) has judgment 71% — strong judgment, weaker technical
  const newStudySessions: Store['study_sessions'] = {
    'demo-student-001': [{
      id: 'demo-session-j-001',
      user_id: 'demo-student-001',
      domain: 'SPD_JUDGMENT',
      completed_at: '2025-04-15T10:00:00.000Z',
      total: 15, correct: 12, partial: 1, wrong: 2,
      score_pct: 85,
    }],
    'demo-student-002': [{
      id: 'demo-session-j-002',
      user_id: 'demo-student-002',
      domain: 'SPD_JUDGMENT',
      completed_at: '2025-04-15T11:00:00.000Z',
      total: 15, correct: 11, partial: 1, wrong: 3,
      score_pct: 78,
    }],
    'demo-student-003': [{
      id: 'demo-session-j-003',
      user_id: 'demo-student-003',
      domain: 'SPD_JUDGMENT',
      completed_at: '2025-04-15T12:00:00.000Z',
      total: 15, correct: 5, partial: 1, wrong: 9,
      score_pct: 38,  // ← the signal: high technical, terrible judgment
    }],
    'demo-student-004': [{
      id: 'demo-session-j-004',
      user_id: 'demo-student-004',
      domain: 'SPD_JUDGMENT',
      completed_at: '2025-04-15T13:00:00.000Z',
      total: 15, correct: 10, partial: 1, wrong: 4,
      score_pct: 71,  // ← strong judgment despite lower overall score
    }],
  }

  return {
    ...store,
    users: { ...store.users, ...newUsers },
    student_profiles: { ...store.student_profiles, ...newProfiles },
    assessments: { ...store.assessments, ...newAssessments },
    study_sessions: { ...store.study_sessions, ...newStudySessions },
  }
}
