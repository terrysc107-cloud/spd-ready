# Domain Pitfalls: SPD Ready

**Domain:** Next.js 14 App Router + Supabase multi-role healthcare placement web app
**Researched:** 2026-04-20
**Confidence:** HIGH — all pitfalls sourced from official Next.js docs, official Supabase docs, and @supabase/ssr documentation

---

## Critical Pitfalls

Mistakes that cause rewrites, data leaks, or hard demo failures.

---

### Pitfall 1: Using `getSession()` for Server-Side Authorization

**Name:** Trusting `getSession()` on the Server

**What goes wrong:** Calling `supabase.auth.getSession()` inside middleware, Server Components, or Route Handlers to gate access. This method reads the JWT directly from the cookie without revalidating it against Supabase's auth server. A tampered or expired token will appear valid. For a multi-role app, this means a student could spoof a hospital or admin session.

**Why it happens:** It looks correct and works during development because tokens aren't expired yet. The bug surfaces in production or after token rotation.

**Consequences:** Role checks silently pass for unauthorized users. Hospital and admin routes become accessible to students with crafted cookies.

**Prevention:** Use `supabase.auth.getUser()` on the server at all times — it contacts the Supabase Auth server to cryptographically validate the JWT. Never use `getSession()` for authorization decisions; it's only safe for display purposes on non-sensitive pages.

```typescript
// WRONG — do not use this for auth gates
const { data: { session } } = await supabase.auth.getSession()

// CORRECT — always use getUser() on the server
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

**Warning signs:** You are calling `getSession()` anywhere in `middleware.ts`, a Server Component, or a Route Handler.

**Phase:** Phase 1 (Auth foundation) — get this right before building any other page.

---

### Pitfall 2: Middleware Not Forwarding Refreshed Tokens

**Name:** Broken Token Refresh Loop in Middleware

**What goes wrong:** Next.js middleware runs before every render. Supabase tokens expire (default 1 hour). If middleware calls `getUser()` but does NOT forward the refreshed token back into both the request cookies (for Server Components) and the response cookies (for the browser), the session silently dies. Users are logged out mid-demo or see stale data.

**Why it happens:** The `@supabase/ssr` pattern requires a two-way cookie write: update `request.cookies` so downstream Server Components see the fresh token, AND set `response.cookies` so the browser stores it. One missing direction breaks the loop.

**Consequences:** Token expires mid-session. Server Components get a stale session. User appears logged out. In a demo context, this looks like a broken app.

**Prevention:** Follow the exact `@supabase/ssr` middleware pattern with both `getAll` and `setAll` wired to both `request` and `response`. Do not omit either direction.

```typescript
// middleware.ts — correct pattern
const supabase = createServerClient(url, key, {
  cookies: {
    getAll() { return request.cookies.getAll() },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        request.cookies.set(name, value)           // for Server Components
        response.cookies.set(name, value, options) // for the browser
      })
    }
  }
})
await supabase.auth.getUser() // triggers refresh if needed
```

**Warning signs:** Users report being randomly logged out. Dev works fine but staging breaks after an hour. Server Components sometimes see no user even when the user is logged in.

**Phase:** Phase 1 (Auth foundation).

---

### Pitfall 3: Using `@supabase/auth-helpers-nextjs` Instead of `@supabase/ssr`

**Name:** Deprecated Auth Helpers Package

**What goes wrong:** Searching for Supabase + Next.js tutorials will surface a large volume of content using `@supabase/auth-helpers-nextjs`. This package is deprecated. Supabase now focuses all bug fixes and new features exclusively on `@supabase/ssr`. Using the old package causes subtle session issues in App Router, especially around cookie handling and Server Component support.

**Why it happens:** Blog posts, YouTube tutorials, and Stack Overflow answers from 2022–2023 still recommend `auth-helpers-nextjs`.

**Consequences:** Mysterious auth bugs that can't be fixed because they're package-level. Wasted debugging time.

**Prevention:** Install `@supabase/ssr` from day one. Never install `@supabase/auth-helpers-nextjs`. Do not mix both packages — this causes auth conflicts.

```bash
# Correct
npm install @supabase/ssr @supabase/supabase-js

# Never use this
npm install @supabase/auth-helpers-nextjs
```

**Warning signs:** Your package.json contains `@supabase/auth-helpers-nextjs`. Any tutorial or AI suggestion that references `createClientComponentClient` or `createServerComponentClient` (the old API) — those are from the deprecated package.

**Phase:** Phase 1 (Auth foundation) — enforce before writing a single line of auth code.

---

### Pitfall 4: RLS Table Enabled But No SELECT Policy for UPDATE/DELETE

**Name:** Missing SELECT Policy Breaks Mutations

**What goes wrong:** Supabase RLS requires a SELECT policy to exist before UPDATE or DELETE operations will succeed. Without a SELECT policy, any mutation silently fails or returns an empty result — the row cannot be "found" to mutate it.

**Why it happens:** Developers enable RLS and write an INSERT policy and an UPDATE policy but forget SELECT. The mutation appears to run (no error thrown) but no rows are changed. Extremely hard to debug.

**Consequences:** Hospital "Accept candidate" action silently does nothing. Assessment submission appears to succeed but the record is unchanged. Demo breaks with no visible error.

**Prevention:** For every table with RLS enabled, explicitly write policies for ALL operations you intend to use: SELECT, INSERT, UPDATE, DELETE. Use the Supabase dashboard's RLS policy helper to audit coverage per table.

**Warning signs:** A mutation runs without error but the database row does not change. Supabase logs show the query ran but returned 0 rows affected.

**Phase:** Phase 1 (Schema + RLS baseline) and Phase 2 (each feature as it's added).

---

### Pitfall 5: RLS Policy Performance — Joins Instead of IN Subqueries

**Name:** Slow RLS Policies Caused by Table Joins

**What goes wrong:** Writing an RLS policy that joins the source table back to a lookup table (e.g., checking if `auth.uid()` is in a team/ownership table via a JOIN) causes the database to re-run the join for every single row scanned. At 50+ candidates in a list, this is the difference between 20ms and 9 seconds.

**Why it happens:** The natural way to write "does this user own this row" looks like a join. The performant way uses a subquery with IN.

**Consequences:** The hospital candidate list becomes unusable once the demo has more than a handful of seeded records. Admin dashboard queries time out.

**Prevention:** Always use the `IN` subquery pattern for RLS lookups, and wrap `auth.uid()` in a `SELECT` to enable caching.

```sql
-- SLOW (join-based) — never do this
create policy "slow_policy" on applications
using (
  auth.uid() in (
    select hospital_user_id
    from externship_openings
    where externship_openings.id = applications.externship_id
  )
);

-- FAST (IN subquery, cached auth.uid()) — do this
create policy "fast_policy" on applications
using (
  externship_id in (
    select id from externship_openings
    where hospital_user_id = (select auth.uid())
  )
);
```

Also add a B-tree index on every `user_id` or `hospital_user_id` column referenced in RLS policies.

**Warning signs:** Candidate list query takes more than 500ms. EXPLAIN ANALYZE shows Seq Scan where an index scan was expected.

**Phase:** Phase 2 (candidate matching and ranking) — before seeding demo data.

---

### Pitfall 6: Role in JWT vs Role in Database — Split Brain

**Name:** Role Stored in Two Places Gets Out of Sync

**What goes wrong:** Supabase Auth stores the user's role in `auth.users.raw_user_meta_data`. Application code also stores it in `public.users.role`. These two copies can diverge. Middleware reads the JWT claim (fast, cached), but database queries use the table column. If an admin changes a user's role in the dashboard, the JWT still carries the old role until the user logs out and back in.

**Why it happens:** The simplest approach is to store role in both places. It feels consistent but creates a sync problem.

**Consequences:** A student who gets upgraded to hospital status still sees the student dashboard until their next login. An admin who sets someone to "blocked" cannot actually prevent access.

**Prevention:** Choose one authoritative source: the `public.users` table. In middleware, after validating the user with `getUser()`, fetch the role from the database (not the JWT). Cache this with React `cache()` inside a DAL function so it runs once per request cycle. Do not rely on JWT metadata for role-based decisions.

**Warning signs:** Role changes don't take effect until the user logs out. Middleware checks `user.user_metadata.role` instead of querying `public.users`.

**Phase:** Phase 1 (Auth foundation) — establish the single source of truth for role before building role-specific pages.

---

### Pitfall 7: Middleware Auth Check Not Covering All Role-Specific Routes

**Name:** Incomplete Route Protection in Middleware

**What goes wrong:** Middleware checks `/student/*` and `/hospital/*` routes, but because of how the `matcher` config works, some routes are accidentally excluded — especially API routes, dynamic segments, and routes with query parameters. A student can navigate directly to `/hospital/candidates` and see hospital data.

**Why it happens:** The `matcher` config uses regex patterns that are easy to misconfigure. Dynamic routes like `/hospital/candidates/[id]` need explicit coverage. Static asset exclusions can accidentally swallow protected routes.

**Consequences:** Role boundaries are bypassed. Students see candidate lists. Hospital admins access admin metrics.

**Prevention:** Write the middleware matcher to cover all non-static paths. Enforce role checks at TWO levels: (1) middleware redirect for UX, (2) Server Component / Route Handler for actual security. Never rely on middleware alone as the security boundary.

```typescript
// middleware.ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'
  ]
}

// Then in middleware body, check role:
if (path.startsWith('/hospital') && userRole !== 'hospital') {
  return NextResponse.redirect(new URL('/unauthorized', request.url))
}
if (path.startsWith('/admin') && userRole !== 'admin') {
  return NextResponse.redirect(new URL('/unauthorized', request.url))
}
```

AND verify role again in each Server Component or Route Handler (defense in depth).

**Warning signs:** You can navigate to `/hospital/candidates` while logged in as a student and see data. Middleware only has a single `protectedRoutes` array rather than per-role checks.

**Phase:** Phase 1 (Auth foundation) and Phase 3 (hospital dashboard).

---

## Moderate Pitfalls

Mistakes that cause bugs and lost time but are recoverable without a rewrite.

---

### Pitfall 8: Assessment Double-Submission

**Name:** Race Condition on Assessment Submit

**What goes wrong:** The student hits "Submit Assessment" and the button is not disabled during submission. They click it twice, or the network is slow and they click again. Two server action calls fire. The scoring engine runs twice, creates two `student_assessments` records, and both overwrite `student_profiles.readiness_score`. The second write wins with whatever partial state was calculated.

**Why it happens:** Next.js Server Actions do not deduplicate concurrent calls. Without disabling the button during `pending` state, double-clicks are common on slow connections.

**Prevention:** Use `useActionState` to get the `pending` boolean and disable the submit button immediately. Add a database-level unique constraint on `(student_user_id, status)` with a partial index for status = 'submitted' so that even if two calls land simultaneously, only one insert wins.

```typescript
// Client component wrapping the assessment submit
const [state, formAction, pending] = useActionState(submitAssessment, null)

<button disabled={pending} type="submit">
  {pending ? 'Submitting...' : 'Submit Assessment'}
</button>
```

**Warning signs:** A student's `student_assessments` table has duplicate rows for the same user. The score fluctuates after submission.

**Phase:** Phase 2 (assessment engine).

---

### Pitfall 9: Assessment Progress Lost on Navigation

**Name:** Multi-Step Assessment State Lost on Page Refresh or Back Navigation

**What goes wrong:** The 30-question assessment is stored purely in React component state (or URL params). The student completes 20 questions, accidentally navigates away or refreshes, and all progress is gone. For a demo, this means the presenter can't demo the assessment without completing it in one uninterrupted sitting.

**Why it happens:** Client-side state is ephemeral. URL-based state requires all 30 answers in the URL. Neither is reliable for a multi-step flow.

**Prevention:** Persist assessment progress to the database as the student advances through steps. Save each response to `assessment_responses` as it's answered (upsert on `(assessment_id, question_id)`). Mark the assessment `status = 'in_progress'` with a `started_at`. On page load, check for an existing in-progress assessment and resume from where they left off.

**Warning signs:** Refreshing the assessment page mid-way returns the student to question 1. There is no `in_progress` status in the `student_assessments` schema.

**Phase:** Phase 2 (assessment engine).

---

### Pitfall 10: N+1 Queries on the Candidate List

**Name:** N+1 Query Pattern When Loading Ranked Candidates

**What goes wrong:** The hospital candidate list first fetches all applications for an opening (1 query), then for each application fetches the student profile (N queries), then for each student fetches their assessment scores (N more queries). With 20 seeded candidates this is 41+ queries per page load.

**Why it happens:** Supabase's JS client makes it tempting to write chained `.select()` calls in a loop rather than using a single relational select or a view.

**Prevention:** Use Supabase's relational select with embedded relations in a single query. Build a database view for the ranked candidate list that joins `applications`, `student_profiles`, and `student_assessments` with the fit score calculation in SQL, not in application code.

```typescript
// WRONG — triggers N+1
const { data: applications } = await supabase.from('applications').select('*')
for (const app of applications) {
  const { data: profile } = await supabase
    .from('student_profiles').select('*').eq('user_id', app.student_user_id)
}

// CORRECT — single relational query
const { data } = await supabase
  .from('applications')
  .select(`
    *,
    student_profiles(*),
    student_assessments(overall_score, readiness_tier)
  `)
  .eq('externship_id', openingId)
  .order('fit_score', { ascending: false })
```

**Warning signs:** The network tab shows 20+ Supabase API calls when the candidate list loads. Page load time scales with the number of applicants.

**Phase:** Phase 3 (candidate ranking and hospital dashboard).

---

### Pitfall 11: shadcn/ui Component Hydration Mismatch

**Name:** Client/Server Render Mismatch with shadcn/ui in App Router

**What goes wrong:** shadcn/ui components use Radix UI primitives that depend on browser APIs (portals, focus management, `document`). When these are rendered in Server Components without the `"use client"` directive, Next.js throws a hydration error: the server renders a fallback but the client tries to mount the Radix portal differently. This is silent in some cases and crashes the page in others.

**Why it happens:** It is easy to use a Dialog, Popover, Tooltip, or Sheet component inside a Server Component without thinking about it — they look like pure JSX but they are client-only.

**Prevention:** Any shadcn/ui component that uses interactivity, portals, or event handlers must be wrapped in a Client Component (`"use client"`) or used within one. Build a thin wrapper component for complex UI compositions that keeps the interactive parts client-side and passes only serializable data as props from Server Components.

**Warning signs:** `Error: Hydration failed because the server rendered HTML didn't match the client.` in the browser console. Dialog or Sheet components that don't open, or that briefly flash on page load.

**Phase:** Phase 2 onward — whenever interactive shadcn/ui components are first introduced.

---

### Pitfall 12: Supabase Realtime Channel Leak

**Name:** Unreleased Realtime Subscriptions Causing "Too Many Channels" Error

**What goes wrong:** If any part of the app uses Supabase Realtime (e.g., live candidate status updates on the hospital dashboard), and the channel is not cleaned up on component unmount, new channels are created on every navigation but old ones are never removed. Supabase has a default limit of 100 channels per client. The app starts throwing "too many channels" errors, queries stop working, and the client eventually stalls.

**Why it happens:** `useEffect` cleanup functions are forgotten, or the Supabase client is re-created inside the component (creating a new client each time instead of a shared singleton).

**Prevention:** Always return a cleanup function from `useEffect` that calls `supabase.removeChannel(channel)`. Create the Supabase browser client as a singleton outside the component tree.

```typescript
useEffect(() => {
  const channel = supabase
    .channel('application-status')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'applications' }, handler)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)  // REQUIRED — always clean up
  }
}, [])
```

**Warning signs:** Browser console shows repeated channel creation logs. After navigating between pages several times, Supabase queries slow down or fail silently.

**Phase:** Phase 3 (hospital dashboard) — if realtime is used. Consider omitting realtime for the MVP/demo since polling is simpler and sufficient.

---

### Pitfall 13: RLS Policies Missing for Authenticated vs. Anonymous

**Name:** RLS Silently Failing Because `auth.uid()` Returns NULL for Anon

**What goes wrong:** Policies like `user_id = auth.uid()` silently return no rows (not an error) when the user is not logged in, because `NULL = anything` is always false in SQL. This is correct behavior, but it trips up developers who expect an error. The symptom is that a user who "should" see data sees nothing, and there's no error to debug.

**Why it happens:** The policy evaluates to false without revealing why. Developers add a `TO authenticated` clause but forget about states where the user is briefly logged out or has an expired token.

**Prevention:** Use the `TO authenticated` clause explicitly on all policies that require login. This tells Postgres to skip the policy entirely for anonymous users (faster, clearer). Always test your RLS policies with both authenticated and unauthenticated requests using Supabase's Table Editor "Policies" simulator.

```sql
create policy "students see own profile"
on student_profiles
for select
to authenticated
using ( user_id = (select auth.uid()) );
```

**Warning signs:** An authenticated user queries their own data and gets an empty array with no error. The RLS policy is missing the `TO authenticated` clause.

**Phase:** Phase 1 (Schema + RLS baseline).

---

## Minor Pitfalls

Mistakes that cause annoyances and wasted time but don't threaten the build.

---

### Pitfall 14: Demo Seed Data Foreign Key Order Violations

**Name:** Seed Script Fails Due to FK Constraint Order

**What goes wrong:** The seed script inserts `student_profiles` before the corresponding `auth.users` record exists (since Supabase auth users live in the `auth` schema, not `public`). Or it inserts `applications` before `externship_openings` exist. The FK violation causes partial seeds and inconsistent demo data.

**Why it happens:** Writing seed scripts by table name alphabetically or in feature order rather than dependency order.

**Prevention:** Seed tables in strict dependency order:
1. `auth.users` (via Supabase admin client, not raw SQL)
2. `public.users` (role mapping)
3. `hospital_profiles`
4. `student_profiles`
5. `assessment_questions`
6. `student_assessments`
7. `assessment_responses`
8. `externship_openings`
9. `applications`
10. `hospital_feedback`

Use `ON CONFLICT DO NOTHING` or `UPSERT` on all seed inserts so re-running the seed is idempotent.

**Warning signs:** Seed script throws FK violation errors. Demo data is partially populated. Re-running the seed creates duplicate records.

**Phase:** Phase 4 (demo data seeding).

---

### Pitfall 15: Demo Data That Looks Fake

**Name:** Placeholder Seed Data Destroys Demo Credibility

**What goes wrong:** Student names are "Test User 1", "Test User 2". Hospital names are "Hospital A". Readiness scores are all exactly 75. The demo looks like a wireframe, not a product, and fails to convince a healthcare executive that this is real.

**Why it happens:** Seed data is written quickly to "just make it work."

**Prevention:** Invest 30 minutes in realistic seed data:
- 8–10 students with real SPD-domain names, realistic cities (Chicago IL, Houston TX, Phoenix AZ), varied readiness scores across all three tiers (e.g., 82%, 69%, 51%)
- 3–4 hospitals with real-sounding names (Riverside Medical Center, St. Catherine's Surgery Center), realistic facility types and case volumes
- 2–3 externship openings per hospital with real shift descriptions
- Pre-calculated fit scores showing the ranking clearly
- One student at Tier 1 (clearly ready), one at Tier 2 (needs coaching), one at Tier 3 (not ready) — so the demo tells a story

The scoring model and three tiers only read as meaningful when the data is varied and realistic.

**Warning signs:** A hospital executive looks at the demo and says "is this real data?" or "these names look fake."

**Phase:** Phase 4 (demo data seeding).

---

### Pitfall 16: Layout-Level Auth Checks Instead of DAL

**Name:** Putting Auth Logic in Layout Files

**What goes wrong:** Placing session checks inside layout components (`app/hospital/layout.tsx`) feels logical but is unreliable. Next.js's partial rendering means layouts do not always re-run on navigation between child routes. A user who logs out via a server action may still see protected layout UI until a full page reload.

**Why it happens:** Layout auth checks work well during initial load, so developers assume they work for all navigation.

**Prevention:** Do NOT rely on layouts for security checks. Do a lightweight redirect check in middleware (fast, cookie-based), but do the actual authorization check in each page's Server Component or in a centralized Data Access Layer (DAL) function that is called per-request. The DAL function should be memoized with React `cache()` so calling it multiple times in the same render cycle doesn't trigger duplicate DB queries.

**Warning signs:** Protected content briefly flashes after logout before the redirect fires. Admin UI is visible for a moment before the user is redirected.

**Phase:** Phase 1 (Auth foundation) — establish the DAL pattern before building role-specific pages.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Auth setup | Using `@supabase/auth-helpers-nextjs` instead of `@supabase/ssr` | Pin `@supabase/ssr` in package.json from day one |
| Phase 1: Auth setup | `getSession()` used in middleware | Replace with `getUser()`, enforce in code review |
| Phase 1: Auth setup | Role stored in JWT metadata only | Always fetch role from `public.users` table |
| Phase 1: Schema + RLS | Missing SELECT policy breaking mutations | Write policies for all four operations per table |
| Phase 2: Assessment engine | Double-submission on slow network | Disable submit button with `useActionState` pending |
| Phase 2: Assessment engine | Progress lost on refresh | Persist each answer immediately to `assessment_responses` |
| Phase 2: shadcn/ui components | Hydration mismatch with Radix portals | Wrap interactive components in `"use client"` |
| Phase 3: Candidate ranking | N+1 query per candidate | Use relational select or a database view |
| Phase 3: Hospital dashboard | Slow RLS from join-based policies | Use IN subquery pattern, add indexes |
| Phase 3: Hospital dashboard | Realtime channel leak | Always call `removeChannel()` in useEffect cleanup |
| Phase 4: Demo seeding | FK violations in seed script | Seed in strict dependency order |
| Phase 4: Demo seeding | Fake-looking data undercuts demo | Use realistic names, cities, varied scores |

---

## Sources

- Supabase SSR package documentation: https://supabase.com/docs/guides/auth/server-side/nextjs (HIGH confidence — official docs)
- Supabase auth helpers migration guide: https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers (HIGH confidence — official docs)
- Supabase RLS performance guide: https://supabase.com/docs/guides/database/postgres/row-level-security (HIGH confidence — official docs)
- Next.js authentication guide: https://nextjs.org/docs/app/guides/authentication (HIGH confidence — official docs, updated 2026-04-15)
- Next.js data security guide: https://nextjs.org/docs/app/guides/data-security (HIGH confidence — official docs)
- Context7 @supabase/ssr snippets: https://context7.com/supabase/ssr/llms.txt (HIGH confidence — authoritative source)
- Context7 Supabase RLS examples: https://github.com/supabase/supabase/blob/master/apps/docs/content/troubleshooting/rls-performance-and-best-practices-Z5Jjwv.mdx (HIGH confidence)
- Supabase realtime cleanup docs: https://supabase.com/docs/guides/realtime/getting_started (HIGH confidence — official docs)
