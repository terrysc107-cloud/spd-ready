# Project Kickoff — SPD Ready

## Project Name
SPD Ready

## Product Type
SaaS placement engine / credentialing platform

## Who It Serves
- **Students:** sterile processing (SPD) students in externship programs
- **Hospitals / Surgery Centers:** sites offering externship openings
- **Coordinators / Admins:** program directors managing cohorts

## Core Problem
Hospitals have no structured way to evaluate whether an SPD student is ready for externship. Students have no portable, credible signal of readiness. Placements are made on gut feel, causing failed externships, wasted preceptor time, and student dropout.

## Core Outcome
A student completes a scored readiness assessment, receives a structured profile (Tier 1/2/3), browses externship openings they are eligible for, and applies. Hospitals review verified candidate profiles and make confident placement decisions.

## Primary User Journey
1. Student registers → onboards (demographics, program, availability)
2. Student completes 30-question readiness assessment
3. Student receives tier + readiness score across 6 weighted dimensions
4. Student browses study modules to improve weak domains
5. Student applies to externship openings
6. Hospital reviews candidate profile + score
7. Hospital accepts → placement confirmed

## Secondary User Journeys
- Hospital posts and manages externship openings
- Hospital reviews cohort performance + ROI projection
- Hospital assigns learning modules to cohort students
- Admin views platform-wide metrics

## What Must Feel Excellent
- Assessment flow (must feel rigorous, not a quiz)
- Results page (must feel like a real credential, not a score)
- Candidate profile visible to hospitals (must inspire confidence)
- Student dashboard (motivation via streak, XP, mastery progress)

## What Can Wait
- In-app messaging (coordinators use email)
- Stripe / billing
- AI matching (deterministic scoring in v1)
- Preceptor role
- Unlimited assessment retakes (24h cooldown enforced)

## Likely Technical Shape
- Next.js 15 App Router + Supabase + Tailwind + shadcn/ui + Vercel
- Supabase RLS + Custom Access Token Hook for role enforcement
- Server Actions for all mutations
- DAL pattern (src/lib/dal/) for all queries
- Resend + React Email for notifications
- PostHog for analytics

## Risks
- RLS misconfiguration causing data leaks across roles
- Assessment scoring formula must stay deterministic — no black-box scoring
- 24h cooldown must be enforced server-side (not client-side)
- Hospital profile page currently redirects to onboarding — dedicated edit UI needed

## Current State (as of May 2026)
The application is ~90% feature-complete. Key gaps:
1. Hospital application review workflow (status change UI missing)
2. Admin dashboard has no content
3. No toast notifications
4. Learning dashboard polish (progress bars, interactive mastery)

## Recommended Phase
**Phase 10 — Production Hardening** (core features complete, need polish + missing workflow)

## Chief Builder Decision
- active phase: Phase 10 — Production Hardening
- lead agent: Full-Stack Builder
- support agents: Design Auditor, Scout
