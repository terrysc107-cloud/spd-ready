---
phase: "01-foundation"
plan: "03"
subsystem: "auth"
tags: [auth, dal, server-actions, supabase, next16]
dependency_graph:
  requires: [01-01, 01-02]
  provides: [auth-dal, auth-actions, auth-pages, auth-callback]
  affects: [all-future-phases]
tech_stack:
  added: []
  patterns: [dal-pattern, server-actions, void-redirect-errors, async-searchparams]
key_files:
  created:
    - spd-ready/src/lib/dal/auth.ts
    - spd-ready/src/actions/auth.ts
    - spd-ready/src/app/auth/callback/route.ts
    - spd-ready/src/app/api/auth/signout/route.ts
    - spd-ready/supabase/migrations/004_auth_trigger.sql
  modified:
    - spd-ready/src/app/(auth)/login/page.tsx
    - spd-ready/src/app/(auth)/register/page.tsx
    - spd-ready/src/app/(auth)/reset-password/page.tsx
decisions:
  - "Server Actions use redirect-with-query-params for errors (void return type required by React form action prop)"
  - "signUpAction uses service_role Admin API to set app_metadata.role — users cannot self-elevate"
  - "signUpAction inserts public.users row directly; 004_auth_trigger.sql provides defense-in-depth via ON CONFLICT DO NOTHING"
  - "All auth pages use Next.js 16 async searchParams (Promise pattern) — breaking change from Next.js 15"
  - "signInAction redirects based on app_metadata.role after successful sign-in"
  - "signUpAction redirects to role-specific onboarding (/student/onboarding or /hospital/onboarding)"
metrics:
  duration: "~30 minutes"
  completed: "2026-04-21T16:12:54Z"
  tasks_completed: 2
  files_created: 5
  files_modified: 3
---

# Phase 01 Plan 03: Auth Pages, Server Actions, DAL & Auth Callback Summary

Auth layer built on top of scaffold (01-01) and schema/RLS (01-02). DAL pattern, four Server Actions, three form pages, callback route, and sign-out API route all complete. TypeScript compiles clean.

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/dal/auth.ts` | DAL: `getCurrentUser`, `getRole`, `requireRole` — all use `getUser()`, memoized with `cache()` |
| `src/actions/auth.ts` | Server Actions: `signInAction`, `signUpAction`, `signOutAction`, `resetPasswordAction` |
| `src/app/auth/callback/route.ts` | Route Handler: exchanges Supabase one-time code for session (email confirm + password reset) |
| `src/app/api/auth/signout/route.ts` | Route Handler: GET-based sign-out, redirects to `/login` |
| `supabase/migrations/004_auth_trigger.sql` | DB trigger: syncs `auth.users` INSERT → `public.users` (defense-in-depth, `ON CONFLICT DO NOTHING`) |

## Files Modified

| File | Change |
|------|--------|
| `src/app/(auth)/login/page.tsx` | Full implementation with shadcn Card form wired to `signInAction` |
| `src/app/(auth)/register/page.tsx` | Full implementation with role radio selector (student / hospital) wired to `signUpAction` |
| `src/app/(auth)/reset-password/page.tsx` | Full implementation with email field wired to `resetPasswordAction`, success state display |

## Auth Flow Confirmed

### Four Server Actions

1. **`signInAction`** — validates email/password, calls `supabase.auth.signInWithPassword()`, redirects to role-specific dashboard (`/student/dashboard`, `/hospital/dashboard`, `/admin/dashboard`). Errors redirect to `/login?error=...`.

2. **`signUpAction`** — validates inputs + role whitelist (`student` | `hospital` only), creates auth user, sets `app_metadata.role` via service_role Admin API (`updateUserById`), inserts `public.users` row via admin client. Redirects to role-specific onboarding. Errors redirect to `/register?error=...`.

3. **`signOutAction`** — calls `supabase.auth.signOut()`, revalidates layout cache, redirects to `/login`.

4. **`resetPasswordAction`** — calls `supabase.auth.resetPasswordForEmail()` with callback URL, redirects to `/reset-password?success=...` or `/reset-password?error=...`.

## Role Security Approach

- **`app_metadata.role`** is set only via `SUPABASE_SERVICE_ROLE_KEY` in `signUpAction`. Users submitting `role=admin` via form manipulation are rejected at the validation step (only `student` and `hospital` accepted). Admin accounts must be created out-of-band.
- **`public.users` insert** happens in `signUpAction` via the admin client (bypasses RLS). Migration `004_auth_trigger.sql` provides a DB-level fallback trigger that fires on `auth.users` INSERT with `ON CONFLICT DO NOTHING` — so if the Server Action already inserted the row, the trigger is a no-op.
- **JWT `app_role` claim** is populated by the custom access token hook (from plan 01-02) which reads from `public.users.role`. This means the JWT claim is always consistent with `public.users` after the user re-authenticates.

## DAL Pattern Established

```typescript
// src/lib/dal/auth.ts — template for all Phase 2/3 DAL files

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()  // ALWAYS getUser, never getSession
  return user ?? null
})

export async function requireRole(role, redirectTo = '/unauthorized') {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.app_metadata?.role !== role) redirect(redirectTo)
  return user
}
```

**Phase 2 pattern:** Call `requireRole('student')` at the top of every student Server Action and Server Component that touches student data. Call `getCurrentUser()` in any DAL function that needs the user ID for a query.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed void return type incompatibility in Server Actions**
- **Found during:** TypeScript check after Task 2
- **Issue:** React's `<form action>` prop requires `(formData: FormData) => void | Promise<void>`. The plan's Server Actions returned `{ error: string }` objects on failure paths, making the return type `Promise<{ error: string } | void>` — not assignable to `Promise<void>`.
- **Fix:** Changed all error return paths to use `redirect('/path?error=...')` instead. All success paths already used `redirect()`. Server Actions now consistently return `void` (via `redirect` throws, which are `never`). This means the form action prop type is satisfied.
- **Error display:** Login and register pages already read `searchParams.error` and display it — compatible with the redirect-with-query-params pattern.
- **Files modified:** `src/actions/auth.ts`
- **Commit:** d36f0fe (included in main task commit)

**2. [Rule 3 - Deviation] Used Next.js 16 async searchParams**
- **Found during:** Reading Next.js 16 docs per AGENTS.md instruction before writing page files
- **Issue:** Next.js 16 changed `searchParams` from a synchronous object to a `Promise`. The plan's page code used the old synchronous pattern (`searchParams.error` directly).
- **Fix:** All three auth pages are `async` functions that `await searchParams` before accessing fields.
- **Files modified:** All three `(auth)` page files
- **Commit:** d36f0fe

## TypeScript Compile Result

```
npx tsc --noEmit
# Exit 0, no output — clean
```

## Dev Server Smoke Test

Dev server starts successfully. HTTP routes return 500 because `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are empty in `.env.local` — the Supabase project has not yet been connected. This is expected for the foundation phase; all auth pages render only after real Supabase credentials are added.

**To complete setup:** Fill in `.env.local` with values from the Supabase Dashboard > Settings > API.

## What Phase 2 Needs to Know

1. **DAL pattern:** Import `getCurrentUser` or `requireRole` from `@/lib/dal/auth`. Call `requireRole('student')` at the top of every student Server Action. Use `getCurrentUser()` to get the user ID for DB queries.
2. **New DAL files:** Create `src/lib/dal/student.ts`, `src/lib/dal/assessment.ts` following the same pattern — `const supabase = await createClient()` inside each function, always call `getCurrentUser()` first.
3. **Role redirects:** After student onboarding completes, redirect to `/student/dashboard`. The layout for `(student)/layout.tsx` should call `requireRole('student')` to guard the entire student route group.
4. **searchParams is async:** All Next.js 16 page components must `await searchParams` and `await params` — synchronous access is deprecated.
5. **signUpAction redirects to onboarding:** Students go to `/student/onboarding`, hospitals to `/hospital/onboarding` — these pages need to be built in Phase 2 / Phase 3.

## Known Stubs

None — all files are fully implemented. The auth pages display properly once Supabase credentials are set.

## Threat Flags

No new security surface introduced beyond what is documented in the plan's threat model.

## Self-Check: PASSED

- All 8 files exist on disk: FOUND
- Commit d36f0fe exists in git log: FOUND
- `npx tsc --noEmit` exits 0: PASS
