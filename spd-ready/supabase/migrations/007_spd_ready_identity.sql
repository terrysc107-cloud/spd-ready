-- ============================================================
-- SPD Ready — Identity / tenant schema
-- Migration: 007_spd_ready_identity.sql
--
-- Repositions SPD Ready onto a real multi-tenant identity model
-- that MIRRORS SPD Intel's `spd` schema shape (organization ->
-- department -> profile/role), so a later cross-app integration is
-- wiring, not a schema retrofit. Adds a `tech` role (the staff
-- member being trained/validated) on top of Intel's role set.
--
-- Lives in a dedicated `spd_ready` schema to coexist with the
-- legacy `public` tables (001-006) and to avoid name collisions
-- if these apps ever share one Supabase project.
-- ============================================================

create schema if not exists spd_ready;
grant usage on schema spd_ready to anon, authenticated, service_role;

set search_path = spd_ready, public, extensions;

-- Organizations
create table spd_ready.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);

-- Departments
create table spd_ready.departments (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid references spd_ready.organizations(id) on delete cascade,
  name       text not null,
  code       text,
  created_at timestamptz default now()
);

-- Profiles (extends Supabase auth.users). Column names match Intel's
-- spd.profiles exactly so a later cross-app view/FK is trivial.
-- `tech` is added for the staff member being trained/validated.
-- `legacy_user_id` bridges to the older demo/public user id during transition.
create table spd_ready.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  org_id         uuid references spd_ready.organizations(id),
  department_id  uuid references spd_ready.departments(id),
  name           text,
  role           text not null default 'tech'
                   check (role in ('tech','supervisor','manager','director','qa')),
  legacy_user_id uuid,
  created_at     timestamptz default now()
);

-- ------------------------------------------------------------
-- RLS helper functions (mirror Intel spd.* signatures)
-- ------------------------------------------------------------
create or replace function spd_ready.get_my_org_id()
returns uuid language sql security definer set search_path = spd_ready, public
as $$ select org_id from spd_ready.profiles where id = auth.uid() $$;

create or replace function spd_ready.get_my_role()
returns text language sql security definer set search_path = spd_ready, public
as $$ select role from spd_ready.profiles where id = auth.uid() $$;

create or replace function spd_ready.get_my_dept_id()
returns uuid language sql security definer set search_path = spd_ready, public
as $$ select department_id from spd_ready.profiles where id = auth.uid() $$;

-- ------------------------------------------------------------
-- PostgREST privileges (RLS still gates the rows)
-- ------------------------------------------------------------
grant all on all tables    in schema spd_ready to authenticated, service_role;
grant all on all sequences in schema spd_ready to authenticated, service_role;
alter default privileges in schema spd_ready grant all on tables    to authenticated, service_role;
alter default privileges in schema spd_ready grant all on sequences to authenticated, service_role;
