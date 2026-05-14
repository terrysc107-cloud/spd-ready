# Career Prep — Build Plan

**Status:** Approved scope, planning complete, ready to schedule build.
**Branch:** `claude/upgrade-ui-premium-z0YzN` (planning only; implementation lands in PR 4 of the UI premium upgrade.)
**Approved by user:** all three modules in scope; "plan the career prep" — full plan below.

---

## Why this exists

SPD Ready's first job is **verifying readiness for placement**. After this audit/upgrade cycle, it gets a second job: **carrying students from "placed" into a career**. Hospitals stay engaged because the platform keeps producing better externs over time. Students stay engaged because the platform helps them after day one, not just up to day one.

Three modules cover the gap from "ready for externship" to "thriving as a tech":

| Module | Pain it solves | Who benefits |
|---|---|---|
| **Interview Prep** | "I know the work but I freeze in interviews" | Tier 1 / Tier 2 students approaching their first interview |
| **Career Roadmap** | "I got placed — now what?" | Placed externs, junior techs, the entire CRCST path |
| **Professional Readiness** | "I'm clinically fine but I'm getting feedback on conduct/communication" | All students, especially Tier 2/3 trying to close the gap |

All three feed back into the existing dual-score system rather than starting a new credential — they make the existing scores *richer*.

---

## Sequencing recommendation

Build in this order. Each module is independently shippable, but the order maximizes early value.

1. **Interview Prep** — ships first. Highest user-visible impact for the cohort that's actually about to interview. Produces a new "Interview Readiness" badge that strengthens the hospital trust story immediately.
2. **Professional Readiness** — ships second. Smallest scope; mostly content + short checks. Plugs the "soft skills" gap that hospitals complain about most.
3. **Career Roadmap** — ships third. Bigger architectural lift (state machine over a multi-year progression, milestones tied to evidence). Highest retention value but lowest "today's user" urgency.

If you want a single-module ship, **build Interview Prep first**.

---

## Module 1 — Interview Prep

### Goal
A practice surface for SPD externship interviews. Produces an **Interview Readiness Score** alongside the existing Readiness and Judgment scores. Coordinators see a third signal: *can this candidate represent themselves under interview pressure?*

### User stories
- *As a Tier 1 student about to interview at Mercy Health, I want to practice answers to the questions I'm likely to be asked so I don't freeze.*
- *As a Tier 2 student, I want timed practice with rubric feedback so I know which answers are weak before a coordinator hears them.*
- *As a hospital coordinator, I want to see Interview Readiness on the candidate card so I can prioritize who's ready for an on-site interview.*

### Surfaces
1. **`/student/interview`** — module home
   - Header: current Interview Readiness Score + percentile cohort comparison
   - "Continue practicing" CTA → next recommended question from weakest category
   - Practice rounds list (Behavioral / Clinical Scenarios / Situational / Mock Interview)
   - Last 5 sessions with scores
2. **`/student/interview/practice/[questionId]`** — single-question practice
   - Question prompt
   - Three modes (radio): Written / Spoken (record 60s) / Quick Notes
   - Submit → rubric-graded feedback (strengths / gaps / model answer)
   - "Next question" or "Save and exit"
3. **`/student/interview/round/[roundId]`** — full mock-interview round
   - 5–7 questions, timed (90s each)
   - Progress meter + category indicator
   - End-of-round summary with score, breakdown by category, and the worst-scored answer highlighted
4. **`/hospital/candidates/[id]`** — candidate profile gets a third score badge
   - Position: alongside existing Readiness + Judgment badges
   - Tooltip explains how it was calculated

### Question bank shape
~80 questions to start, spread across 4 categories:

| Category | Examples | Count |
|---|---|---|
| Behavioral | "Tell me about a time you noticed a sterilization error" | 20 |
| Clinical scenario | "An OR calls demanding instruments that aren't fully cycled — what do you do?" | 25 |
| Situational professionalism | "A senior tech asks you to skip biological indicator validation. Walk me through your response." | 20 |
| Standard interview | "Why SPD? Where do you see yourself in 3 years?" | 15 |

Each question carries: prompt, ideal-answer rubric (3–5 weighted criteria), 2 model answers (one strong, one weak with annotation), and tags (e.g. `safety_ownership`, `escalation`, `professionalism`) that link back to the Judgment score categories.

### Scoring
Per-question score = sum of rubric criterion hits (0/0.5/1 each), weighted, normalized to 0–100.

Session score = mean of question scores in the session.

**Interview Readiness Score** = exponentially weighted moving average across all sessions, with a recency multiplier (last 30 days weighted higher). Updates after every completed round.

Threshold tiers (mirroring main readiness):
- 75+ "Interview-ready"
- 55–74 "Practicing"
- <55 "Needs reps"

### Grading approach (v1 vs. v2)
- **v1 (ship first):** rubric-based, deterministic — checks the answer for category-tagged keywords + structure (problem stated, action taken, outcome). No AI. Fast, cheap, defensible.
- **v2 (later):** swap rubric for an LLM-graded version with strict structure ("give a score 0–100 with reasoning across these 4 criteria"), validated against the rubric scores for a calibration period.

### Data model (new tables)
```sql
interview_questions (
  id uuid pk,
  category text,         -- behavioral | clinical_scenario | situational_pro | standard
  difficulty int,        -- 1 | 2 | 3
  prompt text,
  rubric jsonb,          -- [{criterion, weight}]
  model_answers jsonb,   -- {strong, weak}
  tags text[],           -- judgment-score linkage
  active bool,
  created_at timestamptz
)

interview_sessions (
  id uuid pk,
  user_id uuid fk auth.users,
  mode text,             -- single | round
  category text|null,    -- only for round
  started_at timestamptz,
  completed_at timestamptz|null,
  session_score numeric|null
)

interview_responses (
  id uuid pk,
  session_id uuid fk interview_sessions,
  question_id uuid fk interview_questions,
  answer_text text,
  audio_url text|null,   -- v1 stores in supabase storage
  rubric_hits jsonb,     -- per-criterion 0/0.5/1
  question_score numeric,
  graded_at timestamptz
)

interview_readiness (
  user_id uuid pk fk auth.users,
  current_score numeric,
  category_scores jsonb, -- per-category breakdown
  sessions_completed int,
  last_session_at timestamptz,
  updated_at timestamptz
)
```

RLS: students read/write only their own rows. Hospital coordinators can SELECT `interview_readiness.current_score` for students who appear in their pipeline (same join pattern as existing candidate visibility).

### Engineering scope
- Migration for 4 tables + RLS policies → ~1 day
- Server actions for session lifecycle + response grading → ~1 day
- Question bank seed (80 questions written) → ~2 days *content work, can run parallel*
- 3 new pages + tied components → ~3 days
- Candidate profile badge addition → ~0.5 day
- Tests + verification → ~1 day

**Estimate: ~1.5 weeks engineering + 2 days content.**

---

## Module 2 — Professional Readiness

### Goal
A short, structured surface for the soft skills hospitals say matter most: communication, professionalism, HIPAA basics, dress code, escalation patterns. Distinct from the Judgment score (which is scenario-based) — this is foundational "how to show up."

Completion produces a **Professional Readiness checkmark** on the student profile and feeds completion-rate signals into hospital filters.

### User stories
- *As a student, I want to learn the unwritten rules of an SPD department before my first day so I don't make rookie mistakes.*
- *As a coordinator, I want to filter for candidates who've completed Professional Readiness because those are the ones I won't have to re-train on basics.*

### Surfaces
1. **`/student/professional`** — module home
   - Progress ring across 6 sections
   - Per-section status: not started / in progress / complete
2. **`/student/professional/[section]`** — section reader
   - Editorial layout: long-form read (3–8 min), key takeaways callout, then a 3-question check at the bottom
   - Pass the check (66%+) to mark section complete
3. **`/hospital/candidates`** — filter and badge
   - Filter: "Professional Readiness complete"
   - Badge on candidate card next to tier

### Section list (6 sections, ~5 min each)
1. **Department Etiquette** — dress code, hygiene, communication norms, common rookie mistakes
2. **Communication Patterns** — how to ask for help, how to escalate, how to give & receive feedback
3. **HIPAA & Patient Privacy** — what externs can/can't see, what they say outside the department, social media boundaries
4. **Shift Discipline** — punctuality, handoff rituals, signing off, when to stay late, when to NOT stay late
5. **Working with Surgeons & OR** — pressure dynamics, the "I need this NOW" call, polite-but-firm refusals
6. **Self-Care & Sustainability** — ergonomics, pace management, recognizing burnout, mental health resources

### Scoring
Simple completion. Each section ends with a 3-question check; pass = mark complete. **No score visible to the student or coordinator** — just a completion checkmark and a "5/6 complete" progress signal. Optional badge for 100% complete: "Professional Standards: Complete."

### Data model (new tables)
```sql
professional_sections (
  id text pk,            -- 'etiquette' | 'communication' | etc.
  title text,
  body_mdx text,         -- MDX content
  check_questions jsonb, -- [{prompt, options[4], correct_index}]
  order_index int,
  active bool
)

professional_progress (
  user_id uuid fk auth.users,
  section_id text fk professional_sections,
  check_score int,       -- 0–3
  completed_at timestamptz|null,
  primary key (user_id, section_id)
)
```

RLS: students read/write own progress; coordinators read aggregate completion stats for students in their pipeline.

### Engineering scope
- Migration for 2 tables + RLS → ~0.5 day
- MDX content for 6 sections → ~3 days *content*
- 2 new pages + section reader component → ~1.5 days
- Candidate filter + badge integration → ~0.5 day
- Tests + verification → ~0.5 day

**Estimate: ~3 days engineering + 3 days content.**

---

## Module 3 — Career Roadmap

### Goal
A visual progression from extern to senior tech, with milestones tied to real evidence (placement record, certifications, years of experience, score history). Gives students a reason to keep using the platform after they're placed, and gives hospitals a long-term ally for workforce development.

### User stories
- *As a placed extern, I want to see what comes next — when do I qualify for CRCST, what does Tech II look like, what's the path to lead tech?*
- *As a coordinator, I want to recommend the roadmap to new hires because it tells them how to grow without me having to mentor every step.*
- *As an alumni student, I want to keep my profile alive after placement and update my milestones as I hit them.*

### Surfaces
1. **`/student/roadmap`** — visual roadmap
   - Vertical timeline (mobile) / horizontal milestone chain (desktop)
   - Each milestone: status (locked / unlocked / in progress / complete), required evidence, "How to unlock" detail
   - Current position marker shows where the student is
2. **`/student/roadmap/[milestoneId]`** — milestone detail
   - What is this milestone, who awards it (external cert vs. platform-tracked), what's the path
   - Resources (links, recommended modules to complete first)
   - "Mark complete" form with optional evidence upload (cert PDF, hire date letter)
3. **Profile** — current rank surfaces on student profile + hospital candidate view

### Milestone chain (v1)
| # | Milestone | Awarded by | Evidence |
|---|---|---|---|
| 1 | Pre-placement student | platform | account created |
| 2 | Readiness Tier 1 | platform | readiness_score ≥ 75 |
| 3 | Application submitted | platform | applications table has ≥1 row |
| 4 | First placement | platform/coordinator | application status = placed |
| 5 | Externship complete | platform/coordinator | hospital_feedback row exists |
| 6 | CRCST eligible | external (HSPA) | 400 hours logged + study readiness |
| 7 | CRCST certified | external | cert upload + verification |
| 8 | SPD Tech I (entry) | self-attest + employer | hire date + role |
| 9 | SPD Tech II (1+ yr) | self-attest + cert add-ons | time + optional CHL/CIS certs |
| 10 | Lead tech / charge | self-attest | role + tenure |
| 11 | Educator / Manager track | self-attest | role + cert (CRCST + management cert) |

### Hours-logging sub-feature
For milestone 6 (CRCST eligible: 400 hours), students need to log hours. Lightweight pattern:
- "Log hours" widget on `/student/roadmap` and `/student/dashboard`
- Form: date, hours, site, role
- Stored in `hours_logs` table — coordinator can countersign

### Scoring
No score — gamified progression. Three derived stats surface:
- **Career stage** (1–11, current milestone label)
- **Time at stage** (e.g. "12 weeks as Tech I")
- **Next milestone unlock requirements** (visible always)

### Data model (new tables)
```sql
career_milestones (
  id text pk,            -- 'tier_1_ready' | 'crcst_certified' etc.
  title text,
  description text,
  order_index int,
  awarded_by text,       -- platform | external | self_attest
  required_evidence jsonb, -- declarative rules
  resources jsonb,
  active bool
)

student_milestones (
  user_id uuid fk auth.users,
  milestone_id text fk career_milestones,
  status text,           -- locked | unlocked | in_progress | complete
  evidence_url text|null,
  awarded_at timestamptz|null,
  primary key (user_id, milestone_id)
)

hours_logs (
  id uuid pk,
  user_id uuid fk auth.users,
  date date,
  hours numeric,
  site text,
  role text,
  countersigned_by uuid|null,
  countersigned_at timestamptz|null,
  created_at timestamptz
)
```

A nightly job (or on-demand server action) walks the milestone rules and updates `student_milestones.status` for platform-awarded ones based on real data.

RLS: students read/write own rows; coordinators countersign hours for their placements (RLS check via applications table linkage); admins read all for analytics.

### Engineering scope
- Migration for 3 tables + RLS + milestone rule evaluator → ~2 days
- Server action for milestone evaluation + cert evidence upload to Supabase Storage → ~1.5 days
- 2 new pages + timeline component → ~3 days
- Hours-log widget (reusable across dashboard + roadmap) → ~1 day
- Coordinator countersign UX → ~1 day
- Profile + candidate-card career stage badges → ~0.5 day
- Tests + verification → ~1.5 days

**Estimate: ~2 weeks engineering. No content overhead (rules are structured, not editorial).**

---

## Integration with existing dual-score system

Today's scores: **Readiness Score** + **Judgment Score**. Adding career prep makes that surface richer without breaking the existing model:

```
Student profile
├─ Readiness Score (existing — 6 weighted dimensions)
├─ Judgment Readiness Score (existing — 8 judgment categories)
├─ Interview Readiness Score (new — Module 1)
├─ Professional Readiness ✓ (new — Module 2, completion only)
└─ Career Stage (new — Module 3, progression label)
```

On the hospital candidate card, this means 3 scores + 1 completion + 1 stage label. The card design from the UI proposal (`DESIGN-SYSTEM-PROPOSAL.md` §7.5) needs to accommodate one extra row of signal. We'll add a dedicated "career" subsection in the candidate profile detail page (`/hospital/candidates/[id]` tabs).

---

## Risks & open questions

| Risk | Mitigation |
|---|---|
| Interview question content is a lot of writing | Hire/contract a SPD program director for content review; v1 ships with 80 questions, expand quarterly |
| Audio recording for spoken practice has privacy implications | v1 ships text-only; spoken mode in v2 with explicit consent + private bucket + 30-day auto-delete |
| Career roadmap milestones differ by state/hospital | v1 uses HSPA CRCST as the canonical cert path; document deviations as a known limitation |
| LLM grading (v2 of interview prep) adds inference cost | Cap at N graded answers per student per week; offer rubric-only mode as fallback |
| Coordinator countersigning hours could be abused | Audit log every countersign; flag if same coordinator countersigns >X students same day |

---

## Phasing summary

| Phase | Scope | Duration | Output |
|---|---|---|---|
| **A** | Interview Prep (v1) | 1.5 weeks eng + 2 days content | Third score live, candidate badge live |
| **B** | Professional Readiness | 3 days eng + 3 days content | 6 sections live, completion badge, filter |
| **C** | Career Roadmap | 2 weeks eng | 11-milestone progression live, hours logging, candidate stage badge |
| **D** | Polish + cross-module dashboard | ~3 days | Unified "your career" dashboard widget pulling from all three |

**Total: ~5–6 weeks for all three modules.** Each phase is independently shippable behind a feature flag.

---

## Decision gates

Before starting Phase A, confirm:
- [ ] Approve sequencing (A → B → C → D)
- [ ] Approve 80-question initial bank for Interview Prep (vs. larger)
- [ ] Approve rubric-only grading for v1 (vs. waiting for LLM grading)
- [ ] Approve HSPA CRCST as canonical cert path
- [ ] Confirm career-prep PR lands AFTER the UI premium upgrade PRs (so all new screens are built on the Premium Clinical design system, not the current low-budget look)

Once these are confirmed, Phase A starts and lands as PR 4 of the UI premium upgrade work.
