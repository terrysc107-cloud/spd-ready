# SPD Ready — Project State

## Status

**Current phase:** Not started  
**Last activity:** 2026-04-20  
**Next action:** /gsd-discuss-phase 1

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-20)

**Core value:** A hospital or executive can review a structured student readiness profile and make a better placement decision faster than they could before.  
**Current focus:** Planning complete — ready to execute Phase 1

## Phase Status

| # | Phase | Status | Plans |
|---|-------|--------|-------|
| 1 | Foundation | Not started | TBD |
| 2 | Student Core Loop | Not started | TBD |
| 3 | Hospital Core Loop | Not started | TBD |
| 4 | Feedback, Admin, and Demo Data | Not started | TBD |
| 5 | Polish, Email, and Analytics | Not started | TBD |

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
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

**To resume:** Read ROADMAP.md for phase structure, then run /gsd-discuss-phase 1 to plan Phase 1 execution.
