-- ============================================================
-- SPD Ready — RLS for the global question bank
-- Migration: 013_questions_rls.sql
--
-- Mirrors the GLOBAL-content pattern of public.assessment_questions
-- (migration 002), NOT the org-scoped pattern of the rest of spd_ready:
--   - any authenticated user reads ACTIVE questions
--   - managers/QA may additionally read drafts (for the review UI)
--   - NO insert/update/delete policy -> writes only via service_role
--     (the seed/import/generation scripts), which bypasses RLS.
-- ============================================================

set search_path = spd_ready, public, extensions;

alter table spd_ready.questions enable row level security;

-- Learners + everyone: only active content is visible.
create policy "questions_select_active" on spd_ready.questions
  for select to authenticated
  using (status = 'active');

-- Reviewers (manager/director/qa): read everything incl. drafts/rejected.
create policy "questions_select_review" on spd_ready.questions
  for select to authenticated
  using (spd_ready.get_my_role() in ('manager','director','qa'));

-- No write policies on purpose: import + generation run under service_role
-- (bypasses RLS); authenticated users can never mutate global content.
