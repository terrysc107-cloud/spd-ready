# Technology Stack: SPD Ready

**Project:** SPD Ready — Sterile Processing Student Readiness & Externship Placement
**Researched:** 2026-04-20
**Sources:** Context7 (Supabase SSR, Next.js, shadcn/ui, Resend, PostHog), npm registry, official docs

---

## Verdict on Planned Stack

The planned stack is well-chosen and confirmed. One meaningful upgrade is recommended: use **Next.js 15** instead of 14. The `@supabase/ssr` library has already adopted the async `cookies()` API from Next.js 15, meaning all official Supabase documentation and code examples are written for Next.js 15. Building on Next.js 14 today means writing code that contradicts official Supabase patterns and will need migration soon.

---

## Recommended Stack (Confirmed + Adjusted)

### Core Framework

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Next.js | **15.5.15** (latest stable) | Full-stack framework, App Router, Server Actions | HIGH — Context7 verified, npm confirmed |
| React | **19.x** (bundled with Next 15) | UI layer | HIGH |
| TypeScript | **5.x** | Type safety throughout | HIGH |

**Why Next.js 15 over 14:** The `@supabase/ssr` package uses `await cookies()` in all current documentation. This is the Next.js 15 async cookies API. Starting on Next.js 14 means fighting against official patterns from day one. Next.js 15 is stable and widely deployed as of April 2026. The project constraint says "Next.js 14 App Router" — this should be updated to "Next.js 15 App Router" before build starts.

### Authentication and Database

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Supabase (hosted) | Latest cloud | Postgres DB, Auth, Storage, RLS | HIGH |
| @supabase/supabase-js | **2.104.0** | Supabase JS client | HIGH — npm confirmed |
| @supabase/ssr | **0.10.2** | SSR-safe client for Next.js (server components, middleware, route handlers) | HIGH — Context7 verified |

**Do not use** `@supabase/auth-helpers-nextjs` — this package is deprecated. `@supabase/ssr` is the current official package.

### UI and Styling

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Tailwind CSS | **4.x** (v4.2.3) | Utility CSS | HIGH — npm confirmed |
| shadcn/ui CLI | **4.3.1** | Component scaffolding (copies components into your repo) | HIGH — Context7 verified |
| Radix UI | (installed via shadcn) | Accessible primitives behind shadcn components | HIGH |

**Important shadcn/ui note:** shadcn/ui is not installed as a dependency. The CLI copies component source files into your project. Initialize with:
```bash
npx shadcn@latest init -t next
npx shadcn@latest add button card form input label select badge
```

**Tailwind v4 cursor fix required** — add to `globals.css`:
```css
@layer base {
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}
```
Tailwind v4 changed the default button cursor behavior; shadcn components need this fix.

### Transactional Email

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Resend | **6.12.2** | Transactional email (placement notifications, magic links) | HIGH — Context7 verified |

Use from Next.js Route Handlers or Server Actions. Do not call from client components.

### Analytics

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| posthog-js | **1.369.3** | Client-side analytics, session recording | HIGH — Context7 verified |
| @posthog/next | **0.1.0** | PostHog Next.js App Router wrapper | HIGH — Context7 verified |

Use `@posthog/next` (not just `posthog-js`) for App Router. Wrap root layout with `PostHogProvider` and include `PostHogPageView` for automatic SPA route tracking.

### Deployment

| Technology | Purpose | Confidence |
|------------|---------|------------|
| Vercel | Hosting, zero-config Next.js deployment | HIGH |

---

## Supporting Libraries

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| zod | 4.3.6 | Schema validation for forms and Server Actions | Required with react-hook-form |
| react-hook-form | 7.73.1 | Form state management | Use with zod resolver via @hookform/resolvers |
| @hookform/resolvers | latest | Connects zod schemas to react-hook-form | Install alongside react-hook-form |
| lucide-react | latest | Icons (shadcn default icon set) | Installed automatically by shadcn |

---

## Key Package Install Commands

```bash
# Create project
npx create-next-app@latest spd-ready --typescript --tailwind --app --src-dir --import-alias "@/*"

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Email and analytics
npm install resend posthog-js @posthog/next

# Forms and validation
npm install react-hook-form @hookform/resolvers zod

# Initialize shadcn (interactive - picks up project config)
npx shadcn@latest init -t next
```

---

## Critical Setup Patterns

### 1. Supabase Client Factory Files

Create three separate utility files. Never reuse the same client across contexts.

**`lib/supabase/middleware.ts`** — used only in `middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: call getUser() to refresh session tokens
  const { data: { user } } = await supabase.auth.getUser()

  // Route protection by role
  const path = request.nextUrl.pathname
  if (!user && (path.startsWith('/student') || path.startsWith('/hospital') || path.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
```

**`lib/supabase/server.ts`** — used in Server Components and Route Handlers:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()  // async in Next.js 15

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component — middleware handles refresh
          }
        },
      },
    }
  )
}
```

**`lib/supabase/client.ts`** — used only in Client Components (`'use client'`):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  // isSingleton: true by default — safe to call multiple times
}
```

### 2. Middleware (Required — Not Optional)

`middleware.ts` at the project root is mandatory. Without it, session tokens do not refresh between Server Component renders and users get logged out unexpectedly.

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 3. Role-Based Access: Three-Layer Approach

SPD Ready has three roles (student, hospital, admin). Enforce at all three layers:

**Layer 1 — Middleware route guard** (coarse, fast):
```typescript
// In updateSession() above — redirect unauthenticated users
// Add role check for /admin routes:
if (user && path.startsWith('/admin')) {
  const role = user.app_metadata?.role
  if (role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
}
```

**Layer 2 — Server Component check** (per-page enforcement):
```typescript
// app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()  // verified, not from cache
  
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/unauthorized')
  }
  // render admin page
}
```

**Layer 3 — RLS policies in Postgres** (database enforcement):
```sql
-- Students can only see their own assessment data
create policy "students_own_assessments"
on student_assessments for select
to authenticated
using (student_user_id = auth.uid());

-- Hospitals can see applications to their own openings
create policy "hospitals_see_own_applications"
on applications for select
to authenticated
using (
  externship_id in (
    select id from externship_openings
    where hospital_user_id = auth.uid()
  )
);

-- Admin role check via app_metadata
create policy "admin_full_access_student_profiles"
on student_profiles for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
```

### 4. Role Storage Strategy

Store user roles in `app_metadata` (not `user_metadata`). `app_metadata` cannot be modified by the user themselves — only by the service role key.

Set role at signup via a Supabase Edge Function triggered by `auth.users` insert, or via the Admin API:
```typescript
// Server Action or API route with service role key
const supabaseAdmin = createClient(url, SERVICE_ROLE_KEY)
await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'student' }  // or 'hospital' or 'admin'
})
```

Access in RLS policies:
```sql
(select auth.jwt() -> 'app_metadata' ->> 'role') = 'hospital'
```

### 5. getUser() vs getSession() — Critical Security Distinction

- **`supabase.auth.getUser()`** — contacts the Supabase Auth server, verifies the JWT is valid and not revoked. Use for all authorization decisions in Server Components, Server Actions, and Route Handlers.
- **`supabase.auth.getSession()`** — reads JWT from cookie without server verification. The user object is unverified. Use only for non-sensitive display (e.g., showing a user's name in the UI).

Never use `getSession()` to gate access to protected resources.

### 6. PostHog Setup for App Router

```typescript
// app/layout.tsx
import { PostHogProvider, PostHogPageView } from '@posthog/next'
import { Suspense } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider
          apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY!}
          clientOptions={{ api_host: '/ingest' }}
          bootstrapFlags
        >
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
```

Add to `next.config.ts` for proxying (avoids ad blockers):
```typescript
rewrites: async () => [{
  source: '/ingest/:path*',
  destination: 'https://app.posthog.com/:path*',
}]
```

---

## What NOT to Do

| Anti-Pattern | Why | What to Do Instead |
|-------------|-----|--------------------|
| Use `@supabase/auth-helpers-nextjs` | Deprecated package | Use `@supabase/ssr` |
| Use `supabase.auth.getSession()` for authorization | Returns unverified JWT — can be spoofed | Use `supabase.auth.getUser()` |
| Skip `middleware.ts` | Sessions stop refreshing; users randomly log out | Always implement middleware that calls `getUser()` |
| Store role in `user_metadata` | Users can update their own `user_metadata` — a student could make themselves admin | Store role in `app_metadata` only |
| One Supabase client for all contexts | Server client used in browser causes errors; browser client used server-side loses cookies | Three separate factory files (middleware / server / client) |
| Build on Next.js 14 with current `@supabase/ssr` | `@supabase/ssr` docs use async `cookies()` which is Next.js 15 API | Start on Next.js 15 |
| Install Tailwind v4 then skip cursor fix | shadcn buttons show `cursor: default` on hover | Add cursor fix to `globals.css` |
| Use Server Actions for Supabase reads | Server Actions add unnecessary overhead for reads | Fetch in Server Components directly; use Server Actions only for mutations |
| Use `posthog-js` directly in App Router without `@posthog/next` | SPA route changes not tracked; manual pageview wiring required | Use `@posthog/next` wrapper package |

---

## Environment Variables Required

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # server-only, never expose to client

RESEND_API_KEY=re_your_key

NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

`SUPABASE_SERVICE_ROLE_KEY` must never be in a `NEXT_PUBLIC_` prefixed variable and must never be used in Client Components.

---

## Alternatives Considered and Rejected

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 App Router | Remix, SvelteKit | Vercel/Supabase ecosystem alignment; Claude Code works best with Next.js patterns |
| Auth | Supabase Auth | Auth.js (NextAuth), Clerk | Already paying for Supabase; Clerk adds cost; Auth.js requires separate DB setup |
| UI Components | shadcn/ui + Tailwind v4 | MUI, Mantine, Chakra | shadcn owns the code in your repo — no runtime dependency; Tailwind v4 is faster and cleaner |
| Email | Resend | SendGrid, Postmark | Resend has React email templates, simpler DX, developer-first |
| Analytics | PostHog | Mixpanel, Amplitude | PostHog is open-source-first, cheaper at this scale, has feature flags for later |
| ORM | Direct Supabase client queries | Prisma, Drizzle | Supabase client already provides typed queries via generated types; Prisma adds complexity without benefit when Supabase handles schema |

---

## Confidence Summary

| Area | Confidence | Basis |
|------|------------|-------|
| Next.js 15 recommendation | HIGH | npm versions confirmed; Next.js 15 upgrade docs verified via Context7 |
| @supabase/ssr patterns | HIGH | Official Context7 docs; package version confirmed |
| Role storage in app_metadata | HIGH | Supabase official docs via Context7 |
| RLS policy patterns | HIGH | Context7 verified with SQL examples |
| shadcn/ui + Tailwind v4 | HIGH | Context7 confirmed compatibility and cursor fix |
| Resend integration pattern | HIGH | Context7 verified with Next.js Route Handler example |
| PostHog @posthog/next | HIGH | Context7 verified with App Router layout example |
| getUser() vs getSession() security | HIGH | Explicitly documented in @supabase/ssr official docs |
