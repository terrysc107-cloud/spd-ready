# Phase 2: Student Core Loop — Pattern Map

**Mapped:** 2026-04-21
**Files analyzed:** 16 new/modified files
**Analogs found:** 14 / 16

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/dal/student.ts` | dal | CRUD | `src/lib/dal/auth.ts` | role-match |
| `src/lib/dal/assessment.ts` | dal | CRUD + request-response | `src/lib/dal/auth.ts` | role-match |
| `src/lib/dal/scoring.ts` | utility | transform | `src/lib/dal/auth.ts` (structure only) | partial-match |
| `src/actions/student.ts` | server-action | request-response | `src/actions/auth.ts` | exact |
| `src/app/(student)/layout.tsx` | layout | request-response | `src/app/(student)/layout.tsx` (existing) | exact (modify) |
| `src/app/(student)/student/dashboard/page.tsx` | page | request-response | `src/app/(student)/student/dashboard/page.tsx` (existing) | exact (modify) |
| `src/app/(student)/onboarding/page.tsx` | page | request-response | `src/app/(auth)/register/page.tsx` | role-match |
| `src/app/(student)/profile/page.tsx` | page | request-response | `src/app/(auth)/login/page.tsx` | role-match |
| `src/app/(student)/assessment/page.tsx` | page | request-response | `src/app/(auth)/login/page.tsx` | role-match |
| `src/app/(student)/assessment/[step]/page.tsx` | page | request-response | `src/app/(auth)/login/page.tsx` | role-match |
| `src/app/(student)/results/page.tsx` | page | request-response | `src/app/(auth)/reset-password/page.tsx` | role-match |
| `src/app/(student)/applications/page.tsx` | page | request-response | `src/app/(auth)/login/page.tsx` | role-match |
| `src/components/student/OnboardingForm.tsx` | component | request-response | `src/app/(auth)/register/page.tsx` (form pattern) | role-match |
| `src/components/student/AssessmentQuestion.tsx` | component | request-response | `src/app/(auth)/login/page.tsx` (form pattern) | role-match |
| `src/components/student/TierBadge.tsx` | component | transform | `src/components/ui/badge.tsx` | partial-match |
| `src/components/student/CategoryScoreBar.tsx` | component | transform | none | no-analog |
| `supabase/migrations/005_seed_assessment_questions.sql` | migration | batch | none | no-analog |

---

## Pattern Assignments

### `src/lib/dal/student.ts` (dal, CRUD)

**Analog:** `src/lib/dal/auth.ts`

**Imports pattern** (lines 1–3):
```typescript
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
```

**Auth/guard pattern** — every DAL function calls `getCurrentUser()` first (lines 13–23):
```typescript
import { getCurrentUser } from '@/lib/dal/auth'

export const getStudentProfile = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return data
})
```

**Core DAL pattern** — `cache()` wraps read functions; mutable functions do NOT use `cache()`:
```typescript
// Read → wrap with cache()
export const getStudentProfile = cache(async () => { ... })

// Write/upsert → no cache()
export async function upsertStudentProfile(data: StudentProfileInput): Promise<void> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { error } = await supabase
    .from('student_profiles')
    .upsert({ ...data, user_id: user.id }, { onConflict: 'user_id' })

  if (error) throw new Error(error.message)
}
```

**`requireRole()` for writes** — import from `src/lib/dal/auth.ts` and call at top of write functions (lines 44–55 of auth.ts):
```typescript
import { requireRole } from '@/lib/dal/auth'

export async function upsertStudentProfile(data: StudentProfileInput) {
  const user = await requireRole('student')
  // user is guaranteed non-null and student role here
  const supabase = await createClient()
  // ...
}
```

---

### `src/lib/dal/assessment.ts` (dal, CRUD)

**Analog:** `src/lib/dal/auth.ts`

**Imports pattern** — same as student.ts plus `getCurrentUser` and `requireRole`:
```typescript
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, requireRole } from '@/lib/dal/auth'
```

**Core read pattern** — `.maybeSingle()` for nullable single-row reads; no `.single()` (which throws):
```typescript
export const getLatestCompletedAssessment = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('student_assessments')
    .select('*')
    .eq('student_user_id', user.id)
    .eq('status', 'completed')
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
})
```

**Write pattern** — `requireRole('student')` guards mutations:
```typescript
export async function saveAnswerToDb(
  assessmentId: string,
  questionId: string,
  answer: string,
  score: number
): Promise<void> {
  const user = await requireRole('student')
  const supabase = await createClient()
  const { error } = await supabase
    .from('assessment_responses')
    .upsert(
      { assessment_id: assessmentId, question_id: questionId, student_user_id: user.id, answer, score },
      { onConflict: 'assessment_id,question_id' }
    )
  if (error) throw new Error(error.message)
}
```

---

### `src/lib/dal/scoring.ts` (utility, transform)

**Analog:** `src/lib/dal/auth.ts` (file structure only — no Supabase calls needed here)

**Pattern:** Pure TypeScript exports, no `cache()`, no Supabase, no auth. This file is a math module.

```typescript
// No 'use server' — not a Server Action
// No createClient — no DB access
// No cache() — pure functions, idempotent

export type CategoryScores = {
  technical: number    // 0–100
  situational: number
  process: number
  behavior: number     // NOTE: maps from DB column 'behavioral'
  instrument: number
  reliability: number
}

export function computeReadinessScore(scores: CategoryScores): number {
  return (
    scores.technical    * 0.30 +
    scores.situational  * 0.25 +
    scores.process      * 0.15 +
    scores.behavior     * 0.15 +
    scores.instrument   * 0.10 +
    scores.reliability  * 0.05
  )
}

export function deriveReadinessTier(overallScore: number): 1 | 2 | 3 {
  if (overallScore >= 75) return 1
  if (overallScore >= 55) return 2
  return 3
}
```

**CRITICAL — category name mismatch:** The DB column `assessment_questions.category` uses the value `'behavioral'`. The `CategoryScores` type uses `behavior`. The DAL must remap when building `CategoryScores`:
```typescript
// In assessment.ts computeCategoryScores():
behavior: avg(byCategory['behavioral'] ?? []),  // 'behavioral' = DB value, behavior = TS key
```

---

### `src/actions/student.ts` (server-action, request-response)

**Analog:** `src/actions/auth.ts`

**Directive and imports pattern** (lines 1–6 of auth.ts):
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
```

**For Phase 2, also import DAL and zod:**
```typescript
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/dal/auth'
import { upsertStudentProfile, getStudentProfile } from '@/lib/dal/student'
import { checkCooldown, createAssessment, saveAnswerToDb, computeCategoryScores } from '@/lib/dal/assessment'
import { computeReadinessScore, deriveReadinessTier, deriveStrengthsAndGrowth } from '@/lib/dal/scoring'
```

**Action signature — void return (redirect-only) pattern** (lines 13–38 of auth.ts):
```typescript
// Use this when ALL paths end in redirect() — return type is void
export async function signInAction(formData: FormData) {
  // ...
  redirect('/student/dashboard')
}
```

**Action signature — prevState pattern for useActionState** (RESEARCH.md Pattern 1, verified from Next.js 16 forms.md):
```typescript
// Use this when the client uses useActionState() — prevState MUST be first param
type ActionState = { error?: string } | null

export async function upsertStudentProfileAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = profileSchema.safeParse(Object.fromEntries(formData))
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors.toString() }
  }
  await upsertStudentProfile(validated.data)
  redirect('/student/dashboard')
}
```

**Error redirect pattern** (lines 17–19, 26–28 of auth.ts):
```typescript
// For void actions: errors via redirect with ?error= query param
if (!email || !password) {
  redirect('/login?error=missing_fields')
}
// ...
if (error) {
  redirect('/login?error=invalid_credentials')
}
```

**revalidatePath pattern** (lines 28–29 of auth.ts):
```typescript
// After a mutation, revalidate so cached Server Components re-fetch
revalidatePath('/', 'layout')
```

**CRITICAL — redirect() after await writes, never before** (RESEARCH.md Pitfall 3):
```typescript
// CORRECT: write first, then redirect
await saveAnswerToDb(assessmentId, questionId, answer, score)
redirect(`/student/assessment/${currentStep + 1}`)

// WRONG: redirect throws and interrupts the write
redirect(`/student/assessment/${currentStep + 1}`)
await saveAnswerToDb(...)  // NEVER REACHED
```

---

### `src/app/(student)/layout.tsx` (layout, request-response)

**Analog:** `src/app/(student)/layout.tsx` (existing — modify in place)

**Current pattern** (lines 1–13):
```typescript
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-sm">SPD Ready — Student</span>
        <a href="/api/auth/signout" className="text-sm text-muted-foreground hover:text-foreground">
          Sign out
        </a>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
```

**Phase 2 modification:** Add nav links for Dashboard, Onboarding/Profile, Assessment, Results, Applications. Keep the same structural pattern (`min-h-screen` + `border-b nav` + `p-6 main`). Layout is a Server Component — no `'use client'` needed.

---

### `src/app/(student)/onboarding/page.tsx` (page, request-response)

**Analog:** `src/app/(auth)/register/page.tsx`

**Page shell pattern — Server Component with async searchParams** (lines 9–14 of register/page.tsx):
```typescript
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string }>
}) {
  const params = await searchParams
  // ...
}
```

**Error banner pattern** (lines 30–34 of register/page.tsx):
```typescript
{params.error && (
  <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
    Registration failed: {params.error}
  </p>
)}
```

**Form structure pattern** — `<form action={serverAction}>` wrapping Card with CardHeader/CardContent/CardFooter (lines 28–118 of register/page.tsx). The onboarding page renders the `<OnboardingForm>` Client Component inside this shell, passing it server-fetched data (existing profile for edit mode).

**Key difference from register page:** Onboarding page should check if profile already exists (redirect to `/student/profile` if `profile_complete = true`). Add this server-side check before rendering:
```typescript
const profile = await getStudentProfile()
if (profile?.profile_complete) redirect('/student/profile')
```

---

### `src/app/(student)/profile/page.tsx` (page, request-response)

**Analog:** `src/app/(auth)/reset-password/page.tsx`

**Conditional render pattern** (lines 26–68 of reset-password/page.tsx) — shows different content based on server-fetched state. Profile page shows read-only view OR edit form:
```typescript
// Reads are done in the Server Component; data passed as props
const profile = await getStudentProfile()
if (!profile) redirect('/student/onboarding')

return (
  <Card>
    <CardHeader>...</CardHeader>
    {isEditing ? (
      <OnboardingForm initialData={profile} />
    ) : (
      <ProfileReadView profile={profile} />
    )}
  </Card>
)
```

---

### `src/app/(student)/assessment/page.tsx` (page, request-response)

**Analog:** `src/app/(auth)/login/page.tsx` (Server Component shell pattern)

**Server Component redirect-only pattern** — this page does nothing but check state and redirect:
```typescript
import { redirect } from 'next/navigation'
import { getStudentProfile } from '@/lib/dal/student'
import { getLatestInProgressAssessment, checkCooldown } from '@/lib/dal/assessment'
import { getCurrentUser } from '@/lib/dal/auth'

export default async function AssessmentEntryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Profile gate — defense in depth layer 1
  const profile = await getStudentProfile()
  if (!profile?.profile_complete) redirect('/student/onboarding')

  // Resume check
  const inProgress = await getLatestInProgressAssessment()
  if (inProgress) {
    redirect(`/student/assessment/${inProgress.response_count + 1}`)
  }

  // Cooldown check
  const cooldown = await checkCooldown(user.id)
  if (!cooldown.allowed) {
    redirect(`/student/assessment/start?cooldown=${cooldown.nextAttemptAt?.toISOString()}`)
  }

  redirect('/student/assessment/start')
}
```

---

### `src/app/(student)/assessment/[step]/page.tsx` (page, request-response)

**Analog:** `src/app/(auth)/login/page.tsx` (structural shell) + RESEARCH.md Pattern 2

**CRITICAL — async params in Next.js 16** (RESEARCH.md Pattern 7, verified from Next.js 16 page.md):
```typescript
export default async function AssessmentStepPage({
  params,
}: {
  params: Promise<{ step: string }>   // params IS a Promise in Next.js 16
}) {
  const { step } = await params       // MUST await before accessing fields
  const stepNum = parseInt(step, 10)

  if (isNaN(stepNum) || stepNum < 1 || stepNum > 30) {
    redirect('/student/assessment')
  }
  // ...
}
```

**Server Component data-loading pattern** — load all data needed server-side, pass as props to Client Component:
```typescript
// Server Component loads; Client Component renders and handles form submission
const questions = await getActiveQuestions()
const question = questions[stepNum - 1]
const inProgress = await getLatestInProgressAssessment()
const existingAnswer = inProgress
  ? await getResponseForQuestion(inProgress.id, question.id)
  : null

return (
  <AssessmentQuestion
    question={question}
    stepNum={stepNum}
    totalSteps={30}
    existingAnswer={existingAnswer?.answer ?? null}
    assessmentId={inProgress?.id ?? ''}
  />
)
```

---

### `src/app/(student)/results/page.tsx` (page, request-response)

**Analog:** `src/app/(auth)/reset-password/page.tsx`

**Server Component reading computed data from DB** — same pattern as reset-password conditional render:
```typescript
import { getStudentProfile } from '@/lib/dal/student'
import { getLatestCompletedAssessment } from '@/lib/dal/assessment'
import { redirect } from 'next/navigation'

export default async function ResultsPage() {
  const profile = await getStudentProfile()
  const assessment = await getLatestCompletedAssessment()

  if (!assessment || assessment.status !== 'completed') {
    redirect('/student/assessment')
  }

  return (
    <div>
      <TierBadge tier={profile?.readiness_tier ?? 3} />
      {/* per-category bars, strengths, growth areas */}
    </div>
  )
}
```

---

### `src/app/(student)/applications/page.tsx` (page, request-response)

**Analog:** `src/app/(auth)/login/page.tsx` (minimal Server Component)

**Read-only list pattern** — Server Component fetches list, renders directly:
```typescript
import { getApplications } from '@/lib/dal/student'
import { getCurrentUser } from '@/lib/dal/auth'
import { redirect } from 'next/navigation'

export default async function ApplicationsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const applications = await getApplications()

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Applications</h1>
      {applications.length === 0 ? (
        <p className="text-muted-foreground">No applications yet.</p>
      ) : (
        <ul>{applications.map(app => <ApplicationRow key={app.id} application={app} />)}</ul>
      )}
    </div>
  )
}
```

---

### `src/components/student/OnboardingForm.tsx` (component, request-response)

**Analog:** Form pattern from `src/app/(auth)/register/page.tsx` + RESEARCH.md Pattern 1

**Client Component directive and imports:**
```typescript
'use client'

import { useActionState, useState } from 'react'
import { upsertStudentProfileAction } from '@/actions/student'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
```

**useActionState pattern** (RESEARCH.md Pattern 1, verified from Next.js 16 forms.md):
```typescript
export function OnboardingForm({ initialData }: { initialData?: StudentProfile | null }) {
  const [step, setStep] = useState(1)
  const [state, formAction, pending] = useActionState(upsertStudentProfileAction, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="step" value={step} />
      {step === 1 && <Step1PersonalInfo />}
      {step === 2 && <Step2Logistics />}
      {step === 3 && <Step3Preferences />}

      {step < 3 ? (
        <Button type="button" onClick={() => setStep(s => s + 1)}>Next</Button>
      ) : (
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : 'Complete Profile'}
        </Button>
      )}
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    </form>
  )
}
```

**Error display pattern** — matches `register/page.tsx` lines 30–34:
```typescript
{state?.error && (
  <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
    {state.error}
  </p>
)}
```

---

### `src/components/student/AssessmentQuestion.tsx` (component, request-response)

**Analog:** Form pattern from `src/app/(auth)/login/page.tsx`

**Client Component with form action:**
```typescript
'use client'

import { useActionState } from 'react'
import { saveAnswerAction } from '@/actions/student'
import { Button } from '@/components/ui/button'

export function AssessmentQuestion({
  question,
  stepNum,
  totalSteps,
  existingAnswer,
  assessmentId,
}: AssessmentQuestionProps) {
  const [state, formAction, pending] = useActionState(saveAnswerAction, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <input type="hidden" name="questionId" value={question.id} />
      <input type="hidden" name="step" value={stepNum} />

      {/* Progress — rendered via shadcn Progress component or CSS div */}
      <div className="mb-4 text-sm text-muted-foreground">
        Question {stepNum} of {totalSteps}
      </div>

      <p className="mb-4 font-medium">{question.prompt}</p>

      {/* Radio options from question.options_json */}
      {Object.entries(question.options_json).map(([key, text]) => (
        <label key={key} className="flex items-center gap-2 mb-2">
          <input
            type="radio"
            name="answer"
            value={key}
            defaultChecked={existingAnswer === key}
            required
          />
          {key}: {text}
        </label>
      ))}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving...' : stepNum < totalSteps ? 'Next' : 'Submit Assessment'}
      </Button>
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    </form>
  )
}
```

---

### `src/components/student/TierBadge.tsx` (component, transform)

**Analog:** `src/components/ui/badge.tsx` (shadcn Badge primitive as base)

**Pattern:** Use shadcn `Badge` with variant logic based on tier number. No `useActionState` — pure display component.

```typescript
import { Badge } from '@/components/ui/badge'

type Tier = 1 | 2 | 3

const TIER_CONFIG: Record<Tier, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  1: { label: 'Tier 1 — Ready', variant: 'default' },
  2: { label: 'Tier 2 — Ready with Support', variant: 'secondary' },
  3: { label: 'Tier 3 — Not Ready Yet', variant: 'destructive' },
}

export function TierBadge({ tier }: { tier: Tier }) {
  const config = TIER_CONFIG[tier]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
```

---

### `src/components/student/CategoryScoreBar.tsx` (component, transform)

**Analog:** None — no charting components exist in the codebase.

**Pattern from RESEARCH.md** — use CSS-only Tailwind width bars (avoids recharts SSR hydration risk, Pitfall 8):

```typescript
// No 'use client' needed — pure display, no browser APIs

type CategoryScoreBarProps = {
  category: string
  score: number  // 0–100
}

export function CategoryScoreBar({ category, score }: CategoryScoreBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="capitalize">{category}</span>
        <span className="text-muted-foreground">{Math.round(score)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
```

---

## Shared Patterns

### Authentication / Authorization Guard
**Source:** `src/lib/dal/auth.ts` lines 44–55
**Apply to:** All DAL write functions in `student.ts` and `assessment.ts`; all Server Actions in `student.ts`
```typescript
import { requireRole } from '@/lib/dal/auth'

// At the top of every Server Action and DAL write:
const user = await requireRole('student')
// user is NonNullable and role-verified — no further null checks needed
```

### Null-safe User Guard for Read DAL Functions
**Source:** `src/lib/dal/auth.ts` lines 13–24
**Apply to:** All DAL read functions (`getStudentProfile`, `getActiveQuestions`, etc.)
```typescript
const user = await getCurrentUser()
if (!user) return null   // reads return null when unauthenticated
```

### Async searchParams / params (Next.js 16)
**Source:** `src/app/(auth)/login/page.tsx` lines 9–14; `src/app/(auth)/register/page.tsx` lines 9–13
**Apply to:** All page files that use `searchParams` or `params`
```typescript
// searchParams
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  // ...
}

// params (dynamic segments)
export default async function Page({
  params,
}: {
  params: Promise<{ step: string }>
}) {
  const { step } = await params
  // ...
}
```

### Error Banner Display
**Source:** `src/app/(auth)/login/page.tsx` lines 27–33; `src/app/(auth)/register/page.tsx` lines 30–34
**Apply to:** All pages and Client Components that display action errors
```typescript
{params.error && (
  <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
    {params.error}
  </p>
)}
```

### Supabase Client (server-side)
**Source:** `src/lib/supabase/server.ts` lines 1–27
**Apply to:** All DAL files — import `createClient` from this path, never create inline
```typescript
import { createClient } from '@/lib/supabase/server'

// In DAL function:
const supabase = await createClient()   // must be awaited
```

### Layout Shell Structure
**Source:** `src/app/(student)/layout.tsx` lines 1–13
**Apply to:** `src/app/(student)/layout.tsx` (modify — add nav links)
```typescript
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-sm">SPD Ready — Student</span>
        <a href="/api/auth/signout" className="text-sm text-muted-foreground hover:text-foreground">
          Sign out
        </a>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
```

### Card + Form Shell (Server Component pages)
**Source:** `src/app/(auth)/login/page.tsx` lines 1–81; `src/app/(auth)/register/page.tsx` lines 1–119
**Apply to:** `onboarding/page.tsx`, `profile/page.tsx`, `assessment/page.tsx` (where forms appear)
```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// <form action={serverAction}> wraps Card internals
<form action={serverAction}>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="field">Field Name</Label>
      <Input id="field" name="field" required />
    </div>
  </CardContent>
  <CardFooter>
    <Button type="submit" className="w-full">Submit</Button>
  </CardFooter>
</form>
```

### revalidatePath After Mutation
**Source:** `src/actions/auth.ts` lines 28–29 and 108
**Apply to:** All Server Actions in `student.ts` that mutate DB state
```typescript
import { revalidatePath } from 'next/cache'

// After successful DB write, before redirect:
revalidatePath('/', 'layout')
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/student/CategoryScoreBar.tsx` | component | transform | No charting/progress-bar components exist; use CSS-only Tailwind pattern from RESEARCH.md |
| `supabase/migrations/005_seed_assessment_questions.sql` | migration | batch | No seeded data migrations exist yet; follow existing migration numbering convention (001–004 exist) |

---

## Critical Cross-Cutting Notes for Planner

1. **`saveAnswerAction` must NOT use `useActionState` signature** if called directly (not via `useActionState` hook). For `AssessmentQuestion.tsx` that does use `useActionState`, the Server Action MUST have `(prevState, formData)` as first two params.

2. **`scoring.ts` has no auth/Supabase** — it is a pure math module. Do not add `'use server'` to it. It is imported by `student.ts` Server Actions.

3. **`assessment.ts` DAL `computeCategoryScores` must map `'behavioral'` (DB value) to `behavior` (TS key)** — critical mismatch identified in RESEARCH.md.

4. **All new pages under `(student)/` inherit the student layout** — no additional layout file needed unless a sub-group (e.g., assessment) needs its own layout for shared data loading.

5. **`getActiveQuestions()` should use `cache()`** — questions don't change per request; caching avoids 30 re-fetches during assessment navigation.

---

## Metadata

**Analog search scope:** `src/actions/`, `src/lib/dal/`, `src/lib/supabase/`, `src/app/(auth)/`, `src/app/(student)/`, `src/components/ui/`
**Files scanned:** 29
**Pattern extraction date:** 2026-04-21
