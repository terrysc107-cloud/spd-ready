-- ============================================================
-- SPD Ready — Initial Schema
-- Migration: 001_initial_schema.sql
-- Creates all 9 application tables in FK dependency order
-- ============================================================

-- users (extends auth.users — must exist before all profile tables)
create table if not exists public.users (
  id         uuid references auth.users(id) on delete cascade primary key,
  email      text not null,
  role       text not null check (role in ('student', 'hospital', 'admin')),
  created_at timestamptz default now()
);

-- student_profiles
create table if not exists public.student_profiles (
  id                        uuid         default gen_random_uuid() primary key,
  user_id                   uuid         references public.users(id) on delete cascade unique not null,
  first_name                text         not null,
  last_name                 text         not null,
  city                      text         not null,
  state                     text         not null,
  travel_radius_miles       integer      not null default 25,
  certification_status      text         not null,
  program_name              text,
  expected_completion_date  date,
  availability_json         jsonb        default '{}',
  transportation_reliability text        not null,
  preferred_environment     text,
  readiness_score           numeric(5,2),
  readiness_tier            integer      check (readiness_tier in (1, 2, 3)),
  summary                   text,
  strengths_json            jsonb        default '[]',
  growth_areas_json         jsonb        default '[]',
  profile_complete          boolean      default false,
  created_at                timestamptz  default now(),
  updated_at                timestamptz  default now()
);

-- assessment_questions (static question bank — no FK to users)
create table if not exists public.assessment_questions (
  id               uuid   default gen_random_uuid() primary key,
  category         text   not null check (category in ('technical', 'situational', 'process', 'behavioral', 'instrument', 'reliability')),
  type             text   not null default 'multiple_choice',
  prompt           text   not null,
  options_json     jsonb  not null,
  scoring_key_json jsonb  not null,
  active           boolean default true,
  created_at       timestamptz default now()
);

-- student_assessments (FK to users — must come after users)
create table if not exists public.student_assessments (
  id                uuid         default gen_random_uuid() primary key,
  student_user_id   uuid         references public.users(id) on delete cascade not null,
  status            text         not null default 'in_progress' check (status in ('in_progress', 'completed')),
  started_at        timestamptz  default now(),
  submitted_at      timestamptz,
  technical_score   numeric(5,2),
  situational_score numeric(5,2),
  process_score     numeric(5,2),
  behavior_score    numeric(5,2),
  instrument_score  numeric(5,2),
  reliability_score numeric(5,2),
  overall_score     numeric(5,2),
  created_at        timestamptz  default now()
);

-- assessment_responses (FK to student_assessments AND assessment_questions)
create table if not exists public.assessment_responses (
  id            uuid         default gen_random_uuid() primary key,
  assessment_id uuid         references public.student_assessments(id) on delete cascade not null,
  question_id   uuid         references public.assessment_questions(id) not null,
  selected_answer text,
  score         numeric(3,2),
  created_at    timestamptz  default now(),
  unique (assessment_id, question_id)
);

-- hospital_profiles (FK to users)
create table if not exists public.hospital_profiles (
  id                   uuid    default gen_random_uuid() primary key,
  user_id              uuid    references public.users(id) on delete cascade unique not null,
  organization_name    text    not null,
  site_name            text    not null,
  city                 text    not null,
  state                text    not null,
  facility_type        text    not null,
  dept_size            text    not null,
  case_volume          text    not null,
  complexity_level     text    not null,
  teaching_capacity    text    not null,
  preceptor_strength   text    not null,
  extern_slots         integer not null default 1,
  scheduling_preferences text,
  notes                text,
  profile_complete     boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- externship_openings (FK to users — hospital owner)
create table if not exists public.externship_openings (
  id                uuid    default gen_random_uuid() primary key,
  hospital_user_id  uuid    references public.users(id) on delete cascade not null,
  title             text    not null,
  start_date        date,
  end_date          date,
  slots             integer not null default 1,
  shift             text,
  requirements_json jsonb   default '[]',
  status            text    not null default 'open' check (status in ('open', 'closed', 'filled')),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- applications (FK to externship_openings AND users — student applicant)
create table if not exists public.applications (
  id               uuid         default gen_random_uuid() primary key,
  externship_id    uuid         references public.externship_openings(id) on delete cascade not null,
  student_user_id  uuid         references public.users(id) on delete cascade not null,
  fit_score        numeric(5,2),
  status           text         not null default 'applied' check (status in ('applied', 'under_review', 'accepted', 'waitlisted', 'rejected')),
  hospital_notes   text,
  submitted_at     timestamptz  default now(),
  unique (externship_id, student_user_id)
);

-- hospital_feedback (FK to applications — written by hospital after placement)
create table if not exists public.hospital_feedback (
  id                    uuid    default gen_random_uuid() primary key,
  application_id        uuid    references public.applications(id) on delete cascade unique not null,
  attendance_score      integer check (attendance_score between 1 and 5),
  coachability_score    integer check (coachability_score between 1 and 5),
  professionalism_score integer check (professionalism_score between 1 and 5),
  communication_score   integer check (communication_score between 1 and 5),
  quality_score         integer check (quality_score between 1 and 5),
  recommended           boolean,
  notes                 text,
  created_at            timestamptz default now()
);

-- ============================================================
-- Indexes on FK columns used in RLS policy lookups
-- (Required for performance — prevents sequential scans on
-- the hospital candidate list and application lookups)
-- ============================================================
create index if not exists idx_student_profiles_user_id        on public.student_profiles(user_id);
create index if not exists idx_student_assessments_user_id     on public.student_assessments(student_user_id);
create index if not exists idx_assessment_responses_assessment  on public.assessment_responses(assessment_id);
create index if not exists idx_hospital_profiles_user_id       on public.hospital_profiles(user_id);
create index if not exists idx_externship_openings_hospital    on public.externship_openings(hospital_user_id);
create index if not exists idx_applications_externship         on public.applications(externship_id);
create index if not exists idx_applications_student            on public.applications(student_user_id);
create index if not exists idx_hospital_feedback_application   on public.hospital_feedback(application_id);
