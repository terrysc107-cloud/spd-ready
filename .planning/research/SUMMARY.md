# Project Research Summary

**Project:** SPD Ready — Sterile Processing Student Readiness & Externship Placement
**Domain:** Healthcare workforce readiness assessment + multi-role placement web app
**Researched:** 2026-04-20
**Confidence:** HIGH

---

## Executive Summary

SPD Ready is a niche but structurally well-defined product: a credentialing-adjacent readiness platform for healthcare students, combined with a placement coordination tool for hospital externship coordinators. The closest industry analogs are clinical rotation management systems (Exxat, MedHub) and allied health credentialing platforms (VerityStream), but SPD Ready's core differentiator is a domain-specific structured assessment that produces actionable readiness tiers — not a generic questionnaire or a resume database. The entire value proposition depends on the quality of the 30 SPD-specific questions and the clarity of the tier/fit scoring output. Everything else in the product is infrastructure for that core signal.

The recommended build approach is a linear, dependency-gated phase sequence: auth and schema first, then the student assessment loop, then the hospital review loop, then admin and polish. No phase can be safely started without the prior phase being stable, because the hospital experience is entirely dependent on students having completed assessments with real scores. The two highest-risk technical components — the RLS policy matrix and the assessment engine — must be validated with test data before proceeding to downstream phases. The stack is confirmed stable (Next.js 15 + Supabase + shadcn/ui + Tailwind v4 + Vercel) with one important correction: Next.js 15 should replace any reference to Next.js 14, because the official @supabase/ssr package is written for the Next.js 15 async cookies() API.

The primary risks are not technical complexity — the stack is well-documented and the data model is straightforward. The risks are (1) auth security mistakes in Phase 1 that are invisible until production, specifically getSession() misuse and incomplete role enforcement, (2) the assessment question content itself, which requires domain review to avoid feeling generic to hospital coordinators who are SPD subject matter experts, and (3) demo data quality, which must tell a credible story across all three readiness tiers to be convincing at a conference presentation.

---

## Key Findings

### Recommended Stack

The planned stack is confirmed and well-chosen. One correction and several version pins are required before starting. Use **Next.js 15.5.15** (not 14) because @supabase/ssr 0.10.2 uses the async cookies() API that is native to Next.js 15 — starting on Next.js 14 means fighting official Supabase patterns from day one. All stack dependencies were verified via Context7 and npm as of 2026-04-20.

**Core technologies:**
- **Next.js 15.5.15** (App Router): Full-stack framework — confirmed alignment with @supabase/ssr async API
- **React 19.x**: UI layer — bundled with Next.js 15, no separate install required
- **TypeScript 5.x**: Type safety throughout — required, not optional
- **@supabase/supabase-js 2.104.0**: Supabase JS client — use this, not any legacy package
- **@supabase/ssr 0.10.2**: SSR-safe Supabase client — the ONLY auth package; @supabase/auth-helpers-nextjs is deprecated and must not be installed
- **Tailwind CSS 4.2.3**: Utility CSS — requires cursor fix in globals.css for shadcn compatibility
- **shadcn/ui CLI 4.3.1**: Component scaffolding — copies components into the repo; initialize with `npx shadcn@latest init -t next`
- **Resend 6.12.2**: Transactional email — placement notifications and status-change alerts; Server Actions or Route Handlers only
- **posthog-js 1.369.3 + @posthog/next 0.1.0**: Analytics — use @posthog/next wrapper (not bare posthog-js) for SPA route tracking
- **zod 4.3.6 + react-hook-form 7.73.1**: Form validation — use together with @hookform/resolvers
- **Vercel**: Deployment — zero-config for Next.js

**Critical setup notes:**
- Three separate Supabase client factory files are required: lib/supabase/server.ts (Server Components + Route Handlers), lib/supabase/client.ts (Client Components only), lib/supabase/middleware.ts (middleware only). Never reuse across contexts.
- middleware.ts at the project root is mandatory — without it, sessions stop refreshing and users get randomly logged out.
- Store user roles in app_metadata (not user_metadata) — users cannot modify their own app_metadata, preventing role escalation.
- Always use supabase.auth.getUser() for authorization; never use supabase.auth.getSession() on the server — getSession() reads an unverified JWT that can be spoofed.
- SUPABASE_SERVICE_ROLE_KEY must never be in a NEXT_PUBLIC_ variable and must never be used in Client Components.

---

### Table Stakes Features

**Student must-have:**
- Email/password registration + magic link — both modes required; healthcare education users are not tech-heavy
- Role-based onboarding split — students and hospitals must land in their own context immediately after signup
- Multi-step profile intake wizard with save-on-step-complete — single long form causes abandonment
- 30-question assessment with SPD-specific vocabulary — generic questionnaire language destroys trust
- Immediate synchronous results on submit — no async jobs needed; delay feels broken
- Results page: tier badge prominently displayed, per-category score breakdown, strengths/growth areas, and clear CTA per tier
- Application status tracking (applied, under review, accepted, waitlisted, rejected)
- Email notification on status change
- Profile completeness indicator
- Password reset flow

**Hospital must-have:**
- Site profile creation with department/capacity details (feeds fit score model)
- Externship opening creation with status toggle (open/closed/filled)
- Ranked candidate list sorted by fit score, with tier badge inline
- Full structured candidate profile view (tier, category breakdown, strengths, growth areas, fit rationale)
- Accept/Waitlist/Reject actions per candidate + email trigger to student
- Internal notes field (optional, not visible to student)
- Email notification on new candidate application
- Post-placement feedback form (6 scored attributes + free text)

**Admin must-have:**
- Student count with tier distribution chart
- Active openings + application volume counts
- Placement count + feedback summary
- Searchable/filterable list views for students and hospitals

---

### Key Differentiators

What makes SPD Ready distinct from generic job boards and clinical rotation systems:

- **SPD-specific situational judgment questions** — Domain credibility with hospital coordinators who are SPD subject matter experts; the question bank is the moat and must use real SPD vocabulary (decontamination, IFU, OR, sterility indicators, tray assembly)
- **Tiered readiness label (Ready / Ready with Support / Not Ready Yet)** — Actionable in ways raw scores are not; maps to clinical credentialing language
- **Per-category readiness breakdown with labeled bars** — No generic placement platform shows coaching direction by category
- **Fit score with visible dimension-by-dimension rationale** — Most matching systems give a score with no explanation; showing the "why" builds coordinator trust
- **Improvement path for Tier 3 students** — Turns rejection into a re-engagement cycle
- **Candidate narrative summary** — Template-generated in v1, AI-generated in v2; 2-3 sentences more scannable than a profile grid
- **Post-placement feedback loop** — Closes the loop and builds a quality data signal over time
- **Hospital teaching capacity matching** — Matching a Tier 2 student needing coaching to a high-teaching-capacity site, with visible rationale

**Defer to v2+ (anti-features for v1):** in-app messaging, resume upload/parsing, AI-generated matching, unlimited assessment retakes (no cooldown gate), multi-hospital enterprise accounts, student document uploads, preceptor role, Stripe/payment, LMS/learning content

---

### Architecture Decisions

**Route group structure:**
```
app/
  (marketing)/     landing page
  (auth)/          login, signup — no shared layout with authenticated routes
  (student)/       student layout shell + auth guard; onboarding, assessment/[step], results, dashboard
  (hospital)/      hospital layout shell + auth guard; onboarding, openings, candidates, dashboard
  (admin)/         admin layout shell + auth guard; dashboard
```
Role context lives in session and layout, not URL prefixes. URLs stay clean (/dashboard, /assessment/1, /candidates).

**RLS + JWT role strategy:**
- Role stored in user_metadata.role at signup
- Custom Access Token Hook embeds role as app_role JWT claim for use in RLS
- RLS policies check `(select auth.jwt()->>'app_role')` — evaluated once per query, not per row (performance critical)
- Defense in depth: middleware redirect (UX) + Server Component check (per-page security) + RLS policies (database enforcement)
- Never rely on middleware alone as the security boundary

**Assessment engine approach:**
- URL-based step state (/assessment/[step]) + server-persisted responses (upsert to assessment_responses on each step)
- Survives page refresh and browser close; student can resume mid-assessment
- Scoring runs as a Server Action on final submit — deterministic arithmetic, no Edge Function overhead needed
- Score written to both student_assessments (detail) and student_profiles (summary for hospital review)

**DAL pattern (lib/dal/):**
- student.ts, assessment.ts, hospital.ts, applications.ts, scoring.ts
- Server Actions and Server Components call DAL functions — never query Supabase directly in components
- Centralizes auth checks and prevents accidental bypass
- Memoize with React cache() so multiple calls in one render cycle don't duplicate DB queries

**Major components:**
1. **Middleware** — session refresh + coarse route protection; no business logic, no DB queries
2. **Role layout shells** — per-role nav + role mismatch redirect; secondary security layer
3. **DAL (lib/dal/)** — all database queries with auth checks; single source of truth
4. **Server Actions (actions/)** — all mutations; CSRF protection, revalidation, redirect built-in
5. **Assessment engine** — step-through UI with server-persisted state; scoring Action on submit
6. **Fit scoring (lib/dal/scoring.ts)** — deterministic weighted formula (6 dimensions) computed on application submit
7. **Candidate review page** — single Supabase join query across 4 tables; RLS enforced at application level

---

### Critical Pitfalls to Avoid

1. **Using getSession() for server-side authorization** — Always use supabase.auth.getUser() on the server; getSession() reads an unverified JWT that can be spoofed to access hospital or admin routes. This bug is invisible in development.

2. **Broken token refresh in middleware** — The @supabase/ssr setAll handler must write to BOTH request.cookies (for Server Components) and response.cookies (for the browser). One missing direction causes random mid-session logouts that surface in staging, not development.

3. **Role stored in two places getting out of sync** — One authoritative source: the public.users table. Fetch role from DB after getUser() in middleware and memoize with React cache(). Do not rely solely on JWT metadata — role changes won't take effect until the user logs out.

4. **Missing SELECT policy on RLS tables breaks mutations silently** — Every table needs SELECT, INSERT, UPDATE, and DELETE policies. A missing SELECT causes UPDATE/DELETE to return 0 rows with no error — hospital "Accept candidate" silently does nothing, assessment submission appears to succeed but record is unchanged.

5. **Slow RLS policies from join-based lookups** — Use the IN subquery pattern (not joins) in all RLS policies. Wrap auth.uid() in (select auth.uid()) for single-evaluation caching. Add B-tree indexes on all user_id/hospital_user_id columns in RLS policies. Failure causes candidate list timeouts at demo-scale data.

---

## Implications for Roadmap

Based on combined research, the recommended phase structure compresses the 7-phase handoff plan to 5 phases by merging phases that share context and have no blocking dependencies between them.

### Phase 1: Foundation — Auth, Schema, RLS
**Rationale:** Every other phase depends on auth and database being correct. RLS written wrong here breaks everything downstream invisibly. The custom access token hook is required for role-based RLS — it cannot be added later without rewriting all policies.
**Delivers:** Working auth (signup with role selection, login, magic link, session management), all 8 database tables with migrations, complete RLS policy matrix, route group scaffold, middleware, 3 Supabase client utilities, /unauthorized page
**Avoids:** getSession() misuse, deprecated auth-helpers-nextjs package, role stored in user_metadata (escalation risk), incomplete route protection coverage
**Research flag:** Standard patterns — well-documented in official docs. Skip phase research, but verify each RLS policy with the Supabase policy simulator before proceeding.

### Phase 2: Student Core Loop — Profile, Assessment, Results
**Rationale:** Hospital review is meaningless without students who have completed assessments with real scores. The assessment engine is the most complex component in the app and carries the most pitfall surface area (double-submission, progress loss, shadcn hydration mismatches). It deserves its own full phase.
**Delivers:** Student onboarding wizard (multi-step, save-on-step), 30-question assessment engine (URL steps + server-persisted responses), scoring Server Action (readiness score + tier written to profile), results page (tier badge + category bars + strengths/growth areas + CTAs), 3 seeded test students (one per tier)
**Avoids:** Assessment double-submission (useActionState pending state + DB unique constraint), progress lost on refresh (persist each answer immediately), shadcn/ui hydration mismatches (wrap Radix interactive components in "use client")
**Research flag:** Assessment question content is a domain knowledge problem, not technical. Needs domain review before this phase. The 30 questions must use real SPD vocabulary to maintain credibility with hospital coordinators.

### Phase 3: Hospital Core Loop — Profile, Openings, Candidates, Placement
**Rationale:** Requires Phase 2 students with completed profiles and assessment scores to have meaningful data. Hospital profile, opening creation, application/fit-scoring, and candidate review are one logical unit sharing the same layout shell and data context — splitting them adds context-switching overhead with no benefit.
**Delivers:** Hospital onboarding form, externship opening creation (with status toggle), application submit with fit score computation (6-dimension deterministic formula), ranked candidate list (card view with tier badge + fit score inline), candidate detail review (single join query across 4 tables), Accept/Waitlist/Reject actions
**Avoids:** N+1 queries on candidate list (use Supabase relational select in one query), slow RLS from join-based policies (IN subquery pattern + indexes), realtime channel leak if realtime is used (always call removeChannel() in useEffect cleanup — recommend polling over realtime for MVP)
**Research flag:** Geography-based fit scoring needs early validation — test the radius matching approach against real city/state data or define the state-level fallback before the fit score is treated as accurate.

### Phase 4: Feedback, Admin, and Demo Data
**Rationale:** Post-placement feedback requires placed students from Phase 3. Admin dashboard is read-only aggregation over existing data. Both phases share no blocking dependency and can be built in sequence within one phase. Demo data quality is as important as any feature for the conference presentation.
**Delivers:** Post-placement feedback form (6 attributes + notes), admin dashboard (5 KPI tiles + searchable list views for students and hospitals), realistic seed data (8-10 students with varied tiers and real SPD-domain names/cities, 3-4 hospitals, 2-3 openings each, pre-calculated fit scores, one student clearly per tier)
**Avoids:** FK constraint violations in seed script (seed in strict dependency order: auth.users first, then profiles, then openings, then applications), fake-looking data undermining demo credibility (realistic names, varied scores, data that tells a 3-tier story)
**Research flag:** Standard patterns — no research needed.

### Phase 5: Polish, Email, and Analytics
**Rationale:** Email and analytics are not blocking — the core product works without them. Treating them as polish prevents them from becoming blockers during earlier phases. Loading states and error boundaries should be added now before the demo, not as an afterthought.
**Delivers:** Resend email notifications (application status changes, new applicant alerts), PostHog event tracking (use @posthog/next wrapper), Tailwind v4 cursor fix in globals.css, loading states for all async pages, error boundaries, empty states with actionable copy (never a dead-end "no results" message)
**Avoids:** PostHog SPA route tracking gap (use @posthog/next, not bare posthog-js), ad blocker blocking analytics (add next.config.ts rewrite to proxy /ingest to PostHog)
**Research flag:** Standard patterns — skip research.

### Phase Ordering Rationale

- Phase 1 before all others: RLS and auth errors are invisible and compound — they cannot be retrofitted safely
- Phase 2 before Phase 3: Hospital review requires scored students; assessment engine is the highest-complexity component and needs stable RLS to test against
- Phase 3 after Phase 2: Fit scoring requires student readiness tier and profile data to exist
- Phase 4 after Phase 3: Feedback requires accepted placements; admin metrics are only meaningful with real data
- Phase 5 last: Email and analytics are additive and do not block any core user flow

### Research Flags

Needs deeper attention during planning:
- **Phase 2:** Assessment question content — 30 questions need domain review before the assessment engine is built. Technical implementation is straightforward; content quality is the risk.
- **Phase 3:** Geography fit scoring — validate the radius matching or state-level fallback approach before fit score is treated as accurate in the demo.

Standard patterns, skip research-phase:
- **Phase 1:** Auth, middleware, RLS — fully documented in official Supabase and Next.js docs
- **Phase 4:** Feedback form, admin dashboard, seed data — standard CRUD + aggregate queries
- **Phase 5:** Email (Resend), analytics (PostHog) — both have clear official integration patterns

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages version-confirmed via Context7 and npm; @supabase/ssr patterns verified against official docs |
| Features | MEDIUM-HIGH | Table stakes and differentiators derived from project documents + clinical rotation system pattern knowledge; WebSearch unavailable for external platform verification |
| Architecture | HIGH | Route groups, RLS patterns, DAL, Server Actions, and assessment state strategy all verified against official Next.js and Supabase docs via Context7 |
| Pitfalls | HIGH | All critical pitfalls sourced from official Next.js authentication guide, official Supabase SSR docs, and RLS performance guide |

**Overall confidence:** HIGH

### Gaps to Address

- **Assessment question content:** The 30 SPD-specific questions are the hardest thing to get right and the most likely to undermine the product if they feel generic. This is a domain knowledge problem, not a technical one. Domain review with an SPD subject matter expert is recommended before the assessment engine is built in Phase 2.
- **Geography-based fit scoring:** Radius matching from city/state without a paid geocoding API may require state-level approximation for v1. Validate the fit score geography dimension early in Phase 3 — either use a free geocoding API or define the state-level fallback and document the limitation.
- **Assessment retake anti-gaming:** Design the schema to support cooldown tracking from Phase 1 (attempt timestamps in student_assessments), even if the enforcement UI is deferred to v2. Retrofitting this schema later requires a migration.

---

## Sources

### Primary (HIGH confidence)
- @supabase/ssr official docs (Context7 verified) — SSR client patterns, getUser() vs getSession(), middleware cookie handling, custom access token hook
- Supabase RLS docs (Context7 verified) — policy patterns, performance guide, custom claims and RBAC
- Next.js App Router docs (Context7 verified) — route groups, Server Actions, DAL pattern, authentication guide, data security guide
- npm registry — package versions confirmed for all core dependencies
- Project planning documents (spd_ready_planning_handoff.md, PROJECT.md) — domain requirements, data model, scoring formula, out-of-scope decisions

### Secondary (MEDIUM confidence)
- Clinical rotation platform pattern knowledge (Exxat, MedHub, VerityStream behavioral patterns) — UX recommendations for student and coordinator interfaces; WebSearch unavailable for direct verification
- Allied health credentialing platform conventions — hospital coordinator workflow expectations

### Tertiary (LOW confidence — validate during implementation)
- Geography matching approach for fit score — needs testing against real city/state data before the fit score dimension is considered accurate

---

*Research completed: 2026-04-20*
*Ready for roadmap: yes*
