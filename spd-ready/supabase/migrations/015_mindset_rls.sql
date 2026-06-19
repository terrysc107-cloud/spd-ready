-- ============================================================
-- SPD Ready — RLS for mindset_profiles
-- Migration: 015_mindset_rls.sql
--
-- Mirrors the staff-owned engine pattern (migration 010): the owning tech
-- has full access to their own profile; org managers/QA may read their
-- org's profiles AND write the manager_adjustment (validate/adjust the
-- archetype, like competency sign-off). A SELECT policy is authored before
-- any UPDATE (missing SELECT = silent mutation failures).
-- ============================================================

set search_path = spd_ready, public, extensions;

alter table spd_ready.mindset_profiles enable row level security;

-- Owner reads own; org managers/QA read their org's profiles.
create policy "mp_select" on spd_ready.mindset_profiles for select
  using (
    staff_id = auth.uid()
    or (spd_ready.get_my_role() in ('supervisor','manager','director','qa')
        and spd_ready.staff_in_my_org(staff_id))
  );

-- Only the tech creates their own baseline.
create policy "mp_insert" on spd_ready.mindset_profiles for insert
  with check (staff_id = auth.uid());

-- Tech updates own (T1 recompute + beta feedback).
create policy "mp_update_own" on spd_ready.mindset_profiles for update
  using (staff_id = auth.uid());

-- Managers/QA in the same org may update (manager_adjustment).
create policy "mp_update_manager" on spd_ready.mindset_profiles for update
  using (
    spd_ready.get_my_role() in ('supervisor','manager','director','qa')
    and spd_ready.staff_in_my_org(staff_id)
  );
