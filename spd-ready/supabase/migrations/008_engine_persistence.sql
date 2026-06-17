-- ============================================================
-- SPD Ready — Learning engine persistence
-- Migration: 008_engine_persistence.sql
--
-- Real homes for the STATEFUL learning-engine data that currently
-- lives in the JSON demo store (src/lib/local-db/store.ts). Static
-- SPD content (question banks, concept defs, domain maps) stays as
-- code. Shapes mirror the TS types in src/lib/local-db/types.ts.
--
-- All rows are keyed by staff_id = spd_ready.profiles.id = auth.users.id.
-- The pure scoring logic in mastery.ts is unchanged; only persistence
-- moves here.
-- ============================================================

set search_path = spd_ready, public, extensions;

-- Concept mastery (mirrors ConceptMastery). One row per (staff, concept).
create table spd_ready.concept_mastery (
  id                      uuid primary key default gen_random_uuid(),
  staff_id                uuid not null references spd_ready.profiles(id) on delete cascade,
  concept_id              text not null,
  domain                  text not null,
  quiz_accuracy           integer not null default 0,
  confidence_calibration  integer not null default 50,
  spaced_repetition       integer not null default 0,
  context_variety         integer not null default 0,
  recency_decay           integer not null default 100,
  mastery_score           integer not null default 0,
  review_interval_days    integer not null default 0,
  next_review_at          timestamptz not null default now(),
  last_reviewed_at        timestamptz not null default now(),
  attempts                integer not null default 0,
  distinct_questions_seen integer not null default 0,
  updated_at              timestamptz not null default now(),
  unique (staff_id, concept_id)
);
create index on spd_ready.concept_mastery (staff_id);
create index on spd_ready.concept_mastery (staff_id, domain);

-- Domain assessments (mirrors DomainAssessment). T0 baseline + current.
create table spd_ready.domain_assessments (
  id                uuid primary key default gen_random_uuid(),
  staff_id          uuid not null references spd_ready.profiles(id) on delete cascade,
  domain            text not null,
  knowledge_t0      integer not null check (knowledge_t0 between 1 and 5),
  confidence_t0     integer not null check (confidence_t0 between 1 and 5),
  knowledge_current integer not null check (knowledge_current between 1 and 5),
  confidence_current integer not null check (confidence_current between 1 and 5),
  t0_at             timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (staff_id, domain)
);
create index on spd_ready.domain_assessments (staff_id);

-- Study sessions (mirrors StudySession). Append-only history.
create table spd_ready.study_sessions (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid not null references spd_ready.profiles(id) on delete cascade,
  domain       text not null,
  completed_at timestamptz not null default now(),
  total        integer not null,
  correct      integer not null,
  partial      integer not null,
  wrong        integer not null,
  score_pct    numeric(5,2) not null
);
create index on spd_ready.study_sessions (staff_id);
create index on spd_ready.study_sessions (staff_id, domain);

-- Streaks (mirrors StreakData). One row per staff.
create table spd_ready.streaks (
  staff_id        uuid primary key references spd_ready.profiles(id) on delete cascade,
  current         integer not null default 0,
  longest         integer not null default 0,
  last_study_date date
);

-- XP records (mirrors XPRecord). One row per staff.
create table spd_ready.xp_records (
  staff_id          uuid primary key references spd_ready.profiles(id) on delete cascade,
  total             integer not null default 0,
  sessions_completed integer not null default 0,
  domains_mastered  text[] not null default '{}'
);

-- Confidence taps (mirrors confidence_taps map). One row per (staff, question).
create table spd_ready.confidence_taps (
  id          uuid primary key default gen_random_uuid(),
  staff_id    uuid not null references spd_ready.profiles(id) on delete cascade,
  question_id text not null,
  tap         text not null check (tap in ('not_sure','pretty_sure','certain')),
  updated_at  timestamptz not null default now(),
  unique (staff_id, question_id)
);
create index on spd_ready.confidence_taps (staff_id);
