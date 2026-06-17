# SPD Ready — Handoff

## Latest checkpoint — 2026-06-17 (Claude)

### Active task
Reposition SPD Ready from a student→hospital externship marketplace (demo prototype) into the **staff competency / training / compliance** layer of the SPD readiness suite. Slice 0 (real foundation) + Slice 1 (competency loop) of an approved plan.
Plan file: `/Users/terry/.claude/plans/well-lets-talk-about-iterative-quokka.md`

### Goal
SPD Ready = "the software that creates a standard SPD training and process the industry lacks." A tech trains on real SPD competencies; the existing readiness/mastery engine scores confidence and **auto-feeds a verifiable competency record**; a manager assigns/validates off audits/observation. Drives hospital adoption of the suite. Backend integration with SPD Intel + Cert Prep is deferred to LAST.

### What changed (this session)
**Foundation discovery:** SPD Ready was NOT on Supabase — it ran on a cookie + JSON demo store (`src/lib/local-db/store.ts`), with the Supabase migrations/RLS/role-hook present but unwired. Decision (owner): make it real first.

**Data layer — 5 new migrations (additive, in a dedicated `spd_ready` schema mirroring SPD Intel's shape):**
- `007_spd_ready_identity.sql` — `organizations / departments / profiles` (+ `tech` role) + RLS helpers (`get_my_org_id/_role/_dept_id`).
- `008_engine_persistence.sql` — `concept_mastery, domain_assessments, study_sessions, streaks, xp_records, confidence_taps` (keyed by `staff_id = auth.users.id`).
- `009_role_hook.sql` — Custom Access Token Hook now reads role from `spd_ready.profiles`; signup trigger provisions a profile (role `tech`).
- `010_engine_rls.sql` — SELECT-first RLS; engine data owned by the staff member, org managers read-only.
- `011_competency_core.sql` — `competency_templates / items / assignments / observations / records` + SELECT-first RLS (tech reads own, managers assign/validate).

**Code:**
- Supabase clients (`server.ts`, `client.ts`) pinned to `{ db: { schema: 'spd_ready' } }`.
- `src/lib/dal/auth.ts` — added real Supabase auth (`getAuthUser`, `requireAuth`, `requireAppRole`, `AppRole`, `MANAGER_ROLES`). Kept legacy demo cookie auth so archived code still compiles.
- Engine persistence rewritten to Supabase (pure scoring logic untouched): `dal/mastery.ts`, `dal/likert.ts`, `dal/study.ts`, `dal/learning.ts`, `actions/mastery.ts`, `actions/study.ts`.
- Competency layer (new): `dal/competency.ts`, `dal/competency-logic.ts` (pure, testable), `dal/org.ts`, `actions/competency.ts` (assign/validate + `syncTrainingToCompetency` auto-feed hooked into `recordAttemptAction`).
- UI (new `src/app/(competency)/`): `layout`, `staff`, `assign`, `validate/[assignmentId]`, `report`, `my` + client forms `components/competency/{AssignForm,ValidateForm}.tsx`.
- Archived marketplace (non-breaking, git-mv): `(hospital)` → `_archive_hospital`; student `applications/openings/assessment` → `_archive_student`. Added `src/lib/flags.ts` (`MARKETPLACE_ENABLED`).
- Hygiene: `package.json` scripts (`test/test:watch/typecheck/lint`); removed hardcoded service_role key from `scripts/seed-test-users.mjs` → env vars; added `.env.example`; `.gitignore` `!.env.example`.
- New: `tests/competency.test.ts`; `scripts/seed-competency.mjs`.

### Tests / checks run (exact results)
- `npm run typecheck` → **clean** (0 errors).
- `npm test` → **3 suites, 26 tests passed** (incl. 6 new competency tests).
- `npm run build` (dummy public env) → **succeeds**; `(competency)` routes present, marketplace routes gone.
- `supabase db reset` / live e2e → **NOT run — Docker not running in this environment.**

### Git branch & status
- Branch: `feature/staff-competency-foundation` (off `main`).
- **Uncommitted.** 46 changed paths. Not committed (awaiting owner go-ahead per repo policy).

### Decisions made
- Reposition (not extend); reuse the learning/mastery engine as the training half of competency.
- Align identity to SPD Intel's `org/dept/profile/role` shape now; integrate later.
- Make the foundation real first (Supabase auth + persistence + RLS); static SPD content stays as code.
- `spd_ready` schema (not `public`, not Intel's `spd`) to avoid collisions and ease a later cross-schema view.
- Thin competency slice first; pathways / IFU acks / remediation / renewals deferred to Slice 2+.
- Parked: externship placement may later become an SPD Cert Prep feature.

### Blockers / risks / warnings
- **SECURITY (owner action):** the Supabase **service_role key** for project ref `[REDACTED — project wbzn…sfu]` was hardcoded in git history. Removed from source, but **rotate it in the Supabase dashboard** and update all envs (local/Vercel/CI) together; consider a history scrub (BFG).
- DB-side work is **unverified against a live database** (no Docker here). Migrations + DAL queries are typechecked but not executed.
- Transition seam: legacy demo cookie auth still present; the student learning/study routes are repositioned as the tech training surface but their `(student)` layout still uses demo `requireRole`. Re-home them under real auth in a follow-up.
- Legacy `src/app/api/seed/route.ts` still targets the old demo store — review/remove later.

### Exact next step
1. **Rotate the leaked service_role key** (owner, dashboard).
2. Bring up a DB and apply migrations: `supabase start && supabase db reset` (needs Docker) OR `supabase db push` to the remote project. Then configure the Custom Access Token Hook in Supabase Auth settings to `public.custom_access_token_hook`.
3. Seed: `node --env-file=.env.local scripts/seed-competency.mjs`.
4. E2E verify the loop: tech logs in → studies `sterilization` → mastery persists + `syncTrainingToCompetency` writes training observations + assignment → `ready_for_validation`; manager opens `/validate/[assignmentId]` → signs off → one `competency_records` row → `/report` shows it. Run the RLS/data assertions in the plan's Verification section.
5. Follow-up: re-home the tech training routes under real auth (new `(tech)` group); add a "My Competencies" entry point from the tech dashboard.

---
## Handoff — 2026-06-17 11:55:53 EDT

- Repo: /Users/terry/code/spd-ready
- Branch: feature/staff-competency-foundation
- Last commit: 4117992 feat: complete phases 3-5 — feedback, email, mobile nav, seed expansion
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
```
 M spd-ready/.gitignore
 M spd-ready/package.json
 M spd-ready/scripts/seed-test-users.mjs
 M spd-ready/src/actions/mastery.ts
 M spd-ready/src/actions/study.ts
R  spd-ready/src/app/(hospital)/hospital/candidates/[studentId]/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/candidates/[studentId]/page.tsx
R  spd-ready/src/app/(hospital)/hospital/candidates/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/candidates/page.tsx
R  spd-ready/src/app/(hospital)/hospital/cohort/[studentId]/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/cohort/[studentId]/page.tsx
R  spd-ready/src/app/(hospital)/hospital/cohort/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/cohort/page.tsx
R  spd-ready/src/app/(hospital)/hospital/cohort/roi/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/cohort/roi/page.tsx
R  spd-ready/src/app/(hospital)/hospital/dashboard/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/dashboard/page.tsx
R  spd-ready/src/app/(hospital)/hospital/onboarding/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/onboarding/page.tsx
R  spd-ready/src/app/(hospital)/hospital/openings/[id]/candidates/[appId]/feedback/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/openings/[id]/candidates/[appId]/feedback/page.tsx
R  spd-ready/src/app/(hospital)/hospital/openings/[id]/candidates/[appId]/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/openings/[id]/candidates/[appId]/page.tsx
R  spd-ready/src/app/(hospital)/hospital/openings/[id]/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/openings/[id]/page.tsx
R  spd-ready/src/app/(hospital)/hospital/openings/new/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/openings/new/page.tsx
R  spd-ready/src/app/(hospital)/hospital/openings/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/openings/page.tsx
R  spd-ready/src/app/(hospital)/hospital/profile/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/profile/page.tsx
R  spd-ready/src/app/(hospital)/layout.tsx -> spd-ready/src/app/_archive_hospital/layout.tsx
R  spd-ready/src/app/(student)/student/applications/page.tsx -> spd-ready/src/app/_archive_student/applications/page.tsx
R  spd-ready/src/app/(student)/student/assessment/[assessmentId]/[step]/page.tsx -> spd-ready/src/app/_archive_student/assessment/[assessmentId]/[step]/page.tsx
R  spd-ready/src/app/(student)/student/assessment/page.tsx -> spd-ready/src/app/_archive_student/assessment/page.tsx
R  spd-ready/src/app/(student)/student/assessment/start/page.tsx -> spd-ready/src/app/_archive_student/assessment/start/page.tsx
R  spd-ready/src/app/(student)/student/openings/page.tsx -> spd-ready/src/app/_archive_student/openings/page.tsx
 M spd-ready/src/lib/dal/auth.ts
 M spd-ready/src/lib/dal/learning.ts
 M spd-ready/src/lib/dal/likert.ts
 M spd-ready/src/lib/dal/mastery.ts
 M spd-ready/src/lib/dal/study.ts
 M spd-ready/src/lib/supabase/client.ts
 M spd-ready/src/lib/supabase/server.ts
?? .ai/
?? spd-ready/.env.example
?? spd-ready/scripts/seed-competency.mjs
?? spd-ready/src/actions/competency.ts
?? spd-ready/src/app/(competency)/
?? spd-ready/src/components/competency/
?? spd-ready/src/lib/dal/competency-logic.ts
?? spd-ready/src/lib/dal/competency.ts
?? spd-ready/src/lib/dal/org.ts
?? spd-ready/src/lib/flags.ts
?? spd-ready/supabase/migrations/007_spd_ready_identity.sql
?? spd-ready/supabase/migrations/008_engine_persistence.sql
?? spd-ready/supabase/migrations/009_role_hook.sql
?? spd-ready/supabase/migrations/010_engine_rls.sql
?? spd-ready/supabase/migrations/011_competency_core.sql
?? spd-ready/tests/competency.test.ts
```

### Summary
- TODO: What changed?

### Decisions / assumptions
- TODO: Key choices Claude made.

### Next steps
- TODO: The next human/Hermes/Claude action.

### Blockers / warnings
- TODO: Anything unresolved, failing, risky, or needing the user.

---
## Handoff — 2026-06-17 12:19:02 EDT

- Repo: /Users/terry/code/spd-ready
- Branch: feature/staff-competency-foundation
- Last commit: 4117992 feat: complete phases 3-5 — feedback, email, mobile nav, seed expansion
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
```
 M spd-ready/.gitignore
 M spd-ready/package.json
 M spd-ready/scripts/seed-test-users.mjs
 M spd-ready/src/actions/mastery.ts
 M spd-ready/src/actions/study.ts
R  spd-ready/src/app/(hospital)/hospital/candidates/[studentId]/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/candidates/[studentId]/page.tsx
R  spd-ready/src/app/(hospital)/hospital/candidates/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/candidates/page.tsx
R  spd-ready/src/app/(hospital)/hospital/cohort/[studentId]/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/cohort/[studentId]/page.tsx
R  spd-ready/src/app/(hospital)/hospital/cohort/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/cohort/page.tsx
R  spd-ready/src/app/(hospital)/hospital/cohort/roi/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/cohort/roi/page.tsx
R  spd-ready/src/app/(hospital)/hospital/dashboard/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/dashboard/page.tsx
R  spd-ready/src/app/(hospital)/hospital/onboarding/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/onboarding/page.tsx
R  spd-ready/src/app/(hospital)/hospital/openings/[id]/candidates/[appId]/feedback/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/openings/[id]/candidates/[appId]/feedback/page.tsx
R  spd-ready/src/app/(hospital)/hospital/openings/[id]/candidates/[appId]/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/openings/[id]/candidates/[appId]/page.tsx
R  spd-ready/src/app/(hospital)/hospital/openings/[id]/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/openings/[id]/page.tsx
R  spd-ready/src/app/(hospital)/hospital/openings/new/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/openings/new/page.tsx
R  spd-ready/src/app/(hospital)/hospital/openings/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/openings/page.tsx
R  spd-ready/src/app/(hospital)/hospital/profile/page.tsx -> spd-ready/src/app/_archive_hospital/hospital/profile/page.tsx
R  spd-ready/src/app/(hospital)/layout.tsx -> spd-ready/src/app/_archive_hospital/layout.tsx
R  spd-ready/src/app/(student)/student/applications/page.tsx -> spd-ready/src/app/_archive_student/applications/page.tsx
R  spd-ready/src/app/(student)/student/assessment/[assessmentId]/[step]/page.tsx -> spd-ready/src/app/_archive_student/assessment/[assessmentId]/[step]/page.tsx
R  spd-ready/src/app/(student)/student/assessment/page.tsx -> spd-ready/src/app/_archive_student/assessment/page.tsx
R  spd-ready/src/app/(student)/student/assessment/start/page.tsx -> spd-ready/src/app/_archive_student/assessment/start/page.tsx
R  spd-ready/src/app/(student)/student/openings/page.tsx -> spd-ready/src/app/_archive_student/openings/page.tsx
 M spd-ready/src/lib/dal/auth.ts
 M spd-ready/src/lib/dal/learning.ts
 M spd-ready/src/lib/dal/likert.ts
 M spd-ready/src/lib/dal/mastery.ts
 M spd-ready/src/lib/dal/study.ts
 M spd-ready/src/lib/supabase/client.ts
 M spd-ready/src/lib/supabase/server.ts
?? .ai/
?? spd-ready/.env.example
?? spd-ready/scripts/seed-competency.mjs
?? spd-ready/src/actions/competency.ts
?? spd-ready/src/app/(competency)/
?? spd-ready/src/components/competency/
?? spd-ready/src/lib/dal/competency-logic.ts
?? spd-ready/src/lib/dal/competency.ts
?? spd-ready/src/lib/dal/org.ts
?? spd-ready/src/lib/flags.ts
?? spd-ready/supabase/migrations/007_spd_ready_identity.sql
?? spd-ready/supabase/migrations/008_engine_persistence.sql
?? spd-ready/supabase/migrations/009_role_hook.sql
?? spd-ready/supabase/migrations/010_engine_rls.sql
?? spd-ready/supabase/migrations/011_competency_core.sql
?? spd-ready/tests/competency.test.ts
```

### Summary
- TODO: What changed?

### Decisions / assumptions
- TODO: Key choices Claude made.

### Next steps
- TODO: The next human/Hermes/Claude action.

### Blockers / warnings
- TODO: Anything unresolved, failing, risky, or needing the user.

---
## Handoff — 2026-06-17 12:52:28 EDT

- Repo: /Users/terry/code/spd-ready
- Branch: feature/staff-competency-foundation
- Last commit: ae2ca52 feat: reposition SPD Ready into staff competency platform (Slice 0+1)
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
Clean working tree or not a git repo.

### Summary
- TODO: What changed?

### Decisions / assumptions
- TODO: Key choices Claude made.

### Next steps
- TODO: The next human/Hermes/Claude action.

### Blockers / warnings
- TODO: Anything unresolved, failing, risky, or needing the user.
