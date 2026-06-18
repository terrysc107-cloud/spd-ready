# SPD Ready — Handoff

## CONTENT ENGINE checkpoint — 2026-06-18 (Claude) — Phases 0+1 done

Building the content engine + assessment/mindset redesign. Plan: `/Users/terry/.claude/plans/well-lets-talk-about-iterative-quokka.md`. Branch `feature/staff-competency-foundation` head `355385e` (pushed). DB = `wbznovoufjdlzmjrzsfu`.

**Phase 0 — questions moved to DB (commit aa192fd):** migrations `012_questions.sql` (unified `spd_ready.questions`, kind=study|assessment, track_domain for the 8 legacy study tracks + learning_domain/concept_id for the 7-domain framework, content_hash dedup) + `013_questions_rls.sql` (global-content RLS: authenticated read active, managers read drafts, writes service_role only). `src/lib/dal/questions.ts` = single read boundary, maps rows → existing TrackQuestion/AssessmentQuestion shapes, **static fallback** if DB empty. Rewired the quiz page + `getActiveQuestions` + `getDomainProgress`. `scripts/seed-questions.ts` (tsx) seeded the 140 static Q. Added **tsx** devDep for TS content scripts.

**Phase 1 — crcst import (commit 355385e):** `scripts/import-crcst.ts` imported **1,420** SPD Cert Prep Q → **831 active + 589 draft** (0 dups). CRCST 689 → 7 tech domains (off-mission anatomy/micro/medterm/IT/profdev = draft); CER 273 → HLD **active** (HLD bank 10→321); CHL 458 → **draft** (manager/leadership, future track). Active study tracks now: Sterilization 148, Compliance 146, Decon 89, Prep 74, Storage 67, Instrument 56, HLD 321, Judgment 30, SterilityAssurance 10 — **verified live in the study hub UI**. Total bank = 1,560 Q.

**Gates:** typecheck (incl. scripts) clean · 26/26 tests · build green (23 routes).

**Run the scripts:** `node --env-file=.env.local --import tsx scripts/seed-questions.ts` / `scripts/import-crcst.ts` (idempotent; delete-by-source then insert).

**NEXT — Phase 2 (assessment + mindset redesign, Beta) then Phase 3 (generation loop):**
- Phase 2 decisions locked: co-equal Readiness + Mindset; mindset model = beta-validated config-driven v1 (not hardcoded) with tech+manager feedback. Reuse `domain_assessments` (Likert T0/T1) + judgment_type tags + confidence-calibration idea. New: `mindset-logic.ts` (pure/testable), `mindset-model.ts` (versioned config), migration `014_mindset.sql` (mindset_profiles + tech_feedback + manager_adjustment), UI (radar + archetype + beta tap), and **rewire the readiness assessment flow** — it's still on the local JSON store + demo `requireRole('student')` (broken under real auth; `createAssessment`/`saveAnswerToDb`/`finalizeAssessment` need Supabase migration too).
- Phase 3: research-grounded `Workflow` (ST79/ST91/ST108 → draft → adversarial verify → tag → draft rows), judgment-first (crcst left SPD_JUDGMENT at 30).
- Owner decision pending: promote/cull the 589 draft (esp. CHL 458 manager content + off-mission CRCST).

---

## LIVE checkpoint — 2026-06-18 (Claude) — app wired to Supabase + auth verified end-to-end

**The app is now real and working against a live database.** Branch `feature/staff-competency-foundation` head `6f3c09f` (pushed).

**Database = existing project `ts-micro-saas-hub` (ref `wbznovoufjdlzmjrzsfu`).** Chosen over a new project (org is Pro → new project = +$10/mo) and over sharing crcst (prod) / SPD Intel. It already held SPD Ready's original `public` schema; we added the namespaced `spd_ready` schema beside it.
- **Migrations 006→011 applied** via Supabase MCP `apply_migration` (history now linear 001→011). 14 `spd_ready` tables, all RLS-enabled with policies.
- **Gotcha fixed:** PostgREST only exposed `public, graphql_public`. Ran `alter role authenticator set pgrst.db_schemas = 'public, graphql_public, spd_ready'` + `notify pgrst, 'reload schema'` so the app/seed can reach `spd_ready`. (If the platform ever resets this, re-add `spd_ready` under Dashboard → Settings → API → Exposed schemas.)
- **Seeded** `scripts/seed-competency.mjs`: org "Northland Demo Hospital — SPD", 1 dept, 1 manager + 2 techs, 1 template (Steam Sterilization Basics) + 3 items, 1 assignment → tech1. **Logins:** `manager@demo-spd.test` / `tech1@demo-spd.test` / `tech2@demo-spd.test`, all `Password123!`.
- **`.env.local`** created (gitignored) with URL + anon key + `SUPABASE_SERVICE_ROLE_KEY=[REDACTED]`. Service_role key is the original (leaked-in-history) one — Terry chose not to rotate yet; rotate in Dashboard → Settings → API when ready and update `.env.local`.
- **Access-token hook NOT enabled in Auth config — and not needed:** `getAuthUser` + RLS resolve role from the `profiles` table directly. (Enabling it later just removes one profile read.)

**Auth re-home DONE + verified live (commit 6f3c09f):** `signInAction`→`signInWithPassword` + role redirect (manager→/competency, tech→/student/dashboard); `signOutAction`/`resetPasswordAction`→Supabase; dropped dead demo `signUpAction`; (student) layout + 9 tech pages + `dal/student.ts` swapped `getCurrentUser`→`getAuthUser`/`requireAuth`. **Playwright-verified:** manager login → /competency shows 3 staff + "0 of 1 validated" (RLS-scoped); tech login → /student/dashboard shows real identity + empty engine state.

**Gates:** typecheck clean · 26/26 tests · build green (23 routes).

**Known limits / next:**
- `dal/student.ts` profile read/write is still the local JSON store (`local-db`) — works locally, but the FS is read-only on Vercel; migrate `student_profiles` to `spd_ready` before deploy (out of scope this pass).
- Tech engine data starts empty (no training yet) — demo the loop by having a tech train (writes to Supabase) then a manager validate.
- Optional cleanup: retire legacy `admin/dashboard` + `api/seed`; StatCard/ProgressRing refactor of the tech dashboard gamification row.
- The full populated **validate → evidence** manager path isn't exercised yet (assignment is at `assigned`); walk a tech through training to reach `ready_for_validation`, then sign off.

---

## UI BUILD checkpoint — 2026-06-18 (Claude) — narrative reposition complete

**Task:** Finish the offline-verifiable UI build. Branch `feature/staff-competency-foundation` (pushed; head `4613291`).

**Done & pushed since last checkpoint:**
- **Landing rewrite (commit 8d095ae):** `(marketing)/page.tsx` fully repositioned student→placement ⇒ **SPD competency / survey-readiness**. New story: hero "One standard for SPD competency", problem (no industry training standard / record falls apart at survey), the **assign→train→auto-feed→validate→prove** loop, the readiness-score engine, a manager **Department Readiness** mock card, a tech process-training section, a **competency-status** explainer (Validated / In Training / Needs Attention). Kept the **OhioHealth ROI section (locked)** + all brand visuals. Removed all `?role=student|hospital` deep links → single **Request a demo / Sign in**. **Visually QA'd at 1280px + 390px** (stacks clean on mobile).
- **Invite-only register (commit 8d095ae):** `(auth)/register/page.tsx` → "Request access" (mailto CTA), dropped Student/Hospital radio + the demo-store `signUpAction` call.
- **Tech copy sweep (commit 4613291):** de-placemented dashboard ("Student Portal"→"My Training"; tier "Placement Ready"→"Survey Ready"; judgment/tier-progress copy), results `TIER_NEXT_STEPS` (no externship eligibility/applications), study+learning ("coordinator"→"manager"), onboarding (credential→competency record). Active tech surface now clean of placement framing; `_archive_*` dirs untouched (not routed).

**Gates:** `npm run typecheck` clean · `npm run build` green (23 routes; `/` and `/register` now static) after each commit.

**THE ONE REMAINING UI PIECE — auth re-home (needs a live Supabase project; cannot verify a login flow offline, no Docker):**
- `signInAction` (`src/actions/auth.ts`) → Supabase `signInWithPassword`.
- add `redirectForRole(role)` — manager roles→`/competency`, tech→`/student/dashboard`.
- swap tech pages `getCurrentUser()` (demo cookie) → `requireAppRole(['tech'])`/`requireAuth()`; (student) layout currently still demo-auth.
- then seed + walk the populated manager↔tech loop end-to-end.
**To do it:** set `.env.local` (URL + anon + service_role) on a remote project → `node --env-file=.env.local scripts/seed-competency.mjs` → verify.

**Optional later (low value, needs data): retire legacy `admin/dashboard` + `api/seed`; StatCard/ProgressRing refactor of the tech dashboard gamification row.**

---

## UI BUILD checkpoint — 2026-06-17 (Claude)

**Task:** Premium UI build (4 phases). Branch `feature/staff-competency-foundation` (pushed). Plan: `/Users/terry/.claude/plans/well-lets-talk-about-iterative-quokka.md`.

**Done & committed/pushed:**
- **Phase 1 (commit 5ab01b5):** premium app shell — `components/shell/{AppShell,Sidebar}` (dark `--sidebar-*` rail on desktop, mobile bottom-tab bar, role-aware) + ui primitives `page-header, stat-card, progress-ring, status-pill, table/DataTable, empty-state, skeleton, toast`. `(competency)`+`(student)` layouts → thin AppShell wrappers. globals.css elevation doc. **Visually QA'd at 1280px + 390px.**
- **Phase 2 (commit 6c1ed8b):** manager journey — NEW `/competency` overview (gradient header, StatCards, readiness ring, needs-attention, recent sign-offs), elevated `/competency/staff` (DataTable + rollup), new `/competency/staff/[staffId]`, `/competency/report` evidence packet (+print), restyled assign/validate + forms (Toast). Additive DAL `lib/dal/competency-overview.ts` + `getMyOrg`. **ROUTING FIX:** `(competency)` route group → real `competency/` segment (the group resolved to `/` and collided with marketing; also fixed pre-existing broken `/competency/*` nav links).
- **Phase 3 partial (commit 0ec5c33):** Logo subtitle + root metadata de-student-ified; killed all dead links to archived `openings/applications/assessment` (dashboard/results/profile) incl. a `redirect()` that pointed at a 404.

**Gates:** `npm run typecheck` clean · `npm run build` succeeds (23 routes) after every phase. NOT visually QA'd with populated data (no Docker/Supabase).

**REMAINING UI work:**
- Phase 3 (needs live DB to verify): full landing-page rewrite (still student/placement framed), invite-only register, `signInAction`→Supabase `signInWithPassword`, `redirectForRole` (manager→/competency, tech→/student/dashboard), swap tech pages `getCurrentUser`→`requireAppRole(['tech'])`.
- Phase 4: tech dashboard StatCard/ProgressRing adoption + emoji demotion; retire legacy `admin/dashboard` + `api/seed`.

**To visually QA / verify the populated app:** connect a remote Supabase (`.env.local`), `node --env-file=.env.local scripts/seed-competency.mjs`, then walk manager + tech flows. (No Docker locally.) Shell/primitives were QA'd via a temporary `/preview` page (since removed).

---

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

---
## Handoff — 2026-06-17 18:28:23 EDT

- Repo: /Users/terry/code/spd-ready
- Branch: feature/staff-competency-foundation
- Last commit: 0ec5c33 feat(ui): de-student-ify copy + fix dead marketplace links (Phase 3 partial)
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
```
 M .ai/HANDOFF.md
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
## Handoff — 2026-06-17 20:08:50 EDT

- Repo: /Users/terry/code/spd-ready
- Branch: feature/staff-competency-foundation
- Last commit: 399b559 docs: handoff checkpoint — narrative reposition complete; auth re-home is the last DB-gated piece
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

---
## Handoff — 2026-06-17 20:15:07 EDT

- Repo: /Users/terry/code/spd-ready
- Branch: feature/staff-competency-foundation
- Last commit: 399b559 docs: handoff checkpoint — narrative reposition complete; auth re-home is the last DB-gated piece
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
```
 M .ai/HANDOFF.md
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
## Handoff — 2026-06-17 20:17:41 EDT

- Repo: /Users/terry/code/spd-ready
- Branch: feature/staff-competency-foundation
- Last commit: 399b559 docs: handoff checkpoint — narrative reposition complete; auth re-home is the last DB-gated piece
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
```
 M .ai/HANDOFF.md
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
## Handoff — 2026-06-17 20:22:25 EDT

- Repo: /Users/terry/code/spd-ready
- Branch: feature/staff-competency-foundation
- Last commit: 399b559 docs: handoff checkpoint — narrative reposition complete; auth re-home is the last DB-gated piece
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
```
 M .ai/HANDOFF.md
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
## Handoff — 2026-06-17 20:36:53 EDT

- Repo: /Users/terry/code/spd-ready
- Branch: feature/staff-competency-foundation
- Last commit: e43e9ac docs: live checkpoint — Supabase wired + auth verified e2e
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

---
## Handoff — 2026-06-17 20:42:39 EDT

- Repo: /Users/terry/code/spd-ready
- Branch: feature/staff-competency-foundation
- Last commit: e43e9ac docs: live checkpoint — Supabase wired + auth verified e2e
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
```
 M .ai/HANDOFF.md
```

### Summary
- TODO: What changed?

### Decisions / assumptions
- TODO: Key choices Claude made.

### Next steps
- TODO: The next human/Hermes/Claude action.

### Blockers / warnings
- TODO: Anything unresolved, failing, risky, or needing the user.
