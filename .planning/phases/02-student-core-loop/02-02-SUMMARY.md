---
phase: 02-student-core-loop
plan: "02"
name: "Assessment Questions Seed + Assessment Engine DAL + Server Actions"
subsystem: assessment-engine
tags: [dal, server-actions, scoring, assessment, migration, unit-tests]
dependency_graph:
  requires: [02-01]
  provides: [getActiveQuestions, checkCooldown, saveAnswerToDb, computeCategoryScores, finalizeAssessment, startAssessmentAction, saveAnswerAction, submitAssessmentAction, computeReadinessScore, deriveReadinessTier, deriveStrengthsAndGrowth, 005_seed_assessment_questions]
  affects: [02-03]
tech_stack:
  added: [jest, ts-jest, "@types/jest"]
  patterns: [cache-wrapped-dal-reads, requireRole-dal-writes, behavioral-to-behavior-remap, await-before-redirect, server-side-score-derivation, idempotent-uuid-migration]
key_files:
  created:
    - spd-ready/supabase/migrations/005_seed_assessment_questions.sql
    - spd-ready/src/lib/dal/assessment.ts
    - spd-ready/src/lib/dal/scoring.ts
    - spd-ready/tests/scoring.test.ts
    - spd-ready/tests/assessment.test.ts
    - spd-ready/jest.config.js
  modified:
    - spd-ready/src/actions/student.ts
decisions:
  - "assessment_questions schema uses options_json (jsonb) + scoring_key_json (jsonb), not separate option_a/b/c/d columns — migration adapted to actual schema"
  - "student_assessments has no readiness_tier column — tier written to student_profiles only"
  - "assessment_responses has no student_user_id — RLS enforces via assessment_id FK chain"
  - "Migration uses fixed UUIDs (a1000000-...) not gen_random_uuid() for idempotent ON CONFLICT DO NOTHING re-runs"
  - "URL contract locked: /student/assessment/${assessmentId}/1 for start, /student/assessment/${assessmentId}/${step+1} for steps"
  - "scoring.ts is a pure TS module — no Supabase, no use server, importable from both DAL and Server Actions"
metrics:
  duration_minutes: 5
  completed_date: "2026-04-21"
  tasks_completed: 2
  files_created: 6
  files_modified: 1
---

# Phase 2 Plan 02: Assessment Questions Seed + Assessment Engine DAL + Server Actions Summary

**One-liner:** 30 SPD questions seeded with fixed UUIDs and options_json/scoring_key_json format; complete assessment DAL with behavioral→behavior remap; three Server Actions with cooldown, profile gate, and count guard.

## What Was Built

### Task 1: Migration 005 + scoring.ts + Unit Tests

**`spd-ready/supabase/migrations/005_seed_assessment_questions.sql`**
- 30 SPD-specific multiple-choice questions across 6 categories (5 per category)
- Categories: technical, situational, process, behavioral, instrument, reliability
- Uses actual schema columns: `id, category, type, prompt, options_json, scoring_key_json, active`
- Fixed UUIDs (`a1000000-0000-0000-0000-00000000000X`) for idempotent `ON CONFLICT (id) DO NOTHING`
- `scoring_key_json` format: `{"correct": "B", "score_map": {"A": 0, "B": 1.0, "C": 0.25, "D": 0}}`

**`spd-ready/src/lib/dal/scoring.ts`** — pure TypeScript, no Supabase, no `use server`:
- `CategoryScores` type: `{ technical, situational, process, behavior, instrument, reliability }`
- `computeReadinessScore(scores)`: weighted formula — technical×0.30 + situational×0.25 + process×0.15 + behavior×0.15 + instrument×0.10 + reliability×0.05
- `deriveReadinessTier(score)`: returns 1 (≥75), 2 (55–74.99), or 3 (<55)
- `deriveStrengthsAndGrowth(scores)`: returns top 2 strengths and bottom 2 growth area keys
- `CATEGORY_LABELS`: display labels for each category key

**`spd-ready/tests/scoring.test.ts`** — 10 unit tests:
- `computeReadinessScore`: all-100 → 100, mixed → 70, all-0 → 0
- `deriveReadinessTier`: boundary tests at 75, 55, 54.99
- `deriveStrengthsAndGrowth`: correct ordering, handles ties without throwing

**`spd-ready/tests/assessment.test.ts`** — 10 unit tests:
- Cooldown logic: blocks at 1h, 23h59m; allows at exactly 24h, 25h; allows null
- `timeUntilNextAttempt`: correct ms remaining calculation
- Submit count guard: allows ≥30, blocks <30

**`spd-ready/jest.config.js`**: ts-jest preset, node test environment

### Task 2: Assessment DAL + Server Actions

**`spd-ready/src/lib/dal/assessment.ts`** — exports:
- `getActiveQuestions(): Promise<AssessmentQuestion[]>` — `cache()`-wrapped, orders by category then created_at for consistent question order across retakes
- `getLatestInProgressAssessment(): Promise<StudentAssessment | null>` — includes `response_count` for resume position
- `getLatestCompletedAssessment(): Promise<StudentAssessment | null>` — for results page and cooldown display
- `getResponseForQuestion(assessmentId, questionId): Promise<AssessmentResponse | null>` — for pre-filling answers on resume
- `checkCooldown(userId): Promise<{ allowed: boolean, nextAttemptAt?: Date }>` — 24h retake gate
- `createAssessment(): Promise<string>` — inserts in-progress row, returns id
- `saveAnswerToDb(assessmentId, questionId, selectedAnswer, question): Promise<void>` — upserts with `onConflict: 'assessment_id,question_id'`; derives score server-side from `scoring_key_json.score_map`
- `computeCategoryScores(assessmentId): Promise<CategoryScores>` — groups responses by category, averages ×100; includes critical behavioral→behavior remap
- `finalizeAssessment(assessmentId, categoryScores, overallScore): Promise<void>` — marks completed, writes all score columns

**`spd-ready/src/actions/student.ts`** — appended three exports:
- `startAssessmentAction()`: checks `profile_complete` AND `checkCooldown` server-side before `createAssessment()`; redirects to `/student/assessment/${id}/1`
- `saveAnswerAction(formData)`: awaits `saveAnswerToDb()` BEFORE redirect; calls `submitAssessmentAction` on step 30
- `submitAssessmentAction(assessmentId)`: checks response count ≥ 30; computes scores server-side; writes to `student_assessments` then `student_profiles`; redirects to `/student/results`

## Critical Implementation Details

### behavioral → behavior Remap (CONFIRMED)

```typescript
// src/lib/dal/assessment.ts — computeCategoryScores()
return {
  technical:   avg(byCategory['technical']   ?? []),
  situational: avg(byCategory['situational'] ?? []),
  process:     avg(byCategory['process']     ?? []),
  // CRITICAL REMAP: DB stores 'behavioral', TS type uses 'behavior'
  behavior:    avg(byCategory['behavioral']  ?? []),
  instrument:  avg(byCategory['instrument']  ?? []),
  reliability: avg(byCategory['reliability'] ?? []),
}
```

Without this remap, `behavior` would always be 0, producing wrong weighted scores.

### saveAnswerToDb Awaited Before redirect (CONFIRMED)

```typescript
// src/actions/student.ts — saveAnswerAction()
// Write answer BEFORE redirect — redirect() throws and would interrupt the write (Pitfall 3)
await saveAnswerToDb(assessmentId, questionId, selectedAnswer, question)

if (currentStep >= 30) {
  await submitAssessmentAction(assessmentId)
  return
}

redirect(`/student/assessment/${assessmentId}/${currentStep + 1}`)
```

### Schema Deviations from Plan (Auto-fixed, Rule 1)

The plan referenced column names that differ from the actual `001_initial_schema.sql`:

| Plan Assumed | Actual Schema | Fix Applied |
|---|---|---|
| `option_a/b/c/d, correct_answer, score_map_json` | `options_json (jsonb), scoring_key_json (jsonb)` | Migration uses jsonb format |
| `score_technical, score_situational, ...` | `technical_score, situational_score, ...` | `finalizeAssessment()` uses correct names |
| `readiness_tier` in student_assessments | No such column — tier is in student_profiles only | `finalizeAssessment()` omits tier write; `submitAssessmentAction` writes tier to student_profiles |
| `student_user_id` in assessment_responses | No such column | `saveAnswerToDb` doesn't write it; RLS enforces via FK chain |
| `is_correct, answered_at` in assessment_responses | No such columns | Omitted from upsert |

### URL Contract (Locked for Plan 02-03)

```
startAssessmentAction  → /student/assessment/${assessmentId}/1
saveAnswerAction       → /student/assessment/${assessmentId}/${step+1}  (steps 1-29)
                       → calls submitAssessmentAction                    (step 30)
submitAssessmentAction → /student/results
```

Plan 02-03 MUST use route `[assessmentId]/[step]` dynamic segments. This is a locked contract.

## DAL Function Signatures for Plan 02-03

```typescript
// assessment.ts
getActiveQuestions(): Promise<AssessmentQuestion[]>
getLatestInProgressAssessment(): Promise<StudentAssessment | null>  // includes response_count
getLatestCompletedAssessment(): Promise<StudentAssessment | null>
getResponseForQuestion(assessmentId: string, questionId: string): Promise<AssessmentResponse | null>
checkCooldown(userId: string): Promise<{ allowed: boolean; nextAttemptAt?: Date }>

// AssessmentQuestion type (key fields for UI)
type AssessmentQuestion = {
  id: string
  category: string
  prompt: string                                  // NOT question_text
  options_json: Record<string, string>            // {"A": "text", "B": "text", ...}
  scoring_key_json: { correct: string; score_map: Record<string, number> }
}

// student.ts Server Actions
startAssessmentAction(): Promise<void>
saveAnswerAction(formData: FormData): Promise<void>
submitAssessmentAction(assessmentId: string): Promise<void>
```

## Unit Test Results

```
Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total
```

## TypeScript Compile Result

`npx tsc --noEmit` exits 0 — no errors.

## Migration Row Count

`grep -c "'multiple_choice'"` returns 30. Five rows per category including 5 with `'behavioral'`.

## Security Review (Threat Model)

All 6 threats from the plan's threat model are mitigated:

| Threat ID | Mitigation Confirmed |
|-----------|---------------------|
| T-02-06: Crafted score via formData | Score derived from `scoring_key_json` in DB; no score field accepted from client |
| T-02-07: Retake cooldown bypass | `checkCooldown()` called inside `startAssessmentAction` (server-side) |
| T-02-08: Double-submit | `unique(assessment_id, question_id)` constraint prevents duplicate responses |
| T-02-09: assessmentId belonging to another student | `finalizeAssessment` filters `.eq('student_user_id', user.id)` |
| T-02-10: submitAssessmentAction with <30 responses | Count check in `submitAssessmentAction` redirects with error if `count < 30` |
| T-02-11: Score from tampered responses | `computeCategoryScores` always re-fetches from DB for specific `assessmentId` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Schema column name mismatches in assessment_questions**
- **Found during:** Task 1 (reading 001_initial_schema.sql before writing migration)
- **Issue:** Plan specified `option_a/b/c/d, correct_answer, score_map_json` but actual schema uses `options_json (jsonb), scoring_key_json (jsonb)` with `prompt` not `question_text`
- **Fix:** Migration uses jsonb format per actual schema; `AssessmentQuestion` type in assessment.ts uses correct field names
- **Files modified:** `005_seed_assessment_questions.sql`, `src/lib/dal/assessment.ts`
- **Commit:** 1fb91e5

**2. [Rule 1 - Bug] student_assessments missing readiness_tier column**
- **Found during:** Task 2 (verifying schema before writing finalizeAssessment)
- **Issue:** Plan referenced `readiness_tier` in `student_assessments` UPDATE but schema has no such column; tier is stored in `student_profiles.readiness_tier` only
- **Fix:** `finalizeAssessment()` does not write readiness_tier; `submitAssessmentAction` writes tier to `student_profiles` via separate UPDATE
- **Files modified:** `src/lib/dal/assessment.ts`, `src/actions/student.ts`
- **Commit:** 8af3980

**3. [Rule 1 - Bug] assessment_responses missing student_user_id, is_correct, answered_at**
- **Found during:** Task 2 (verifying schema before writing saveAnswerToDb)
- **Issue:** Plan referenced these columns in upsert but they don't exist in schema
- **Fix:** `saveAnswerToDb` upserts only the columns that exist: `assessment_id, question_id, selected_answer, score`
- **Files modified:** `src/lib/dal/assessment.ts`
- **Commit:** 8af3980

**4. [Rule 1 - Bug] Migration used gen_random_uuid() — not idempotent**
- **Found during:** Task 1 (plan used gen_random_uuid() in INSERT)
- **Issue:** `ON CONFLICT (id) DO NOTHING` requires deterministic UUIDs; gen_random_uuid() generates new UUIDs on every run, so re-running the migration inserts duplicates (the conflict never fires)
- **Fix:** Used fixed UUIDs (`a1000000-0000-0000-0000-000000000001` through `..000000000030`) so ON CONFLICT fires correctly on re-runs
- **Files modified:** `supabase/migrations/005_seed_assessment_questions.sql`
- **Commit:** 1fb91e5

## Known Stubs

None — all data flows are complete. DAL reads real data from DB. Scoring is deterministic arithmetic. Server Actions have full business logic.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes beyond what the plan's threat model covers.

## What Plan 02-03 Needs

1. **Route structure:** `src/app/(student)/assessment/[assessmentId]/[step]/page.tsx` — NOT `[step]` alone
2. **Question field:** Use `question.prompt` (not `question.question_text`) for display
3. **Options:** Render from `question.options_json` (Record<string, string>) — iterate with `Object.entries(question.options_json)`
4. **Resume:** Call `getLatestInProgressAssessment()` → check `response_count` → redirect to `/${id}/${count + 1}`
5. **Pre-fill:** Call `getResponseForQuestion(assessmentId, question.id)` → `existingAnswer?.selected_answer`
6. **Form fields required:** `assessmentId` (hidden), `questionId` (hidden), `step` (hidden), `answer` (radio group)
7. **Server Action:** `saveAnswerAction` from `@/actions/student` — use as `<form action={saveAnswerAction}>`

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: Migration + scoring.ts + unit tests | 1fb91e5 | 005_seed_assessment_questions.sql, src/lib/dal/scoring.ts, tests/scoring.test.ts, tests/assessment.test.ts, jest.config.js, package.json |
| Task 2: Assessment DAL + Server Actions | 8af3980 | src/lib/dal/assessment.ts, src/actions/student.ts |
