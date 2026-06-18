-- ============================================================
-- SPD Ready — Learning Modules + Completions
-- Migration: 016_learning.sql
--
-- The educational content type that establishes the ONE standard /
-- proper expectations for every tech: a module is rich best-practice
-- lessons (photos/videos via external links + text + objectives) that
-- a tech reads/watches, then answers check-for-understanding questions
-- on. The checks reuse spd_ready.questions (kind='study') and the
-- existing mastery -> competency spine, so completing a module raises
-- concept mastery (driving the adaptive feed) and auto-feeds the
-- competency record — no new scoring code.
--
-- learning_modules = GLOBAL content (like spd_ready.questions, mig 012):
--   not org-scoped; draft->active lifecycle; written by service_role.
-- module_completions = staff-owned engine data (like concept_mastery).
-- RLS lives in 017.
-- ============================================================

set search_path = spd_ready, public, extensions;

create table spd_ready.learning_modules (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  domain             text not null check (domain in (   -- 7-domain framework
                       'foundational','decontamination','high_level_disinfection','iap',
                       'sterilization','sterile_storage','spd_judgment')),
  concept_ids        text[] not null default '{}',      -- ConceptIds this module covers
  title              text not null,
  summary            text,
  objectives         text[] not null default '{}',
  -- ordered lesson sections: [{"heading","body","image_url","video_url"}] (external URLs)
  sections           jsonb not null default '[]',
  -- check-for-understanding questions -> spd_ready.questions(id)
  check_question_ids uuid[] not null default '{}',
  estimated_minutes  integer,
  difficulty         text not null default 'intermediate'
                       check (difficulty in ('foundational','intermediate','advanced')),
  status             text not null default 'draft'
                       check (status in ('draft','active','archived','rejected')),
  source             text not null default 'generated'
                       check (source in ('authored','generated','seed')),
  source_ref         text,
  content_hash       text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index on spd_ready.learning_modules (status, domain);
create unique index learning_modules_content_hash_uniq
  on spd_ready.learning_modules (content_hash) where content_hash is not null;

-- A tech's progress through a module (one current row per module+staff).
create table spd_ready.module_completions (
  id           uuid primary key default gen_random_uuid(),
  module_id    uuid not null references spd_ready.learning_modules(id) on delete cascade,
  staff_id     uuid not null,                 -- = auth.users.id (mirrors concept_mastery)
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  score_pct    integer,                       -- 0..100 from the check quiz
  updated_at   timestamptz not null default now(),
  unique (module_id, staff_id)
);
create index on spd_ready.module_completions (staff_id);
