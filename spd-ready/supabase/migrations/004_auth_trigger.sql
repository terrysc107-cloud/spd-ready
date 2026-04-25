-- ============================================================
-- SPD Ready — Auth Trigger
-- Migration: 004_auth_trigger.sql
-- Syncs new auth.users rows to public.users on signup.
-- This is a fallback/defense-in-depth mechanism. The primary
-- insert happens in signUpAction via the Admin API. This trigger
-- ensures public.users is populated even if the Server Action
-- fails mid-way or a user is created outside the app (e.g.,
-- via the Supabase dashboard or admin scripts).
-- ============================================================

-- Function: called by the trigger on auth.users INSERT
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert into public.users only if the row doesn't already exist.
  -- The Server Action may have already inserted it via the Admin API.
  -- Role defaults to 'student' if not set — signUpAction always sets it
  -- via app_metadata before this trigger fires in normal flow.
  insert into public.users (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_app_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger: fires after each new auth.users row is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();
