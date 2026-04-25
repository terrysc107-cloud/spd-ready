# Phase 2: Student Core Loop — Research

**Researched:** 2026-04-21
**Domain:** Next.js 16 App Router multi-step forms, assessment engine, server-side scoring, results display
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STUDENT-01 | Multi-step onboarding form (name, city, state, travel radius, cert status, program name, completion date, shift availability, transportation reliability, preferred environment) | Multi-step form pattern with URL steps + Server Actions per step |
| STUDENT-02 | Profile saved to `student_profiles` on submit | DAL `upsertStudentProfile()` + Server Action |
| STUDENT-03 | Student can view and edit completed profile | Profile page reads from DAL; edit re-uses the form with prefilled values |
| STUDENT-04 | Profile completion gate — cannot access assessment until profile is complete | `profile_complete` boolean in schema; redirect in assessment DAL and Server Action |
| STUDENT-05 | Student can view application statuses | Read-only list from `applications` table in DAL |
| ASSESS-01 | 30 questions across 6 categories (5 each) | `assessment_questions` table already seeded via migration; DAL `getActiveQuestions()` |
| ASSESS-02 | One question per screen, progress bar | URL-based steps: `/student/assessment/[step]`; step index drives question selection |
| ASSESS-03 | Each answer persisted immediately (resumable) | Server Action upserts `assessment_responses` on every "Next" click |
| ASSESS-04 | Submit only when all 30 answered | Server Action checks response count === 30 before marking complete |
| ASSESS-05 | 24h retake cooldown | Check `student_assessments.submitted_at` for latest completed attempt before creating new |
| ASSESS-06 | 30 SPD-specific questions seeded | Migration script with real CRCST vocabulary — decontamination, sterilization, HLD, instrument handling, documentation |
| SCORE-01 | Weighted scoring formula server-side | Pure TypeScript in `src/lib/dal/scoring.ts`, called from submit Server Action |
| SCORE-02 | Tier assignment (1/2/3) | `deriveReadinessTier()` in scoring DAL |
| SCORE-03 | Results page: score, tier badge, per-category breakdown, top 2 strengths, bottom 2 growth areas, application eligibility, next steps | Server Component reads from `student_assessments` and `student_profiles` |
| SCORE-04 | Tier 3 improvement path | Conditional rendering on results page; specific Tier 3 section with category-specific guidance |
| SCORE-05 | Profile updated with readiness_score, readiness_tier, strengths_json, growth_areas_json on completion | Submit Server Action writes both `student_assessments` and `student_profiles` |
</phase_requirements>

---

## Summary

Phase 2 builds the complete student workflow on top of the Phase 1 scaffold. Three sequential flows must work end-to-end: (1) multi-step profile onboarding, (2) 30-question assessment engine with per-answer persistence and cooldown enforcement, (3) server-side scoring and a results page with tier, strengths, growth areas, and next steps.

The scaffold delivered by Phase 1 is confirmed ready: Next.js 16.2.4 with `proxy.ts` (renamed from `middleware.ts`), three Supabase SSR client files (`server.ts`, `client.ts`, `middleware.ts`), the DAL pattern at `src/lib/dal/auth.ts`, and route groups including `(student)/`. Tables are created. RLS policies are in place. shadcn/ui components available: button, input, label, card, select, badge.

The highest-complexity element is the assessment engine. The key architectural decisions are already locked in `ARCHITECTURE.md`: URL-based step routing (`/student/assessment/[step]`), per-answer server-persisted responses, scoring runs as a Server Action on final submit, not a DB trigger or Edge Function.

**Primary recommendation:** Build in three waves — Wave 1: profile onboarding form + DAL, Wave 2: assessment engine (start, step, submit, seed), Wave 3: scoring computation + results page. The profile gate for assessment and the retake cooldown are cross-cutting concerns that both belong in Wave 2 Server Actions.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Multi-step onboarding form UI | Browser / Client | Frontend Server (SSR) | Form state (current step, field values) lives in client; page renders server-side |
| Profile persistence | API / Backend | Database | Server Action owns mutation; Supabase Postgres owns persistence via RLS |
| Profile completion gate | API / Backend | Frontend Server (SSR) | Check `profile_complete` in Server Action / assessment layout before allowing assessment start |
| Assessment question loading | Frontend Server (SSR) | Database | Assessment layout Server Component loads all 30 questions once; passes to step pages |
| Per-answer persistence | API / Backend | Database | Server Action upserts `assessment_responses` row; no client state dependency |
| Assessment resumability | Database / Storage | Frontend Server (SSR) | Resume state is in `assessment_responses` rows; layout reads existing answers on load |
| Retake cooldown check | API / Backend | Database | Server Action checks `student_assessments.submitted_at` before creating new attempt |
| Scoring calculation | API / Backend | — | Pure TypeScript in Server Action on submit; no DB trigger, no Edge Function |
| Tier assignment | API / Backend | — | Deterministic function in `src/lib/dal/scoring.ts` |
| Results display | Frontend Server (SSR) | Database | Server Component reads computed scores from DB; no client-side calculation |
| Application status list | Frontend Server (SSR) | Database | Server Component + DAL read `applications` for current user |

---

## Standard Stack

### Core (confirmed from Phase 1 scaffold)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.4 | App Router, Server Actions, URL-based routing | Already installed — Phase 1 scaffold [VERIFIED: package.json] |
| @supabase/ssr | 0.10.2 | SSR-safe Supabase client | Already installed [VERIFIED: package.json] |
| React | 19.2.4 | `useActionState`, `use()` hook, Server Components | Bundled with Next.js 16 [VERIFIED: package.json] |
| zod | ^4.3.6 | Server-side form validation | Already installed [VERIFIED: package.json] |
| react-hook-form | ^7.73.1 | Multi-step form state in Client Components | Already installed [VERIFIED: package.json] |
| @hookform/resolvers | ^5.2.2 | Connects zod schemas to react-hook-form | Already installed [VERIFIED: package.json] |
| shadcn/ui | (source files) | Button, Input, Label, Card, Select, Badge | Already installed: button, input, label, card, select, badge [VERIFIED: src/components/ui/] |
| Tailwind CSS | ^4 | Utility CSS | Already installed [VERIFIED: package.json] |

### Supporting (needs to be added)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | latest | Per-category score bar chart on results page | Results page only — lightweight, React-native chart library |
| lucide-react | ^1.8.0 | Icons (checkmark tiers, progress indicators) | Already installed via shadcn [VERIFIED: package.json] |

**Version verification for recharts:**
```bash
npm view recharts version
```

**Installation for recharts only:**
```bash
cd "/Users/terry/Desktop/untitled folder/spd internship os/spd-ready"
npm install recharts
```

**Additional shadcn components needed:**
```bash
npx shadcn@latest add progress separator textarea
```
- `progress` — progress bar for assessment steps (ASSESS-02, PLATFORM-03)
- `separator` — visual divider on results page
- `textarea` — not needed for Phase 2, defer

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | chart.js / @visx | recharts is React-native, no imperative API needed; lighter for a simple bar chart |
| recharts | CSS-only bars | Pure Tailwind percentage bars are simpler, no dep — use if per-category display is a simple `div` with `w-[{score}%]` width |
| URL-based step routing | React state for steps | URL routing enables deep linking and browser back button; required for resumability |

---

## Architecture Patterns

### System Architecture Diagram

```
Student browser
       |
       | GET /student/onboarding           POST /student/onboarding (Server Action)
       |                                          |
       v                                          v
(student)/onboarding/page.tsx         src/actions/student.ts
  [Client Component — multi-step]     → upsertStudentProfileAction()
  Step 1: personal info                  validates with zod
  Step 2: logistics                      calls dal/student.ts
  Step 3: preferences                    sets profile_complete = true on last step
       |                                          |
       v                                          v
       |                                   src/lib/dal/student.ts
       |                                   → getUser() → upsert student_profiles
       |
       |
       | GET /student/assessment             POST /student/assessment (start)
       |                                          |
       v                                          v
(student)/assessment/page.tsx         src/actions/assessment.ts
  [Server Component — entry gate]     → startAssessmentAction()
  checks profile_complete               checks cooldown (24h)
  checks cooldown                       creates student_assessments row
  redirects to /assessment/1            redirects to /student/assessment/1
       |
       |
       | GET /student/assessment/[step]      POST (answer Server Action)
       |                                          |
       v                                          v
(student)/assessment/[step]/page.tsx  → saveAnswerAction(assessmentId, questionId, answer)
  [Client Component]                     upserts assessment_responses
  renders single question                redirects to next step or /student/results
  shows progress bar (step/30)
  pre-fills saved answer if resuming
       |
       | (step 30 submit)
       v
src/actions/assessment.ts
→ submitAssessmentAction()
  fetches all 30 responses
  groups by category
  calls computeReadinessScore()
  calls deriveReadinessTier()
  calls deriveStrengthsAndGrowth()
  writes student_assessments (scores)
  writes student_profiles (readiness_score, tier, strengths_json, growth_areas_json)
  redirects to /student/results
       |
       v
(student)/results/page.tsx
  [Server Component]
  reads student_assessments + student_profiles via DAL
  renders: TierBadge, overall score, per-category bars, strengths, growth areas, next steps
  Tier 3: renders improvement path section
```

### Recommended Project Structure (Phase 2 additions)

```
src/
├── app/
│   └── (student)/
│       ├── layout.tsx                   # existing — nav shell
│       ├── dashboard/page.tsx           # existing — update to show profile/assessment status
│       ├── onboarding/
│       │   └── page.tsx                 # NEW — multi-step profile form
│       ├── profile/
│       │   └── page.tsx                 # NEW — view/edit profile (STUDENT-03)
│       ├── assessment/
│       │   ├── page.tsx                 # NEW — entry gate (cooldown check, redirect to step 1)
│       │   └── [step]/
│       │       └── page.tsx             # NEW — single question screen
│       ├── results/
│       │   └── page.tsx                 # NEW — scored readiness profile
│       └── applications/
│           └── page.tsx                 # NEW — application status list (STUDENT-05)
├── actions/
│   ├── auth.ts                          # existing
│   └── student.ts                       # NEW — upsertStudentProfileAction, startAssessmentAction,
│                                        #        saveAnswerAction, submitAssessmentAction
├── lib/
│   ├── dal/
│   │   ├── auth.ts                      # existing
│   │   ├── student.ts                   # NEW — getStudentProfile, upsertStudentProfile,
│   │   │                                #        getApplications
│   │   ├── assessment.ts                # NEW — getActiveQuestions, getOrCreateAssessment,
│   │   │                                #        getAssessmentResponses, getLatestCompletedAssessment
│   │   └── scoring.ts                   # NEW — computeReadinessScore, deriveReadinessTier,
│   │                                    #        deriveStrengthsAndGrowth
│   └── supabase/                        # existing — server.ts, client.ts, middleware.ts
├── components/
│   ├── ui/                              # existing shadcn primitives
│   └── student/                         # NEW
│       ├── OnboardingForm.tsx           # multi-step Client Component
│       ├── AssessmentQuestion.tsx       # single question Client Component
│       ├── AssessmentProgress.tsx       # progress bar
│       ├── TierBadge.tsx                # tier 1/2/3 badge (also used in Phase 3)
│       └── CategoryScoreBar.tsx         # per-category bar (also used in Phase 3)
└── supabase/
    ├── migrations/
    │   ├── 001–004                      # existing
    │   └── 005_seed_assessment_questions.sql  # NEW — 30 SPD questions
```

### Pattern 1: Multi-Step Onboarding Form (URL-based steps)

**What:** A single page at `/student/onboarding` renders a Client Component that tracks current step in React state. On the final step submit, a Server Action persists the entire profile. Steps 1–2 use `next` button with local state only; step 3 POSTs the form.

**When to use:** When the form fits in a single page load but is too long to show at once. This avoids the complexity of URL-per-step for a simple form. The three steps (personal info / logistics / preferences) are purely cosmetic — the data only needs to be in the DB after final submit (STUDENT-01, STUDENT-02).

**Why not URL-per-step for onboarding:** Unlike the assessment (which needs per-answer persistence for resumability), the profile form is short enough that losing data on refresh is acceptable. The user can always restart onboarding. URL steps would add routing complexity with no resumability benefit.

```typescript
// Source: Next.js 16 forms.md [VERIFIED: node_modules/next/dist/docs/01-app/02-guides/forms.md]
// src/components/student/OnboardingForm.tsx
'use client'

import { useActionState, useState } from 'react'
import { upsertStudentProfileAction } from '@/actions/student'

const TOTAL_STEPS = 3

export function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [state, formAction, pending] = useActionState(upsertStudentProfileAction, null)

  return (
    <form action={formAction}>
      {/* Hidden step indicator */}
      <input type="hidden" name="step" value={step} />

      {step === 1 && <Step1PersonalInfo />}
      {step === 2 && <Step2Logistics />}
      {step === 3 && <Step3Preferences />}

      {/* Navigation */}
      {step < TOTAL_STEPS ? (
        <button type="button" onClick={() => setStep(s => s + 1)}>Next</button>
      ) : (
        <button type="submit" disabled={pending}>
          {pending ? 'Saving...' : 'Complete Profile'}
        </button>
      )}

      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  )
}
```

**Server Action signature:**
```typescript
// src/actions/student.ts
'use server'

export async function upsertStudentProfileAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  // validate with zod, call DAL, redirect on success
}
```

**CRITICAL — Next.js 16 Server Action signature:** When used with `useActionState`, the action MUST accept `(prevState, formData)` as the first two parameters. [VERIFIED: Next.js 16 forms.md]

### Pattern 2: Assessment Engine (URL-based steps with per-answer persistence)

**What:** Each question is a separate URL (`/student/assessment/1` through `/student/assessment/30`). On "Next", a Server Action upserts the answer to `assessment_responses`, then `redirect()`s to the next step. On the final step, the submit Server Action computes scores and redirects to `/student/results`.

**When to use:** When resumability is required. The assessment must survive browser close (ASSESS-03). URL routing is the correct pattern — after a redirect, the next page is a fresh Server Component render that reads the current answer from DB for pre-filling.

**Resume detection at assessment entry:**
```typescript
// src/app/(student)/assessment/page.tsx  [Server Component]
// Source: ARCHITECTURE.md Assessment Engine Architecture [VERIFIED: .planning/research/ARCHITECTURE.md]

import { getLatestInProgressAssessment } from '@/lib/dal/assessment'
import { redirect } from 'next/navigation'

export default async function AssessmentEntryPage() {
  const inProgress = await getLatestInProgressAssessment()

  if (inProgress) {
    // Resume: find the first unanswered question
    const answeredCount = inProgress.response_count
    redirect(`/student/assessment/${answeredCount + 1}`)
  }

  // Start new assessment (after checking profile complete and cooldown)
  redirect('/student/assessment/start')
}
```

**Step page pattern:**
```typescript
// src/app/(student)/assessment/[step]/page.tsx
// Source: Next.js 16 page.md [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md]

export default async function AssessmentStepPage({
  params,
}: {
  params: Promise<{ step: string }>  // NOTE: params is a Promise in Next.js 16
}) {
  const { step } = await params
  const stepNum = parseInt(step, 10)

  // Validate step bounds
  if (isNaN(stepNum) || stepNum < 1 || stepNum > 30) {
    redirect('/student/assessment')
  }

  // Load questions and existing answer for this step
  const questions = await getActiveQuestions()
  const question = questions[stepNum - 1]
  const existingAnswer = await getResponseForQuestion(assessmentId, question.id)

  return (
    <AssessmentQuestion
      question={question}
      stepNum={stepNum}
      totalSteps={30}
      existingAnswer={existingAnswer}
      assessmentId={assessmentId}
    />
  )
}
```

**CRITICAL — `params` is a Promise in Next.js 16.** Must `await params` before accessing properties. [VERIFIED: Next.js 16 page.md]

**Answer persistence Server Action:**
```typescript
// src/actions/student.ts
'use server'

import { redirect } from 'next/navigation'
import { saveAnswerToDb } from '@/lib/dal/assessment'

export async function saveAnswerAction(formData: FormData) {
  const assessmentId = formData.get('assessmentId') as string
  const questionId = formData.get('questionId') as string
  const answer = formData.get('answer') as string
  const currentStep = parseInt(formData.get('step') as string, 10)

  await saveAnswerToDb(assessmentId, questionId, answer)

  if (currentStep >= 30) {
    // Trigger scoring on final step
    await submitAssessmentAction(assessmentId)
    redirect('/student/results')
  }

  redirect(`/student/assessment/${currentStep + 1}`)
}
```

### Pattern 3: Scoring Computation (Server Action, not trigger)

**What:** Pure TypeScript functions in `src/lib/dal/scoring.ts`. Called inside a Server Action after all 30 responses are confirmed present. Writes back to both `student_assessments` and `student_profiles`.

**Source:** [VERIFIED: .planning/research/ARCHITECTURE.md, section 5.3]

```typescript
// src/lib/dal/scoring.ts

export type CategoryScores = {
  technical: number    // 0–100
  situational: number
  process: number
  behavior: number
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

export function deriveStrengthsAndGrowth(scores: CategoryScores): {
  strengths: string[]
  growthAreas: string[]
} {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a)
  return {
    strengths: sorted.slice(0, 2).map(([k]) => k),
    growthAreas: sorted.slice(-2).map(([k]) => k),
  }
}
```

**Computing category scores from responses:**

Each `assessment_response` row has a `score` field (0–1 numeric) written when the answer is saved. The per-category score = average of the 5 questions' scores × 100.

```typescript
// src/lib/dal/assessment.ts

export async function computeCategoryScores(assessmentId: string): Promise<CategoryScores> {
  const supabase = await createClient()
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select('score, assessment_questions(category)')
    .eq('assessment_id', assessmentId)

  // Group by category, average scores, multiply by 100
  const byCategory: Record<string, number[]> = {}
  for (const r of responses ?? []) {
    const cat = (r.assessment_questions as any).category as string
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(Number(r.score))
  }

  const avg = (arr: number[]) =>
    arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) * 100 : 0

  return {
    technical:   avg(byCategory['technical']   ?? []),
    situational: avg(byCategory['situational'] ?? []),
    process:     avg(byCategory['process']     ?? []),
    behavior:    avg(byCategory['behavioral']  ?? []),
    instrument:  avg(byCategory['instrument']  ?? []),
    reliability: avg(byCategory['reliability'] ?? []),
  }
}
```

**IMPORTANT — schema category name mismatch:** The `assessment_questions.category` column uses `'behavioral'` (as defined in migration 001), but the scoring formula variable is named `behavior`. The DAL must map `'behavioral'` → `behavior` when building the `CategoryScores` object. [VERIFIED: supabase/migrations/001_initial_schema.sql]

### Pattern 4: Retake Cooldown (24h enforcement)

**What:** Before creating a new `student_assessments` row, query for the most recent completed assessment. If `submitted_at` is within the last 24 hours, redirect with an error message.

```typescript
// src/lib/dal/assessment.ts

export async function checkCooldown(userId: string): Promise<{
  allowed: boolean
  nextAttemptAt?: Date
}> {
  const supabase = await createClient()
  const { data: latest } = await supabase
    .from('student_assessments')
    .select('submitted_at')
    .eq('student_user_id', userId)
    .eq('status', 'completed')
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!latest?.submitted_at) return { allowed: true }

  const submittedAt = new Date(latest.submitted_at)
  const cooldownEnd = new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000)
  const now = new Date()

  if (now < cooldownEnd) {
    return { allowed: false, nextAttemptAt: cooldownEnd }
  }
  return { allowed: true }
}
```

### Pattern 5: Profile Completion Gate

**What:** The `student_profiles.profile_complete` boolean is set to `true` on final onboarding submit. The assessment entry page (Server Component) and start Server Action both check this field before proceeding.

```typescript
// In assessment entry Server Component
const profile = await getStudentProfile(user.id)
if (!profile || !profile.profile_complete) {
  redirect('/student/onboarding')
}
```

**Why check in Server Component AND Server Action:** Defense in depth. The UI gate prevents confusion; the Server Action gate prevents any direct URL navigation to `/student/assessment/start`.

### Pattern 6: DAL Function Template (follows Phase 1 pattern)

All DAL functions MUST call `getUser()` first. This is the established Phase 1 pattern from `src/lib/dal/auth.ts`. [VERIFIED: src/lib/dal/auth.ts]

```typescript
// src/lib/dal/student.ts
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
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

### Pattern 7: Next.js 16 Breaking Changes (CRITICAL)

These differences from earlier Next.js versions are confirmed from the installed docs and must be followed in every file:

1. **`proxy.ts` not `middleware.ts`** — The file at the project root is `proxy.ts`, exporting `proxy()` not `middleware()`. [VERIFIED: src/proxy.ts, node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md]

2. **`params` is a Promise** — In page files, `params` is `Promise<{ [key]: string }>`. Always `await params` before accessing fields. [VERIFIED: Next.js 16 page.md]

3. **`searchParams` is a Promise** — Same as params — `await searchParams` or use React `use()` in Client Components. [VERIFIED: Next.js 16 page.md]

4. **`useActionState` replaces `useFormState`** — Use `useActionState` from `react` (React 19). The server action signature is `(prevState, formData)`. [VERIFIED: Next.js 16 forms.md]

5. **`useFormStatus` is from `react-dom`** — Import from `'react-dom'` not `'react'`. [VERIFIED: Next.js 16 forms.md]

### Anti-Patterns to Avoid

- **Scoring in a DB trigger:** No — it's hard to debug, can't be tested in isolation. Use a Server Action.
- **Scoring in an Edge Function:** No — overkill for deterministic arithmetic at this scale.
- **Assessment state in localStorage:** No — data is lost on clear/private browsing. All state in `assessment_responses` rows.
- **All 30 onboarding questions on one page:** Poor UX and overwhelming. Use 3 logical groups.
- **`getSession()` anywhere on the server:** The DAL `getCurrentUser()` from Phase 1 calls `getUser()`. Never bypass it.
- **Calling Supabase directly in page or component files:** All DB access goes through `src/lib/dal/`.
- **Hard-coding question content in TypeScript:** Questions belong in `assessment_questions` table, loaded via DAL.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validators | zod (already installed) | Type-safe, composable, works with react-hook-form and Server Actions |
| Pending/loading state | `useState(loading)` | `useActionState` pending from React 19 | Built into the framework, no race conditions |
| Per-category bar charts | SVG/canvas from scratch | recharts `BarChart` OR Tailwind % bars | recharts is React-native; pure Tailwind bars work for simple non-interactive display |
| Cooldown timer display | Custom date math in JSX | Standard JS Date arithmetic in DAL | One place to compute, pass `nextAttemptAt` as prop |
| Question order randomization | Custom shuffle | Do NOT randomize — fixed order by category | Fixed order is required for consistent category scoring across retakes |
| Answer scoring | Custom per-question logic | `scoring_key_json` column in `assessment_questions` | The scoring key is seeded with each question; DAL reads it |

**Key insight:** The scoring formula is four lines of arithmetic. The complexity is data plumbing (loading 30 questions, grouping 30 responses by category, calling the formula). Don't over-engineer it.

---

## Assessment Questions — SPD Domain Content

**ASSESS-06 is the content-critical requirement.** Questions must use real CRCST vocabulary or hospital coordinators will dismiss the assessment as generic. This research phase produced 30 question seeds across the 6 categories.

### Question format in `assessment_questions` table:

```json
{
  "category": "technical",
  "type": "multiple_choice",
  "prompt": "Question text here",
  "options_json": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "scoring_key_json": {
    "correct": "B",
    "score_map": { "A": 0, "B": 1, "C": 0.25, "D": 0 }
  }
}
```

**Score map rationale:** Some questions have a "best" answer (score 1.0) and a "partially correct" answer (score 0.25). This produces more differentiated scores than pure 0/1. The partially correct option represents common near-miss knowledge gaps in SPD training. [ASSUMED — the partial scoring approach is my recommendation; confirm with domain expert]

### 30 SPD Questions by Category

**Technical Knowledge (5 questions) — CRCST domain: sterilization science, decontamination chemistry, biological indicators**

1. A biological indicator (BI) for steam sterilization uses spores of which organism?
   - A: Geobacillus stearothermophilus [correct: 1.0]
   - B: Bacillus atrophaeus [score: 0.0 — this is used for ethylene oxide]
   - C: Staphylococcus aureus [score: 0.0]
   - D: Bacillus subtilis [score: 0.25 — related but not steam BI]

2. The minimum required exposure time for a 132°C gravity steam sterilization cycle is:
   - A: 3 minutes [score: 0.25]
   - B: 4 minutes [correct: 1.0 — standard gravity flash at 132°C]
   - C: 10 minutes [score: 0.0]
   - D: 20 minutes [score: 0.0]

3. High-level disinfection (HLD) differs from sterilization in that it:
   - A: Kills all microbial life including prions [score: 0.0]
   - B: Eliminates all organisms except high numbers of bacterial spores [correct: 1.0]
   - C: Reduces microbial count by 99.9% [score: 0.0 — that's disinfection, not HLD]
   - D: Is used for critical-class instruments only [score: 0.0]

4. Which Spaulding classification applies to instruments that contact intact mucous membranes?
   - A: Critical [score: 0.0]
   - B: Semi-critical [correct: 1.0]
   - C: Non-critical [score: 0.0]
   - D: Minimal risk [score: 0.0]

5. An ethylene oxide (EtO) sterilization cycle requires aeration after the run because:
   - A: The instruments are too hot to handle [score: 0.0]
   - B: EtO residuals must off-gas to safe levels before patient contact [correct: 1.0]
   - C: The humidity must normalize [score: 0.25]
   - D: The cycle indicator needs time to change color [score: 0.0]

**Situational Judgment (5 questions) — realistic scenarios in the decontam room and sterile core**

6. You receive a tray from the OR with visible bioburden on the instruments. Your first action is:
   - A: Immediately sterilize the tray to kill the bioburden [score: 0.0 — bioburden blocks sterilant penetration]
   - B: Point-of-use pre-clean, then transport to decontam for full manual cleaning [correct: 1.0]
   - C: Notify your supervisor before touching the tray [score: 0.25]
   - D: Soak in enzyme solution directly at the sterile assembly table [score: 0.0]

7. During assembly, you find a crack in the hinge of a needle driver. You should:
   - A: Reassemble the tray — hairline cracks are cosmetic [score: 0.0]
   - B: Mark the instrument as "out of service," set it aside, and document it [correct: 1.0]
   - C: File the crack smooth and return it to service [score: 0.0]
   - D: Soak in glutaraldehyde to strengthen the joint [score: 0.0]

8. The sterility maintenance time (event-related sterility) for a wrapped tray depends on:
   - A: The number of days since sterilization [score: 0.0]
   - B: How the package has been stored and handled since sterilization [correct: 1.0]
   - C: The temperature of the storage area [score: 0.25]
   - D: The type of sterilizer used [score: 0.0]

9. You accidentally breach your sterile field while opening a peel pouch. The correct action is:
   - A: Continue — the outer packaging protected the contents [score: 0.0]
   - B: Discard the item and obtain a new sterile one [correct: 1.0]
   - C: Wipe the item with alcohol and proceed [score: 0.0]
   - D: Place the item in a sterile basin before using [score: 0.25]

10. A surgeon calls requesting a custom tray not on standard pick list. You should:
    - A: Tell them it is impossible without a 24-hour notice [score: 0.0]
    - B: Check the preference card, verify instrument availability, and communicate an accurate ETA [correct: 1.0]
    - C: Build the tray from memory to save time [score: 0.0]
    - D: Escalate immediately to the charge nurse without gathering information first [score: 0.25]

**Process Discipline (5 questions) — documentation, traceability, standard work**

11. Traceability in sterile processing means:
    - A: Tracking how many packs were processed per shift [score: 0.0]
    - B: Linking each sterilized item to the load, sterilizer, operator, date, and patient it was used on [correct: 1.0]
    - C: Verifying that biological indicators are run weekly [score: 0.25]
    - D: Keeping a log of sterilizer maintenance dates [score: 0.25]

12. A chemical integrator inside a sterilization pack that fails to reach "pass" status indicates:
    - A: The pack was not sterilized and must be recalled [score: 0.25 — recall may be warranted but the indicator alone does not confirm non-sterility]
    - B: Sterilization conditions may not have been met; escalate per your department's recall policy [correct: 1.0]
    - C: The sterilizer is malfunctioning and must be taken out of service [score: 0.0]
    - D: The pack was loaded incorrectly and should be re-wrapped and re-processed immediately [score: 0.0]

13. The ANSI/AAMI ST79 standard is the primary guidance document for:
    - A: Flexible endoscope reprocessing [score: 0.0]
    - B: Comprehensive guide to steam sterilization and sterility assurance in health care [correct: 1.0]
    - C: Chemical disinfectant selection and efficacy testing [score: 0.0]
    - D: Instrument repair and maintenance schedules [score: 0.0]

14. When is it acceptable to skip the decontamination step and send an instrument directly to assembly?
    - A: When the instrument came from a clean procedure [score: 0.0]
    - B: When the surgeon requests a fast turn [score: 0.0]
    - C: Never — all used instruments must go through decontam [correct: 1.0]
    - D: Only for non-lumened instruments [score: 0.0]

15. A wet pack is discovered after steam sterilization. The correct action is:
    - A: Allow it to air dry on the counter [score: 0.0]
    - B: Reject the pack, investigate the cause, rewrap and re-process [correct: 1.0]
    - C: Use the items immediately — drying time is only needed for shelf storage [score: 0.0]
    - D: Document it in the log and use the items if the BI was negative [score: 0.0]

**Behavioral / Culture Fit (5 questions) — professionalism, teamwork, communication in a healthcare SPD context**

16. A coworker routinely skips the manual cleaning step when the department is busy. You should:
    - A: Match their workflow to keep up with volume [score: 0.0]
    - B: Report them to management anonymously [score: 0.25]
    - C: Address it professionally with your coworker, then escalate to the supervisor if the behavior continues [correct: 1.0]
    - D: Leave a note in the communication log [score: 0.25]

17. During a rush at end of shift, you realize you do not have time to finish a complex tray before handoff. You should:
    - A: Finish as fast as possible and mark it complete [score: 0.0]
    - B: Leave the tray where it is without comment [score: 0.0]
    - C: Communicate the status clearly to the oncoming shift and document where you left off [correct: 1.0]
    - D: Ask a coworker to finish it without telling them the current state [score: 0.0]

18. A new hospital policy requires double-checking instrument counts with a partner before releasing OR sets. Your initial reaction is:
    - A: This is unnecessary extra work and wastes time [score: 0.0]
    - B: Implement the policy, recognize that count checks reduce errors and liability [correct: 1.0]
    - C: Do it only when supervisors are watching [score: 0.0]
    - D: Ask to be exempt because you have never had a count error [score: 0.0]

19. An OR charge nurse tells you a tray you assembled had a wrong instrument count. You should:
    - A: Deny it — you double-checked the count [score: 0.0]
    - B: Apologize, take responsibility, investigate your process, and implement a corrective action [correct: 1.0]
    - C: Blame the OR tech who used the tray [score: 0.0]
    - D: Report it to the OR manager as an OR error [score: 0.0]

20. The most important reason to wear full PPE in the decontamination room is:
    - A: To comply with hospital policy and avoid disciplinary action [score: 0.25]
    - B: To prevent exposure to bloodborne pathogens and sharps injuries [correct: 1.0]
    - C: Because it makes you look professional [score: 0.0]
    - D: To keep your uniform clean [score: 0.0]

**Instrument / Workflow Familiarity (5 questions) — instrument identification, tray assembly, set management**

21. A box-lock instrument should be inspected in the OPEN position during assembly because:
    - A: It is easier to count instruments when open [score: 0.0]
    - B: Box-lock joints may trap debris and show wear that is invisible when the instrument is closed [correct: 1.0]
    - C: Sterilant does not penetrate closed instruments as effectively [score: 0.25]
    - D: Instrument strings require open configuration [score: 0.0]

22. Which of the following instruments is used for blunt dissection and tissue manipulation (not cutting)?
    - A: Metzenbaum scissors [score: 0.0]
    - B: Kelly hemostat [correct: 1.0]
    - C: Adson forceps [score: 0.25 — grasping, not blunt dissection]
    - D: #15 blade scalpel [score: 0.0]

23. Instruments with tungsten carbide inserts are typically identified by:
    - A: A red dot or ring on the handle [correct: 1.0 — gold for TC inserts is most common; red indicates other specialty in some systems — ASSUMED standard color coding]
    - B: A blue marker on the tip [score: 0.0]
    - C: A rubber ring at the hinge [score: 0.0]
    - D: A silver stripe on the shank [score: 0.0]

24. A preference card for a laparoscopic cholecystectomy lists "5mm trocar x3, 10mm trocar x1." During assembly you find only two 5mm trocars available. You should:
    - A: Substitute with a 12mm trocar for the third port [score: 0.0]
    - B: Notify the scheduler and the OR nurse, and hold the case tray until the correct count is available or a substitution is approved [correct: 1.0]
    - C: Send the tray with a note saying the third trocar is missing [score: 0.25]
    - D: Reassign the tray to a different case that needs fewer trocars [score: 0.0]

25. The purpose of using an ultrasonic cleaner in SPD is:
    - A: To sterilize instruments at low temperatures [score: 0.0]
    - B: To use cavitation to remove soil from instrument crevices and lumens that manual cleaning cannot reach [correct: 1.0]
    - C: To replace manual scrubbing for all instruments [score: 0.0]
    - D: To remove rust and discoloration from stainless steel [score: 0.25]

**Reliability (5 questions) — attendance mindset, follow-through, accountability)**

26. The SPD department functions on a just-in-time model. Missing a scheduled shift has the most direct impact on:
    - A: The department's overtime budget [score: 0.25]
    - B: OR case scheduling and patient safety if sterile instruments are unavailable [correct: 1.0]
    - C: Your performance review rating [score: 0.0]
    - D: Coworker morale [score: 0.25]

27. You are feeling slightly ill before a shift. The professional action is:
    - A: Come to work and try to push through [score: 0.0]
    - B: Call in as soon as possible so staffing can be arranged, and follow your facility's illness reporting protocol [correct: 1.0]
    - C: Wait until the shift starts to decide [score: 0.0]
    - D: Ask a friend to cover informally without notifying the supervisor [score: 0.0]

28. You are assigned to finish instrument assembly for a trauma set before the end of shift, but you are running low on time. The right approach is:
    - A: Rush through assembly without checking the count [score: 0.0]
    - B: Communicate the situation to your supervisor before the deadline, not after [correct: 1.0]
    - C: Leave the tray incomplete and hope the next shift has time [score: 0.0]
    - D: Skip documentation to save time [score: 0.0]

29. Your externship site asks you to be available for an extra day next month for a high-volume case day. You:
    - A: Decline — the externship agreement only covers set hours [score: 0.0]
    - B: Check your schedule and respond promptly with a clear yes or no [correct: 1.0]
    - C: Say yes but do not confirm via the preferred communication channel [score: 0.25]
    - D: Ask why you were chosen before deciding [score: 0.0]

30. At the end of your first week, your preceptor gives you corrective feedback on instrument inspection technique. You:
    - A: Explain that you learned a different method in your training program [score: 0.0]
    - B: Thank them for the feedback, apply it immediately, and ask a clarifying question if needed [correct: 1.0]
    - C: Nod but continue your original technique [score: 0.0]
    - D: Report the feedback difference to your program coordinator [score: 0.25]

---

## Common Pitfalls

### Pitfall 1: `params` and `searchParams` not awaited (Next.js 16)
**What goes wrong:** Writing `const { step } = params` instead of `const { step } = await params` causes a TypeScript error and a runtime error in Next.js 16.
**Why it happens:** Training data and many blog posts show the synchronous (Next.js 14) pattern.
**How to avoid:** Every page that uses `params` or `searchParams` must `await` them first. No exceptions.
**Warning signs:** TypeScript error: "Property 'x' does not exist on type 'Promise<...>'"

### Pitfall 2: Double-submission on assessment final step
**What goes wrong:** Two scoring Server Action calls fire simultaneously; two rows written; scores diverge.
**Why it happens:** No pending state on the submit button.
**How to avoid:** Use `useActionState` — the `pending` boolean disables the submit button during action execution.
**Warning signs:** Two `student_assessments` rows with `status='completed'` for the same user.

### Pitfall 3: Assessment answer not persisted before redirect
**What goes wrong:** Server Action calls `redirect()` before the `upsert` to `assessment_responses` completes. Answer is lost.
**Why it happens:** `redirect()` throws a special exception that interrupts the function. Any code after it is unreachable.
**How to avoid:** Call `await saveAnswerToDb(...)` BEFORE calling `redirect()`. Never put a redirect before an async write.

### Pitfall 4: Category name mismatch (`behavioral` vs `behavior`)
**What goes wrong:** The schema uses `'behavioral'` as the category enum value. The scoring formula uses `behavior` as the variable name. If the DAL does not remap, `behavior` is always `0` and scores are wrong.
**How to avoid:** In `computeCategoryScores()`, map `byCategory['behavioral']` → `behavior` explicitly. Add a unit test for this mapping.

### Pitfall 5: Cooldown bypass via direct URL navigation
**What goes wrong:** Student navigates directly to `/student/assessment/start` after completing an assessment within 24h. The UI redirected them but the URL is publicly accessible within the role.
**How to avoid:** The `startAssessmentAction` Server Action must check cooldown before creating a row, not just the UI. Server Actions are the security boundary, not the page.

### Pitfall 6: Profile gate bypass
**What goes wrong:** Student with an incomplete profile navigates directly to `/student/assessment` and starts a new attempt without profile data. Scoring writes back to `student_profiles` but many columns are null, causing FK or constraint issues in Phase 3.
**How to avoid:** Assessment entry Server Component AND `startAssessmentAction` both check `profile_complete = true`. Two layers.

### Pitfall 7: `useActionState` signature mismatch
**What goes wrong:** Server Action defined as `async function action(formData: FormData)` but `useActionState` requires `(prevState, formData)` as the first two parameters. The `prevState` argument is silently ignored as `FormData`.
**How to avoid:** When wiring with `useActionState`, the action signature MUST be `async function action(prevState: PrevState, formData: FormData)`.
**Source:** [VERIFIED: Next.js 16 forms.md]

### Pitfall 8: Recharts SSR hydration error
**What goes wrong:** Recharts uses browser-specific APIs (ResizeObserver). Rendering a Recharts component in a Server Component throws `document is not defined`.
**How to avoid:** Wrap `CategoryScoreBar.tsx` with `'use client'` directive. The results page (Server Component) passes serialized score data as props to the client chart component. Alternatively, use CSS-only bars for Phase 2 and upgrade to recharts in Phase 5.

### Pitfall 9: RLS missing on new DAL operations
**What goes wrong:** Phase 1 wrote RLS policies for all tables. However, if a Phase 2 DAL function queries a table column not covered by the existing SELECT policy (e.g., queries `student_profiles` with a new filter), it may silently return empty results.
**How to avoid:** After writing each DAL function, verify it returns data for a test user. The existing `SELECT` policies are broad (select all own rows), so this is unlikely but worth checking.

---

## Code Examples

### Verified patterns from official sources

### Async params in Next.js 16 page
```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md [VERIFIED]

export default async function AssessmentStepPage({
  params,
}: {
  params: Promise<{ step: string }>
}) {
  const { step } = await params
  // ...
}
```

### useActionState with Server Action (React 19 / Next.js 16)
```typescript
// Source: node_modules/next/dist/docs/01-app/02-guides/forms.md [VERIFIED]
'use client'
import { useActionState } from 'react'
import { upsertStudentProfileAction } from '@/actions/student'

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    upsertStudentProfileAction,
    null
  )
  return (
    <form action={formAction}>
      {/* fields */}
      <button disabled={pending} type="submit">Save</button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  )
}
```

### Server Action with useActionState (prevState required)
```typescript
// Source: node_modules/next/dist/docs/01-app/02-guides/forms.md [VERIFIED]
'use server'
import { z } from 'zod'

type ActionState = { error?: string } | null

export async function upsertStudentProfileAction(
  prevState: ActionState,   // REQUIRED first param when used with useActionState
  formData: FormData
): Promise<ActionState> {
  const validated = profileSchema.safeParse(Object.fromEntries(formData))
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors.toString() }
  }
  // write to DB...
  redirect('/student/dashboard')
}
```

### DAL pattern with getUser() (from Phase 1 — matches exactly)
```typescript
// Source: src/lib/dal/auth.ts [VERIFIED]
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
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

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware()` | `proxy.ts` + `export function proxy()` | Next.js 16.0.0 | Phase 1 already migrated — proxy.ts exists [VERIFIED: src/proxy.ts] |
| Synchronous `params` / `searchParams` | Async (Promise) | Next.js 15 → 16 | All page files must `await params` |
| `useFormState` from `react-dom` | `useActionState` from `react` | React 19 | Already using React 19.2.4 [VERIFIED: package.json] |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | ~2023 | Phase 1 already uses @supabase/ssr only [VERIFIED: package.json] |

**Deprecated / outdated:**
- `searchParams` as a synchronous prop: deprecated in Next.js 15, must be Promise in 16
- `useFormState`: removed in React 19 in favor of `useActionState`

---

## Runtime State Inventory

> This section is N/A for Phase 2. This is a greenfield feature build, not a rename/refactor/migration. No runtime state items to audit.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16 runtime | ✓ | (system) | — |
| npm | Package install | ✓ | (system) | — |
| Next.js 16.2.4 | All Phase 2 routes | ✓ | 16.2.4 | — |
| @supabase/ssr | DAL / auth | ✓ | 0.10.2 | — |
| shadcn/ui (button, input, label, card, select, badge) | Form components | ✓ | installed | — |
| shadcn/ui (progress) | Assessment progress bar | ✗ | not installed | Add via `npx shadcn@latest add progress` |
| recharts | Per-category score chart | ✗ | not installed | Use CSS-only Tailwind bars (simpler, no hydration risk) |
| Supabase project | DB operations | UNKNOWN | — | Must have .env.local populated before running |

**Missing dependencies with fallback:**
- `shadcn/ui progress`: install with `npx shadcn@latest add progress` — or implement with a simple `<div>` + Tailwind width utility
- `recharts`: CSS-only bar approach using `style={{ width: \`${score}%\` }}` is fully viable for Phase 2; recharts can be added in Phase 5 for polish

**Missing dependencies with no fallback:**
- Supabase `.env.local` values — DB queries will fail without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Must be populated before Wave 1 can be verified end-to-end.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — Wave 0 gap |
| Config file | None — see Wave 0 |
| Quick run command | `npx jest --testPathPattern="scoring" --passWithNoTests` (after setup) |
| Full suite command | `npx jest --passWithNoTests` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCORE-01 | Weighted formula returns correct overall score | unit | `npx jest tests/scoring.test.ts -t "computeReadinessScore"` | ❌ Wave 0 |
| SCORE-02 | Tier assignment thresholds (75%, 55%) | unit | `npx jest tests/scoring.test.ts -t "deriveReadinessTier"` | ❌ Wave 0 |
| SCORE-01 | Strengths/growth area derivation from scores | unit | `npx jest tests/scoring.test.ts -t "deriveStrengthsAndGrowth"` | ❌ Wave 0 |
| ASSESS-05 | 24h cooldown: blocked when < 24h elapsed | unit | `npx jest tests/assessment.test.ts -t "checkCooldown"` | ❌ Wave 0 |
| ASSESS-05 | 24h cooldown: allowed when > 24h elapsed | unit | `npx jest tests/assessment.test.ts -t "checkCooldown"` | ❌ Wave 0 |
| ASSESS-04 | Submit blocked if < 30 responses exist | unit | `npx jest tests/assessment.test.ts -t "submitAssessment count"` | ❌ Wave 0 |
| STUDENT-04 | Assessment gate redirects if profile_complete=false | unit/smoke | manual — navigate to /student/assessment without profile | — |
| ASSESS-03 | Resumability — answer survives page reload | smoke | manual — answer Q1, reload, verify Q1 pre-filled | — |

**Manual-only justification:** Tests marked "manual" require a live Supabase connection and authenticated session — automated integration tests are out of scope for Phase 2. Pure TypeScript logic (scoring formula, cooldown math) is fully unit testable without a DB.

### Sampling Rate
- **Per task commit:** `npx jest tests/scoring.test.ts --passWithNoTests`
- **Per wave merge:** `npx jest --passWithNoTests`
- **Phase gate:** Scoring unit tests pass + manual smoke test of full assessment flow before `/gsd-verify-work 2`

### Wave 0 Gaps
- [ ] `spd-ready/tests/scoring.test.ts` — covers SCORE-01, SCORE-02, strengths/growth derivation
- [ ] `spd-ready/tests/assessment.test.ts` — covers cooldown logic (ASSESS-05), submit count guard (ASSESS-04)
- [ ] Framework install: `cd spd-ready && npm install --save-dev jest @types/jest ts-jest && npx ts-jest config:init`

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (inherited) | `getUser()` in every DAL function — established in Phase 1 |
| V3 Session Management | yes (inherited) | `proxy.ts` + `@supabase/ssr` cookie refresh |
| V4 Access Control | yes | `requireRole('student')` in Server Actions; RLS on all tables |
| V5 Input Validation | yes | zod schema validates all form inputs in Server Actions |
| V6 Cryptography | no | No new cryptographic operations in this phase |

### Known Threat Patterns for Phase 2

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Direct URL navigation to assessment without profile | Elevation of Privilege | Profile completion check in Server Component AND `startAssessmentAction` |
| Submitting assessment answers as wrong user | Spoofing / Tampering | DAL calls `getCurrentUser()` before every DB write; RLS enforces `student_user_id = auth.uid()` |
| Double-click / double-submit on assessment | Tampering | `useActionState` pending disables button; `unique(assessment_id, question_id)` constraint in schema prevents duplicate responses |
| Retake cooldown bypass via direct Server Action call | Elevation of Privilege | Cooldown check inside `startAssessmentAction` (server-side), not just in the UI |
| Role escalation via onboarding form | Elevation of Privilege | Server Action reads role from `user.app_metadata.role` (server-controlled); no user input can change it |
| Score manipulation via crafted formData | Tampering | Score is computed server-side from `assessment_responses` in DB — no score is accepted from client input |

**Critical:** The scoring formula must NEVER read score values from `formData`. It always re-derives from `assessment_responses` rows in the database. This prevents a student from submitting a crafted score.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Partial credit scoring (score_map with 0.25 values) produces meaningfully differentiated tiers | Assessment Questions | All scores cluster at 0 or 1; tier spread is reduced. Mitigation: review question set with SPD domain expert |
| A2 | Tungsten carbide identification uses gold ring (not red dot) in most US hospital SPD departments | Question 23 | Wrong answer keyed as correct; damages domain credibility. Mitigation: confirm with CRCST practitioner |
| A3 | CSS-only Tailwind bars are sufficient for the results page per-category display in Phase 2 | Standard Stack / Pitfall 8 | If recharts is required by UX review, adds a dependency and hydration complexity |
| A4 | The `profile_complete` flag set to `true` on final onboarding step is the correct gate mechanism | Profile Completion Gate pattern | If onboarding is multi-session (user fills step 1, leaves, returns), the gate may trigger before all data is truly filled. Mitigation: validate required fields in the Server Action before setting `profile_complete = true` |

**If this table is empty:** All claims in this research were verified or cited. This table is not empty — A1 and A2 are domain content assumptions that should be reviewed by a CRCST practitioner before production launch.

---

## Open Questions

1. **Question 23 instrument color coding (TC insert identification)**
   - What we know: Gold rings are commonly used for TC-grade instruments in the US market
   - What's unclear: Some facilities use different color systems; "red" is used in some sources
   - Recommendation: Mark as `[ASSUMED]` in the seed data; flag for review with a CRCST practitioner before launch

2. **Partial credit scoring (0.25) values — are they appropriate for this audience?**
   - What we know: The score_map allows fractional credit for partially correct answers
   - What's unclear: Whether CRCST students typically encounter partial credit assessments; whether 0.25 is the right weight
   - Recommendation: Implement as specified; review with domain expert in Phase 4 when demo data is seeded

3. **`profile_complete` flag — should edit resets it to false?**
   - What we know: STUDENT-03 says students can edit their profile post-submission
   - What's unclear: If a student edits their profile after completing an assessment, should `profile_complete` remain true?
   - Recommendation: Keep `profile_complete = true` on edit (fields remain populated); only set to `false` if a required field is cleared

---

## Sources

### Primary (HIGH confidence)
- Next.js 16 `page.md` — async params/searchParams behavior [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md]
- Next.js 16 `proxy.md` — proxy() function, migration from middleware [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md]
- Next.js 16 `forms.md` — useActionState, prevState signature, pending state [VERIFIED: node_modules/next/dist/docs/01-app/02-guides/forms.md]
- SPD Ready `001_initial_schema.sql` — column names, enum values, constraints [VERIFIED: spd-ready/supabase/migrations/001_initial_schema.sql]
- SPD Ready `package.json` — installed packages and versions [VERIFIED: spd-ready/package.json]
- SPD Ready `src/proxy.ts` — Next.js 16 proxy pattern in use [VERIFIED: spd-ready/src/proxy.ts]
- SPD Ready `src/lib/dal/auth.ts` — DAL pattern established in Phase 1 [VERIFIED]
- SPD Ready `.planning/research/ARCHITECTURE.md` — assessment engine architecture, scoring patterns
- SPD Ready `.planning/research/PITFALLS.md` — double-submit, progress loss, RLS pitfalls
- SPD Ready `.planning/STATE.md` — decisions log confirming Next.js 16, proxy.ts rename, Server Action patterns

### Secondary (MEDIUM confidence)
- CRCST exam domain content (decontamination, sterilization, HLD, Spaulding classification, ANSI/AAMI ST79) — [ASSUMED from training knowledge; question set needs domain review]

### Tertiary (LOW confidence)
- Specific answer keys for Questions 22–25 (instrument identification) — [ASSUMED: not verified against current CRCST study materials; flag for review]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against package.json and installed Next.js 16 docs
- Architecture patterns: HIGH — verified against Next.js 16 docs, ARCHITECTURE.md, and existing Phase 1 patterns
- Assessment question content: MEDIUM — grounded in SPD/CRCST domain knowledge, needs practitioner review for instrument-specific answers
- Pitfalls: HIGH — sourced from existing PITFALLS.md plus Next.js 16 breaking changes verified in docs
- Scoring formula: HIGH — exact formula specified in REQUIREMENTS.md and ARCHITECTURE.md

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (stable stack; content questions need domain review before launch)
