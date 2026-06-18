-- ============================================================
-- SPD Ready — Mindset Profiles (the judgment/mindset half of the
-- co-equal Readiness + Mindset assessment).
-- Migration: 014_mindset.sql
--
-- One row per (staff, model_version). The T0 columns are the LOCKED
-- baseline (set once at first compute, like domain_assessments.knowledge_t0);
-- the non-T0 columns are the CURRENT (T1) values, recomputed as the tech
-- trains on judgment scenarios, so we can show improvement deltas.
--
-- model_version records which versioned config (src/lib/mindset-model.ts)
-- produced the row, so Beta tuning of archetype thresholds never invalidates
-- historical profiles (longitudinal validity).
-- ============================================================

set search_path = spd_ready, public, extensions;

create table if not exists spd_ready.mindset_profiles (
  id                  uuid primary key default gen_random_uuid(),
  staff_id            uuid not null references spd_ready.profiles(id) on delete cascade,
  model_version       text not null,

  -- ---- Baseline (T0, locked on first compute) ----
  dimension_scores_t0 jsonb   not null,            -- { safety_ownership: 0..100, ... }
  archetype_t0        text    not null,
  demonstrated_t0     jsonb   not null,            -- per-dimension SJT score 0..100
  self_perception     jsonb,                       -- { dimension: 1..5 } Likert (nullable)
  calibration_gap_t0  integer,                     -- self − demonstrated, percentage points
  covered_t0          text[]  not null default '{}', -- dimensions the baseline SJT actually covered

  -- ---- Current (T1, recomputed as judgment training accrues) ----
  dimension_scores    jsonb   not null,
  archetype           text    not null,
  demonstrated_current jsonb  not null,

  -- ---- Beta feedback loop (the industry buy-in engine) ----
  tech_feedback       text check (tech_feedback in ('fits','partly','no')),
  tech_feedback_note  text,
  tech_feedback_at    timestamptz,

  -- ---- Manager validation / adjustment ----
  manager_adjustment  jsonb,                       -- { archetype, note, by, by_name, at }

  baseline_at         timestamptz not null default now(),
  computed_at         timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (staff_id, model_version)
);

create index if not exists mindset_profiles_staff_idx on spd_ready.mindset_profiles (staff_id);
