---
phase: 02-student-core-loop
plan: "03"
name: "Assessment UI + Results Page + Dashboard Update"
subsystem: assessment-ui
tags: [ui, assessment, results, server-components, client-components, next16-async-params]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [AssessmentEntryPage, AssessmentStartPage, AssessmentStepPage, ResultsPage, TierBadge, CategoryScoreBar, AssessmentQuestion]
  affects: []
tech_stack:
  added: []
  patterns: [async-params-next16, async-searchParams-next16, useFormStatus-pending-state, css-only-progress-bar, server-component-display]
key_files:
  created:
    - spd-ready/src/components/student/TierBadge.tsx
    - spd-ready/src/components/student/CategoryScoreBar.tsx
    - spd-ready/src/components/student/AssessmentQuestion.tsx
    - spd-ready/src/app/(student)/assessment/page.tsx
    - spd-ready/src/app/(student)/assessment/start/page.tsx
    - spd-ready/src/app/(student)/assessment/[assessmentId]/[step]/page.tsx
    - spd-ready/src/app/(student)/results/page.tsx
  modified: []
decisions:
  - "Step page uses question.prompt + question.options_json (jsonb), not question_text/option_a/b/c/d — follows actual AssessmentQuestion type from 02-02"
  - "Results page reads readiness_tier from student_profiles (not student_assessments — no readiness_tier column there)"
  - "Results page reads score columns as technical_score/situational_score/etc. (not score_technical)"
  - "CategoryScoreBar is a Server Component (no 'use client') — CSS-only Tailwind width style"
  - "AssessmentQuestion uses useFormStatus (not useActionState) — saveAnswerAction always redirects, never returns state"
metrics:
  duration_minutes: 3
  completed_date: "2026-04-21"
  tasks_completed: 2
  files_created: 7
  files_modified: 0
---

# Phase 2 Plan 03: Assessment UI + Results Page Summary

**One-liner:** Assessment entry gate, start confirmation, 30-question step pages, and scored results page wired to DAL/Server Actions from plans 02-01 and 02-02 — full student loop is now end-to-end functional.

## What Was Built

### Task 1: Display Components

**`spd-ready/src/components/student/TierBadge.tsx`**
- Renders Tier 1/2/3 badge using shadcn Badge component
- Tier 1: `default` variant (Ready); Tier 2: `secondary` (Ready with Support); Tier 3: `destructive` (Not Ready Yet)
- Optional `size="large"` prop shows description below badge

**`spd-ready/src/components/student/CategoryScoreBar.tsx`**
- Server Component — no `'use client'` directive
- CSS-only Tailwind progress bar (`style={{ width: `${pct}%` }}`) — no recharts, no hydration risk
- Accepts `isStrength` and `isGrowthArea` props to change bar color and show inline label
- Accessible: `role="progressbar"` with `aria-valuenow/min/max` attributes

**`spd-ready/src/components/student/AssessmentQuestion.tsx`**
- Client Component (`'use client'`)
- Uses `useFormStatus` from `react-dom` for pending state on submit button (not `useActionState`)
- Form `action={saveAnswerAction}` — hidden inputs: `assessmentId`, `questionId`, `step`
- Radio group for answer options A/B/C/D with `defaultChecked` for resume pre-fill
- SubmitButton label: "Next Question" (steps 1–29) or "Submit Assessment" (step 30)
- Progress bar shows `Question X of 30` with percentage

### Task 2: Assessment Route Pages + Results Page

**`spd-ready/src/app/(student)/assessment/page.tsx`** — Entry gate:
- Awaits `searchParams` (Next.js 16 async API)
- Checks `getCurrentUser()` → redirect to `/login` if unauthenticated
- Checks `profile_complete` → redirect to `/student/onboarding` if false
- Checks `checkCooldown()` → shows cooldown card with formatted next-attempt time if blocked
- Reads `getLatestInProgressAssessment()` → resumes at `response_count + 1` if in-progress assessment exists
- Falls through to `/student/assessment/start` for new assessment

**`spd-ready/src/app/(student)/assessment/start/page.tsx`** — Start confirmation:
- Server Component with profile gate (defense-in-depth layer 2)
- Card with 30-question overview and 4 key facts (questions, resumable, cooldown, immediate results)
- `<form action={startAssessmentAction}>` — Button submits to Server Action

**`spd-ready/src/app/(student)/assessment/[assessmentId]/[step]/page.tsx`** — Single question screen:
- Awaits `params` (Next.js 16 breaking change — params is Promise)
- Validates step bounds: `isNaN(stepNum) || stepNum < 1 || stepNum > 30` → redirect to entry gate
- Loads all questions via `getActiveQuestions()` (cache()-wrapped)
- Defense in depth: verifies `inProgress.id === assessmentId` from URL (T-02-12 mitigation)
- Builds `options` from `question.options_json` (jsonb Record) — NOT `option_a/b/c/d` (schema deviation fix)
- Passes `question.prompt` as `questionText` — NOT `question.question_text`
- Pre-fills saved answer via `getResponseForQuestion(assessmentId, question.id)` for resume

**`spd-ready/src/app/(student)/results/page.tsx`** — Scored results:
- Reads `getLatestCompletedAssessment()` — redirects to `/student/assessment` if none
- Tier from `profile.readiness_tier` (NOT from student_assessments — no such column there)
- Score columns from `assessment.technical_score`, `assessment.situational_score`, etc.
- Renders: overall score %, TierBadge (large size), 6 CategoryScoreBars with strength/growth markers
- Top strengths card + growth areas card (from `profile.strengths_json`, `profile.growth_areas_json`)
- Tier 3 improvement path card (conditional `tier === 3`) with per-growth-area improvement notes
- Tier-specific next steps (TIER_NEXT_STEPS lookup by tier 1/2/3)
- Application CTA (only for Tier 1 and Tier 2 — `tier !== 3`)
- Retake link for all tiers

## URL Structure Confirmed

```
/student/assessment          → entry gate (profile + cooldown + resume check)
/student/assessment/start    → start confirmation page
/student/assessment/[assessmentId]/[step]  → single question step (1–30)
/student/results             → scored results display
```

## Next.js 16 Async Params Confirmed

- `assessment/page.tsx`: `const params = await searchParams`
- `assessment/[assessmentId]/[step]/page.tsx`: `const { assessmentId, step } = await params`

## Schema Deviations Handled (from 02-02-SUMMARY.md)

| Plan Code | Actual Field | Fix Applied |
|-----------|-------------|-------------|
| `question.question_text` | `question.prompt` | Step page uses `question.prompt` |
| `question.option_a/b/c/d` | `question.options_json` (jsonb) | Step page iterates `options_json['A'/'B'/'C'/'D']` |
| `assessment.score_technical` | `assessment.technical_score` | Results page uses correct column names |
| `assessment.readiness_tier` | No such column — tier in `student_profiles` | Results page reads `profile.readiness_tier` |

## Tier 3 Improvement Path Confirmed

```tsx
{tier === 3 && (
  <Card className="border-destructive/30 bg-destructive/5">
    ...per-growth-area improvement notes...
  </Card>
)}
```

## Category Score Bar Approach

CSS-only Tailwind — no recharts, no client JS. Width set via `style={{ width: `${pct}%` }}`. Server Component (no `'use client'`).

## TypeScript Compile Result

`npx tsc --noEmit` exits 0 — no errors.

## Unit Test Result

`npx jest --passWithNoTests`: 20 tests passed, 0 failed (same 20 tests from plan 02-02 — no new tests added in this UI plan).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Step page uses options_json instead of option_a/b/c/d**
- **Found during:** Task 2 (reading 02-02-SUMMARY.md and assessment.ts before writing step page)
- **Issue:** Plan code in task 2 built `options = { A: question.option_a, ... }` using flat columns, but actual `AssessmentQuestion` type from 02-02 uses `options_json: Record<string, string>` (jsonb)
- **Fix:** Step page builds options as `{ A: rawOptions['A'] ?? '', ... }` from `question.options_json`
- **Files modified:** `src/app/(student)/assessment/[assessmentId]/[step]/page.tsx`
- **Commit:** 957bd2b

**2. [Rule 1 - Bug] Results page reads tier from student_profiles, not student_assessments**
- **Found during:** Task 2 (reading StudentAssessment type and 02-02-SUMMARY.md schema deviations)
- **Issue:** Plan code referenced `assessment.readiness_tier` but `StudentAssessment` type has no such field — tier is stored in `student_profiles.readiness_tier`
- **Fix:** Results page reads `profile.readiness_tier` instead
- **Files modified:** `src/app/(student)/results/page.tsx`
- **Commit:** 957bd2b

**3. [Rule 1 - Bug] Results page uses correct score column names**
- **Found during:** Task 2 (reading StudentAssessment type)
- **Issue:** Plan code used `assessment.score_technical` etc., but actual column names are `assessment.technical_score`, `assessment.situational_score`, etc.
- **Fix:** Results page uses correct column names per `StudentAssessment` type
- **Files modified:** `src/app/(student)/results/page.tsx`
- **Commit:** 957bd2b

**4. [Rule 1 - Bug] Step page uses question.prompt instead of question.question_text**
- **Found during:** Task 2 (reading AssessmentQuestion type from assessment.ts)
- **Issue:** Plan code passed `questionText={question.question_text}` but actual field is `question.prompt`
- **Fix:** Step page passes `questionText={question.prompt}`
- **Files modified:** `src/app/(student)/assessment/[assessmentId]/[step]/page.tsx`
- **Commit:** 957bd2b

## Known Stubs

None — all data flows are connected to real DAL functions. The empty-state guards (no strengths/growthAreas) are correct initial states, not stubs.

## Security Review (Threat Model)

| Threat ID | Mitigation Confirmed |
|-----------|---------------------|
| T-02-12: Accessing another student's assessmentId | Step page cross-checks `inProgress.id === assessmentId`; getLatestInProgressAssessment scoped to auth.uid() |
| T-02-13: Navigating directly to /start without profile | start/page.tsx checks `profile_complete`; startAssessmentAction also checks (dual defense) |
| T-02-14: Manipulating step number in URL | isNaN/bounds check on step; all 30 responses required by submitAssessmentAction |
| T-02-15: Results page showing another student's data | getLatestCompletedAssessment + getStudentProfile scoped to auth.uid(); RLS enforces at DB |
| T-02-16: Unauthenticated access | getCurrentUser() at top of every Server Component |

## Threat Flags

None — no new network endpoints, auth paths, or schema changes beyond what the plan's threat model covers.

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: TierBadge, CategoryScoreBar, AssessmentQuestion | 98e1f2a | src/components/student/TierBadge.tsx, src/components/student/CategoryScoreBar.tsx, src/components/student/AssessmentQuestion.tsx |
| Task 2: Assessment pages + results page | 957bd2b | src/app/(student)/assessment/page.tsx, src/app/(student)/assessment/start/page.tsx, src/app/(student)/assessment/[assessmentId]/[step]/page.tsx, src/app/(student)/results/page.tsx |

## Self-Check: PASSED

- [x] `spd-ready/src/components/student/TierBadge.tsx` exists
- [x] `spd-ready/src/components/student/CategoryScoreBar.tsx` exists
- [x] `spd-ready/src/components/student/AssessmentQuestion.tsx` exists
- [x] `spd-ready/src/app/(student)/assessment/page.tsx` exists
- [x] `spd-ready/src/app/(student)/assessment/start/page.tsx` exists
- [x] `spd-ready/src/app/(student)/assessment/[assessmentId]/[step]/page.tsx` exists
- [x] `spd-ready/src/app/(student)/results/page.tsx` exists
- [x] commit 98e1f2a exists
- [x] commit 957bd2b exists
- [x] `npx tsc --noEmit` exits 0
- [x] `npx jest --passWithNoTests` exits 0 (20 tests pass)
