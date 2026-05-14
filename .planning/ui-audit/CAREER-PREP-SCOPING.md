# Career Prep Additions — Scoping Placeholder

**Status:** Deferred per user request — scoped only after the UI audit and design system are approved.

The user wants to "add a few elements to prepare students for internship and jobs." This document captures candidate features so we can pick the right scope once the design direction is locked in. Nothing here is committed to until the user picks from `DESIGN-SYSTEM-PROPOSAL.md` § 12.

## Candidate elements

### 1. Interview Prep module
A practice surface that complements (not duplicates) the readiness assessment.

**Why it fits SPD Ready:** the readiness assessment already covers what a student *knows*. Interview prep covers how they *present* what they know.

**Shape (sketch):**
- Question bank of common SPD externship interview prompts (behavioral + clinical)
- Practice modes: written-answer (with rubric feedback), timed-recall, mock-interview round
- Scored on professionalism, clinical accuracy, situational awareness
- Optional: one-button "generate practice round from your weak Judgment categories"
- Score feeds an "Interview Readiness" badge — a third score alongside Readiness + Judgment

### 2. Career Roadmap & Milestones tracker
Externship → entry-level Tech → CRCST cert → CSPDT advancement → leadership path.

**Why it fits:** the platform already verifies readiness for the first placement. Showing the road *after* placement gives students a reason to stay engaged and gives hospitals a reason to recommend the platform to placed externs.

**Shape (sketch):**
- Visual progression with locked/unlocked milestones
- Each milestone shows what it takes to unlock (experience hours, certifications, score thresholds)
- Pulls live from student profile + assessment data — not a static page

### 3. Professional Readiness module
A distinct surface from clinical readiness — covers the soft skills hospitals stop trusting externs for.

**Why it fits:** "Professional Standards" already exists inside the Judgment track. Pulling it out into its own short-format module makes the value visible and gives coordinators a *fourth* signal.

**Shape (sketch):**
- Resume & profile builder (with templates pre-validated for SPD roles)
- Dress code & department-etiquette quick guide
- Communication patterns (how to escalate, when to ask, how to push back safely)
- HIPAA / patient-data basics
- Each section: short read → 3-question check → completion checkmark on profile

## How to choose

The user originally selected "Wait — let's scope this after the UI audit" — so we explicitly do NOT pick today.

After the audit is approved, ask:

> Which of the three career-prep modules want to ship in PR 4 — Interview Prep, Career Roadmap, Professional Readiness, or all three?

Recommended (if forced to pick): **Interview Prep first** — it produces a third score that strengthens the hospital trust story, and it directly maps to the original Judgment track infrastructure, so it's low new-architecture cost.

## Out of scope here

- Resume upload (the user already vetoed this in `CLAUDE.md`)
- AI mock-interviewer (Phase 9 territory, not v1)
- Job board outside externships (SPD Ready is placement-focused; job board would dilute the brand)
