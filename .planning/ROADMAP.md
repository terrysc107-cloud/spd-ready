# SPD Ready — Roadmap

**Project:** SPD Ready  
**Generated:** 2026-04-20  
**Total phases:** 5  
**Total requirements:** 44

---

## Phases

- [ ] **Phase 1: Foundation** — Auth, schema, RLS, and project scaffold
- [x] **Phase 2: Student Core Loop** — Profile, assessment engine, scoring, and results
- [ ] **Phase 3: Hospital Core Loop** — Site profile, openings, fit scoring, candidate review, and placement actions
- [ ] **Phase 4: Feedback, Admin, and Demo Data** — Post-placement feedback, admin dashboard, and realistic seed data
- [ ] **Phase 5: Polish, Email, and Analytics** — Email notifications, PostHog analytics, loading states, error boundaries, and mobile responsiveness

---

## Phase Details

### Phase 1: Foundation
**Goal:** The project scaffold, authentication system, and complete database schema with RLS are in place and verified — every downstream phase can build on a secure, role-enforced foundation.  
**Depends on:** —  
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06  
**Success criteria:**
1. A visitor can register as a student or hospital, log in, and remain logged in across browser sessions without being unexpectedly signed out.
2. A logged-in user can log out from any page and is redirected to the login screen.
3. A user who requests a password reset receives an emailed link and can set a new password.
4. An unauthenticated user who navigates to a protected route (e.g., /student/dashboard) is redirected to the login page.
5. A student account cannot access hospital routes, and a hospital account cannot access student routes — the role boundary is enforced at both the UI and database layer.
**Plans:** TBD  
**UI hint:** yes

---

### Phase 2: Student Core Loop
**Goal:** A student can complete their profile, take the 30-question readiness assessment, and receive a scored readiness profile with tier, strengths, growth areas, and next steps.  
**Depends on:** Phase 1  
**Requirements:** STUDENT-01, STUDENT-02, STUDENT-03, STUDENT-04, STUDENT-05, ASSESS-01, ASSESS-02, ASSESS-03, ASSESS-04, ASSESS-05, ASSESS-06, SCORE-01, SCORE-02, SCORE-03, SCORE-04, SCORE-05  
**Success criteria:**
1. A new student can complete the multi-step onboarding form and see their saved profile — they cannot reach the assessment until the profile is fully submitted.
2. A student can take the 30-question assessment one question per screen, close the browser mid-way, return later, and continue from where they left off — no answers are lost.
3. On submitting all 30 answers, the student lands on a results page showing their overall score, readiness tier badge, per-category breakdown, top 2 strengths, bottom 2 growth areas, and suggested next steps.
4. A Tier 3 student sees a specific improvement path rather than a generic rejection message.
5. A student who completed an assessment within the last 24 hours cannot start a new attempt — the retake cooldown is enforced.
**Plans:** TBD  
**UI hint:** yes

---

### Phase 3: Hospital Core Loop
**Goal:** A hospital can set up their site profile, create externship openings, and review a ranked list of eligible candidates with full readiness profiles — then accept, waitlist, or reject each candidate.  
**Depends on:** Phase 2  
**Requirements:** HOSP-01, HOSP-02, HOSP-03, OPEN-01, OPEN-02, OPEN-03, MATCH-01, MATCH-02, MATCH-03, CAND-01, CAND-02, CAND-03, CAND-04, CAND-05  
**Success criteria:**
1. A hospital user can complete the site profile form and view or edit it after submission.
2. A hospital can create an externship opening, view all their openings in a list, and toggle an opening's status between open, closed, and filled.
3. When a student applies to an opening, a deterministic fit score (6 dimensions: geography, schedule, readiness tier, support alignment, environment fit, instrument familiarity) is computed and stored — only Tier 1 and Tier 2 students appear in the candidate list.
4. A hospital can open the ranked candidate list for an opening and see each student's name, readiness tier badge, fit score, top strengths, and city/state — sorted by fit score descending.
5. A hospital can open a full candidate profile and click Accept, Waitlist, or Reject — the status change is immediately visible on both the hospital's candidate view and the student's application status page.
**Plans:** TBD  
**UI hint:** yes

---

### Phase 4: Feedback, Admin, and Demo Data
**Goal:** Post-placement feedback is collectable, the admin dashboard shows platform-wide metrics, and realistic seeded data enables a credible conference demo across all three readiness tiers.  
**Depends on:** Phase 3  
**Requirements:** FEED-01, FEED-02, ADMIN-01, ADMIN-02, ADMIN-03  
**Success criteria:**
1. A hospital can submit a post-placement feedback form (rating attendance, coachability, professionalism, communication, attention to detail, and overall recommendation) for an accepted student — the record is saved and linked to the application.
2. An admin user can view the dashboard showing total students, total assessments completed, tier distribution (Tier 1 / 2 / 3 counts), total hospitals, total openings, total applications, and accepted/waitlisted/rejected breakdown.
3. A student or hospital account attempting to access the admin dashboard is blocked and redirected.
4. Running the demo seed script produces 10 realistic students (varied tiers, names, and cities), 2 hospitals, 3 openings, and 15 applications with varied statuses and fit scores — the full demo loop is walkable without creating any data manually.
**Plans:** TBD  
**UI hint:** yes

---

### Phase 5: Polish, Email, and Analytics
**Goal:** The application sends email notifications on placement status changes, tracks user events via PostHog, and presents a polished, mobile-responsive experience with no dead ends.  
**Depends on:** Phase 4  
**Requirements:** PLATFORM-01, PLATFORM-02, PLATFORM-03, PLATFORM-04, PLATFORM-05  
**Success criteria:**
1. The landing page at / shows the product description with clear "I'm a student" and "I'm a hospital" CTAs — an unauthenticated visitor can immediately understand the product and start the right signup flow.
2. When a hospital accepts, waitlists, or rejects a candidate, the student receives an email notification via Resend at their registered address.
3. Role-aware navigation shows only the routes relevant to the logged-in user's role — a student never sees hospital menu items and vice versa.
4. Every multi-step flow (student onboarding, assessment) displays a progress bar showing current step position.
5. All pages and forms are usable on a mobile device — Tailwind breakpoints ensure forms, dashboards, and candidate lists render correctly on small screens.
**Plans:** TBD  
**UI hint:** yes

### Phase 6: Learning Engine + Intern Companion — OhioHealth-validated framework: six-domain alignment, Likert knowledge+confidence self-assessment, mastery formula with spaced repetition, coordinator cohort + module assignment flow, error-category tagging, mock CE certificates, hospital ROI projection panel, HLD content gap-fill

**Goal:** A student can complete training modules with confidence-tap and post-module Likert self-assessment, see their per-domain mastery and knowledge/confidence deltas update on a learning dashboard, and earn mock CE certificates — while a hospital coordinator can add students by email, assign modules with notes, and view a cohort ROI projection grounded in OhioHealth/SpecialtyCare benchmarks.
**Requirements**: N/A (net-new beyond v1 REQUIREMENTS.md scope)
**Depends on:** Phase 5
**Plans:** 6 plans

Plans:
- [x] 06-01-PLAN.md — Domain remap + data model (types, concept catalog, error categories, store extensions)
- [x] 06-02-PLAN.md — HLD content authoring (10 new High-Level Disinfection questions)
- [x] 06-03-PLAN.md — Mastery engine + Likert assessment (formula, spaced repetition, recency decay, confidence tap, post-quiz Likert)
- [x] 06-04-PLAN.md — Student learning UI (/student/learning dashboard, domain detail, assigned modules in /student/study)
- [ ] 06-05-PLAN.md — Hospital cohort + assignment + ROI (cohort table, per-student detail, assign module, ROI projection panel)
- [ ] 06-06-PLAN.md — Mock CE certificates + marketing update (certificate issuance, profile display, OhioHealth-validated landing section)

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-04-21 |
| 2. Student Core Loop | 3/3 | Complete | 2026-04-21 |
| 3. Hospital Core Loop | 0/? | Not started | — |
| 4. Feedback, Admin, and Demo Data | 0/? | Not started | — |
| 5. Polish, Email, and Analytics | 0/? | Not started | — |
| 6. Learning Engine + Intern Companion | 0/6 | Not started | — |
