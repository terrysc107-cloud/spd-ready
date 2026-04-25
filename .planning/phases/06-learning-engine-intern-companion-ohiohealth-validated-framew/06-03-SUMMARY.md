---
phase: 06-learning-engine-intern-companion-ohiohealth-validated-framew
plan: 03
subsystem: api
tags: [mastery, spaced-repetition, likert, confidence-tap, local-db, server-actions, react]

requires:
  - phase: 06-01
    provides: LearningDomain, ConceptId, ConfidenceTap types + store tables (concept_mastery, domain_assessments, confidence_taps)
provides:
  - computeMasteryScore with 5-component formula (accuracy×0.35 + calibration×0.25 + SR×0.20 + variety×0.10 + recency×0.10)
  - SR ladder [1,3,7,21,60 days] with advanceSpacedRepetition
  - 90-day linear recency decay via computeRecencyDecay
  - T0/T1 Likert DAL with locked baseline and rolling T1 updates
  - recordAttemptAction and submitLikertAction Server Actions
  - ConfidenceTapPrompt (3-state pre-answer), LikertSelfAssessment (post-module), StudyQuiz extended
affects: [06-04, 06-05, 06-06]

tech-stack:
  added: []
  patterns: [mastery formula DAL, T0-locked Likert baseline, confidence tap state in Client Component]

key-files:
  created:
    - spd-ready/src/lib/dal/mastery.ts
    - spd-ready/src/lib/dal/likert.ts
    - spd-ready/src/actions/mastery.ts
    - spd-ready/src/actions/likert.ts
    - spd-ready/src/components/student/ConfidenceTapPrompt.tsx
    - spd-ready/src/components/student/LikertSelfAssessment.tsx
  modified:
    - spd-ready/src/lib/local-db/store.ts
    - spd-ready/src/components/student/StudyQuiz.tsx

key-decisions:
  - "store.ts extended here with confidence_taps + domain_assessments + concept_mastery (not 06-01)"
  - "handleSubmit in StudyQuiz is now async — awaits recordAttemptAction before updating local state"
  - "LikertSelfAssessment shown AFTER saveStudySessionAction resolves, before router.push"

patterns-established:
  - "Mastery DAL: readStore/writeStore with in-memory mutation + recency decay applied at read time"
  - "T0 lock: upsertDomainAssessmentT0 returns existing row unchanged if domain already has a baseline"

requirements-completed: []

duration: ~12min
completed: 2026-04-25
---

# Plan 06-03: Mastery Engine + Likert Self-Assessment Summary

**Full mastery formula (5-component weighted score), spaced repetition ladder, T0-locked Likert baseline, confidence tap per question — all wired into an extended StudyQuiz flow**

## Performance

- **Duration:** ~12 min (inline execution after agent Bash permission issue)
- **Completed:** 2026-04-25
- **Tasks:** 3 of 3
- **Files created:** 6 + 2 modified

## Accomplishments
- `mastery.ts` DAL: MASTERY_WEIGHTS (sum=1.0), SR_INTERVALS_DAYS [1,3,7,21,60], RECENCY_DECAY_DAYS=90, `computeMasteryScore`, `applyAttempt`, `getDueForReview`
- `likert.ts` DAL: T0 locked on first call to `upsertDomainAssessmentT0`; `updateDomainAssessmentT1` updates rolling score; `likertToPct` + `deltaPp` for pp conversion
- Two Server Actions: `recordAttemptAction` (stores confidence tap + runs `applyAttempt`); `submitLikertAction` (T0/T1 upsert + revalidatePath)
- `ConfidenceTapPrompt`: 3-state (not_sure/pretty_sure/certain) shown above answer choices before answering
- `LikertSelfAssessment`: two 5-point scales rendered after final answer, defers navigation to results until submitted
- `StudyQuiz` extended: confidence tap tracked per question, submit disabled until tap + answer selected, Likert intercepts end-of-quiz navigation

## Task Commits

1. **Task 1: Mastery formula DAL** — `39e6f97` (feat)
2. **Task 2: Likert DAL + Server Actions** — `d11da3f` (feat)
3. **Task 3: Components + StudyQuiz extension** — `598eb87` (feat)

## Files Created/Modified
- `spd-ready/src/lib/dal/mastery.ts` — Full mastery engine (167 lines)
- `spd-ready/src/lib/dal/likert.ts` — T0/T1 read+write DAL (81 lines)
- `spd-ready/src/actions/mastery.ts` — recordAttemptAction Server Action (38 lines)
- `spd-ready/src/actions/likert.ts` — submitLikertAction Server Action (29 lines)
- `spd-ready/src/components/student/ConfidenceTapPrompt.tsx` — 3-state confidence prompt (44 lines)
- `spd-ready/src/components/student/LikertSelfAssessment.tsx` — 5-point dual Likert (68 lines)
- `spd-ready/src/components/student/StudyQuiz.tsx` — Extended with mastery loop (225 lines)
- `spd-ready/src/lib/local-db/store.ts` — Added domain_assessments, concept_mastery, confidence_taps tables

## Decisions Made
- `store.ts` Phase 6 table extensions applied here (agent discovered 06-01's store.ts lacked them)
- `handleSubmit` made `async` to await `recordAttemptAction` — synchronous feedback state still set before the await returns UI changes
- Likert intercepts post-quiz navigation; no redirect fires until `onComplete` is called

## Deviations from Plan
- Store table extensions were part of this plan (06-01's store.ts was missing them) — added here without scope creep

## Issues Encountered
- Executor agent lacked Bash permission for git commits — orchestrator completed all commits inline.

## Next Phase Readiness
- All mastery primitives in place; 06-04 can read `getConceptMastery`, `getDomainAssessment`, `getDueForReview`
- `domain_assessments` and `concept_mastery` tables populated on first module completion

---
*Phase: 06-learning-engine-intern-companion-ohiohealth-validated-framew*
*Completed: 2026-04-25*
