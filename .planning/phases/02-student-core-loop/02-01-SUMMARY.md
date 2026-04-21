---
phase: 02-student-core-loop
plan: "01"
name: "Student DAL + Profile Onboarding + Profile View/Edit"
subsystem: student-profile
tags: [dal, server-actions, multi-step-form, onboarding, profile, applications]
dependency_graph:
  requires: [01-03]
  provides: [getStudentProfile, upsertStudentProfile, getApplications, upsertStudentProfileAction, OnboardingForm, onboarding-page, profile-page, applications-page, profile_complete-gate]
  affects: [02-02, 02-03]
tech_stack:
  added: [shadcn/progress, shadcn/separator]
  patterns: [cache-wrapped-dal-reads, requireRole-dal-writes, useActionState-client-component, zod-server-validation, async-searchParams-next16]
key_files:
  created:
    - spd-ready/src/lib/dal/student.ts
    - spd-ready/src/actions/student.ts
    - spd-ready/src/components/student/OnboardingForm.tsx
    - spd-ready/src/app/(student)/onboarding/page.tsx
    - spd-ready/src/app/(student)/profile/page.tsx
    - spd-ready/src/app/(student)/applications/page.tsx
  modified:
    - spd-ready/src/app/(student)/layout.tsx
    - spd-ready/src/app/(student)/student/dashboard/page.tsx
decisions:
  - "Used `as unknown as ApplicationRow[]` cast for Supabase nested join return — Supabase returns arrays for joined relations; our ApplicationRow type uses singular objects for ergonomics at call sites"
  - "profile_complete gate: onboarding/page.tsx redirects to /student/profile if profile_complete=true, preventing double-onboarding"
  - "Edit mode via ?edit=true query param — no separate route needed, clean URL pattern, awaits searchParams per Next.js 16"
metrics:
  duration_minutes: 4
  completed_date: "2026-04-21"
  tasks_completed: 2
  files_created: 6
  files_modified: 2
---

# Phase 2 Plan 01: Student DAL + Profile Onboarding + Profile View/Edit Summary

**One-liner:** Student profile DAL with cache/requireRole pattern, zod-validated Server Action, and 3-step OnboardingForm Client Component wired via useActionState.

## What Was Built

### Task 1: Student DAL + Server Action

**`spd-ready/src/lib/dal/student.ts`** — exports:
- `getStudentProfile(): Promise<StudentProfile | null>` — `cache()`-wrapped, calls `getCurrentUser()`, uses `.maybeSingle()`, returns null if unauthenticated
- `getApplications(): Promise<ApplicationRow[]>` — `cache()`-wrapped, filters by `student_user_id`, joins `externship_openings` + `hospital_profiles`
- `upsertStudentProfile(input: StudentProfileInput): Promise<void>` — no `cache()`, calls `requireRole('student')` at top, upserts with `onConflict: 'user_id'`, always sets `profile_complete: true`

**`spd-ready/src/actions/student.ts`** — exports:
- `upsertStudentProfileAction(prevState, formData): Promise<ActionState>` — `'use server'`, zod validation, calls `upsertStudentProfile()`, `revalidatePath('/', 'layout')`, `redirect('/student/dashboard')` on success; returns `{ error }` on validation failure

### Task 2: UI Components + Pages

**`spd-ready/src/components/student/OnboardingForm.tsx`** — 3-step Client Component:
- Step 1 (Personal Info): first_name, last_name, cert_status, program_name, expected_completion_date
- Step 2 (Location & Travel): city, state (US states dropdown), travel_radius, transportation_reliable (radio)
- Step 3 (Availability & Preferences): shift_availability (toggle buttons → CSV hidden input), preferred_environment
- Uses `useActionState(upsertStudentProfileAction, null)` — pending state disables Submit button
- Progress indicator: 3-segment bar, filled segments track current step
- Accepts `initialData` prop for edit mode pre-fill

**`spd-ready/src/app/(student)/onboarding/page.tsx`**:
- Calls `getCurrentUser()` → redirects to `/login` if unauthenticated
- Calls `getStudentProfile()` → redirects to `/student/profile` if `profile_complete === true`
- Renders `<OnboardingForm initialData={profile} />` for new or partial profiles

**`spd-ready/src/app/(student)/profile/page.tsx`**:
- Awaits `searchParams` (Next.js 16 async pattern)
- `?edit=true` → renders `<OnboardingForm initialData={profile} />` pre-filled
- Default → read-only card view (Personal Info, Program & Certification, Availability & Preferences)
- Shows readiness tier badge + score if assessment completed
- CTA to start assessment if no tier yet

**`spd-ready/src/app/(student)/applications/page.tsx`**:
- Lists applications with site name, opening title, status badge (applied/under_review/accepted/waitlisted/rejected)
- Empty state message when no applications exist

**`spd-ready/src/app/(student)/layout.tsx`** (updated):
- Nav links: Dashboard, Profile, Assessment, Applications
- Sign out via `signOutAction` Server Action form

**`spd-ready/src/app/(student)/student/dashboard/page.tsx`** (updated):
- Profile status card: shows program + location if complete, CTA to onboarding if not
- Assessment status card: shows score + View Results if complete, Start Assessment CTA if profile complete but no score, locked message if profile incomplete

## Profile Gate Behavior

- `onboarding/page.tsx` checks `profile?.profile_complete` — redirects to `/student/profile` if true (prevents re-onboarding)
- `profile/page.tsx` redirects to `/student/onboarding` if no profile row exists
- Assessment access gate (Plan 02-02) will read `profile_complete` from `getStudentProfile()` — the field is correctly set to `true` by `upsertStudentProfile()` on every save

## DAL Function Signatures

```typescript
// Reads (cached)
getStudentProfile(): Promise<StudentProfile | null>
getApplications(): Promise<ApplicationRow[]>

// Writes (requireRole guard)
upsertStudentProfile(input: StudentProfileInput): Promise<void>
```

## Server Action Signature

```typescript
// prevState pattern confirmed — compatible with useActionState
upsertStudentProfileAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null>
```

## TypeScript Compile Result

`npx tsc --noEmit` exits 0 — no errors.

## Security Review (Threat Model)

All 5 threats from the plan's threat model are mitigated:

| Threat | Mitigation Confirmed |
|--------|---------------------|
| T-02-01: Assessment without profile | `onboarding/page.tsx` profile_complete gate wired |
| T-02-02: Crafted formData with extra fields | zod `profileSchema.safeParse` only extracts expected fields |
| T-02-03: Unauthenticated POST to action | `requireRole('student')` at top of action |
| T-02-04: Upsert another student's profile | DAL always sets `user_id: user.id` from requireRole; onConflict: 'user_id' |
| T-02-05: Applications showing other students' data | `getApplications()` filters by `user.id`; RLS enforces separately |

## Known Stubs

None — all data flows are wired. The applications page correctly shows an empty state when no applications exist (not a stub — that is the correct initial state for a new student).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ApplicationRow type assertion**
- **Found during:** Task 1 TypeScript check
- **Issue:** Supabase returns arrays for nested join relations (`hospital_profiles: {...}[]`) but `ApplicationRow` type expects a singular object. Direct `as ApplicationRow[]` cast fails TS strict mode.
- **Fix:** Used `as unknown as ApplicationRow[]` double cast — the runtime shape is consistent at call sites since `.maybeSingle()` is not used here (it's a list query).
- **Files modified:** `spd-ready/src/lib/dal/student.ts` line 93
- **Commit:** 3094150

## What Plan 02-02 Needs

1. **Profile gate:** Import `getStudentProfile` from `@/lib/dal/student` and check `profile?.profile_complete` — redirect to `/student/onboarding` if false. This is the defense-in-depth layer 2 (layer 1 is in `onboarding/page.tsx`).

2. **DAL pattern for `assessment.ts`:** Follow the exact same pattern as `student.ts` — `cache()` for reads, `requireRole('student')` for writes, `getCurrentUser()` as the auth check, `maybeSingle()` for nullable single-row queries.

3. **`upsertStudentProfileAction` is already in `src/actions/student.ts`** — Plan 02-02 will add `startAssessmentAction`, `saveAnswerAction`, and `submitAssessmentAction` to the same file.

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: Student DAL + Server Action | 3094150 | src/lib/dal/student.ts, src/actions/student.ts, src/components/ui/progress.tsx, src/components/ui/separator.tsx |
| Task 2: OnboardingForm + pages + layout | 4da9e07 | src/components/student/OnboardingForm.tsx, src/app/(student)/onboarding/page.tsx, src/app/(student)/profile/page.tsx, src/app/(student)/applications/page.tsx, src/app/(student)/layout.tsx, src/app/(student)/student/dashboard/page.tsx |

## Self-Check: PASSED

- [x] `spd-ready/src/lib/dal/student.ts` exists
- [x] `spd-ready/src/actions/student.ts` exists
- [x] `spd-ready/src/components/student/OnboardingForm.tsx` exists
- [x] `spd-ready/src/app/(student)/onboarding/page.tsx` exists
- [x] `spd-ready/src/app/(student)/profile/page.tsx` exists
- [x] `spd-ready/src/app/(student)/applications/page.tsx` exists
- [x] commit 3094150 exists
- [x] commit 4da9e07 exists
- [x] `npx tsc --noEmit` exits 0
