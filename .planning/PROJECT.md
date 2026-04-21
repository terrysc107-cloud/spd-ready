# SPD Ready

## What This Is

SPD Ready is a readiness-to-placement engine for sterile processing (SPD) students and externship sites. It assesses whether a student is ready for externship placement, generates a structured readiness profile, matches students to the right hospital or surgery center, and gives hospitals the confidence to place the right candidates faster. It is separate from SPD Cert Prep (study/exam prep) and sits between education, readiness evaluation, placement workflow, and operational feedback.

## Core Value

A hospital or executive can review a structured student readiness profile and make a better placement decision faster than they could before.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Student can create an account and complete a profile (name, location, travel radius, cert status, program, availability, transportation)
- [ ] Student can complete a multi-category readiness assessment (6 categories, 30 questions)
- [ ] Student receives a scored readiness profile with tier, strengths, growth areas, and next steps
- [ ] Hospital can create a site profile describing capacity, environment, and requirements
- [ ] Hospital can create externship openings with title, dates, slots, shift, and requirements
- [ ] System ranks students against openings using a deterministic fit score
- [ ] Hospital can review ranked candidates with full readiness profiles
- [ ] Hospital can accept, waitlist, or reject candidates
- [ ] Hospital can submit post-placement feedback on students
- [ ] Admin can view platform metrics (student counts, tier distribution, openings, placements)
- [ ] Landing page with clear CTAs for students and hospitals

### Out of Scope

- Native mobile app — MVP is web-only; mobile is a Phase 2+ project
- Stripe / billing — monetization is a future milestone
- Full LMS inside this app — learning happens in SPD Cert Prep, not here
- SPD Cert Prep integration — will be added after both products are stable
- In-app messaging inbox — too complex for MVP; email covers it
- AI-native matching (agentic black boxes) — deterministic scoring in v1; AI layer added later
- Preceptor tools — future module
- Multi-tenant / white-label enterprise — not MVP scope
- Compliance/audit intelligence engine — future module
- Advanced agentic AI workflows — out of scope for this milestone

## Context

- **Client:** Approached by Healthmark, a major medical company, for this platform
- **Domain:** Sterile processing department (SPD) / Central Sterile Services Department (CSSD) — hospital supply chain
- **Existing product:** SPD Cert Prep (CRCST exam prep) is a separate, existing product. SPD Ready is distinct but will eventually connect to it.
- **Users:** Three roles — Student, Hospital (site), Admin
- **Demo goal:** Conference-ready demo that shows the full student → assessment → hospital review → placement loop
- **Seeded data:** Acceptable for demo
- **Build approach:** Claude Code (AI-driven development), no prior codebase

## Constraints

- **Tech stack**: Next.js 14 App Router + Supabase + Tailwind CSS + shadcn/ui + Vercel + Resend + PostHog — decided, do not deviate
- **Auth**: Supabase Auth (email/password + magic link) — ties into RLS policies
- **Scoring**: Deterministic weighted formula (no AI black box) — explainable, controllable
- **Speed**: Demo-ready MVP is the immediate priority; perfect > production, but working > perfect
- **Budget**: No unnecessary complexity — do not add features not in scope
- **Database**: All 8 core tables defined in handoff doc §21 — must match exactly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router | Server components + server actions give clean data flow; Vercel deployment is zero-config | — Pending |
| Supabase for DB + Auth | Auth, Postgres, RLS, and storage in one service — no extra auth service | — Pending |
| shadcn/ui components | Polished professional look fast; built on Radix primitives; fully customizable | — Pending |
| Deterministic fit scoring | Fast to build, explainable, controllable; AI can layer on later | — Pending |
| Separate from SPD Cert Prep | Avoids product confusion; different core value propositions; can integrate later | — Pending |
| Demo with seeded data | Acceptable for conference demo; proves the loop without waiting for real users | — Pending |
| 6 readiness categories | Technical, Situational, Process, Behavioral, Instrument/Workflow, Reliability — covers all real-world dimensions | — Pending |

## Readiness Scoring Model

```ts
readiness_score =
  technical * 0.30 +
  situational * 0.25 +
  process * 0.15 +
  behavior * 0.15 +
  instrument * 0.10 +
  reliability * 0.05
```

**Tiers:**
- Tier 1 (Ready): ≥ 75%
- Tier 2 (Ready with support): 55–74%
- Tier 3 (Not ready yet): < 55%

## Fit Scoring Model

```
fit_score =
  geography * 20 +
  schedule * 20 +
  readiness_tier * 20 +
  support_alignment * 15 +
  environment_fit * 15 +
  instrument_familiarity * 10
```

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-20 after initialization*
