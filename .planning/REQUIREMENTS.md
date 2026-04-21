# SPD Ready — v1 Requirements

**Generated:** 2026-04-20  
**Source:** spd_ready_planning_handoff.md + domain research (STACK, FEATURES, ARCHITECTURE, PITFALLS, SUMMARY)  
**Status:** Ready for roadmap

---

## v1 Requirements

### Authentication (AUTH)

- [ ] **AUTH-01**: User can register with email and password, selecting a role (student or hospital) at signup
- [ ] **AUTH-02**: User can log in with email and password and remain logged in across sessions
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User can reset password via emailed link
- [ ] **AUTH-05**: Role is stored as a JWT claim (app_role) via Supabase Custom Access Token Hook; RLS policies enforce it server-side
- [ ] **AUTH-06**: Unauthenticated users are redirected to login when accessing protected routes

### Student Profile (STUDENT)

- [x] **STUDENT-01
**: Student can complete a multi-step onboarding form capturing: first name, last name, city, state, travel radius (miles), certification status, training program name, expected completion date, shift availability, transportation reliability, and preferred environment
- [x] **STUDENT-02
**: Student's profile is saved to the `student_profiles` table on submit
- [x] **STUDENT-03
**: Student can view and edit their completed profile
- [x] **STUDENT-04
**: Student cannot access the assessment until their profile is complete (profile completion gate)
- [x] **STUDENT-05
**: Student can view their application statuses (applied / under review / accepted / waitlisted / rejected)

### Readiness Assessment (ASSESS)

- [ ] **ASSESS-01**: Student can take a 30-question readiness assessment across 6 categories: Technical Knowledge (5 questions), Situational Judgment (5), Process Discipline (5), Behavioral/Culture Fit (5), Instrument/Workflow Familiarity (5), Reliability (5)
- [ ] **ASSESS-02**: Assessment is presented one question per screen with a progress bar showing current position
- [ ] **ASSESS-03**: Each answer is persisted to the database immediately so the assessment is resumable if the student navigates away or closes the browser
- [ ] **ASSESS-04**: Student can only submit once all 30 questions are answered
- [ ] **ASSESS-05**: Assessment has a retake cooldown (minimum 24 hours between attempts) to prevent score gaming
- [ ] **ASSESS-06**: `assessment_questions` table is seeded with 30 SPD-specific questions at launch (5 per category); questions use real sterile processing vocabulary and scenarios

### Scoring & Results (SCORE)

- [ ] **SCORE-01**: Overall readiness score is calculated server-side on assessment submit using the weighted formula: `overall = technical*0.30 + situational*0.25 + process*0.15 + behavior*0.15 + instrument*0.10 + reliability*0.05`
- [ ] **SCORE-02**: Student is assigned a readiness tier based on overall score: Tier 1 (Ready) ≥ 75%, Tier 2 (Ready with support) 55–74%, Tier 3 (Not ready yet) < 55%
- [ ] **SCORE-03**: Student results page displays: overall score, tier badge (hero element), per-category breakdown, top 2 strengths, bottom 2 growth areas, application eligibility status, and suggested next steps
- [ ] **SCORE-04**: Tier 3 students receive a specific improvement path (not just a rejection message)
- [ ] **SCORE-05**: Student profile is updated with readiness_score, readiness_tier, strengths_json, and growth_areas_json on assessment completion

### Hospital Profile (HOSP)

- [ ] **HOSP-01**: Hospital user can complete a site profile capturing: organization name, site name, city, state, facility type, department size, case volume, complexity level, teaching capacity, preceptor strength, number of extern slots, scheduling preferences, and notes
- [ ] **HOSP-02**: Hospital profile is saved to `hospital_profiles` table on submit
- [ ] **HOSP-03**: Hospital can view and edit their completed profile

### Externship Openings (OPEN)

- [ ] **OPEN-01**: Hospital can create an externship opening with: title, start date, end date, number of slots, shift info, requirements, and status
- [ ] **OPEN-02**: Hospital can view and manage all their openings (list view)
- [ ] **OPEN-03**: Hospital can update the status of an opening (open / closed / filled)

### Candidate Matching (MATCH)

- [ ] **MATCH-01**: System computes a deterministic fit score for each eligible student per opening using: geography (20 pts), schedule alignment (20 pts), readiness tier (20 pts), support need alignment (15 pts), environment fit (15 pts), instrument/workflow familiarity (10 pts)
- [ ] **MATCH-02**: Fit score is stored in `applications.fit_score` at application create time
- [ ] **MATCH-03**: Only students who have completed the assessment and are Tier 1 or Tier 2 are eligible to appear in candidate lists (Tier 3 students see improvement path only)

### Candidate Review (CAND)

- [ ] **CAND-01**: Hospital can view a ranked candidate list per opening, sorted by fit score descending, showing: student name, readiness tier badge, fit score, top strengths, city/state
- [ ] **CAND-02**: Hospital can open a full candidate profile showing: readiness score, tier, per-category scores, strengths, growth areas, coaching recommendations, and a narrative summary
- [ ] **CAND-03**: Narrative summary is generated from structured scoring data (template-string approach in v1: "This candidate shows strong [top category] and [second category], with moderate need for coaching in [bottom category].")
- [ ] **CAND-04**: Hospital can Accept, Waitlist, or Reject a candidate from the candidate profile view
- [ ] **CAND-05**: Application status updates are reflected immediately in both the hospital view and the student's application status page

### Post-Placement Feedback (FEED)

- [ ] **FEED-01**: After a student is accepted and placement completes, hospital can submit a feedback form rating: attendance, coachability, professionalism, communication, attention to detail, and overall recommendation
- [ ] **FEED-02**: Feedback is saved to `hospital_feedback` table linked to the application

### Admin Dashboard (ADMIN)

- [ ] **ADMIN-01**: Admin user can view a dashboard showing: total students registered, total assessments completed, readiness tier distribution (Tier 1 / 2 / 3 counts), total hospitals, total openings, total applications, accepted/waitlisted/rejected breakdown
- [ ] **ADMIN-02**: Admin dashboard is protected by the admin role — students and hospitals cannot access it
- [ ] **ADMIN-03**: Demo seed script creates realistic data: 10 students (varied tiers, names, cities), 2 hospitals, 3 openings, 15 applications with varied statuses and fit scores

### Platform & UX (PLATFORM)

- [ ] **PLATFORM-01**: Landing page at `/` with product description and clear CTAs ("I'm a student" / "I'm a hospital")
- [ ] **PLATFORM-02**: Role-aware navigation shows only routes relevant to the logged-in user's role
- [ ] **PLATFORM-03**: All multi-step flows show a progress bar (onboarding, assessment)
- [ ] **PLATFORM-04**: Application status changes trigger an email notification to the student via Resend (accepted / waitlisted / rejected)
- [ ] **PLATFORM-05**: App is mobile-responsive (Tailwind breakpoints; forms and dashboards work on mobile)

---

## v2 Requirements (Deferred)

These were considered and explicitly deferred to a future milestone:

- AI-generated candidate narrative (LLM call instead of template string) — Phase 2 upgrade
- SPD Cert Prep integration (import quiz averages, category mastery) — requires Cert Prep API
- Assessment image questions (instrument photos) — content production effort
- Preceptor role and tools — third auth role, adds complexity
- Stripe billing / monetization — future milestone
- In-app messaging inbox — coordinators use email; this is over-engineered for v1
- Deep geocoding for geography score (lat/lng) — use state-level match in v1
- Native mobile app — web-only for MVP
- Compliance/audit intelligence module — future product expansion
- White-label / multi-tenant enterprise — future enterprise tier
- Advanced agentic AI matching — explainable deterministic scoring is the right v1 choice

---

## Out of Scope

- Resume upload/parsing — the readiness profile IS the credential; resumes undermine it
- Background check / vaccination document upload — HIPAA surface, avoid entirely
- Unlimited instant assessment retakes — adds a 24-hour cooldown to prevent gaming
- Generic badges/gamification not tied to placement eligibility — healthcare adults find it patronizing
- Childish UI elements — clinical professional tone throughout

---

## Traceability

| REQ-ID | Phase | Plan |
|--------|-------|------|
| AUTH-01 | Phase 1: Foundation | TBD |
| AUTH-02 | Phase 1: Foundation | TBD |
| AUTH-03 | Phase 1: Foundation | TBD |
| AUTH-04 | Phase 1: Foundation | TBD |
| AUTH-05 | Phase 1: Foundation | TBD |
| AUTH-06 | Phase 1: Foundation | TBD |
| STUDENT-01 | Phase 2: Student Core Loop | TBD |
| STUDENT-02 | Phase 2: Student Core Loop | TBD |
| STUDENT-03 | Phase 2: Student Core Loop | TBD |
| STUDENT-04 | Phase 2: Student Core Loop | TBD |
| STUDENT-05 | Phase 2: Student Core Loop | TBD |
| ASSESS-01 | Phase 2: Student Core Loop | TBD |
| ASSESS-02 | Phase 2: Student Core Loop | TBD |
| ASSESS-03 | Phase 2: Student Core Loop | TBD |
| ASSESS-04 | Phase 2: Student Core Loop | TBD |
| ASSESS-05 | Phase 2: Student Core Loop | TBD |
| ASSESS-06 | Phase 2: Student Core Loop | TBD |
| SCORE-01 | Phase 2: Student Core Loop | TBD |
| SCORE-02 | Phase 2: Student Core Loop | TBD |
| SCORE-03 | Phase 2: Student Core Loop | TBD |
| SCORE-04 | Phase 2: Student Core Loop | TBD |
| SCORE-05 | Phase 2: Student Core Loop | TBD |
| HOSP-01 | Phase 3: Hospital Core Loop | TBD |
| HOSP-02 | Phase 3: Hospital Core Loop | TBD |
| HOSP-03 | Phase 3: Hospital Core Loop | TBD |
| OPEN-01 | Phase 3: Hospital Core Loop | TBD |
| OPEN-02 | Phase 3: Hospital Core Loop | TBD |
| OPEN-03 | Phase 3: Hospital Core Loop | TBD |
| MATCH-01 | Phase 3: Hospital Core Loop | TBD |
| MATCH-02 | Phase 3: Hospital Core Loop | TBD |
| MATCH-03 | Phase 3: Hospital Core Loop | TBD |
| CAND-01 | Phase 3: Hospital Core Loop | TBD |
| CAND-02 | Phase 3: Hospital Core Loop | TBD |
| CAND-03 | Phase 3: Hospital Core Loop | TBD |
| CAND-04 | Phase 3: Hospital Core Loop | TBD |
| CAND-05 | Phase 3: Hospital Core Loop | TBD |
| FEED-01 | Phase 4: Feedback, Admin, and Demo Data | TBD |
| FEED-02 | Phase 4: Feedback, Admin, and Demo Data | TBD |
| ADMIN-01 | Phase 4: Feedback, Admin, and Demo Data | TBD |
| ADMIN-02 | Phase 4: Feedback, Admin, and Demo Data | TBD |
| ADMIN-03 | Phase 4: Feedback, Admin, and Demo Data | TBD |
| PLATFORM-01 | Phase 5: Polish, Email, and Analytics | TBD |
| PLATFORM-02 | Phase 5: Polish, Email, and Analytics | TBD |
| PLATFORM-03 | Phase 5: Polish, Email, and Analytics | TBD |
| PLATFORM-04 | Phase 5: Polish, Email, and Analytics | TBD |
| PLATFORM-05 | Phase 5: Polish, Email, and Analytics | TBD |
