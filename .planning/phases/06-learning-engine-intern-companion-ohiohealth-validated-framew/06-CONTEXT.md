# Phase 6: Learning Engine + Intern Companion — Context

**Gathered:** 2026-04-25
**Status:** Ready for planning
**Source:** Direct conversation capture (no /gsd-discuss-phase run — context gathered iteratively in conversation)

<domain>
## Phase Boundary

This phase transforms SPD Ready from a one-time placement-matching tool into a continuous learning + intern companion platform. It adds:

1. A research-backed **mastery formula** (accuracy + confidence calibration + spaced repetition + recency decay) that drives learning, not just quiz completion
2. **Likert knowledge + confidence self-assessment** per domain — captured at T0 (locked baseline) and updated continuously, producing the marketable delta numbers that close hospital deals
3. A **coordinator cohort flow** where hospital users add students by email, view per-domain mastery + knowledge/confidence deltas, and async-assign modules
4. **Error-category tagging** on modules so coordinators see "this training reduces Missing Indicator risk by X%"
5. **Mock CE certificates** with a partner_issuer field — sets up a future revenue path via accreditation partnerships and sponsorships
6. A **hospital ROI projection panel** using OhioHealth/SpecialtyCare benchmarks ($158k savings per percentage-point of knowledge/confidence gain, $6,185 per error event, 40% error reduction)
7. **Six-domain framework alignment** (Foundational Knowledge, Decontamination, High-Level Disinfection, IAP, Sterilization, Sterile Storage) plus SPD_JUDGMENT as a cross-cutting applied 7th layer that differentiates from Incision
8. **High-Level Disinfection content gap-fill** — ~10 new questions for the missing domain (this is the case study's headline 31%→80% confidence story)

**Out of scope (deferred):**
- Real CE accreditation issuance (HSPA/CBSPD partnership) — mocked via partner_issuer field
- Real-time/synchronous coordinator-student notifications (decided async-only for v1)
- In-department physical task sign-off (deferred — student/coordinator work async per user decision)
- Migration off local-db to Supabase (this phase stays on local-db demo store)

</domain>

<decisions>
## Implementation Decisions (LOCKED)

### Domain Framework
- **D-01:** Adopt OhioHealth/Incision 6-domain industry-standard framework: `foundational`, `decontamination`, `high_level_disinfection`, `iap` (inspection/assembly/packaging), `sterilization`, `sterile_storage`
- **D-02:** Keep `spd_judgment` as a 7th cross-cutting "applied" domain — this is the unique differentiator from Incision (they teach knowledge; we teach judgment)
- **D-03:** Remap existing 8 domains: INSTRUMENT_ID + COMPLIANCE_SAFETY → foundational; PREPARATION → iap; STERILIZATION + STERILITY_ASSURANCE → sterilization; STORAGE_DISTRIBUTION → sterile_storage; SPD_JUDGMENT stays
- **D-04:** Migrate all existing TRACK_QUESTIONS to new domain values via a one-time mapping in code (no data loss; old domain becomes legacy_domain field for reference)
- **D-05:** Author ~10 new High-Level Disinfection questions to fill the gap (the case study's headline domain)

### Mastery Formula
- **D-06:** Composite mastery score per concept: `mastery = quiz_accuracy*0.35 + confidence_calibration*0.25 + spaced_repetition*0.20 + context_variety*0.10 + recency_decay*0.10` — all components 0-100
- **D-07:** `confidence_calibration` rewards (high confidence + correct) and (low confidence + incorrect); penalizes (high confidence + incorrect) heavily
- **D-08:** `spaced_repetition` uses simplified SM-2-like intervals: 1 day → 3 days → 7 days → 21 days → 60 days. Concept's `next_review_at` resurfaces it in the queue automatically
- **D-09:** `recency_decay` linearly reduces score from 100 to 0 over 90 days without review. Mastery is maintained, not "completed"
- **D-10:** `context_variety` increases as a concept is encountered across multiple question framings/types (still simple in v1: count of distinct question IDs answered for the concept). **Clarification (revision 1):** v1 implementation counts ATTEMPTS rather than truly-distinct question IDs (the mastery DAL increments `distinct_questions_seen` per attempt). Refine to true-distinct counting in v2.

### Likert Self-Assessment
- **D-11:** Two 5-point Likert ratings per domain: knowledge (1=Not at all knowledgeable → 5=Very knowledgeable) and confidence (1=Not at all confident → 5=Very confident)
- **D-12:** Captured at T0 on the student's first attempt in any module of that domain → locked. T1 (current) updates after every module completion (high-frequency per user decision: "more frequent is better"). **Clarification (revision 1):** Knowledge/Confidence deltas become non-zero starting from the SECOND module attempt in the same domain — the first module establishes the T0 baseline (T0 == T1 on first completion). This is acceptable for the demo because students typically complete multiple modules per domain. v2 enhancement (deferred): pre-quiz Likert prompt for true T0 capture before any content
- **D-13:** Pre-quiz confidence prompt is single-tap (3-state: not sure / pretty sure / certain) for that specific question — separate from the per-domain Likert which is post-module
- **D-14:** Display delta in headline format on dashboards: "Knowledge +X pp, Confidence +Y pp"

### Coordinator Cohort
- **D-15:** Hospital coordinator can add a student to their cohort by email — direct lookup against local-db users; if not found, show "student must register first" message
- **D-16:** Cohort table columns: student name, tier, overall mastery %, knowledge delta, confidence delta, modules completed, modules assigned, last activity
- **D-17:** Per-student detail page shows 6+1 domain breakdown with knowledge baseline→current, confidence baseline→current, mastery bar, and concept-level mastery list
- **D-18:** Coordinator can assign modules with optional note + due date. Assignments surface as "Assigned by [coordinator name]" on student's study page, sorted to the top
- **D-19:** No notifications/email in v1 — async only. Student sees assignments next time they log in
- **D-20:** Cohort relationship is many-to-many: a student can belong to multiple hospital cohorts (e.g., applied to multiple sites)

### Error-Category Tagging
- **D-21:** Eight error categories from OhioHealth case study: `missing_indicator`, `debris_found`, `incorrect_assembly`, `no_locks`, `missing_load_sticker`, `wet_set`, `wrapped_incorrectly`, `cement_found`
- **D-22:** Each module tagged with one or more error categories it reduces. Mapping is defined in code by Claude (per user: "you define error mapping")
- **D-23:** Coordinator-facing copy on assignment: "Completing this reduces [Error Category] risk." Hospital ROI panel projects $ savings per error category based on benchmarks

### Mock CE Certificates
- **D-24:** On module completion, issue a Certificate record: `studentId, moduleId, ceCredits, partner_issuer ('SPD Ready Demo' for v1), issuedAt`
- **D-25:** `partner_issuer` field reserves the schema slot for future HSPA/CBSPD/sponsor branding — partners will issue real CEUs in the future (per user: revenue engine)
- **D-26:** CE credits per module: foundational/iap/sterilization 2 CEUs each, hld/decontamination 3 CEUs, sterile_storage 1 CEU, spd_judgment 1 CEU. Approximate, not real-world authoritative
- **D-27:** Student profile shows certificate count + CE credits earned. Hospital coordinator view shows student's total CEs

### Hospital ROI Projection Panel
- **D-28:** Use OhioHealth case study benchmarks: $158,000 saved per percentage-point cohort knowledge/confidence gain, $6,185 per SPD error event, 40% error reduction at fully-trained sites. **Clarification (revision 1, locked):** "per percentage-point cohort knowledge/confidence gain" is interpreted as the AVERAGE of cohort knowledge gain (in pp) and cohort confidence gain (in pp), NOT the sum. Summing would double-count the same training signal. ROI math uses `combined_pp = (avgK + avgC) / 2`, then `projected_savings = combined_pp * $158k`. Methodology footnote on the ROI panel must state this.
- **D-29:** Panel shows: cohort size, average knowledge delta, average confidence delta, projected error-rate reduction, projected $ saved (with methodology footnote)
- **D-30:** All numbers labeled "Projected" with footnote linking to OhioHealth/SpecialtyCare methodology (per user: "projected with methodology footnoted")
- **D-31:** Per-error-category breakdown: "Your cohort's training reduces estimated Missing Indicator events by X, projecting $Y in savings"

### Data Model (local-db)
- **D-32:** New tables in store: `domain_assessments`, `concept_mastery`, `module_assignments`, `hospital_cohort`, `module_error_tags`, `certificates`. Existing tables not deleted; `track_questions` gains `concept_id` and `error_categories[]` fields
- **D-33:** All persistence goes through `src/lib/local-db/store.ts` (existing pattern). No Supabase, no migrations — this phase stays demo-only per user
- **D-34:** Concepts: derived from existing question domains/topics — initial concept list defined in code, ~25-30 concepts spanning the 6 domains. Each question maps to one concept_id

### UI/UX
- **D-35:** New student route: `/student/learning` — six-domain dashboard with mastery cards, knowledge/confidence deltas, "next review" queue, assigned modules
- **D-36:** New student route: `/student/learning/[domain]` — concept-level mastery bars + spaced-review queue
- **D-37:** Existing `/student/study` and `/student/study/[domain]` updated to surface assigned modules at top with coordinator tag
- **D-38:** New hospital route: `/hospital/cohort` — cohort table + add-student form
- **D-39:** New hospital route: `/hospital/cohort/[studentId]` — per-student domain + concept breakdown + assign-module action
- **D-40:** New hospital route: `/hospital/cohort/roi` — ROI projection panel
- **D-41:** Use existing TierBadge, CategoryScoreBar, AssessmentQuestion components where possible. New components: MasteryCard, KnowledgeConfidenceDelta, AssignedModuleCard, ROIProjection, LikertSelfAssessment, ConfidenceTapPrompt

### Marketing
- **D-42:** New section on `/` landing page: "OhioHealth-validated framework: 41pp knowledge gain, 29pp confidence gain, 40% error reduction, $500k saved per SPD per year." Cite case study with link

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Conventions
- `CLAUDE.md` — project tech stack rules (Next.js 15+, Tailwind, shadcn/ui, local-db demo mode for v1)
- `.planning/PROJECT.md` — project context
- `.planning/REQUIREMENTS.md` — v1 requirement IDs (this phase has none assigned — net-new feature beyond v1 scope)
- `.planning/STATE.md` — phase history and decisions log

### Existing Code Patterns to Follow
- `src/lib/local-db/store.ts` — local persistence pattern (read/write JSON store at /tmp on Vercel, in-process otherwise)
- `src/lib/local-db/track-questions.ts` — existing question bank (100 questions, 8 domains) — REMAP target
- `src/lib/local-db/questions.ts` — existing assessment questions (30) — separate from track-questions
- `src/lib/dal/study.ts` — existing study DAL pattern
- `src/lib/dal/hospital.ts` — existing hospital DAL pattern
- `src/lib/dal/scoring.ts` — existing scoring utilities
- `src/actions/study.ts` — existing study Server Actions
- `src/actions/hospital.ts` — existing hospital Server Actions
- `src/components/student/StudyQuiz.tsx` — existing quiz component (extend for confidence prompt)
- `src/app/(student)/student/study/page.tsx` — existing study domain list
- `src/app/(student)/student/study/[domain]/page.tsx` — existing study domain runner
- `src/app/(hospital)/hospital/dashboard/page.tsx` — existing hospital dashboard pattern

### External Reference (Validation)
- `/Users/terry/Desktop/SPD_Case_Study_Ohio_Health_May_25pdf.pdf` — knowledge/confidence delta methodology, 6-domain framework, Likert scale survey design, T0/T1 measurement
- `/Users/terry/Desktop/OhioHealth_Error_Reduction_Case_Study.pdf` — error categories, $6,185/error benchmark, $158k/pp savings, 40% error reduction

</canonical_refs>

<specifics>
## Specific Ideas

- Mastery formula coefficients are intentionally tunable — extract as a config constant so we can re-balance after demo feedback
- Spaced repetition intervals: 1d, 3d, 7d, 21d, 60d (SM-2-like simplified)
- Recency decay: linear 100→0 over 90 days
- Confidence calibration: high-conf + wrong = -2x penalty (catches dangerous misconceptions per safety-critical domain)
- ROI panel methodology footnote text: "Projected based on OhioHealth/SpecialtyCare benchmark (2024-2025): $6,185 average cost per SPD error event, $158k savings per percentage-point of cohort knowledge/confidence gain. Actual savings depend on implementation fidelity and site-specific factors."
- Existing study tracks already use `domain` enum — migration path: add new domain field alongside, populate via mapping function, keep legacy_domain for one release, remove later
- HLD question authoring: chemical sterilants (ortho-phthalaldehyde, glutaraldehyde, peracetic acid), MEC monitoring, contact time, rinse protocols, scope reprocessing — pull from AAMI ST91, AORN guidelines (paraphrase, not copy)

</specifics>

<deferred>
## Deferred Ideas

- Real CE accreditation (HSPA/CBSPD) — schema slot reserved (partner_issuer), wire in v2 when partnership signed
- Real-time push notifications when coordinator assigns module — deferred per user "async only for v1"
- In-department physical task sign-off (coordinator marks "yes I watched them do it") — deferred per user
- Knowledge graph / prerequisite chain between concepts — concepts are flat in v1
- Adaptive question selection based on mastery — v1 uses simple "due for review" queue
- Multi-language support — English only v1
- Migration off local-db to Supabase — local-db only for this phase
- Real-time multiplayer/cohort comparisons — single-student focus v1
- Voice/audio module support — text + image only v1

</deferred>

---

*Phase: 06-learning-engine-intern-companion*
*Context gathered: 2026-04-25 via direct conversation capture*
