-- ============================================================
-- SPD Ready — Role source moves to spd_ready.profiles
-- Migration: 009_role_hook.sql
--
-- Repoints the Custom Access Token Hook (defined in 003) to read the
-- authoritative role from spd_ready.profiles instead of public.users,
-- and adds a signup trigger that provisions a spd_ready.profiles row
-- (role defaults to 'tech') for every new auth user.
--
-- SECURITY (unchanged from 003): role is read from an authoritative
-- table, NOT user_metadata; execute is granted only to
-- supabase_auth_admin and revoked from authenticated/anon/public.
-- ============================================================

set search_path = spd_ready, public, extensions;

-- ------------------------------------------------------------
-- Custom Access Token Hook — read role from spd_ready.profiles
-- ------------------------------------------------------------
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = spd_ready, public
as $$
declare
  claims    jsonb;
  user_role text;
begin
  -- Authoritative source: spd_ready.profiles (NOT user_metadata)
  select role into user_role
  from spd_ready.profiles
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if user_role is not null then
    -- RLS reads this as (select auth.jwt()->>'app_role')
    claims := jsonb_set(claims, '{app_role}', to_jsonb(user_role));
  else
    -- No profile yet: deny-by-default empty role
    claims := jsonb_set(claims, '{app_role}', '""');
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- supabase_auth_admin must execute the hook and read the role table.
grant usage on schema spd_ready to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
grant select on table spd_ready.profiles to supabase_auth_admin;

-- ------------------------------------------------------------
-- Signup trigger — provision a spd_ready.profiles row (role 'tech')
-- Org/department stay null until a manager assigns the staff member.
-- ------------------------------------------------------------
create or replace function spd_ready.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = spd_ready, public
as $$
begin
  insert into spd_ready.profiles (id, name, role, legacy_user_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    'tech',
    new.id
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_spd_ready on auth.users;
create trigger on_auth_user_created_spd_ready
  after insert on auth.users
  for each row execute function spd_ready.handle_new_user();
