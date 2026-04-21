# Architecture Patterns — SPD Ready

**Domain:** Multi-role readiness assessment and externship placement web app
**Stack:** Next.js 14 App Router + Supabase Postgres/Auth/RLS + Tailwind + shadcn/ui + Vercel
**Researched:** 2026-04-20
**Overall confidence:** HIGH (verified against Next.js and Supabase official docs via Context7)

---

## 1. Route Structure Recommendation

Use **route groups** (parenthesized folder names) in the App Router to isolate layouts, loading states, and navigation per role without affecting the URL. Each role gets its own layout shell.

```
app/
├── (marketing)/
│   └── page.tsx                        → / (landing page)
│
├── (auth)/
│   ├── login/
│   │   └── page.tsx                    → /login
│   └── signup/
│       └── page.tsx                    → /signup
│
├── (student)/
│   ├── layout.tsx                      ← student nav shell + auth guard
│   ├── onboarding/
│   │   └── page.tsx                    → /onboarding (student profile intake)
│   ├── assessment/
│   │   ├── page.tsx                    → /assessment (start or resume)
│   │   └── [step]/
│   │       └── page.tsx                → /assessment/1 … /assessment/30
│   ├── results/
│   │   └── page.tsx                    → /results (readiness profile)
│   └── dashboard/
│       └── page.tsx                    → /dashboard (student home)
│
├── (hospital)/
│   ├── layout.tsx                      ← hospital nav shell + auth guard
│   ├── onboarding/
│   │   └── page.tsx                    → /onboarding (site profile intake)
│   ├── openings/
│   │   ├── page.tsx                    → /openings (list openings)
│   │   ├── new/
│   │   │   └── page.tsx                → /openings/new
│   │   └── [openingId]/
│   │       └── page.tsx                → /openings/[id] (opening detail)
│   ├── candidates/
│   │   ├── page.tsx                    → /candidates (ranked list)
│   │   └── [applicationId]/
│   │       └── page.tsx                → /candidates/[id] (full profile review)
│   └── dashboard/
│       └── page.tsx                    → /dashboard
│
├── (admin)/
│   ├── layout.tsx                      ← admin nav shell + auth guard
│   └── dashboard/
│       └── page.tsx                    → /admin (metrics overview)
│
└── middleware.ts                       ← session refresh + role-based redirect
```

**Key decisions:**

- Route groups do not appear in the URL, so `/student/dashboard` is just `/dashboard`. This is intentional — keep URLs clean, role context lives in session/layout not URL prefix.
- Each role's `layout.tsx` is the auth + role guard boundary. If the session role does not match, redirect immediately to `/login` or `/unauthorized`.
- The `(auth)` group shares no layout with authenticated routes, keeping the login page clean.
- `/onboarding` is shared as a URL slug across roles — it is disambiguated by role in the layout guard, not by URL.

---

## 2. Middleware Architecture

`middleware.ts` at the project root runs on every request. Its only jobs are:

1. Refresh the Supabase session cookie (required by `@supabase/ssr`)
2. Redirect unauthenticated users to `/login`
3. Redirect authenticated users away from public routes (e.g. `/login`) to their role dashboard

**What middleware must NOT do:** query the database, compute fit scores, or perform any business logic. Keep it fast — cookie reads only.

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must happen before any auth checks
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic = ['/', '/login', '/signup'].some(p => path === p || path.startsWith('/auth'))

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based redirect from root after login
  if (user && (path === '/login' || path === '/signup')) {
    const role = user.user_metadata?.role ?? 'student'
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

**Role-to-route redirect logic lives in each role's `layout.tsx`**, not middleware. Middleware only handles login/logout. Layout files read the session, confirm the role matches the route group, and redirect if mismatched. This separation avoids putting all routing logic in one complex middleware.

---

## 3. Supabase RLS Policy Design

### 3.1 Role Storage Strategy

Store role in `auth.users.user_metadata.role` at signup (via `supabase.auth.signUp({ options: { data: { role: 'student' } } })`). Use the **Custom Access Token Hook** to embed the role as a JWT claim for use in RLS policies. This avoids N+1 database lookups in every RLS check.

```sql
-- Custom access token hook: embeds user role in JWT
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable as $$
declare
  claims jsonb;
  user_role text;
begin
  user_role := event->'claims'->'user_metadata'->>'role';
  claims := jsonb_set(event->'claims', '{app_role}', to_jsonb(coalesce(user_role, 'student')));
  return jsonb_set(event, '{claims}', claims);
end;
$$;
```

In RLS policies, access the embedded role via:
```sql
(select auth.jwt()->>'app_role')
```

### 3.2 RLS Policy Matrix

**student_profiles**
```sql
-- Student reads/writes their own profile only
create policy "student_own_profile_select" on student_profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "student_own_profile_insert" on student_profiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id
    and (select auth.jwt()->>'app_role') = 'student');

create policy "student_own_profile_update" on student_profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Hospital reads profiles of students who have applied to their openings
create policy "hospital_reads_applicant_profiles" on student_profiles
  for select to authenticated
  using (
    (select auth.jwt()->>'app_role') = 'hospital'
    and exists (
      select 1 from applications a
      join externship_openings eo on eo.id = a.externship_id
      where a.student_user_id = student_profiles.user_id
        and eo.hospital_user_id = (select auth.uid())
    )
  );

-- Admin reads all
create policy "admin_reads_all_profiles" on student_profiles
  for select to authenticated
  using ((select auth.jwt()->>'app_role') = 'admin');
```

**student_assessments**
```sql
-- Student reads own assessments only
create policy "student_own_assessments" on student_assessments
  for all to authenticated
  using ((select auth.uid()) = student_user_id)
  with check ((select auth.uid()) = student_user_id);

-- Hospital reads assessments of applicants to their openings
create policy "hospital_reads_applicant_assessments" on student_assessments
  for select to authenticated
  using (
    (select auth.jwt()->>'app_role') = 'hospital'
    and exists (
      select 1 from applications a
      join externship_openings eo on eo.id = a.externship_id
      where a.student_user_id = student_assessments.student_user_id
        and eo.hospital_user_id = (select auth.uid())
    )
  );

-- Admin reads all
create policy "admin_reads_all_assessments" on student_assessments
  for select to authenticated
  using ((select auth.jwt()->>'app_role') = 'admin');
```

**assessment_questions** (read-only for all authenticated users)
```sql
create policy "authenticated_read_questions" on assessment_questions
  for select to authenticated
  using (active = true);
```

**assessment_responses**
```sql
-- Student reads/writes own responses
create policy "student_own_responses" on assessment_responses
  for all to authenticated
  using (
    exists (
      select 1 from student_assessments sa
      where sa.id = assessment_responses.assessment_id
        and sa.student_user_id = (select auth.uid())
    )
  );
```

**hospital_profiles**
```sql
-- Hospital reads/writes own profile
create policy "hospital_own_profile" on hospital_profiles
  for all to authenticated
  using ((select auth.uid()) = user_id
    and (select auth.jwt()->>'app_role') = 'hospital')
  with check ((select auth.uid()) = user_id);

-- Admin reads all
create policy "admin_reads_hospital_profiles" on hospital_profiles
  for select to authenticated
  using ((select auth.jwt()->>'app_role') = 'admin');
```

**externship_openings**
```sql
-- Hospital manages own openings
create policy "hospital_own_openings" on externship_openings
  for all to authenticated
  using ((select auth.uid()) = hospital_user_id
    and (select auth.jwt()->>'app_role') = 'hospital')
  with check ((select auth.uid()) = hospital_user_id);

-- Students can read active openings (to apply)
create policy "student_reads_active_openings" on externship_openings
  for select to authenticated
  using (status = 'active');

-- Admin reads all
create policy "admin_reads_all_openings" on externship_openings
  for select to authenticated
  using ((select auth.jwt()->>'app_role') = 'admin');
```

**applications**
```sql
-- Student manages own applications
create policy "student_own_applications" on applications
  for all to authenticated
  using ((select auth.uid()) = student_user_id)
  with check ((select auth.uid()) = student_user_id);

-- Hospital reads/updates applications to their openings
create policy "hospital_reads_own_applications" on applications
  for select to authenticated
  using (
    (select auth.jwt()->>'app_role') = 'hospital'
    and exists (
      select 1 from externship_openings eo
      where eo.id = applications.externship_id
        and eo.hospital_user_id = (select auth.uid())
    )
  );

create policy "hospital_updates_own_applications" on applications
  for update to authenticated
  using (
    (select auth.jwt()->>'app_role') = 'hospital'
    and exists (
      select 1 from externship_openings eo
      where eo.id = applications.externship_id
        and eo.hospital_user_id = (select auth.uid())
    )
  );

-- Admin reads all
create policy "admin_reads_all_applications" on applications
  for select to authenticated
  using ((select auth.jwt()->>'app_role') = 'admin');
```

**hospital_feedback**
```sql
-- Hospital inserts/reads feedback for their own placed students
create policy "hospital_own_feedback" on hospital_feedback
  for all to authenticated
  using (
    (select auth.jwt()->>'app_role') = 'hospital'
    and exists (
      select 1 from applications a
      join externship_openings eo on eo.id = a.externship_id
      where a.id = hospital_feedback.application_id
        and eo.hospital_user_id = (select auth.uid())
    )
  );

-- Student reads feedback on themselves
create policy "student_reads_own_feedback" on hospital_feedback
  for select to authenticated
  using (
    exists (
      select 1 from applications a
      where a.id = hospital_feedback.application_id
        and a.student_user_id = (select auth.uid())
    )
  );

-- Admin reads all
create policy "admin_reads_all_feedback" on hospital_feedback
  for select to authenticated
  using ((select auth.jwt()->>'app_role') = 'admin');
```

### 3.3 RLS Performance Note

Always wrap `auth.uid()` and `auth.jwt()` calls in `(select ...)` subqueries. This forces Postgres to evaluate them once per query rather than once per row, which is a significant performance improvement on large tables. Example: `using ((select auth.uid()) = user_id)` not `using (auth.uid() = user_id)`.

---

## 4. Server Actions vs API Routes

**Use Server Actions for all mutations.** For SPD Ready, nearly everything that writes data should be a Server Action. Use Route Handlers (API routes) only for the narrow cases listed below.

| Operation | Use | Reason |
|-----------|-----|--------|
| Student profile create/update | Server Action | Form mutation, needs revalidation |
| Assessment start/submit | Server Action | Multi-step form state, needs redirect |
| Save assessment response per step | Server Action | Frequent small writes, no redirect needed |
| Hospital profile create/update | Server Action | Form mutation |
| Opening create/update | Server Action | Form mutation |
| Application status update (accept/reject/waitlist) | Server Action | Button mutation |
| Feedback form submit | Server Action | Form mutation |
| Fit score calculation trigger | Server Action | Called after application submit |
| Admin metrics queries | Server Component data fetch (no action needed) | Read-only, renders on server |
| Supabase Auth callbacks (`/auth/callback`) | Route Handler | OAuth redirect handling requires GET handler |
| PostHog event ingestion (if server-side) | Route Handler | External service webhook |

**Why Server Actions win for this app:**

- Colocate mutation logic with the form that triggers it
- Automatic CSRF protection
- Works with progressive enhancement (no JS required for basic forms)
- `revalidatePath` and `redirect` are first-class inside Server Actions
- Supabase client created server-side, so RLS is enforced — no additional auth check needed

**Data Access Layer (DAL) pattern:** Create `app/lib/dal/` with typed functions for each entity. Server Actions call DAL functions. Server Components call DAL functions. DAL functions create their own Supabase server client and execute queries. This centralizes auth checks and prevents them from being accidentally skipped.

```
app/
├── lib/
│   ├── dal/
│   │   ├── student.ts       ← getStudentProfile(), updateStudentProfile()
│   │   ├── assessment.ts    ← getAssessment(), submitAssessment()
│   │   ├── hospital.ts      ← getHospitalProfile(), getOpenings()
│   │   ├── applications.ts  ← getApplications(), updateApplicationStatus()
│   │   └── scoring.ts       ← computeReadinessScore(), computeFitScore()
│   └── supabase/
│       ├── server.ts        ← createServerClient() for Server Components + Actions
│       ├── client.ts        ← createBrowserClient() for Client Components
│       └── middleware.ts    ← updateSession() for middleware
├── actions/
│   ├── student.ts           ← submitProfileAction(), submitAssessmentAction()
│   ├── hospital.ts          ← createOpeningAction(), updateCandidateStatusAction()
│   └── feedback.ts          ← submitFeedbackAction()
```

---

## 5. Assessment Engine Architecture

The assessment is 30 questions across 6 categories. The engine must: load questions, track progress, save answers incrementally, and compute the score on submit.

### 5.1 State Management Strategy

Use **URL-based step state** (`/assessment/[step]`) combined with **server-persisted partial responses**. Do not rely on client-side state (localStorage, React context) as the single source of truth — network drops would lose progress.

Flow:
1. Student lands on `/assessment`. Server Action creates a `student_assessments` row with `status = 'in_progress'`.
2. Each step page loads the question for that step and the existing response (if any) from `assessment_responses`.
3. On "Next", a Server Action upserts the response row and redirects to the next step.
4. On final step submit, a Server Action marks the assessment `status = 'submitted'`, computes scores, writes them back, and redirects to `/results`.

This approach means the assessment survives page refreshes and browser closes. The student can resume where they left off.

### 5.2 Question Loading

Load the full question bank once in the root assessment layout (Server Component), ordered by category then question index. Pass question IDs down. Each step page receives its question via the ordered array index.

```typescript
// (student)/assessment/layout.tsx — Server Component
import { getActiveQuestions } from '@/lib/dal/assessment'

export default async function AssessmentLayout({ children }) {
  const questions = await getActiveQuestions() // ordered, 30 rows
  return (
    <AssessmentShell questions={questions}>
      {children}
    </AssessmentShell>
  )
}
```

### 5.3 Scoring on Submit

Compute readiness scores **in a Server Action on submit** — not in a DB trigger, not in an Edge Function for MVP.

Rationale: The scoring formula is simple deterministic arithmetic (6 weighted category averages). A Server Action has everything it needs: all responses are in the DB, the formula is in `lib/dal/scoring.ts`. An Edge Function adds deployment complexity for no gain at this scale. A DB trigger is harder to debug and test.

```typescript
// lib/dal/scoring.ts
export function computeReadinessScore(categoryAverages: CategoryScores): number {
  return (
    categoryAverages.technical * 0.30 +
    categoryAverages.situational * 0.25 +
    categoryAverages.process * 0.15 +
    categoryAverages.behavior * 0.15 +
    categoryAverages.instrument * 0.10 +
    categoryAverages.reliability * 0.05
  )
}

export function deriveReadinessTier(score: number): 1 | 2 | 3 {
  if (score >= 75) return 1
  if (score >= 55) return 2
  return 3
}
```

The Server Action that handles submission:
1. Fetches all responses for the assessment
2. Groups by category, computes per-category score
3. Applies weighted formula → `overall_score`
4. Derives tier
5. Writes scores back to `student_assessments`
6. Writes `readiness_score`, `readiness_tier`, `summary`, `strengths_json`, `growth_areas_json` to `student_profiles`
7. Redirects to `/results`

---

## 6. Fit Scoring Architecture

Fit score is computed **on application submit** (Server Action), not precomputed or triggered by DB.

Rationale: Fit score requires both the student profile and the opening profile to be joined. It only needs to exist once a student applies to a specific opening. Computing on application creation is the natural trigger point.

```typescript
// lib/dal/scoring.ts
export function computeFitScore(
  student: StudentProfile,
  opening: ExternshipOpening,
  hospital: HospitalProfile
): number {
  const geo = scoreGeography(student.state, student.city, student.travel_radius_miles, hospital.city, hospital.state)
  const schedule = scoreSchedule(student.availability_json, opening.shift)
  const readiness = scoreReadinessTier(student.readiness_tier)
  const support = scoreSupportAlignment(student.readiness_tier, hospital.teaching_capacity, hospital.preceptor_strength)
  const environment = scoreEnvironmentFit(student, hospital)
  const instrument = scoreInstrumentFamiliarity(student, opening.requirements_json)

  return geo * 20 + schedule * 20 + readiness * 20 + support * 15 + environment * 15 + instrument * 10
}
```

Each sub-scorer returns a 0–1 value. The formula caps at 100. Store result in `applications.fit_score`.

**Future consideration:** If fit score needs to be recomputed in bulk (e.g., hospital updates their opening requirements), extract to a Postgres function or Supabase Edge Function invoked from admin. For MVP, on-apply is sufficient.

---

## 7. Candidate Review Page — Data Flow

This is the most data-joined page in the app. A hospital reviewer sees one candidate's full profile derived from multiple tables.

### 7.1 Data Join

The candidate review page at `/candidates/[applicationId]` needs:
- `applications` row (fit_score, status, hospital_notes)
- `student_profiles` row (demographics, readiness_score, tier, strengths, growth_areas, summary)
- `student_assessments` row (per-category scores, submitted_at)
- `externship_openings` row (opening context)

RLS ensures the hospital can only reach these rows if the application is for one of their openings (enforced at DB level as defined in §3.2).

### 7.2 Data Flow Diagram

```
Hospital browser
       |
       | GET /candidates/[applicationId]
       v
(hospital)/candidates/[applicationId]/page.tsx   [Server Component]
       |
       | calls DAL function
       v
lib/dal/applications.ts → getCandidateReviewData(applicationId)
       |
       | single Supabase query with joins
       v
Supabase Postgres  ←  RLS verifies hospital owns this application
       |
       | returns joined object:
       | { application, studentProfile, assessment, opening }
       v
Server Component renders:
  <CandidateProfileHeader />        ← student name, location, tier badge
  <ReadinessScoreCard />            ← overall score + radar chart of 6 categories
  <StrengthsGrowthPanel />          ← strengths[] + growth_areas[] from profile
  <FitScoreSummary />               ← fit_score breakdown vs this opening
  <AssessmentDetailAccordion />     ← per-category scores (expandable)
  <PlacementDecisionPanel />        ← accept/waitlist/reject buttons (Client Component)
       |
       | PlacementDecisionPanel calls Server Action
       v
actions/hospital.ts → updateCandidateStatusAction(applicationId, status, notes)
       |
       | updates applications.status + hospital_notes
       | revalidatePath('/candidates/[applicationId]')
       v
Page re-renders with updated status
```

### 7.3 Single Query Strategy

Use a single Supabase query with `.select()` traversing foreign key relations rather than 3 separate queries:

```typescript
const { data } = await supabase
  .from('applications')
  .select(`
    id, fit_score, status, hospital_notes, submitted_at,
    externship_openings ( id, title, shift, start_date, requirements_json ),
    student_profiles!applications_student_user_id_fkey (
      first_name, last_name, city, state,
      readiness_score, readiness_tier, summary,
      strengths_json, growth_areas_json,
      student_assessments (
        technical_score, situational_score, process_score,
        behavior_score, instrument_score, reliability_score,
        overall_score, submitted_at
      )
    )
  `)
  .eq('id', applicationId)
  .single()
```

This returns a nested object in one round trip. RLS is enforced at the `applications` table level — if the hospital does not own the opening, the row is not returned.

---

## 8. Component Boundaries

### Server vs Client Component Rules

| Component type | Server or Client | Reason |
|----------------|-----------------|--------|
| Page shells (dashboards, list views) | Server | Data fetching, no interactivity |
| Form pages (onboarding, opening creation) | Client (with Server Action) | Controlled inputs, validation UX |
| Assessment step pages | Client | Tracks selected answer locally before submit |
| Assessment layout (question loader) | Server | Reads question bank once |
| Results page | Server | Read-only display |
| Candidate review page | Server | Read-only joins |
| PlacementDecisionPanel | Client | Button state, optimistic updates |
| Score visualizations (radar chart) | Client | Canvas/SVG animation |
| Admin metrics cards | Server | Aggregate queries |
| Navigation shells | Client | Active link state |

### Shared Component Library Structure

```
components/
├── ui/                      ← shadcn/ui primitives (Button, Card, Badge, etc.)
├── student/
│   ├── ReadinessScoreCard.tsx
│   ├── AssessmentStep.tsx
│   └── ProfileSummary.tsx
├── hospital/
│   ├── CandidateCard.tsx
│   ├── PlacementDecisionPanel.tsx
│   └── OpeningForm.tsx
├── admin/
│   └── MetricsTile.tsx
└── shared/
    ├── TierBadge.tsx         ← reused by student results + hospital review
    ├── CategoryScoreBar.tsx  ← reused in results + candidate review
    └── LoadingSpinner.tsx
```

---

## 9. Build Order and Phase Dependencies

This is the recommended build sequence, based on data dependencies and demo-critical path.

### Phase 1 — Foundation (must be first)
- Supabase project setup: schema migration for all 8 tables, RLS policies, custom access token hook
- Next.js project scaffold: route group structure, layout shells, middleware
- Auth flows: signup (with role selection), login, magic link, session management
- Supabase client utilities: `server.ts`, `client.ts`, `middleware.ts`

**Why first:** Every other phase depends on auth + database being correct. RLS written wrong here breaks everything downstream. Do not skip the custom access token hook — it is required for role-based RLS policies.

### Phase 2 — Student Core Loop (blocks hospital phase)
- Student onboarding form → `student_profiles` write
- Assessment engine: question loading, step-through, response persistence
- Scoring Server Action: compute + write readiness scores + tier to profile
- Results page: display readiness profile

**Why second:** Hospital review is meaningless without students who have completed assessments. Demo requires at least seeded students with scores. Assessment engine is the most complex part of the student loop.

### Phase 3 — Hospital Core Loop (requires Phase 2)
- Hospital onboarding form → `hospital_profiles` write
- Opening creation form → `externship_openings` write
- Application creation (student applies to opening) → `applications` write + fit score computation
- Candidates list page: read applications + student profiles, sorted by fit_score
- Candidate review page: full joined profile display
- Placement decision: update `applications.status`

**Why third:** Requires students with completed profiles + assessments from Phase 2 to have meaningful data to display.

### Phase 4 — Feedback + Admin
- Post-placement feedback form → `hospital_feedback` write
- Admin dashboard: aggregate metrics queries (counts, tier distribution, placement counts)
- Seeded data scripts for demo

**Why fourth:** Feedback requires placed students (Phase 3). Admin dashboard is read-only aggregation.

### Phase 5 — Polish (pre-demo)
- Email notifications via Resend (application status changes, new applicant alerts)
- PostHog event tracking integration
- Demo data seeding scripts
- Loading states, error boundaries, empty states for all pages

### Dependency Graph

```
Phase 1 (Auth + Schema)
    └──→ Phase 2 (Student Loop)
              └──→ Phase 3 (Hospital Loop)
                        └──→ Phase 4 (Feedback + Admin)
                                  └──→ Phase 5 (Polish)
```

No phase can be safely started without the prior phase being stable. The assessment engine (Phase 2) and RLS policies (Phase 1) are the two highest-risk components — they should receive the most careful implementation and be verified with test data before proceeding.

---

## 10. Critical Architecture Decisions Summary

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Route groups | `(student)`, `(hospital)`, `(admin)`, `(auth)`, `(marketing)` | Clean role isolation, shared layouts per role |
| Role storage | `user_metadata.role` + custom JWT claim hook | Single source of truth, no extra DB lookup in RLS |
| RLS role check | `(select auth.jwt()->>'app_role')` | Evaluated once per query, not per row |
| Mutations | Server Actions exclusively | CSRF protection, colocated with forms, revalidation built-in |
| Data access | DAL pattern (`lib/dal/`) | Centralized auth checks, testable, prevents accidental bypass |
| Assessment state | URL steps + server-persisted responses | Survives refresh, no localStorage dependency |
| Readiness scoring | Server Action on submit | Simple arithmetic, no Edge Function overhead for MVP |
| Fit scoring | Server Action on application create | Natural trigger point, all data available |
| Candidate review query | Single Supabase join query | One round trip, RLS enforced at application level |
| Schema migrations | Supabase CLI migrations | Reproducible, version-controlled, Vercel deploy compatible |

---

## Sources

- Next.js App Router: route groups, middleware, Server Actions, DAL pattern — https://nextjs.org/docs/app (verified via Context7 `/websites/nextjs`)
- Supabase RLS, custom access token hook, row-level security — https://supabase.com/docs/guides/auth/row-level-security (verified via Context7 `/websites/supabase`)
- Supabase RLS performance guide — https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices
- Supabase custom RBAC — https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac
- Supabase SSR middleware for Next.js — https://supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package
- Next.js authentication patterns — https://nextjs.org/docs/app/guides/authentication
- Next.js data security / DAL — https://nextjs.org/docs/app/guides/data-security
