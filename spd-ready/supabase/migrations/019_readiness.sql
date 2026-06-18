-- ============================================================
-- SPD Ready — Technical Readiness assessment, rewired to Supabase
-- Migration: 019_readiness.sql
--
-- The 30-question readiness assessment (6 weighted categories →
-- readiness_score + tier 1/2/3) was the last surface still on the JSON
-- file store + legacy demo auth (broken under real auth). This moves it
-- into the `spd_ready` schema on real auth (staff_id = auth.users.id),
-- mirroring the engine tables (concept_mastery / module_completions).
--
--   student_profiles    = the student's demographic profile + the stored
--                         readiness_score/tier/strengths/growth (one per staff)
--   student_assessments = one attempt; holds the 6 category scores + overall
--   assessment_responses= per-question answer + score (question_id is text:
--                         ids come from spd_ready.questions kind='assessment',
--                         but stay FK-free so the static fallback bank also works)
--
-- RLS: owner full; org managers read (read-only visibility into their techs).
-- ============================================================

set search_path = spd_ready, public, extensions;

-- Student profile + stored readiness (keyed by the auth user / profile)
create table spd_ready.student_profiles (
  staff_id                 uuid primary key references spd_ready.profiles(id) on delete cascade,
  first_name               text,
  last_name                text,
  city                     text,
  state                    text,
  travel_radius            integer,
  cert_status              text,
  program_name             text,
  expected_completion_date text,
  shift_availability       text[] not null default '{}',
  transportation_reliable  boolean not null default true,
  preferred_environment    text,
  readiness_score          numeric(5,2),
  readiness_tier           integer check (readiness_tier in (1,2,3)),
  strengths_json           jsonb not null default '[]',
  growth_areas_json        jsonb not null default '[]',
  profile_complete         boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- One assessment attempt
create table spd_ready.student_assessments (
  id                uuid primary key default gen_random_uuid(),
  staff_id          uuid not null references spd_ready.profiles(id) on delete cascade,
  status            text not null default 'in_progress' check (status in ('in_progress','completed')),
  started_at        timestamptz not null default now(),
  submitted_at      timestamptz,
  technical_score   numeric(5,2),
  situational_score numeric(5,2),
  process_score     numeric(5,2),
  behavior_score    numeric(5,2),
  instrument_score  numeric(5,2),
  reliability_score numeric(5,2),
  overall_score     numeric(5,2),
  created_at        timestamptz not null default now()
);
create index on spd_ready.student_assessments (staff_id, status);

-- Per-question response (category snapshotted so scoring needs no re-fetch)
create table spd_ready.assessment_responses (
  id              uuid primary key default gen_random_uuid(),
  assessment_id   uuid not null references spd_ready.student_assessments(id) on delete cascade,
  question_id     text not null,
  category        text,
  selected_answer text,
  score           numeric(4,3),
  created_at      timestamptz not null default now(),
  unique (assessment_id, question_id)
);

-- ============================================================
-- RLS (SELECT-first)
-- ============================================================
alter table spd_ready.student_profiles     enable row level security;
alter table spd_ready.student_assessments  enable row level security;
alter table spd_ready.assessment_responses enable row level security;

-- Helper: does student_assessment `a` belong to me?
create or replace function spd_ready.my_assessment(a uuid)
returns boolean language sql security definer set search_path = spd_ready, public
as $$
  select exists (
    select 1 from spd_ready.student_assessments sa
    where sa.id = a and sa.staff_id = auth.uid()
  )
$$;

-- student_profiles: owner full; org managers read
create policy "sp_select" on spd_ready.student_profiles for select
  using (
    staff_id = auth.uid()
    or (spd_ready.get_my_role() in ('supervisor','manager','director','qa')
        and spd_ready.staff_in_my_org(staff_id))
  );
create policy "sp_insert" on spd_ready.student_profiles for insert
  with check (staff_id = auth.uid());
create policy "sp_update" on spd_ready.student_profiles for update
  using (staff_id = auth.uid());

-- student_assessments: owner full; org managers read
create policy "sa_select" on spd_ready.student_assessments for select
  using (
    staff_id = auth.uid()
    or (spd_ready.get_my_role() in ('supervisor','manager','director','qa')
        and spd_ready.staff_in_my_org(staff_id))
  );
create policy "sa_insert" on spd_ready.student_assessments for insert
  with check (staff_id = auth.uid());
create policy "sa_update" on spd_ready.student_assessments for update
  using (staff_id = auth.uid());

-- assessment_responses: owner only (via assessment ownership)
create policy "ar_select" on spd_ready.assessment_responses for select
  using (spd_ready.my_assessment(assessment_id));
create policy "ar_insert" on spd_ready.assessment_responses for insert
  with check (spd_ready.my_assessment(assessment_id));
create policy "ar_update" on spd_ready.assessment_responses for update
  using (spd_ready.my_assessment(assessment_id));
