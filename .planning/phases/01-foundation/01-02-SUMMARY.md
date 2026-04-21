---
phase: 01-foundation
plan: 02
subsystem: database
tags: [supabase, rls, schema, jwt, migrations]
dependency_graph:
  requires: []
  provides: [database-schema, rls-policies, custom-access-token-hook]
  affects: [01-03-auth-wiring, all-dal-functions]
tech_stack:
  added: [supabase-cli]
  patterns: [rls-with-jwt-claims, in-subquery-rls, custom-access-token-hook]
key_files:
  created:
    - spd-ready/supabase/config.toml
    - spd-ready/supabase/migrations/001_initial_schema.sql
    - spd-ready/supabase/migrations/002_rls_policies.sql
    - spd-ready/supabase/migrations/003_custom_access_token_hook.sql
    - spd-ready/supabase/seed.sql
  modified: []
decisions:
  - Hook reads from public.users (not user_metadata) — users cannot modify their own app_metadata/public.users.role; prevents role escalation
  - All RLS checks use (select auth.jwt()->>'app_role') wrapper — single-evaluation caching per query, not per row
  - Hospital→student lookups use IN subquery (not JOIN) — prevents O(n) per-row join scan on candidate list
metrics:
  duration: "~10 minutes"
  completed: "2026-04-21T16:06:36Z"
  tasks_completed: 3
  files_created: 5
---

# Phase 1 Plan 02: Database Schema, RLS Policies & Custom Access Token Hook Summary

**One-liner:** Full 9-table Postgres schema with per-role RLS policies using JWT claim caching and a `custom_access_token_hook` that reads authoritative role from `public.users`.

## Files Created

| File | Purpose |
|------|---------|
| `supabase/config.toml` | Supabase CLI project config; registers `[auth.hook.custom_access_token]` pointing to `public.custom_access_token_hook` |
| `supabase/migrations/001_initial_schema.sql` | All 9 tables in FK dependency order + 8 B-tree indexes |
| `supabase/migrations/002_rls_policies.sql` | RLS enabled on all 9 tables; SELECT + INSERT + UPDATE policies per table |
| `supabase/migrations/003_custom_access_token_hook.sql` | Hook function, permission grants/revokes |
| `supabase/seed.sql` | Placeholder with FK dependency order documented for Phase 4 |

## Table Count Confirmed: 9

Tables in FK dependency order:
1. `public.users` — mirrors auth.users; authoritative role source
2. `public.student_profiles` — FK to users
3. `public.assessment_questions` — no FK to users (static bank)
4. `public.student_assessments` — FK to users
5. `public.assessment_responses` — FK to student_assessments + assessment_questions
6. `public.hospital_profiles` — FK to users
7. `public.externship_openings` — FK to users (hospital owner)
8. `public.applications` — FK to externship_openings + users (student)
9. `public.hospital_feedback` — FK to applications

## RLS Policy Count Per Table

| Table | SELECT | INSERT | UPDATE | Notes |
|-------|--------|--------|--------|-------|
| users | 1 | 0 | 0 | Insert via trigger only (service_role) |
| student_profiles | 1 | 1 | 1 | Hospital sees applicants via IN subquery |
| assessment_questions | 1 | 0 | 0 | Read-only; seeded via service_role |
| student_assessments | 1 | 1 | 1 | Hospital sees applicants' assessments via IN subquery |
| assessment_responses | 1 | 1 | 1 | Student own assessment chain |
| hospital_profiles | 1 | 1 | 1 | Admin sees all |
| externship_openings | 1 | 1 | 1 | Students see open only |
| applications | 1 | 1 | 2 | Two UPDATE policies: hospital + student |
| hospital_feedback | 1 | 1 | 1 | Hospital write-gated to accepted applications |

**Total policies: 23**

## Hook Configuration Confirmed

`supabase/config.toml` contains:
```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

## What Plan 03 Needs to Know

1. **`app_role` is in JWT claims** — all RLS policies read `(select auth.jwt()->>'app_role')`. Auth code in Plan 03 does NOT need to pass roles manually; the hook embeds them automatically at JWT generation time.

2. **`public.users` must have a row before the hook returns a non-empty role** — the auth trigger (Plan 03 task) that inserts into `public.users` on signup must run BEFORE any authenticated request is made. If `public.users` has no row for a user, the hook defaults `app_role` to `""` and all RLS policies will deny access silently.

3. **Role comes from `public.users.role`** — at signup, the auth trigger reads `raw_app_meta_data->>'role'` from the auth event and writes it to `public.users.role`. Plan 03 must set `raw_app_meta_data.role` at user creation (via `supabase.auth.admin.createUser` or the signup action with `app_metadata`).

4. **`users` table has no user-level INSERT policy** — rows are inserted exclusively by the service-role trigger. No application code should attempt to insert into `public.users` directly.

5. **Migrations are unapplied** — these files are local only. They must be applied to the Supabase cloud project via `supabase db push` or the Supabase dashboard SQL editor before Plan 03's auth code can work end-to-end.

## Commits

| Hash | Message |
|------|---------|
| `d9d90ef` | chore(01-02): init Supabase CLI and write 001_initial_schema.sql |
| `40d989b` | feat(01-02): write 002_rls_policies.sql with complete RLS matrix |
| `3a4d3c8` | feat(01-02): write custom access token hook, configure config.toml, add seed.sql |

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

No new network endpoints or auth paths introduced. All files are SQL migration artifacts applied offline. The hook function uses `SECURITY DEFINER` which is correct and intentional — documented in the migration with a security note.

## Self-Check: PASSED

- `spd-ready/supabase/config.toml` — EXISTS
- `spd-ready/supabase/migrations/001_initial_schema.sql` — EXISTS
- `spd-ready/supabase/migrations/002_rls_policies.sql` — EXISTS
- `spd-ready/supabase/migrations/003_custom_access_token_hook.sql` — EXISTS
- `spd-ready/supabase/seed.sql` — EXISTS
- Commits d9d90ef, 40d989b, 3a4d3c8 — VERIFIED in git log
