-- ============================================================
-- SPD Ready — RLS Policies
-- Migration: 002_rls_policies.sql
-- ============================================================

-- Enable RLS on all 9 tables
alter table public.users                enable row level security;
alter table public.student_profiles     enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.student_assessments  enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.hospital_profiles    enable row level security;
alter table public.externship_openings  enable row level security;
alter table public.applications         enable row level security;
alter table public.hospital_feedback    enable row level security;

-- ============================================================
-- users
-- Student/hospital see own row. Admin sees all.
-- ============================================================
create policy "users_select_own_or_admin" on public.users
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select auth.jwt()->>'app_role') = 'admin'
  );

-- Only the system (via service_role trigger) inserts users rows.
-- No user-level insert policy — rows are inserted by the auth trigger function.

-- ============================================================
-- student_profiles
-- Student: own row. Hospital: rows of students who applied to their openings. Admin: all.
-- ============================================================
create policy "student_profiles_select" on public.student_profiles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select auth.jwt()->>'app_role') = 'admin'
    or (
      (select auth.jwt()->>'app_role') = 'hospital'
      and user_id in (
        select a.student_user_id
        from public.applications a
        join public.externship_openings eo on eo.id = a.externship_id
        where eo.hospital_user_id = (select auth.uid())
      )
    )
  );

create policy "student_profiles_insert_own" on public.student_profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select auth.jwt()->>'app_role') = 'student'
  );

create policy "student_profiles_update_own" on public.student_profiles
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and (select auth.jwt()->>'app_role') = 'student'
  );

-- ============================================================
-- assessment_questions
-- Read-only for all authenticated users (active questions only).
-- Insert/update only via service_role (seeding). No user policies needed.
-- ============================================================
create policy "assessment_questions_select_active" on public.assessment_questions
  for select to authenticated
  using (active = true);

-- ============================================================
-- student_assessments
-- Student: own rows. Admin: all. Hospital: assessments of students who applied to their openings.
-- ============================================================
create policy "student_assessments_select" on public.student_assessments
  for select to authenticated
  using (
    student_user_id = (select auth.uid())
    or (select auth.jwt()->>'app_role') = 'admin'
    or (
      (select auth.jwt()->>'app_role') = 'hospital'
      and student_user_id in (
        select a.student_user_id
        from public.applications a
        join public.externship_openings eo on eo.id = a.externship_id
        where eo.hospital_user_id = (select auth.uid())
      )
    )
  );

create policy "student_assessments_insert_own" on public.student_assessments
  for insert to authenticated
  with check (
    student_user_id = (select auth.uid())
    and (select auth.jwt()->>'app_role') = 'student'
  );

create policy "student_assessments_update_own" on public.student_assessments
  for update to authenticated
  using (
    student_user_id = (select auth.uid())
    and (select auth.jwt()->>'app_role') = 'student'
  );

-- ============================================================
-- assessment_responses
-- Student can read/write responses that belong to their own assessments.
-- ============================================================
create policy "assessment_responses_select_own" on public.assessment_responses
  for select to authenticated
  using (
    assessment_id in (
      select id from public.student_assessments
      where student_user_id = (select auth.uid())
    )
  );

create policy "assessment_responses_insert_own" on public.assessment_responses
  for insert to authenticated
  with check (
    (select auth.jwt()->>'app_role') = 'student'
    and assessment_id in (
      select id from public.student_assessments
      where student_user_id = (select auth.uid())
    )
  );

create policy "assessment_responses_update_own" on public.assessment_responses
  for update to authenticated
  using (
    assessment_id in (
      select id from public.student_assessments
      where student_user_id = (select auth.uid())
    )
  );

-- ============================================================
-- hospital_profiles
-- Hospital: own row. Admin: all. Students: cannot access.
-- ============================================================
create policy "hospital_profiles_select" on public.hospital_profiles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select auth.jwt()->>'app_role') = 'admin'
  );

create policy "hospital_profiles_insert_own" on public.hospital_profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select auth.jwt()->>'app_role') = 'hospital'
  );

create policy "hospital_profiles_update_own" on public.hospital_profiles
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and (select auth.jwt()->>'app_role') = 'hospital'
  );

-- ============================================================
-- externship_openings
-- Hospital: manage own openings. Student: read open openings only. Admin: all.
-- ============================================================
create policy "externship_openings_select" on public.externship_openings
  for select to authenticated
  using (
    hospital_user_id = (select auth.uid())
    or (select auth.jwt()->>'app_role') = 'admin'
    or (
      (select auth.jwt()->>'app_role') = 'student'
      and status = 'open'
    )
  );

create policy "externship_openings_insert_own" on public.externship_openings
  for insert to authenticated
  with check (
    hospital_user_id = (select auth.uid())
    and (select auth.jwt()->>'app_role') = 'hospital'
  );

create policy "externship_openings_update_own" on public.externship_openings
  for update to authenticated
  using (
    hospital_user_id = (select auth.uid())
    and (select auth.jwt()->>'app_role') = 'hospital'
  );

-- ============================================================
-- applications
-- Student: own applications. Hospital: applications to their openings. Admin: all.
-- ============================================================
create policy "applications_select" on public.applications
  for select to authenticated
  using (
    student_user_id = (select auth.uid())
    or (select auth.jwt()->>'app_role') = 'admin'
    or (
      (select auth.jwt()->>'app_role') = 'hospital'
      and externship_id in (
        select id from public.externship_openings
        where hospital_user_id = (select auth.uid())
      )
    )
  );

create policy "applications_insert_student" on public.applications
  for insert to authenticated
  with check (
    student_user_id = (select auth.uid())
    and (select auth.jwt()->>'app_role') = 'student'
  );

-- Hospital can update status and hospital_notes on applications to their openings
create policy "applications_update_hospital" on public.applications
  for update to authenticated
  using (
    (select auth.jwt()->>'app_role') = 'hospital'
    and externship_id in (
      select id from public.externship_openings
      where hospital_user_id = (select auth.uid())
    )
  );

-- Student can update their own application (e.g., withdraw)
create policy "applications_update_student" on public.applications
  for update to authenticated
  using (
    student_user_id = (select auth.uid())
    and (select auth.jwt()->>'app_role') = 'student'
  );

-- ============================================================
-- hospital_feedback
-- Hospital: insert/read for their own accepted applications. Admin: all.
-- Note: student cannot read feedback directly (hospital-facing signal).
-- ============================================================
create policy "hospital_feedback_select" on public.hospital_feedback
  for select to authenticated
  using (
    (select auth.jwt()->>'app_role') = 'admin'
    or application_id in (
      select a.id
      from public.applications a
      join public.externship_openings eo on eo.id = a.externship_id
      where eo.hospital_user_id = (select auth.uid())
    )
  );

create policy "hospital_feedback_insert_hospital" on public.hospital_feedback
  for insert to authenticated
  with check (
    (select auth.jwt()->>'app_role') = 'hospital'
    and application_id in (
      select a.id
      from public.applications a
      join public.externship_openings eo on eo.id = a.externship_id
      where eo.hospital_user_id = (select auth.uid())
      and a.status = 'accepted'
    )
  );

create policy "hospital_feedback_update_hospital" on public.hospital_feedback
  for update to authenticated
  using (
    (select auth.jwt()->>'app_role') = 'hospital'
    and application_id in (
      select a.id
      from public.applications a
      join public.externship_openings eo on eo.id = a.externship_id
      where eo.hospital_user_id = (select auth.uid())
    )
  );
