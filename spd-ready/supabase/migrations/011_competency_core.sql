-- ============================================================
-- SPD Ready — Competency core (Slice 1)
-- Migration: 011_competency_core.sql
--
-- The standardized, verifiable competency loop:
--   template -> assign -> (training auto-feeds + manager validates) -> record
--
-- Two inputs land in competency_observations (source = 'training' from
-- the mastery engine, source = 'manager' from observation/audit). The
-- single competency_records row is the merged, signed-off system of
-- record. Shapes echo Intel's checklists / checklist_items / audit_responses.
-- ============================================================

set search_path = spd_ready, public, extensions;

-- Templates (mirror Intel spd.checklists)
create table spd_ready.competency_templates (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid references spd_ready.organizations(id) on delete cascade,
  name           text not null,
  description    text,
  domain         text,                       -- one of the 7 LearningDomains (nullable = cross-domain)
  version        text not null default 'v1',
  status         text not null default 'active' check (status in ('draft','active','archived')),
  pass_threshold integer not null default 80, -- mastery bar; matches learning.ts "mastered >= 80"
  created_by     uuid references spd_ready.profiles(id),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
create index on spd_ready.competency_templates (org_id);

-- Items (mirror Intel spd.checklist_items)
create table spd_ready.competency_items (
  id            uuid primary key default gen_random_uuid(),
  template_id   uuid references spd_ready.competency_templates(id) on delete cascade,
  label         text not null,               -- e.g. "Read a steam sterilizer printout"
  concept_id    text,                         -- optional link to a ConceptId from concepts.ts
  domain        text,                         -- LearningDomain backing this item
  evidence_type text not null default 'observation'
                  check (evidence_type in ('observation','training','either')),
  weight        integer not null default 1 check (weight between 1 and 3),
  item_order    integer not null default 0
);
create index on spd_ready.competency_items (template_id);

-- Assignments (the Postgres analogue of the old ModuleAssignment, org-scoped)
create table spd_ready.competency_assignments (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references spd_ready.organizations(id) on delete cascade,
  template_id uuid references spd_ready.competency_templates(id) on delete cascade,
  staff_id    uuid references spd_ready.profiles(id) on delete cascade,
  assigned_by uuid references spd_ready.profiles(id),
  status      text not null default 'assigned'
                check (status in ('assigned','in_training','ready_for_validation','validated','failed','expired')),
  due_date    date,
  assigned_at timestamptz default now(),
  unique (template_id, staff_id)
);
create index on spd_ready.competency_assignments (org_id);
create index on spd_ready.competency_assignments (staff_id);

-- Observations (mirror Intel spd.audit_responses) — THE TWO INPUTS
create table spd_ready.competency_observations (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid references spd_ready.competency_assignments(id) on delete cascade,
  item_id       uuid references spd_ready.competency_items(id),
  source        text not null check (source in ('training','manager')),
  result        text not null check (result in ('pass','fail','na')),
  mastery_score integer,                      -- 0..100 snapshot when source='training'
  observed_by   uuid references spd_ready.profiles(id),  -- null when source='training'
  note          text,
  recorded_at   timestamptz default now(),
  -- one current row per (assignment, item, source) so the training auto-feed
  -- and manager sign-off upsert in place (techs can't DELETE under RLS).
  unique (assignment_id, item_id, source)
);
create index on spd_ready.competency_observations (assignment_id);

-- Records — the stored, verifiable system of record
create table spd_ready.competency_records (
  id                       uuid primary key default gen_random_uuid(),
  org_id                   uuid references spd_ready.organizations(id) on delete cascade,
  assignment_id            uuid references spd_ready.competency_assignments(id) on delete cascade,
  staff_id                 uuid references spd_ready.profiles(id),
  template_id              uuid references spd_ready.competency_templates(id),
  template_name_snapshot   text not null,     -- frozen for audit even if template renamed
  outcome                  text not null check (outcome in ('pass','fail')),
  training_score           integer,           -- aggregate mastery rollup from the engine
  validated_by             uuid references spd_ready.profiles(id),
  validated_by_name_snapshot text,
  validation_method        text check (validation_method in ('training_auto','direct_observation','audit')),
  signed_off_at            timestamptz default now(),
  expires_at               date,              -- nullable in Slice 1; renewal layer fills later
  evidence                 jsonb default '{}'
);
create index on spd_ready.competency_records (org_id);
create index on spd_ready.competency_records (staff_id);
create unique index competency_records_assignment_uniq on spd_ready.competency_records (assignment_id);

-- ============================================================
-- RLS (SELECT-first). Org members read their org; techs read own
-- assignments/records; managers assign and validate.
-- ============================================================
alter table spd_ready.competency_templates    enable row level security;
alter table spd_ready.competency_items         enable row level security;
alter table spd_ready.competency_assignments   enable row level security;
alter table spd_ready.competency_observations  enable row level security;
alter table spd_ready.competency_records       enable row level security;

-- Helper: does competency_assignment `a` belong to my org?
create or replace function spd_ready.assignment_in_my_org(a uuid)
returns boolean language sql security definer set search_path = spd_ready, public
as $$
  select exists (
    select 1 from spd_ready.competency_assignments ca
    where ca.id = a and ca.org_id = spd_ready.get_my_org_id()
  )
$$;

-- Templates: org members read; managers write
create policy "ct_tmpl_select" on spd_ready.competency_templates for select
  using (org_id = spd_ready.get_my_org_id());
create policy "ct_tmpl_insert" on spd_ready.competency_templates for insert
  with check (org_id = spd_ready.get_my_org_id()
              and spd_ready.get_my_role() in ('manager','director','qa'));
create policy "ct_tmpl_update" on spd_ready.competency_templates for update
  using (org_id = spd_ready.get_my_org_id()
         and spd_ready.get_my_role() in ('manager','director','qa'));

-- Items: read if parent template in my org; managers write
create policy "ct_item_select" on spd_ready.competency_items for select
  using (template_id in (select id from spd_ready.competency_templates
                         where org_id = spd_ready.get_my_org_id()));
create policy "ct_item_insert" on spd_ready.competency_items for insert
  with check (template_id in (select id from spd_ready.competency_templates
                              where org_id = spd_ready.get_my_org_id()
                                and spd_ready.get_my_role() in ('manager','director','qa')));
create policy "ct_item_update" on spd_ready.competency_items for update
  using (template_id in (select id from spd_ready.competency_templates
                         where org_id = spd_ready.get_my_org_id()
                           and spd_ready.get_my_role() in ('manager','director','qa')));

-- Assignments: tech sees own; org managers see all org; managers write
create policy "ct_assign_select" on spd_ready.competency_assignments for select
  using (
    staff_id = auth.uid()
    or (org_id = spd_ready.get_my_org_id()
        and spd_ready.get_my_role() in ('supervisor','manager','director','qa'))
  );
create policy "ct_assign_insert" on spd_ready.competency_assignments for insert
  with check (org_id = spd_ready.get_my_org_id()
              and spd_ready.get_my_role() in ('supervisor','manager','director','qa'));
create policy "ct_assign_update" on spd_ready.competency_assignments for update
  using (
    (staff_id = auth.uid())  -- tech may advance own training status
    or (org_id = spd_ready.get_my_org_id()
        and spd_ready.get_my_role() in ('supervisor','manager','director','qa'))
  );

-- Observations: read within org; training-source written by the assigned
-- tech, manager-source written by managers.
create policy "ct_obs_select" on spd_ready.competency_observations for select
  using (
    spd_ready.assignment_in_my_org(assignment_id)
    or assignment_id in (select id from spd_ready.competency_assignments where staff_id = auth.uid())
  );
create policy "ct_obs_insert" on spd_ready.competency_observations for insert
  with check (
    (source = 'training'
     and assignment_id in (select id from spd_ready.competency_assignments where staff_id = auth.uid()))
    or (source = 'manager'
        and spd_ready.assignment_in_my_org(assignment_id)
        and spd_ready.get_my_role() in ('supervisor','manager','director','qa'))
  );

-- Records: tech reads own; org managers read all org; managers write
create policy "ct_rec_select" on spd_ready.competency_records for select
  using (
    staff_id = auth.uid()
    or (org_id = spd_ready.get_my_org_id()
        and spd_ready.get_my_role() in ('supervisor','manager','director','qa'))
  );
create policy "ct_rec_insert" on spd_ready.competency_records for insert
  with check (org_id = spd_ready.get_my_org_id()
              and spd_ready.get_my_role() in ('supervisor','manager','director','qa'));
create policy "ct_rec_update" on spd_ready.competency_records for update
  using (org_id = spd_ready.get_my_org_id()
         and spd_ready.get_my_role() in ('supervisor','manager','director','qa'));
