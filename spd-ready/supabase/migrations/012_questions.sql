-- ============================================================
-- SPD Ready — Unified question bank
-- Migration: 012_questions.sql
--
-- Moves the learning/assessment QUESTION CONTENT out of the static
-- TS bundle (src/lib/local-db/{questions,track-questions,hld-questions}.ts)
-- into one Supabase table so import (crcst), generation loops, and future
-- manager authoring share one write target with a draft->active lifecycle.
--
-- This is GLOBAL content (not org-scoped): it intentionally breaks the
-- org-scoped RLS pattern of the rest of spd_ready, exactly like the
-- legacy public.assessment_questions table. RLS lives in 013.
--
-- One table, two kinds:
--   kind='study'      -> correct + partial_credit, keyed by track_domain
--                        (the 8 legacy study tracks) + learning_domain/concept_id
--   kind='assessment' -> per-option score_map + category (the 6 readiness dims)
-- ============================================================

set search_path = spd_ready, public, extensions;

create table spd_ready.questions (
  id              uuid primary key default gen_random_uuid(),
  kind            text not null default 'study' check (kind in ('study','assessment')),

  -- content
  stem            text not null,                 -- question / prompt text
  options         jsonb not null,                -- {"A":"..","B":"..","C":"..","D":".."}
  correct         text check (correct in ('A','B','C','D')),
  partial_credit  text check (partial_credit in ('A','B','C','D')),  -- study only
  score_map       jsonb,                         -- assessment: {"A":1.0,"B":0,...}; null for study
  explanation     text not null default '',
  image           text,

  -- taxonomy / tagging
  category        text,                          -- assessment dim (technical|situational|process|behavioral|instrument|reliability)
  track_domain    text check (track_domain in (  -- legacy 8 study tracks (the quiz UI keys on this)
                     'INSTRUMENT_ID','DECONTAMINATION','PREPARATION','STERILIZATION',
                     'STERILITY_ASSURANCE','STORAGE_DISTRIBUTION','COMPLIANCE_SAFETY','SPD_JUDGMENT')),
  learning_domain text check (learning_domain in (  -- 7-domain framework (mastery/competency key on this)
                     'foundational','decontamination','high_level_disinfection','iap',
                     'sterilization','sterile_storage','spd_judgment')),
  concept_id      text,
  difficulty      text not null default 'intermediate'
                    check (difficulty in ('foundational','intermediate','advanced')),
  judgment_type   text,                          -- scenario sub-type for spd_judgment
  error_categories text[] not null default '{}',
  real_world_standard text,                      -- short human label, e.g. "AAMI ST79"
  standard_refs   jsonb not null default '[]',   -- [{"standard":"ST79","section":"8.6.1","year":2017}]

  -- provenance + lifecycle
  source          text not null default 'authored'
                    check (source in ('authored','crcst_import','generated','seed')),
  source_ref      text,                          -- original id, e.g. crcst 'q-417' / 'tq-hld-001'
  status          text not null default 'draft'
                    check (status in ('draft','active','archived','rejected')),

  -- dedup
  content_hash    text,                          -- sha256(normalized stem + sorted options)

  -- audit
  created_by      uuid references spd_ready.profiles(id),
  reviewed_by     uuid references spd_ready.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index on spd_ready.questions (kind, status, track_domain);
create index on spd_ready.questions (kind, status, learning_domain);
create index on spd_ready.questions (concept_id);
create unique index questions_content_hash_uniq
  on spd_ready.questions (content_hash) where content_hash is not null;
