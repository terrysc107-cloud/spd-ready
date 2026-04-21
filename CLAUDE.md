# SPD Ready — Project Instructions

## Project Summary

SPD Ready is a **readiness-to-placement engine** for sterile processing students and hospital externship sites. Built with Next.js 15 App Router + Supabase + Tailwind CSS + shadcn/ui + Vercel.

**Core loop:** Student profile → 30-question readiness assessment → scored profile with tier → hospital candidate review → placement decision.

## Tech Stack

- **Framework:** Next.js 15 (App Router) — NOT Next.js 14
- **Database + Auth:** Supabase (Postgres + RLS + `@supabase/ssr` — NOT `@supabase/auth-helpers-nextjs`)
- **UI:** Tailwind CSS + shadcn/ui
- **Hosting:** Vercel
- **Email:** Resend + React Email
- **Analytics:** PostHog (`@posthog/next`)

## Critical Security Rules

1. **NEVER use `getSession()` server-side** for authorization. Always use `getUser()` — it verifies the token with Supabase Auth servers.
2. **Roles live in JWT claims** (`app_role`) via the Supabase Custom Access Token Hook. RLS policies read `(select auth.jwt()->>'app_role')` — the `(select ...)` wrapper is required for performance.
3. **Middleware only refreshes sessions and redirects unauthenticated users.** Role enforcement happens in route group layouts + DAL functions.
4. **Every table needs a SELECT policy** before UPDATE/DELETE will work. Missing SELECT = silent mutation failures.
5. **`@supabase/auth-helpers-nextjs` is deprecated** — do not install or import it.

## Architecture Patterns

### Route Groups
```
src/app/
  (auth)/          # login, register, reset-password
  (marketing)/     # landing page (/)
  (student)/       # student-only routes, student layout
  (hospital)/      # hospital-only routes, hospital layout
  (admin)/         # admin-only routes, admin layout
```

### Data Access Layer
All Supabase queries go through `src/lib/dal/` — never call Supabase directly from components or page files. DAL functions own auth context and RLS enforcement.

### Supabase Client Files (3 separate files required)
- `src/lib/supabase/server.ts` — for Server Components and Route Handlers
- `src/lib/supabase/client.ts` — for Client Components
- `src/lib/supabase/middleware.ts` — for middleware session refresh

### Server Actions
Use Server Actions for all mutations. Route Handlers only for OAuth callback (`/auth/callback`) and external webhooks.

## GSD Workflow

This project uses the GSD (Get Shit Done) planning system. Planning artifacts live in `.planning/`.

### Key Files
- `.planning/PROJECT.md` — project context and decisions
- `.planning/REQUIREMENTS.md` — 44 v1 requirements with REQ-IDs
- `.planning/ROADMAP.md` — 5-phase execution plan
- `.planning/STATE.md` — current phase status

### Workflow Commands
```
/gsd-discuss-phase 1    # gather context before planning
/gsd-plan-phase 1       # create PLAN.md files for phase
/gsd-execute-phase 1    # execute plans
/gsd-verify-work 1      # verify phase deliverables
```

### Current Status
- [ ] Phase 1: Foundation (Auth + Schema + RLS) — **NOT STARTED**
- [ ] Phase 2: Student Core Loop
- [ ] Phase 3: Hospital Core Loop
- [ ] Phase 4: Feedback, Admin, Demo Data
- [ ] Phase 5: Polish, Email, Analytics

## Database Schema (8 Tables)

```sql
users            -- Supabase auth.users + app_metadata.role
student_profiles -- student demographic + readiness data
student_assessments -- per-attempt scores and status
assessment_questions -- seeded question bank (30 questions)
assessment_responses -- per-answer records
hospital_profiles -- site details
externship_openings -- openings by site
applications     -- student ↔ opening with fit_score + status
hospital_feedback -- post-placement ratings
```

## Readiness Scoring

```ts
overall = technical*0.30 + situational*0.25 + process*0.15 + behavior*0.15 + instrument*0.10 + reliability*0.05
```

Tiers: Tier 1 (Ready) ≥ 75% | Tier 2 (Ready with support) 55–74% | Tier 3 (Not ready yet) < 55%

## What NOT to Build

- No resume upload (readiness profile IS the credential)
- No in-app messaging (coordinators use email)
- No Stripe in v1
- No AI black-box matching (deterministic scoring in v1)
- No unlimited instant assessment retakes (24h cooldown enforced)
- No preceptor role in v1
