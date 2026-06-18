-- ============================================================
-- SPD Ready — RLS for learning modules + completions
-- Migration: 017_learning_rls.sql
--
-- learning_modules  -> GLOBAL-content pattern (mirrors 013_questions_rls):
--   authenticated read ACTIVE; managers/director/qa read all (review UI);
--   no write policy -> seed/generation run under service_role.
-- module_completions -> staff-owned pattern (mirrors concept_mastery in 010):
--   owner full access; org managers read-only.
-- ============================================================

set search_path = spd_ready, public, extensions;

alter table spd_ready.learning_modules    enable row level security;
alter table spd_ready.module_completions  enable row level security;

-- ---- learning_modules (global content) ----
create policy "lm_select_active" on spd_ready.learning_modules
  for select to authenticated
  using (status = 'active');

create policy "lm_select_review" on spd_ready.learning_modules
  for select to authenticated
  using (spd_ready.get_my_role() in ('manager','director','qa'));
-- no insert/update/delete: writes only via service_role (seed/promote scripts)

-- ---- module_completions (staff-owned) ----
create policy "mc_select" on spd_ready.module_completions for select
  using (
    staff_id = auth.uid()
    or (spd_ready.get_my_role() in ('supervisor','manager','director','qa')
        and spd_ready.staff_in_my_org(staff_id))
  );
create policy "mc_insert" on spd_ready.module_completions for insert
  with check (staff_id = auth.uid());
create policy "mc_update" on spd_ready.module_completions for update
  using (staff_id = auth.uid());
