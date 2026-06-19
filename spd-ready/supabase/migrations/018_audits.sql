-- ============================================================
-- SPD Ready — Audit → Remediation loop + Supabase module assignments
-- Migration: 018_audits.sql
--
-- Closes the defensible-hub loop: a manager audits a tech's area, cites a
-- deficiency (e.g. PPE), and the matching learning module is auto-assigned
-- for the tech to review + validate. Every citation, assignment, completion,
-- and sign-off is a logged, survey-ready record of gaps and drift.
--
--   audits             = the citation (who/what/where/severity/finding)
--   module_assignments = Supabase-backed assignment of a module to a tech
--                        (reason: manager | remediation | baseline). The
--                        remediation rows are created off an audit.
--
-- RLS: tech reads own; org managers full. (Tech completion updates only the
-- assignment row — the audit's sign-off stays manager-only, so completion is
-- derived from the assignment, then the manager closes the audit.)
-- ============================================================

set search_path = spd_ready, public, extensions;

-- The citation
create table spd_ready.audits (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references spd_ready.organizations(id) on delete cascade,
  staff_id     uuid not null references spd_ready.profiles(id) on delete cascade,  -- cited tech
  auditor_id   uuid references spd_ready.profiles(id),
  audit_date   date not null default current_date,
  area         text,                              -- e.g. "Decontam sink 2", "Assembly"
  category     text not null check (category in (
                 'ppe','inspection','documentation','decon_technique',
                 'biological_monitoring','sterile_storage','tray_assembly','sterilizer_operation')),
  severity     text not null default 'minor' check (severity in ('minor','major','critical')),
  finding      text not null,
  domain       text,                              -- learning_domain backing the deficiency
  concept_id   text,
  status       text not null default 'open'
                 check (status in ('open','remediation_assigned','remediated','closed')),
  validated_by uuid references spd_ready.profiles(id),
  closed_at    timestamptz,
  created_at   timestamptz not null default now()
);
create index on spd_ready.audits (org_id);
create index on spd_ready.audits (staff_id);

-- Supabase-backed module assignment (the remediation target, or a manual/baseline assign)
create table spd_ready.module_assignments (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references spd_ready.organizations(id) on delete cascade,
  module_id       uuid not null references spd_ready.learning_modules(id) on delete cascade,
  staff_id        uuid not null references spd_ready.profiles(id) on delete cascade,
  assigned_by     uuid references spd_ready.profiles(id),
  reason          text not null default 'manager' check (reason in ('manager','remediation','baseline')),
  source_audit_id uuid references spd_ready.audits(id) on delete set null,
  status          text not null default 'assigned' check (status in ('assigned','in_progress','completed','validated')),
  due_date        date,
  assigned_at     timestamptz not null default now(),
  completed_at    timestamptz
);
create index on spd_ready.module_assignments (staff_id, status);
create index on spd_ready.module_assignments (org_id);

-- ============================================================
-- RLS (SELECT-first)
-- ============================================================
alter table spd_ready.audits             enable row level security;
alter table spd_ready.module_assignments enable row level security;

-- audits: tech reads own; org managers full
create policy "audit_select" on spd_ready.audits for select
  using (
    staff_id = auth.uid()
    or (org_id = spd_ready.get_my_org_id()
        and spd_ready.get_my_role() in ('supervisor','manager','director','qa'))
  );
create policy "audit_insert" on spd_ready.audits for insert
  with check (org_id = spd_ready.get_my_org_id()
              and spd_ready.get_my_role() in ('supervisor','manager','director','qa'));
create policy "audit_update" on spd_ready.audits for update
  using (org_id = spd_ready.get_my_org_id()
         and spd_ready.get_my_role() in ('supervisor','manager','director','qa'));

-- module_assignments: tech reads + advances own; managers read all org + assign
create policy "ma_select" on spd_ready.module_assignments for select
  using (
    staff_id = auth.uid()
    or (org_id = spd_ready.get_my_org_id()
        and spd_ready.get_my_role() in ('supervisor','manager','director','qa'))
  );
create policy "ma_insert" on spd_ready.module_assignments for insert
  with check (org_id = spd_ready.get_my_org_id()
              and spd_ready.get_my_role() in ('supervisor','manager','director','qa'));
-- tech may advance own assignment status (assigned -> in_progress -> completed);
-- managers may update any assignment in their org (e.g. validate).
create policy "ma_update" on spd_ready.module_assignments for update
  using (
    staff_id = auth.uid()
    or (org_id = spd_ready.get_my_org_id()
        and spd_ready.get_my_role() in ('supervisor','manager','director','qa'))
  );
