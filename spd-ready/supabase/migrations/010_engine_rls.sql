-- ============================================================
-- SPD Ready — RLS for identity + engine tables
-- Migration: 010_engine_rls.sql
--
-- Per the repo's security rules: every table gets RLS, and a SELECT
-- policy is authored BEFORE any INSERT/UPDATE/DELETE (missing SELECT
-- = silent mutation failures). Engine data is owned by the staff
-- member; org managers may read (but not write) their org's data.
-- ============================================================

set search_path = spd_ready, public, extensions;

-- Enable RLS
alter table spd_ready.organizations      enable row level security;
alter table spd_ready.departments        enable row level security;
alter table spd_ready.profiles           enable row level security;
alter table spd_ready.concept_mastery    enable row level security;
alter table spd_ready.domain_assessments enable row level security;
alter table spd_ready.study_sessions     enable row level security;
alter table spd_ready.streaks            enable row level security;
alter table spd_ready.xp_records         enable row level security;
alter table spd_ready.confidence_taps    enable row level security;

-- Helper: is `staff` a member of my org? (used to scope manager reads)
create or replace function spd_ready.staff_in_my_org(staff uuid)
returns boolean language sql security definer set search_path = spd_ready, public
as $$
  select exists (
    select 1 from spd_ready.profiles p
    where p.id = staff and p.org_id = spd_ready.get_my_org_id()
  )
$$;

-- ------------------------------------------------------------
-- Identity
-- ------------------------------------------------------------
create policy "org_select" on spd_ready.organizations for select
  using (id = spd_ready.get_my_org_id());

create policy "dept_select" on spd_ready.departments for select
  using (org_id = spd_ready.get_my_org_id());

-- Profiles: org members read their org; users update their own row;
-- managers/directors provision (insert/update) staff in their org.
create policy "profiles_select" on spd_ready.profiles for select
  using (org_id = spd_ready.get_my_org_id() or id = auth.uid());
create policy "profiles_update_own" on spd_ready.profiles for update
  using (id = auth.uid());
create policy "profiles_manage_insert" on spd_ready.profiles for insert
  with check (
    org_id = spd_ready.get_my_org_id()
    and spd_ready.get_my_role() in ('manager','director','qa')
  );
create policy "profiles_manage_update" on spd_ready.profiles for update
  using (
    org_id = spd_ready.get_my_org_id()
    and spd_ready.get_my_role() in ('manager','director','qa')
  );

-- ------------------------------------------------------------
-- Engine tables: owner full access; org managers read-only
-- ------------------------------------------------------------
-- concept_mastery
create policy "cm_select" on spd_ready.concept_mastery for select
  using (
    staff_id = auth.uid()
    or (spd_ready.get_my_role() in ('supervisor','manager','director','qa')
        and spd_ready.staff_in_my_org(staff_id))
  );
create policy "cm_insert" on spd_ready.concept_mastery for insert
  with check (staff_id = auth.uid());
create policy "cm_update" on spd_ready.concept_mastery for update
  using (staff_id = auth.uid());

-- domain_assessments
create policy "da_select" on spd_ready.domain_assessments for select
  using (
    staff_id = auth.uid()
    or (spd_ready.get_my_role() in ('supervisor','manager','director','qa')
        and spd_ready.staff_in_my_org(staff_id))
  );
create policy "da_insert" on spd_ready.domain_assessments for insert
  with check (staff_id = auth.uid());
create policy "da_update" on spd_ready.domain_assessments for update
  using (staff_id = auth.uid());

-- study_sessions
create policy "ss_select" on spd_ready.study_sessions for select
  using (
    staff_id = auth.uid()
    or (spd_ready.get_my_role() in ('supervisor','manager','director','qa')
        and spd_ready.staff_in_my_org(staff_id))
  );
create policy "ss_insert" on spd_ready.study_sessions for insert
  with check (staff_id = auth.uid());

-- streaks
create policy "st_select" on spd_ready.streaks for select
  using (
    staff_id = auth.uid()
    or (spd_ready.get_my_role() in ('supervisor','manager','director','qa')
        and spd_ready.staff_in_my_org(staff_id))
  );
create policy "st_insert" on spd_ready.streaks for insert
  with check (staff_id = auth.uid());
create policy "st_update" on spd_ready.streaks for update
  using (staff_id = auth.uid());

-- xp_records
create policy "xp_select" on spd_ready.xp_records for select
  using (
    staff_id = auth.uid()
    or (spd_ready.get_my_role() in ('supervisor','manager','director','qa')
        and spd_ready.staff_in_my_org(staff_id))
  );
create policy "xp_insert" on spd_ready.xp_records for insert
  with check (staff_id = auth.uid());
create policy "xp_update" on spd_ready.xp_records for update
  using (staff_id = auth.uid());

-- confidence_taps
create policy "ct_select" on spd_ready.confidence_taps for select
  using (staff_id = auth.uid());
create policy "ct_insert" on spd_ready.confidence_taps for insert
  with check (staff_id = auth.uid());
create policy "ct_update" on spd_ready.confidence_taps for update
  using (staff_id = auth.uid());
