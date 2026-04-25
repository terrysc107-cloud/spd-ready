-- ============================================================
-- SPD Ready — Custom Access Token Hook
-- Migration: 003_custom_access_token_hook.sql
--
-- This function runs at JWT generation time and embeds the
-- user's role from public.users into the JWT as 'app_role'.
-- RLS policies read (select auth.jwt()->>'app_role').
--
-- SECURITY NOTE:
-- - Role is read from public.users (authoritative source)
-- - NOT from user_metadata (users can modify their own metadata)
-- - Execute permission is granted ONLY to supabase_auth_admin
-- - Revoked from authenticated/anon/public to prevent spoofing
-- ============================================================

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
as $$
declare
  claims    jsonb;
  user_role text;
begin
  -- Read role from the authoritative source: public.users table
  -- NOT from event->claims->user_metadata (user-editable, insecure)
  select role into user_role
  from public.users
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if user_role is not null then
    -- Embed role as app_role JWT claim
    -- RLS policies reference this as: (select auth.jwt()->>'app_role')
    claims := jsonb_set(claims, '{app_role}', to_jsonb(user_role));
  else
    -- No role found: default to empty string (RLS policies will deny access)
    claims := jsonb_set(claims, '{app_role}', '""');
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- ============================================================
-- Permissions
-- supabase_auth_admin must be able to execute the hook and
-- read the users table. All other roles are explicitly revoked.
-- ============================================================
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
grant select on table public.users to supabase_auth_admin;
