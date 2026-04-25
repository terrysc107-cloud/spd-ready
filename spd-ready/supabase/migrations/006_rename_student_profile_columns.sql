-- Rename student_profiles columns to match DAL field names
alter table public.student_profiles
  rename column travel_radius_miles to travel_radius;

alter table public.student_profiles
  rename column certification_status to cert_status;

alter table public.student_profiles
  rename column availability_json to shift_availability;

-- Replace text transportation_reliability with boolean transportation_reliable
alter table public.student_profiles
  add column if not exists transportation_reliable boolean not null default true;

update public.student_profiles
  set transportation_reliable = (transportation_reliability = 'reliable')
  where transportation_reliability is not null;

alter table public.student_profiles
  drop column if exists transportation_reliability;
