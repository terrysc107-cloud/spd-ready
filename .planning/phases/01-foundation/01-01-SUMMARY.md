---
phase: 01-foundation
plan: 01
subsystem: scaffold
tags: [next.js, supabase, tailwind, shadcn, auth, route-groups]
dependency_graph:
  requires: []
  provides: [supabase-ssr-clients, route-groups, session-middleware, shadcn-ui]
  affects: [all subsequent plans]
tech_stack:
  added:
    - next@16.2.4
    - "@supabase/ssr@0.10.x"
    - "@supabase/supabase-js@2.x"
    - react-hook-form
    - "@hookform/resolvers"
    - zod
    - resend
    - posthog-js
    - "@posthog/next"
    - shadcn/ui (button, input, label, card, select, badge)
  patterns:
    - three-file supabase SSR client pattern
    - route group role guards with getUser()
    - Next.js 16 proxy convention (renamed from middleware)
key_files:
  created:
    - spd-ready/src/lib/supabase/server.ts
    - spd-ready/src/lib/supabase/client.ts
    - spd-ready/src/lib/supabase/middleware.ts
    - spd-ready/src/proxy.ts
    - "spd-ready/src/app/(marketing)/layout.tsx"
    - "spd-ready/src/app/(marketing)/page.tsx"
    - "spd-ready/src/app/(auth)/layout.tsx"
    - "spd-ready/src/app/(auth)/login/page.tsx"
    - "spd-ready/src/app/(auth)/register/page.tsx"
    - "spd-ready/src/app/(auth)/reset-password/page.tsx"
    - "spd-ready/src/app/(student)/layout.tsx"
    - "spd-ready/src/app/(student)/dashboard/page.tsx"
    - "spd-ready/src/app/(hospital)/layout.tsx"
    - "spd-ready/src/app/(hospital)/dashboard/page.tsx"
    - "spd-ready/src/app/(admin)/layout.tsx"
    - "spd-ready/src/app/(admin)/dashboard/page.tsx"
    - spd-ready/src/app/unauthorized/page.tsx
    - spd-ready/.env.local
    - spd-ready/next.config.ts
    - spd-ready/components.json
  modified:
    - spd-ready/src/app/globals.css (cursor fix + shadcn theme)
    - spd-ready/src/app/layout.tsx (SPD Ready metadata)
decisions:
  - "Next.js 16.2.4 installed (create-next-app@latest). Plan specified Next.js 15 but 16 is latest stable. Next.js 16 renamed middleware.ts convention to proxy.ts — applied this change."
  - "src/middleware.ts renamed to src/proxy.ts per Next.js 16 convention. Export function renamed from 'middleware' to 'proxy'. Functionality identical."
  - "Removed default src/app/page.tsx (create-next-app scaffold) to avoid route conflict with (marketing)/page.tsx at /."
  - "Role guard pattern in layouts: getUser() + user.app_metadata?.role — Plan 03 must follow same pattern for auth actions."
metrics:
  duration: "~25 minutes"
  completed: "2026-04-21"
  tasks_completed: 3
  files_created: 42
---

# Phase 1 Plan 01: Project Scaffold & Supabase Client Setup Summary

Next.js 16 app scaffolded with three-file @supabase/ssr client pattern, five route groups with role guards reading app_metadata, and shadcn/ui initialized with core components.

## What Was Built

A complete runnable Next.js scaffold that all subsequent plans build upon:

- **Three Supabase SSR client files** — `server.ts` (async cookies, Server Components), `client.ts` (createBrowserClient singleton, Client Components), `lib/supabase/middleware.ts` (two-direction token refresh for the proxy)
- **`src/proxy.ts`** — Next.js 16 session-refreshing proxy (renamed from middleware per Next.js 16 convention) with matcher covering all non-static routes
- **Five route groups** with placeholder pages: `(marketing)`, `(auth)`, `(student)`, `(hospital)`, `(admin)`
- **Role guards in protected layouts** — each of student/hospital/admin layouts calls `getUser()` (never `getSession()`), reads `user.app_metadata?.role`, and redirects to `/unauthorized` on mismatch
- **`src/app/unauthorized/page.tsx`** — access denied page with login link
- **shadcn/ui initialized** with button, input, label, card, select, badge components
- **Tailwind v4 cursor fix** added to `globals.css`
- **`.env.local` template** with all 5 required variable names (values blank)
- **`next.config.ts`** with PostHog `/ingest` proxy rewrite

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Next.js 16 middleware → proxy rename**
- **Found during:** Task 3 verification (dev server deprecation warning)
- **Issue:** `create-next-app@latest` installed Next.js 16.2.4 (plan specified "15"). Next.js 16 deprecated the `middleware.ts` file convention in favor of `proxy.ts`, and the exported function name changed from `middleware` to `proxy`.
- **Fix:** Created `src/proxy.ts` exporting `proxy()` function. Removed `src/middleware.ts`. The `@supabase/ssr` internal utility file (`src/lib/supabase/middleware.ts`) was NOT renamed — it is not a Next.js file convention, just an internal module.
- **Commit:** dbe3e88

**2. [Rule 3 - Blocking] Removed conflicting root page.tsx**
- **Found during:** Task 3 setup
- **Issue:** `create-next-app` generates `src/app/page.tsx`. This conflicts with `src/app/(marketing)/page.tsx` which also serves `/`. Both cannot serve the same route.
- **Fix:** Deleted the generated `src/app/page.tsx`. The landing page is exclusively in `(marketing)/page.tsx`.
- **Commit:** dbe3e88

## Verification Results

```
✓ npx tsc --noEmit — exits 0, no errors
✓ package.json contains @supabase/ssr
✓ package.json does NOT contain auth-helpers-nextjs (count: 0)
✓ Three Supabase client files exist
✓ src/lib/supabase/middleware.ts uses getUser(), writes to both request and response cookies
✓ All role layouts use getUser() + app_metadata?.role
✓ globals.css contains cursor: pointer fix
✓ .env.local documents all 5 required env vars
✓ Dev server starts (500 expected — Supabase keys blank in .env.local)
✓ No Next.js deprecation warnings after proxy.ts rename
```

## What Plan 03 Needs to Know

1. **Proxy file is `src/proxy.ts`** (not `src/middleware.ts`) — Next.js 16 convention. The exported function is `proxy`, not `middleware`.

2. **Role guard pattern established** — layouts call `createClient()` from `@/lib/supabase/server`, then `supabase.auth.getUser()`, then read `user.app_metadata?.role`. Plan 03 server actions must follow the same `getUser()` pattern — never `getSession()`.

3. **Role is stored in `app_metadata.role`** (not `user_metadata`) — must be set server-side via service role key at signup. Plan 03 signup action needs `SUPABASE_SERVICE_ROLE_KEY` to call `supabase.auth.admin.updateUserById()`.

4. **Auth redirect paths**: unauthenticated → `/login`; wrong role → `/unauthorized`; authenticated visiting `/login|/register|/reset-password` → `/dashboard` (currently a dead route — Plan 03 should add a `/dashboard` redirect page that sends users to their role-specific dashboard).

5. **`.env.local` values are blank** — user must fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard before Plan 03 auth forms can work.

## Known Stubs

All role dashboard pages (`(student)/dashboard`, `(hospital)/dashboard`, `(admin)/dashboard`) and auth pages (`login`, `register`, `reset-password`) are explicit placeholders. They render static text indicating which plan implements them. This is intentional — they exist to confirm routes are wired, not to render real UI.

## Threat Flags

None — all files in this plan align with the plan's threat model. `SUPABASE_SERVICE_ROLE_KEY` has no `NEXT_PUBLIC_` prefix, `getSession()` is not used anywhere, and role reads come from `app_metadata` (server-controlled).

## Self-Check: PASSED

All 14 key files verified present on disk. Commit dbe3e88 confirmed in git log. TypeScript compiles clean (exit 0). No missing items.
