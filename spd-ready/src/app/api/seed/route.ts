import { NextResponse } from 'next/server'
import { writeStore, type Store } from '@/lib/local-db/store'

// POST /api/seed — wipes and re-seeds the demo store with realistic data
export async function POST() {
  const now = new Date().toISOString()

  // ── Users ────────────────────────────────────────────────────
  const h1Id = 'hosp-user-1111-1111-1111-111111111111'
  const h2Id = 'hosp-user-2222-2222-2222-222222222222'
  const adminId = 'admin-user-0000-0000-0000-000000000000'

  const s1Id = 'stu-1111-1111-1111-111111111111'
  const s2Id = 'stu-2222-2222-2222-222222222222'
  const s3Id = 'stu-3333-3333-3333-333333333333'
  const s4Id = 'stu-4444-4444-4444-444444444444'
  const s5Id = 'stu-5555-5555-5555-555555555555'
  const s6Id = 'stu-6666-6666-6666-666666666666'
  const s7Id = 'stu-7777-7777-7777-777777777777'
  const s8Id = 'stu-8888-8888-8888-888888888888'

  // ── Openings ─────────────────────────────────────────────────
  const o1Id = 'open-1111-1111-1111-111111111111'
  const o2Id = 'open-2222-2222-2222-222222222222'
  const o3Id = 'open-3333-3333-3333-333333333333'

  // ── Applications ─────────────────────────────────────────────
  const a1Id = 'app-1111-1111-1111-111111111111'
  const a2Id = 'app-2222-2222-2222-222222222222'
  const a3Id = 'app-3333-3333-3333-333333333333'
  const a4Id = 'app-4444-4444-4444-444444444444'
  const a5Id = 'app-5555-5555-5555-555555555555'
  const a6Id = 'app-6666-6666-6666-666666666666'
  const a7Id = 'app-7777-7777-7777-777777777777'
  const a8Id = 'app-8888-8888-8888-888888888888'

  const store: Store = {
    users: {
      [adminId]: { id: adminId, email: 'admin@demo.com', password: '12345678', role: 'admin' },
      [h1Id]: { id: h1Id, email: 'umcspd@demo.com', password: '12345678', role: 'hospital' },
      [h2Id]: { id: h2Id, email: 'riverside@demo.com', password: '12345678', role: 'hospital' },
      [s1Id]: { id: s1Id, email: 'maria@demo.com', password: '12345678', role: 'student' },
      [s2Id]: { id: s2Id, email: 'james@demo.com', password: '12345678', role: 'student' },
      [s3Id]: { id: s3Id, email: 'priya@demo.com', password: '12345678', role: 'student' },
      [s4Id]: { id: s4Id, email: 'carlos@demo.com', password: '12345678', role: 'student' },
      [s5Id]: { id: s5Id, email: 'aisha@demo.com', password: '12345678', role: 'student' },
      [s6Id]: { id: s6Id, email: 'david@demo.com', password: '12345678', role: 'student' },
      [s7Id]: { id: s7Id, email: 'emma@demo.com', password: '12345678', role: 'student' },
      [s8Id]: { id: s8Id, email: 'jasmine@demo.com', password: '12345678', role: 'student' },
    },

    hospital_profiles: {
      [h1Id]: {
        user_id: h1Id,
        organization_name: 'University Medical Center',
        site_name: 'UMC Main Campus SPD',
        city: 'Los Angeles',
        state: 'CA',
        facility_type: 'acute_care',
        dept_size: 'large',
        case_volume: 'high',
        complexity_level: 'advanced',
        teaching_capacity: 'strong',
        preceptor_strength: 'strong',
        extern_slots: 3,
        scheduling_preferences: 'Monday–Friday, day shift preferred',
        notes: 'Level 1 trauma center. Externs rotate through decontam, assembly, and sterile storage.',
        profile_complete: true,
        created_at: now,
        updated_at: now,
      },
      [h2Id]: {
        user_id: h2Id,
        organization_name: 'Riverside Surgery Centers',
        site_name: 'Riverside Outpatient SPD',
        city: 'Austin',
        state: 'TX',
        facility_type: 'ambulatory',
        dept_size: 'small',
        case_volume: 'medium',
        complexity_level: 'moderate',
        teaching_capacity: 'moderate',
        preceptor_strength: 'moderate',
        extern_slots: 2,
        scheduling_preferences: 'Flexible — weekday or weekend availability welcome',
        notes: 'High-volume orthopedic and general surgery. Great environment for instrument identification skills.',
        profile_complete: true,
        created_at: now,
        updated_at: now,
      },
    },

    openings: {
      [o1Id]: {
        id: o1Id,
        hospital_user_id: h1Id,
        title: 'Morning SPD Extern — Acute Care',
        start_date: '2026-05-12',
        end_date: '2026-08-08',
        slots: 2,
        shift: 'days',
        requirements: [
          'Enrolled in an accredited SPD or surgical technology program',
          'CRCST exam registration in progress preferred',
          'Reliable transportation required',
        ],
        status: 'open',
        created_at: now,
        updated_at: now,
      },
      [o2Id]: {
        id: o2Id,
        hospital_user_id: h1Id,
        title: 'Evening Decontam Extern',
        start_date: '2026-06-02',
        end_date: '2026-09-26',
        slots: 1,
        shift: 'evenings',
        requirements: [
          'Must be comfortable with high-volume decontamination workflows',
          'Physical stamina required — standing 6–8 hours',
        ],
        status: 'open',
        created_at: now,
        updated_at: now,
      },
      [o3Id]: {
        id: o3Id,
        hospital_user_id: h2Id,
        title: 'Ambulatory SPD Extern — Orthopedics',
        start_date: '2026-05-19',
        end_date: '2026-07-25',
        slots: 2,
        shift: 'days',
        requirements: [
          'Interest in orthopedic instrument sets preferred',
          'Flexible schedule — some Saturday availability helpful',
        ],
        status: 'open',
        created_at: now,
        updated_at: now,
      },
    },

    student_profiles: {
      [s1Id]: {
        user_id: s1Id,
        first_name: 'Maria',
        last_name: 'Santos',
        city: 'Los Angeles',
        state: 'CA',
        travel_radius: 30,
        cert_status: 'crcst',
        program_name: 'LA Community College SPD Program',
        expected_completion_date: '2026-05-15',
        shift_availability: ['days', 'flexible'],
        transportation_reliable: true,
        preferred_environment: 'acute_care',
        readiness_score: 87,
        readiness_tier: 1,
        strengths_json: ['technical', 'process'],
        growth_areas_json: ['instrument', 'reliability'],
        profile_complete: true,
        created_at: now,
        updated_at: now,
      },
      [s2Id]: {
        user_id: s2Id,
        first_name: 'James',
        last_name: 'Kim',
        city: 'Pasadena',
        state: 'CA',
        travel_radius: 25,
        cert_status: 'in_progress',
        program_name: 'Pasadena City College SPD',
        expected_completion_date: '2026-06-01',
        shift_availability: ['days', 'evenings'],
        transportation_reliable: true,
        preferred_environment: 'either',
        readiness_score: 81,
        readiness_tier: 1,
        strengths_json: ['situational', 'behavior'],
        growth_areas_json: ['reliability', 'instrument'],
        profile_complete: true,
        created_at: now,
        updated_at: now,
      },
      [s3Id]: {
        user_id: s3Id,
        first_name: 'Priya',
        last_name: 'Patel',
        city: 'Austin',
        state: 'TX',
        travel_radius: 20,
        cert_status: 'in_progress',
        program_name: 'Austin Community College SPD',
        expected_completion_date: '2026-05-30',
        shift_availability: ['days', 'weekends'],
        transportation_reliable: true,
        preferred_environment: 'ambulatory',
        readiness_score: 78,
        readiness_tier: 1,
        strengths_json: ['technical', 'instrument'],
        growth_areas_json: ['situational', 'reliability'],
        profile_complete: true,
        created_at: now,
        updated_at: now,
      },
      [s4Id]: {
        user_id: s4Id,
        first_name: 'Carlos',
        last_name: 'Rivera',
        city: 'Long Beach',
        state: 'CA',
        travel_radius: 35,
        cert_status: 'none',
        program_name: 'Long Beach City College SPD',
        expected_completion_date: '2026-07-15',
        shift_availability: ['evenings', 'weekends'],
        transportation_reliable: true,
        preferred_environment: 'acute_care',
        readiness_score: 67,
        readiness_tier: 2,
        strengths_json: ['process', 'behavior'],
        growth_areas_json: ['technical', 'instrument'],
        profile_complete: true,
        created_at: now,
        updated_at: now,
      },
      [s5Id]: {
        user_id: s5Id,
        first_name: 'Aisha',
        last_name: 'Johnson',
        city: 'Houston',
        state: 'TX',
        travel_radius: 25,
        cert_status: 'in_progress',
        program_name: 'Houston Community College SPD',
        expected_completion_date: '2026-06-20',
        shift_availability: ['days', 'flexible'],
        transportation_reliable: false,
        preferred_environment: 'ambulatory',
        readiness_score: 61,
        readiness_tier: 2,
        strengths_json: ['behavior', 'reliability'],
        growth_areas_json: ['technical', 'process'],
        profile_complete: true,
        created_at: now,
        updated_at: now,
      },
      [s6Id]: {
        user_id: s6Id,
        first_name: 'David',
        last_name: 'Chen',
        city: 'San Francisco',
        state: 'CA',
        travel_radius: 15,
        cert_status: 'crcst',
        program_name: 'City College of SF SPD Program',
        expected_completion_date: '2026-05-01',
        shift_availability: ['days'],
        transportation_reliable: true,
        preferred_environment: 'acute_care',
        readiness_score: 72,
        readiness_tier: 2,
        strengths_json: ['instrument', 'technical'],
        growth_areas_json: ['situational', 'behavior'],
        profile_complete: true,
        created_at: now,
        updated_at: now,
      },
      [s7Id]: {
        user_id: s7Id,
        first_name: 'Emma',
        last_name: 'Wilson',
        city: 'San Diego',
        state: 'CA',
        travel_radius: 20,
        cert_status: 'none',
        program_name: 'San Diego Mesa College SPD',
        expected_completion_date: '2026-08-01',
        shift_availability: ['evenings', 'nights'],
        transportation_reliable: true,
        preferred_environment: 'either',
        readiness_score: 48,
        readiness_tier: 3,
        strengths_json: ['behavior', 'reliability'],
        growth_areas_json: ['technical', 'instrument'],
        profile_complete: true,
        created_at: now,
        updated_at: now,
      },
      [s8Id]: {
        user_id: s8Id,
        first_name: 'Jasmine',
        last_name: 'Lee',
        city: 'Dallas',
        state: 'TX',
        travel_radius: 30,
        cert_status: 'in_progress',
        program_name: 'Dallas College SPD Program',
        expected_completion_date: '2026-06-15',
        shift_availability: ['days', 'evenings'],
        transportation_reliable: true,
        preferred_environment: 'ambulatory',
        readiness_score: 76,
        readiness_tier: 1,
        strengths_json: ['process', 'situational'],
        growth_areas_json: ['instrument', 'reliability'],
        profile_complete: true,
        created_at: now,
        updated_at: now,
      },
    },

    assessments: {
      [`assess-${s1Id}`]: {
        id: `assess-${s1Id}`, student_user_id: s1Id, status: 'completed',
        started_at: now, submitted_at: now,
        overall_score: 87, technical_score: 91, situational_score: 85,
        process_score: 89, behavior_score: 82, instrument_score: 78, reliability_score: 80,
      },
      [`assess-${s2Id}`]: {
        id: `assess-${s2Id}`, student_user_id: s2Id, status: 'completed',
        started_at: now, submitted_at: now,
        overall_score: 81, technical_score: 78, situational_score: 88,
        process_score: 80, behavior_score: 86, instrument_score: 74, reliability_score: 72,
      },
      [`assess-${s3Id}`]: {
        id: `assess-${s3Id}`, student_user_id: s3Id, status: 'completed',
        started_at: now, submitted_at: now,
        overall_score: 78, technical_score: 82, situational_score: 74,
        process_score: 77, behavior_score: 79, instrument_score: 83, reliability_score: 71,
      },
      [`assess-${s4Id}`]: {
        id: `assess-${s4Id}`, student_user_id: s4Id, status: 'completed',
        started_at: now, submitted_at: now,
        overall_score: 67, technical_score: 62, situational_score: 70,
        process_score: 72, behavior_score: 74, instrument_score: 58, reliability_score: 65,
      },
      [`assess-${s5Id}`]: {
        id: `assess-${s5Id}`, student_user_id: s5Id, status: 'completed',
        started_at: now, submitted_at: now,
        overall_score: 61, technical_score: 55, situational_score: 63,
        process_score: 60, behavior_score: 71, instrument_score: 58, reliability_score: 68,
      },
      [`assess-${s6Id}`]: {
        id: `assess-${s6Id}`, student_user_id: s6Id, status: 'completed',
        started_at: now, submitted_at: now,
        overall_score: 72, technical_score: 76, situational_score: 68,
        process_score: 71, behavior_score: 67, instrument_score: 80, reliability_score: 70,
      },
      [`assess-${s8Id}`]: {
        id: `assess-${s8Id}`, student_user_id: s8Id, status: 'completed',
        started_at: now, submitted_at: now,
        overall_score: 76, technical_score: 73, situational_score: 80,
        process_score: 78, behavior_score: 74, instrument_score: 70, reliability_score: 72,
      },
    },

    responses: {},

    applications: {
      // Opening 1 (UMC Morning — CA days) — Maria(T1,CA), James(T1,CA), Carlos(T2,CA)
      [a1Id]: {
        id: a1Id, externship_id: o1Id, student_user_id: s1Id,
        fit_score: 95, status: 'accepted',
        hospital_notes: 'Top candidate — CRCST certified, exact shift match, same state.',
        submitted_at: now,
      },
      [a2Id]: {
        id: a2Id, externship_id: o1Id, student_user_id: s2Id,
        fit_score: 88, status: 'under_review',
        hospital_notes: '',
        submitted_at: now,
      },
      [a3Id]: {
        id: a3Id, externship_id: o1Id, student_user_id: s4Id,
        fit_score: 64, status: 'applied',
        hospital_notes: '',
        submitted_at: now,
      },
      // Opening 2 (UMC Evening — CA evenings) — Carlos(T2,CA), David(T2,CA)
      [a4Id]: {
        id: a4Id, externship_id: o2Id, student_user_id: s4Id,
        fit_score: 71, status: 'applied',
        hospital_notes: '',
        submitted_at: now,
      },
      [a5Id]: {
        id: a5Id, externship_id: o2Id, student_user_id: s6Id,
        fit_score: 58, status: 'waitlisted',
        hospital_notes: 'Strong instrument scores but shift preference mismatch.',
        submitted_at: now,
      },
      // Opening 3 (Riverside Ambulatory — TX days) — Priya(T1,TX), Aisha(T2,TX), Jasmine(T1,TX)
      [a6Id]: {
        id: a6Id, externship_id: o3Id, student_user_id: s3Id,
        fit_score: 92, status: 'accepted',
        hospital_notes: 'Excellent fit — ambulatory preference, same state, weekend availability.',
        submitted_at: now,
      },
      [a7Id]: {
        id: a7Id, externship_id: o3Id, student_user_id: s5Id,
        fit_score: 73, status: 'under_review',
        hospital_notes: '',
        submitted_at: now,
      },
      [a8Id]: {
        id: a8Id, externship_id: o3Id, student_user_id: s8Id,
        fit_score: 85, status: 'applied',
        hospital_notes: '',
        submitted_at: now,
      },
    },

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

  writeStore(store)

  return NextResponse.json({ ok: true, message: 'Demo data seeded successfully.' })
}

// GET /api/seed — show login credentials for demo
export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to seed demo data. Then log in with:',
    logins: {
      admin: { email: 'admin@demo.com', password: 'any' },
      hospital_umc: { email: 'umcspd@demo.com', password: 'any' },
      hospital_riverside: { email: 'riverside@demo.com', password: 'any' },
      student_tier1: { email: 'maria@demo.com', password: 'any' },
      student_tier2: { email: 'carlos@demo.com', password: 'any' },
    },
  })
}
