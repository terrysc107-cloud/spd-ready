---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 02-student-core-loop
current_plan: 3
status: complete
stopped_at: Completed 02-03-PLAN.md (assessment UI — entry gate, step pages, results page)
last_updated: "2026-04-21T19:00:00Z"
last_activity: 2026-04-21
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 6
  completed_plans: 6
  percent: 100
---

# SPD Ready — Project State

## Status

**Current phase:** 02-student-core-loop
**Current plan:** 3 (complete — phase 2 done)
**Last activity:** 2026-04-21
**Next action:** Execute Phase 3 — Hospital Core Loop

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-20)

**Core value:** A hospital or executive can review a structured student readiness profile and make a better placement decision faster than they could before.  
**Current focus:** Phase --phase — 2

## Phase Status

| # | Phase | Status | Plans |
|---|-------|--------|-------|
| 1 | Foundation | Complete (3/3 plans done) | 01-01, 01-02, 01-03 all complete |
| 2 | Student Core Loop | Complete (3/3 plans done) | 02-01, 02-02, 02-03 all complete |
| 3 | Hospital Core Loop | Not started | TBD |
| 4 | Feedback, Admin, and Demo Data | Not started | TBD |
| 5 | Polish, Email, and Analytics | Not started | TBD |

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-21 | CategoryScoreBar is a Server Component with CSS-only width — no recharts | No hydration risk, simpler, sufficient for bar display |
| 2026-04-21 | AssessmentQuestion uses useFormStatus (not useActionState) for pending state | saveAnswerAction always redirects, never returns state; useFormStatus is the correct API for this pattern |
| 2026-04-21 | Results page reads readiness_tier from student_profiles (not student_assessments) | student_assessments has no readiness_tier column — confirmed in 02-02; tier written to profiles by submitAssessmentAction |
| 2026-04-21 | assessment_questions schema uses options_json/scoring_key_json (jsonb), not option_a/b/c/d | Actual 001_initial_schema.sql uses jsonb columns; plan referenced wrong column names; migration adapted to actual schema |
| 2026-04-21 | student_assessments has no readiness_tier column — tier stored in student_profiles only | Schema defines readiness_tier in student_profiles, not student_assessments; finalizeAssessment omits tier; submitAssessmentAction writes tier to profiles |
| 2026-04-21 | Migration 005 uses fixed UUIDs for idempotent ON CONFLICT DO NOTHING | gen_random_uuid() in INSERT generates new UUIDs each run so ON CONFLICT never fires; fixed UUIDs ensure true idempotency |
| 2026-04-21 | URL contract locked: /student/assessment/[assessmentId]/[step] for assessment routing | assessmentId in URL required for resume and multi-attempt support; Plan 02-03 must use this exact segment structure |
| 2026-04-21 | ApplicationRow uses `as unknown as` double cast for Supabase nested join returns | Supabase returns arrays for joined relations; ApplicationRow uses singular objects for ergonomics; double cast is safe at call sites |
| 2026-04-21 | Profile edit mode via ?edit=true query param | Clean URL pattern, no separate route needed, awaited per Next.js 16 async searchParams |
| 2026-04-21 | profile_complete gate in onboarding/page.tsx redirects to /student/profile | Prevents double-onboarding; Plan 02-02 adds the second gate layer in assessment entry |
| 2026-04-21 | Server Actions use redirect-with-query-params for errors | React form action prop requires void return type; returning error objects causes TS2322; all error paths use redirect('/path?error=...') instead |
| 2026-04-21 | Next.js 16 async searchParams in pages | searchParams is a Promise in Next.js 16 — all auth pages await it before accessing fields |
| 2026-04-21 | signUpAction redirects to role-specific onboarding | Students → /student/onboarding, hospitals → /hospital/onboarding after registration |
| 2026-04-21 | 004_auth_trigger.sql as defense-in-depth | Auth trigger syncs auth.users → public.users on INSERT with ON CONFLICT DO NOTHING; Server Action is primary, trigger is fallback |
| 2026-04-21 | Next.js 16 (create-next-app@latest installed 16.2.4) | Plan said 15, but latest is 16. Next.js 16 renames middleware.ts → proxy.ts and middleware() → proxy(). Applied the rename. Functionality identical. |
| 2026-04-20 | Next.js 15 (not 14) | @supabase/ssr patterns require async cookies API native to Next.js 15; starting on 14 means fighting official Supabase patterns from day one |
| 2026-04-20 | 5 phases (not 7) | Research confirmed tighter phase grouping fits standard granularity; merging phases that share context with no blocking dependency between them |
| 2026-04-20 | Deterministic fit scoring | Explainable, controllable, faster to build; AI matching layer is v2 |
| 2026-04-20 | Assessment retake cooldown (24h) | Prevents score gaming; schema tracks attempt timestamps from Phase 1 |
| 2026-04-20 | Role stored in app_metadata (not user_metadata) | Users cannot modify their own app_metadata, preventing role escalation |
| 2026-04-20 | Always use getUser() not getSession() on server | getSession() reads an unverified JWT that can be spoofed; getUser() is the only safe server-side auth check |
| 2026-04-20 | Three separate Supabase client factories | server.ts, client.ts, middleware.ts — never reused across contexts; prevents session handling bugs |
| 2026-04-20 | DAL pattern (lib/dal/) | Centralizes all DB queries with auth checks; prevents accidental bypass in components |
| 2026-04-20 | Candidate narrative via template string (v1) | Template-string approach is fast to build and credible for demo; LLM-generated narrative is a v2 upgrade |
| 2026-04-20 | State-level geography matching (v1) | Deep geocoding requires paid API; state-level fallback is accurate enough for demo and documented as v1 limitation |

## Accumulated Context

### Research Flags (address during phase planning)

- **Phase 2:** Assessment question content — 30 SPD-specific questions need domain review before the assessment engine is built; generic language destroys hospital coordinator trust
- **Phase 3:** Geography fit scoring — validate state-level radius matching approach before fit score is treated as accurate in the demo

### Architecture Notes

- Route groups: (marketing)/, (auth)/, (student)/, (hospital)/, (admin)/
- RLS policies must use IN subquery pattern (not joins) for performance; wrap auth.uid() in (select auth.uid()) for single-evaluation caching
- B-tree indexes required on all user_id/hospital_user_id columns referenced in RLS policies
- middleware.ts at project root is mandatory — without it, sessions stop refreshing and users get randomly logged out
- Server Actions handle all mutations — CSRF protection, revalidation, and redirect are built-in
- Scoring runs as a Server Action on final submit — deterministic arithmetic, no Edge Function overhead

### Critical Pitfalls (from research)

1. Never use getSession() for server-side authorization — always getUser()
2. @supabase/ssr setAll handler must write to BOTH request.cookies and response.cookies
3. One authoritative role source: public.users table; do not rely solely on JWT metadata
4. Every RLS table needs SELECT, INSERT, UPDATE, and DELETE policies — missing SELECT causes silent mutation failures
5. RLS policies must use IN subquery pattern, not joins, to avoid candidate list timeouts

## Session Continuity

**Planning completed:** 2026-04-20  
**Files written:**

- .planning/PROJECT.md
- .planning/REQUIREMENTS.md
- .planning/research/SUMMARY.md
- .planning/ROADMAP.md
- .planning/STATE.md

**Phase 1 completed:** 2026-04-21
**Phase 2 Plan 01 completed:** 2026-04-21
**Stopped at:** Completed 02-02-PLAN.md (assessment engine — questions, DAL, scoring, Server Actions)
**To resume:** Execute 02-02-PLAN.md — assessment DAL, start/step/submit Server Actions, AssessmentQuestion component, step routing, scoring. Before end-to-end verification: apply migrations (supabase db push) and populate spd-ready/.env.local with Supabase credentials.
