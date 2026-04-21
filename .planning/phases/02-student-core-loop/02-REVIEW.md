---
phase: 02-student-core-loop
reviewed: 2026-04-21T00:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - spd-ready/src/lib/dal/student.ts
  - spd-ready/src/actions/student.ts
  - spd-ready/src/components/student/OnboardingForm.tsx
  - spd-ready/src/app/(student)/onboarding/page.tsx
  - spd-ready/src/app/(student)/profile/page.tsx
  - spd-ready/src/app/(student)/applications/page.tsx
  - spd-ready/src/app/(student)/layout.tsx
  - spd-ready/src/app/(student)/student/dashboard/page.tsx
  - spd-ready/supabase/migrations/005_seed_assessment_questions.sql
  - spd-ready/src/lib/dal/assessment.ts
  - spd-ready/src/lib/dal/scoring.ts
  - spd-ready/tests/scoring.test.ts
  - spd-ready/tests/assessment.test.ts
  - spd-ready/src/components/student/TierBadge.tsx
  - spd-ready/src/components/student/CategoryScoreBar.tsx
  - spd-ready/src/components/student/AssessmentQuestion.tsx
  - spd-ready/src/app/(student)/assessment/page.tsx
  - spd-ready/src/app/(student)/assessment/start/page.tsx
  - spd-ready/src/app/(student)/assessment/[assessmentId]/[step]/page.tsx
  - spd-ready/src/app/(student)/results/page.tsx
findings:
  critical: 2
  warning: 4
  info: 3
  total: 9
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-04-21
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

Phase 2 implements the full student core loop: profile onboarding, 30-question readiness assessment, server-side scoring, and results display. The architecture is generally sound — Server Actions own mutations, the DAL layer owns Supabase queries, and the `behavioral` → `behavior` remap is correctly handled. The scoring math and tier logic are clean and well-tested.

Two critical issues require fixes before ship: the student route group layout is missing its role enforcement guard (any authenticated user can access student routes), and `submitAssessmentAction` accepts an `assessmentId` parameter without verifying ownership of that assessment before reading its responses. Four warnings cover a results page that can silently default to Tier 3 on profile-write failure, a cooldown page that can flash incorrectly, a missing per-step validation UX gap in the onboarding form, and the application list casting away its own types. Three info items address dead code, minor naming, and a `console.error` left in production.

---

## Critical Issues

### CR-01: Student Layout Missing Role Enforcement Guard

**File:** `spd-ready/src/app/(student)/layout.tsx:1-34`

**Issue:** `CLAUDE.md` explicitly states "Role enforcement happens in route group layouts." The `(student)/layout.tsx` renders a nav and wraps `children` — but it never calls `requireRole('student')`. Any authenticated user with a hospital or admin role can navigate directly to `/student/dashboard`, `/student/assessment`, etc. and the layout will render without challenge. Each page only calls `getCurrentUser()` (null check only), not `requireRole`. The auth guard is present in Server Actions but the page/layout layer is unprotected.

**Fix:**
```tsx
// spd-ready/src/app/(student)/layout.tsx
import { requireRole } from '@/lib/dal/auth'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  // Enforces student role — redirects to /unauthorized for non-students
  await requireRole('student')

  return (
    <div className="min-h-screen bg-background">
      {/* ... nav and children unchanged ... */}
    </div>
  )
}
```

---

### CR-02: `submitAssessmentAction` Has No Assessment Ownership Verification

**File:** `spd-ready/src/actions/student.ts:148-190`

**Issue:** `submitAssessmentAction` is an exported Server Action (callable via direct POST) that accepts an arbitrary `assessmentId` string. The response-count query at line 155 reads `assessment_responses` filtered only by `assessment_id` — there is no `.eq('student_user_id', user.id)` guard. If Supabase RLS on `assessment_responses` allows any authenticated student to read all rows (e.g., missing SELECT policy scoped to the owner), any student could pass another student's `assessmentId` and trigger scoring against that student's responses. The computed scores would then be written to the _caller's_ `student_profiles` row — allowing a low-scoring student to hijack a high-scoring student's responses and claim their scores.

Even if RLS prevents the read, the function proceeds silently with `count = 0` (fails the `< 30` guard and redirects with `error=incomplete_assessment`) rather than surfacing an authorization error — masking the exploit attempt.

**Fix:** Add an ownership check before the count query, and scope the count to only the current user's assessment:

```ts
// spd-ready/src/actions/student.ts  — inside submitAssessmentAction
const user = await requireRole('student')

// Verify assessment ownership before touching it
const { data: assessmentRow } = await supabase
  .from('student_assessments')
  .select('id')
  .eq('id', assessmentId)
  .eq('student_user_id', user.id)   // ownership check
  .maybeSingle()

if (!assessmentRow) {
  redirect('/student/assessment?error=not_found')
}

// Count responses scoped to the verified assessment
const { count } = await supabase
  .from('assessment_responses')
  .select('id', { count: 'exact', head: true })
  .eq('assessment_id', assessmentId)
```

---

## Warnings

### WR-01: Results Page Falls Back to Tier 3 on Silent Profile-Update Failure

**File:** `spd-ready/src/app/(student)/results/page.tsx:70`

**Issue:** `submitAssessmentAction` treats the `student_profiles` readiness update as non-fatal — on error it logs to `console.error` and continues to `redirect('/student/results')` (actions/student.ts:183-188). On the results page, tier is derived as `profile?.readiness_tier ?? 3`. If the profile write silently failed, `readiness_tier` will be null, the default of `3` kicks in, and the student sees "Tier 3 — Not Ready Yet" with Tier 3 next steps regardless of their actual score. This is a silent, user-visible correctness failure — the student gets wrong tier messaging with no indication something went wrong.

**Fix:** Either make the profile update fatal (throw and surface an error page), or use the assessment row's `overall_score` to recompute the tier on the results page as a fallback rather than defaulting to 3:

```ts
// spd-ready/src/app/(student)/results/page.tsx
import { deriveReadinessTier } from '@/lib/dal/scoring'

// Prefer profile tier; fall back to recomputing from assessment score rather than hardcoding 3
const tier = (
  profile?.readiness_tier ??
  (assessment.overall_score != null ? deriveReadinessTier(assessment.overall_score) : 3)
) as 1 | 2 | 3
```

Alternatively, make `submitAssessmentAction` throw on profile-update failure so the issue is visible instead of hidden.

---

### WR-02: Assessment Entry Page Shows Cooldown Message When Cooldown Has Already Expired

**File:** `spd-ready/src/app/(student)/assessment/page.tsx:27`

**Issue:** The condition `if (!cooldown.allowed || params.cooldown)` shows the cooldown message whenever a `?cooldown=` query param is present in the URL — even if the cooldown has since expired. A student who is redirected to `/student/assessment?cooldown=<timestamp>` will see the "24-hour cooldown" block until they manually remove the param or navigate away, even if the 24 hours elapsed while they had the tab open.

**Fix:** Remove `params.cooldown` from the branch condition. The server already re-checks cooldown status on every page load via `checkCooldown(user.id)` — that check is the source of truth:

```ts
// spd-ready/src/app/(student)/assessment/page.tsx:27
// Before:
if (!cooldown.allowed || params.cooldown) {

// After:
if (!cooldown.allowed) {
```

The `nextAt` calculation on the following line already has a fallback to `params.cooldown` for displaying the timestamp, so the UX copy is unaffected.

---

### WR-03: Onboarding Multi-Step Form Bypasses Per-Step HTML Validation

**File:** `spd-ready/src/components/student/OnboardingForm.tsx:265-272`

**Issue:** The "Next" button on Steps 1 and 2 is `type="button"`, which never triggers browser HTML5 constraint validation. A student can skip all required fields on Step 1 (first name, last name, cert status, program name, expected date), click "Next" twice, and submit on Step 3. Server-side Zod validation will catch missing fields, but the returned error message (e.g., "First name is required") displays on Step 3 with no indication which step contains the offending field. The student may be confused about what to fix since Step 1 fields are not visible.

**Fix:** Before advancing the step, validate the current step's fields imperatively. A lightweight approach using the native `checkValidity` API on the form element:

```tsx
// spd-ready/src/components/student/OnboardingForm.tsx
const formRef = useRef<HTMLFormElement>(null)

const handleNext = () => {
  // reportValidity() shows browser tooltips; returns false if any required field is empty
  if (formRef.current && !formRef.current.reportValidity()) return
  setStep(s => s + 1)
}

// In JSX:
<form action={formAction} ref={formRef}>
  ...
  <Button type="button" className="ml-auto" onClick={handleNext}>
    Next
  </Button>
```

Note: `reportValidity()` only validates inputs currently rendered in the DOM, which is correct here since only the current step's fields are rendered.

---

### WR-04: `applications/page.tsx` Casts Away Its Own Typed Property

**File:** `spd-ready/src/app/(student)/applications/page.tsx:41-44`

**Issue:** `ApplicationRow` (defined in `student.ts:49-54`) has a fully typed `externship_openings` property. The applications page then accesses this field via `(app.externship_openings as any)?.title` and `(app.externship_openings as any)?.hospital_profiles?.site_name`. The `as any` cast defeats TypeScript's protection — if the shape of `ApplicationRow` changes, this page silently breaks with no type error. The type already provides the correct shape.

**Fix:** Remove the `as any` casts and access the typed property directly:

```tsx
// spd-ready/src/app/(student)/applications/page.tsx:39-44
<CardTitle className="text-base">
  {app.externship_openings?.title ?? 'Externship Opening'}
</CardTitle>
<p className="text-sm text-muted-foreground">
  {app.externship_openings?.hospital_profiles?.site_name ?? 'Hospital'}
</p>
```

Note: The `ApplicationRow` type declares `externship_openings` as non-optional, so the `?.` optional chaining here adds safety for the case where a Supabase join returns null if there is no matching opening row.

---

## Info

### IN-01: `console.error` in Production Server Action

**File:** `spd-ready/src/actions/student.ts:185`

**Issue:** `console.error('Failed to update student_profiles readiness data:', profileError.message)` is used for error reporting in a Server Action. In production on Vercel, this writes to function logs, which is acceptable, but the message format is inconsistent with a structured logging approach. Combined with WR-01 (the error is silently swallowed), this is the only signal that scoring completed but profile write failed.

**Fix:** If the non-fatal behavior is intentional, add enough context to make the log actionable:
```ts
console.error('[submitAssessmentAction] profile readiness update failed', {
  assessmentId,
  userId: user.id,
  error: profileError.message,
})
```

---

### IN-02: Unreachable `return` After `redirect()` Call in `saveAnswerAction`

**File:** `spd-ready/src/actions/student.ts:139`

**Issue:** `return` on line 139 is unreachable — `submitAssessmentAction` always calls `redirect()`, which throws a `NEXT_REDIRECT` exception that unwinds the call stack. The comment "submitAssessmentAction redirects to /student/results" is accurate, so the `return` is defensive dead code.

**Fix:** Remove the unreachable `return` to avoid misleading future readers about control flow:
```ts
// Before:
await submitAssessmentAction(assessmentId)
return // submitAssessmentAction redirects to /student/results

// After:
await submitAssessmentAction(assessmentId)
// redirect() in submitAssessmentAction throws NEXT_REDIRECT — execution stops here
```

---

### IN-03: Stale `behavior` Column Name in `StudentAssessment` Type

**File:** `spd-ready/src/lib/dal/assessment.ts:34`

**Issue:** `StudentAssessment` has field `behavior_score` (line 34), matching the DB column name. This is correct and consistent with `finalizeAssessment` writing to `behavior_score`. However, the field name `behavior_score` vs the `CategoryScores.behavior` key creates a subtle naming inconsistency that could confuse contributors. In `results/page.tsx:81` the mapping is explicit and correct (`behavior: assessment.behavior_score ?? 0`). Not a bug but worth a comment to document the intentional mismatch.

**Fix:** Add a brief comment on the `behavior_score` field in the type:
```ts
behavior_score: number | null     // maps to CategoryScores.behavior (DB column: behavior_score, NOT behavioral_score)
```

---

_Reviewed: 2026-04-21_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
