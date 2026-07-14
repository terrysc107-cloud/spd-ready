# Repo Inventory — SPD Ready

> **Phase 2 deliverable.** Ground-truth snapshot of every page, component, asset, and config in the current repo. Used as the "current state" column in `gap-analysis.md` and as the file map for `rebuild-plan.md`.

Repo root in this audit: `/home/user/spd-ready/spd-ready/` (nested one level under the cloned outer dir; the outer dir holds only `CLAUDE.md`, `spd_ready_planning_handoff.md`, and `.planning/`).

---

## 2.1 Stack & architecture

### Versions (from `package.json`)

| Package | Version | Notes |
|---|---|---|
| `next` | **16.2.4** | Newer than CLAUDE.md claims (15). Middleware renamed to `proxy.ts`. |
| `react`, `react-dom` | **19.2.4** | Concurrent + Server Components default |
| `typescript` | ^5 | strict mode on |
| `tailwindcss` | ^4 | PostCSS-first; **no `tailwind.config.ts` file** |
| `@tailwindcss/postcss` | ^4 | the only Tailwind plugin wired in `postcss.config.mjs` |
| `shadcn` | ^4.4.0 | CLI / registry tooling. `style: base-nova`, `baseColor: neutral` |
| `@base-ui/react` | ^1.4.1 | Radix successor used under shadcn `base-nova`. Powers Button/Input/Select/Progress/Separator/Badge. |
| `lucide-react` | ^1.8.0 | Icon library; declared in `components.json` |
| `@supabase/ssr` | ^0.10.2 | Correct lib per CLAUDE.md (NOT auth-helpers) |
| `@supabase/supabase-js` | ^2.104.0 | |
| `class-variance-authority` | ^0.7.1 | Used in Button + Badge |
| `clsx`, `tailwind-merge` | ^2.1.1 / ^3.5.0 | Composed in `src/lib/utils.ts` as `cn()` |
| `tw-animate-css` | ^1.4.0 | Imported globally; used for `animate-pulse` and base-ui animations |
| `react-hook-form` + `zod` + `@hookform/resolvers` | 7.73 / 4.3 / 5.2 | Installed; usage spotty (see §2.3 page inventory) |
| `resend` | ^6.12.2 | Email — wired in `src/lib/email.ts` |
| `posthog-js` + `@posthog/next` | 1.369 / 0.1 | Installed but no provider mount detected at root layout |
| `jest` + `ts-jest` + `@types/jest` | 30/29/30 | Two test files only |

### Package manager

- **npm** (`package-lock.json` is 379KB). `node_modules` is not installed in this container.
- Scripts: `dev`, `build`, `start` only. No `lint`, no `test` shortcut, no `typecheck`.

### Folder map (3 levels)

```
/home/user/spd-ready/spd-ready/
├── audit/                              ← this audit (new in this pass)
├── public/
│   ├── favicon.ico (lives at src/app/favicon.ico, NOT here — see Asset Audit §2.4)
│   ├── file.svg, globe.svg, next.svg, vercel.svg, window.svg  (Next.js scaffold defaults)
│   └── instruments/
│       └── 8 surgical-instrument SVGs (army-navy-retractor, box-lock-detail, kelly-hemostat, …)
├── scripts/
│   └── seed-test-users.mjs
├── src/
│   ├── actions/                        (8 Server Action modules)
│   ├── app/                            (Next.js App Router — see §2.3)
│   ├── components/
│   │   ├── ui/                         (8 shadcn primitives — see §2.2)
│   │   ├── brand/Logo.tsx
│   │   ├── student/                    (11 domain components)
│   │   └── hospital/                   (4 domain components)
│   ├── lib/
│   │   ├── dal/                        (10 data-access modules)
│   │   ├── local-db/                   (8 in-memory stores — see note below)
│   │   ├── supabase/
│   │   │   ├── server.ts
│   │   │   ├── client.ts
│   │   │   └── middleware.ts
│   │   ├── email.ts
│   │   └── utils.ts                    (cn() helper)
│   └── proxy.ts                        (was middleware.ts before Next.js 16)
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   └── migrations/                     (6 SQL migrations — see §2.6)
├── tests/
│   ├── scoring.test.ts
│   └── assessment.test.ts
├── components.json                     (shadcn config)
├── next.config.ts                      (PostHog rewrite only)
├── postcss.config.mjs                  (@tailwindcss/postcss only)
├── tsconfig.json                       (strict, @/* → ./src/*)
├── jest.config.js
├── package.json
├── package-lock.json
├── AGENTS.md                           ("This is NOT the Next.js you know")
├── CLAUDE.md                           (imports @AGENTS.md)
└── README.md
```

### Notable architecture observations

- **`src/lib/local-db/`** holds 8 in-memory stores (questions, domain-map, error-categories, concepts, hld-questions, etc.). Phase 6 (Learning Engine + Intern Companion) appears to use these stores rather than database tables — only migrations 001–006 exist, and none add learning-engine schemas. **This is not a UI/UX audit finding directly, but it means the Phase 6 features (mastery, Likert, ROI, certificates) are not persisted across deploys and re-seed on every server start.** Flag for the engineering owner.
- **`@/*` path alias** mapped to `./src/*` in `tsconfig.json`. All imports use it.
- **No global `loading.tsx`, `error.tsx`, or catch-all `not-found.tsx`** at the app root. Loading and error states fall back to Next.js defaults (blank).
- **`next.config.ts` is minimal** — only contains a PostHog `/ingest` rewrite. No `images.domains`, no security headers, no rewrites for marketing aliases.
- **AGENTS.md sets a guardrail** ("Read the relevant guide in `node_modules/next/dist/docs/`") — but `node_modules` isn't installed in this container, so cross-checking against vendor docs is not possible from here.

---

## 2.2 Component inventory

### shadcn primitives — `src/components/ui/`

All eight wrap `@base-ui/react` and use `cn()` + CVA. Source dumps are in the appendix per file.

| File | Lines | Purpose | Reusability | Notes |
|---|---|---|---|---|
| `button.tsx` | 59 | Button primitive — base-ui Button + CVA variants | True primitive | **6 variants** (default, outline, secondary, ghost, destructive, link) × **8 sizes** (xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg). **Default height is 32px (h-8)** — small by premium-SaaS standards; below the 44px mobile touch target. |
| `card.tsx` | 104 | Card + CardHeader/Title/Description/Action/Content/Footer | True primitive | Uses `ring-1 ring-foreground/10` (not `border`) — visually subtle. Two sizes (default, sm) via data attribute. |
| `input.tsx` | 21 | Text input | True primitive | **h-8 default** (32px). Single component — no error-message slot, no helper text slot. Validation styling is `aria-invalid:*` only. |
| `label.tsx` | 21 | Form label | True primitive | `text-sm leading-none font-medium`. No required-indicator slot. |
| `badge.tsx` | 53 | Badge with CVA + `useRender` (polymorphic) | True primitive | **6 variants** (default, secondary, destructive, outline, ghost, link). Height fixed at `h-5` (20px). |
| `progress.tsx` | 84 | Progress bar + Track + Indicator + Label + Value | True primitive | Compound (5 exports). Track is h-1 (very thin). |
| `select.tsx` | 202 | Select + 9 sub-exports (Trigger/Content/Item/Group/Label/Value/Separator/ScrollUp/ScrollDown) | True primitive | Uses base-ui Select with Portal + Positioner; Lucide icons (ChevronDown/Up/Check). |
| `separator.tsx` | 26 | Horizontal/vertical separator | True primitive | |

**Missing from the primitive set** (needed for the rebuild — see `rebuild-plan.md` §5.2):
- Dialog / Sheet (no modal primitive)
- Toast / Sonner (no notification primitive)
- Tooltip
- Tabs
- Accordion (FAQ in marketing rebuild)
- Skeleton (loading placeholders)
- Form (with FormField, FormError, FormDescription wrappers)
- Avatar
- Alert
- DropdownMenu
- Table (data-density-aware table primitive — hospital surfaces need it)

### Brand — `src/components/brand/`

| File | Lines | Purpose | Notes |
|---|---|---|---|
| `Logo.tsx` | 63 | Shield-with-checkmark SVG inlined + wordmark "SPD Ready / Readiness Platform" | Inline SVG, hardcoded `oklch(0.32 0.09 222)` and `oklch(0.62 0.18 200)` fills (no token references); sizes `sm/md/lg`; variants `dark/light`. **No standalone `.svg` file** in `public/` — see CF-03. |

### Student domain — `src/components/student/`

(Inventory from the student/hospital/admin agent synthesis. Component-by-component verbatim source not duplicated here for brevity.)

| File | Purpose | Reusability |
|---|---|---|
| `AssessmentQuestion.tsx` | Per-question form wrapper using `useFormStatus` | Partial — assessment-specific |
| `AssignedModuleCard.tsx` | Card for assigned learning module | Partial |
| `CategoryScoreBar.tsx` | CSS-only width bar (Server Component, no recharts) | Partial — used across dashboards |
| `CertificateList.tsx` | List renderer for mock CE certs | One-off |
| `ConfidenceTapPrompt.tsx` | Likert confidence tap UI | One-off |
| `KnowledgeConfidenceDelta.tsx` | Knowledge vs. confidence comparison | One-off |
| `LikertSelfAssessment.tsx` | 5-point Likert input | Partial |
| `MasteryCard.tsx` | Mastery metric display | One-off |
| `OnboardingForm.tsx` | Multi-step student profile form | One-off — uses raw inputs, not Input primitive |
| `StudyQuiz.tsx` | 10-question batch quiz wrapper | One-off |
| `TierBadge.tsx` | Readiness tier badge (Tier 1/2/3) | True primitive — should be exported as part of design system |

### Hospital domain — `src/components/hospital/`

| File | Purpose | Reusability |
|---|---|---|
| `AddStudentForm.tsx` | Enroll student into cohort | One-off |
| `AssignModuleForm.tsx` | Assign learning module to a cohort student | One-off |
| `CohortTable.tsx` | Cohort roster table | Partial — table pattern repeated elsewhere |
| `ROIProjection.tsx` | OhioHealth-grounded ROI panel | One-off |

### Duplication / near-duplication flags (per app-surface agent synthesis)

- `selectClass` (long Tailwind chain for native select styling) duplicated in `/hospital/onboarding`, `/hospital/openings/new`, `/applications`, `/openings`. ~200+ lines of duplicated string. Extract to `src/lib/ui/form-classes.ts` or, better, use the `Select` primitive.
- Status-variant `Record<>` maps (Application status, fit-score variant) duplicated across same four files. Should be a single `STATUS_VARIANT_MAP` export.
- Conic-gradient + inline-style score rings duplicated in `/student/dashboard` and `/student/results`. Extract to a `<ScoreRing score={n} tier={t} />` component.
- Tier color literals (`oklch(0.45 0.18 150)`, `green-500`, `amber-500`, `red-400`) appear in `/admin/dashboard`, `/hospital/candidates`, `/hospital/dashboard`, `/student/dashboard`, `/student/results` — mixed scales. Unify via tier tokens.

---

## 2.3 Page inventory

38 page files across 5 route groups. Counts and tree below.

### Route group structure

```
src/app/
├── layout.tsx                          (root: <html>, body, fonts, metadata — 32 lines)
├── globals.css                         (Tailwind v4 @theme + :root tokens — 146 lines)
├── favicon.ico                         (Next.js convention)
├── api/                                (server routes; not enumerated below)
├── auth/                               (Supabase auth callback — Next.js technical route, not a group)
├── unauthorized/page.tsx               (role-mismatch fallback)
│
├── (marketing)/
│   ├── layout.tsx
│   └── page.tsx                        ★ 515 lines — primary landing, see §2.3.1
│
├── (auth)/
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── reset-password/page.tsx
│
├── (student)/
│   ├── layout.tsx                      (student shell + mobile nav)
│   └── student/
│       ├── dashboard/page.tsx
│       ├── profile/page.tsx
│       ├── onboarding/page.tsx
│       ├── assessment/page.tsx
│       ├── assessment/start/page.tsx
│       ├── assessment/[assessmentId]/[step]/page.tsx
│       ├── applications/page.tsx
│       ├── openings/page.tsx
│       ├── results/page.tsx
│       ├── study/page.tsx
│       ├── study/[domain]/page.tsx
│       ├── study/[domain]/results/page.tsx
│       ├── learning/page.tsx
│       └── learning/[domain]/page.tsx
│
├── (hospital)/
│   ├── layout.tsx
│   └── hospital/
│       ├── dashboard/page.tsx
│       ├── profile/page.tsx
│       ├── onboarding/page.tsx
│       ├── candidates/page.tsx
│       ├── candidates/[studentId]/page.tsx
│       ├── cohort/page.tsx
│       ├── cohort/roi/page.tsx
│       ├── cohort/[studentId]/page.tsx
│       ├── openings/page.tsx
│       ├── openings/new/page.tsx
│       ├── openings/[id]/page.tsx
│       └── openings/[id]/candidates/[appId]/page.tsx
│           └── feedback/page.tsx
│
└── (admin)/
    ├── layout.tsx
    └── admin/dashboard/page.tsx
```

### 2.3.1 Marketing landing — `src/app/(marketing)/page.tsx`

515 lines. Already richly structured. Sections in order:

| # | Section | Lines | Highlights |
|---|---|---|---|
| 1 | Nav | 9–22 | Sticky, `bg-white/80 backdrop-blur-sm`. Logo left, "Sign in" + "Get started free" right. No center nav links. |
| 2 | Hero | 25–74 | `.brand-gradient` bg, "The placement gap ends here." headline, dual CTA, 4-stat grid (8/2/3/6). Uses `bg-[oklch(0.62_0.18_200)]` literal at line 32. |
| 3 | Problem | 77–109 | Two emoji cards (🏥 / 🎓) + synthesis call-out. Uses `oklch()` literals at lines 93, 103. |
| 4 | How It Works | 112–154 | 3 numbered cards with emoji 📚 / 📊 / 🏥. `oklch()` literals lines 128, 142. |
| 5 | Dual Score | 157–230 | Two cards (Readiness / Judgment) with weighted breakdowns. `oklch()` literals lines 198, 216. |
| 6 | For Students | 233–291 | 6-card feature grid with emoji 🎯 ⚡ 🔥 📈 🧠 🏥. CTA button at end. |
| 7 | For Hospitals | 294–389 | 4-bullet list + mock candidate card. Mock card has `text-[oklch(0.45_0.18_150)]` literals lines 347, 348, 363, 371. |
| 8 | Tier Explainer | 392–447 | 3 tier rows using `.tier-1-bg/.tier-2-bg/.tier-3-bg` classes (correct token pattern). |
| 9 | OhioHealth-validated | 450–476 | 4-stat band: +41pp / +29pp / 40% / $500k. Uses inline `<OHStat>` component (lines 516–524) — should be extracted. |
| 10 | Footer CTA | 479–510 | `.brand-gradient` bg, dual CTA. **No actual site footer (links / legal / social)** below this band. |

**Quality summary for landing:**
- Pros: Real content, dual-persona pitch, OhioHealth credibility band, clear hero copy.
- Issues: Emoji-driven hierarchy, inline `oklch()` literals scattered (CF-02), no real footer, no FAQ accordion, no testimonials, mock candidate card hardcoded inline.

### 2.3.2 Auth pages — `src/app/(auth)/*`

(Detailed source dump pending the marketing+auth agent's completion. Section will be updated when it returns. Initial observations:)

- `(auth)/layout.tsx` wraps with shared auth-card surface
- Three pages: `login`, `register`, `reset-password`
- Register has `?role=student|hospital` query param (set from landing CTA)
- Forms use Server Actions, redirect-with-query-params on errors (per STATE.md decision log)
- Next.js 16 async `searchParams` awaited (per STATE.md note)

### 2.3.3 Student surfaces

All shipped. Per student/hospital/admin agent synthesis:

- **dashboard** — primary post-login. Streak, score ring, domain progress grid. Uses conic-gradient inline-style.
- **profile** — view + `?edit=true` edit mode. Uses OnboardingForm.
- **onboarding** — multi-step student profile (first/last name, location, radius, cert, program, availability, transportation, environment).
- **assessment / assessment/start / assessment/[id]/[step]** — 30-question flow with per-question resumability (`useFormStatus` pattern).
- **applications** — student application status list (applied / under_review / accepted / waitlisted / rejected).
- **openings** — list of open externships.
- **results** — overall + per-category breakdown + top 2 strengths / bottom 2 growth + tier.
- **study + study/[domain] + study/[domain]/results** — Phase 6 study mode (StudyQuiz + ConfidenceTapPrompt).
- **learning + learning/[domain]** — Phase 6 mastery dashboard with Likert self-assessment.

### 2.3.4 Hospital surfaces

- **dashboard** — overview cards. Uses tier-color emoji.
- **profile + onboarding** — hospital site profile setup and edit.
- **candidates + candidates/[id]** — ranked candidate list per opening + full candidate readiness profile.
- **cohort + cohort/[id] + cohort/roi** — Phase 6 cohort management, per-student detail, ROI projection panel.
- **openings + openings/new + openings/[id] + openings/[id]/candidates/[appId] + .../feedback** — opening CRUD + per-application candidate review + post-placement feedback.

### 2.3.5 Admin

- **admin/dashboard** — platform-wide counts (students, assessments, tier dist, hospitals, openings, applications, status breakdown).

### 2.3.6 Other

- **unauthorized/page.tsx** — fallback when role mismatch redirects.
- **No `not-found.tsx`** at app root — 404 falls back to Next.js generic page.
- **No global `loading.tsx`** — async route segments show blank during data fetch.
- **No `error.tsx`** at any segment — unhandled errors hit Next.js default error UI.

---

## 2.4 Asset audit

### `public/` contents

| File | Size | Type | Status |
|---|---|---|---|
| `file.svg` | 391 B | Default Next.js icon | Delete — unused |
| `globe.svg` | 1,035 B | Default Next.js icon | Delete — unused |
| `next.svg` | 1,375 B | Default Next.js wordmark | Delete — unused |
| `vercel.svg` | 128 B | Default Next.js triangle | Delete — unused |
| `window.svg` | 385 B | Default Next.js icon | Delete — unused |
| `instruments/army-navy-retractor.svg` | 1,493 B | Domain-relevant SVG | Keep — restyle to tokens |
| `instruments/box-lock-detail.svg` | 1,964 B | Domain-relevant SVG | Keep |
| `instruments/kelly-hemostat.svg` | 1,895 B | Domain-relevant SVG | Keep |
| `instruments/laparoscopic-grasper.svg` | 1,522 B | Domain-relevant SVG | Keep |
| `instruments/mayo-scissors.svg` | 1,663 B | Domain-relevant SVG | Keep |
| `instruments/needle-holder.svg` | 2,287 B | Domain-relevant SVG | Keep |
| `instruments/orthopedic-rongeur.svg` | 1,566 B | Domain-relevant SVG | Keep |
| `instruments/ratchet-mechanism.svg` | 1,870 B | Domain-relevant SVG | Keep |

**Favicon location:** `src/app/favicon.ico` (Next.js convention auto-detects this). Default Next.js favicon — not branded.

### Brand-asset readiness checklist

| Asset | Required for | Present? |
|---|---|---|
| `logo.svg` (primary, full color) | Marketing, email, OG | ❌ — inline in Logo.tsx only |
| `logo-mono.svg` (single-color) | Footer, watermarks | ❌ |
| `logo-mark.svg` (icon only, no wordmark) | Favicon source, app icons | ❌ |
| `favicon.ico` | Browser tab | ⚠️ Default Next.js, not branded |
| `favicon-32.png` / `favicon-16.png` | Browser tab raster fallback | ❌ |
| `apple-touch-icon.png` (180×180) | iOS home screen | ❌ |
| `android-chrome-192.png`, `android-chrome-512.png` | Android home screen | ❌ |
| `site.webmanifest` / `manifest.json` | PWA install metadata | ❌ |
| `og-image.png` (1200×630) | Slack/Twitter/LinkedIn previews | ❌ |
| `twitter-card.png` (optional, 1200×600) | Twitter large image | ❌ |
| `robots.txt` | Search engine crawl rules | ❌ |
| `sitemap.xml` | SEO crawlability | ❌ |
| `browserconfig.xml` | Windows tile | ❌ |

Severity: **P0 for `logo.svg`, `og-image.png`, `apple-touch-icon`. P1 for the rest.** See `critical-findings.md` CF-03 and `rebuild-plan.md` §5.4.

### Fonts

- **Geist Sans** + **Geist Mono** declared in `src/app/layout.tsx` via `next/font/google`. These self-host on Vercel for zero-CLS loading.
- **Bug:** `--font-sans` is self-referenced in `globals.css:10` and is undefined at runtime — see CF-01.

---

## 2.5 Design system status

### Single source of design tokens: `src/app/globals.css` (146 lines)

Structure:

```
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background / --color-foreground / ... (~30 shadcn-compatible color tokens)
  --font-sans  ← BROKEN (self-reference, see CF-01)
  --font-mono  ← correctly wired to --font-geist-mono
  --font-heading
  --radius-sm / md / lg / xl / 2xl / 3xl / 4xl (computed from --radius)
}

:root {                              ← Light mode tokens
  --background: oklch(0.98 0.003 220);
  --foreground: oklch(0.13 0.02 240);
  --primary: oklch(0.32 0.09 222);   ← deep blue
  --accent:  oklch(0.62 0.18 200);   ← cyan-teal
  --destructive: oklch(0.577 0.245 27.325);   ← red
  --radius: 0.75rem;
  --chart-1..5: 5 chart colors (cyan, green, gold, blue, red)
  --sidebar-* : 8 sidebar-scoped tokens (no sidebar component yet uses them)
}

.dark {                              ← Dark mode tokens (NEUTRAL gray — not brand-tied)
  --background: oklch(0.145 0 0);     ← pure gray, no hue
  --primary:   oklch(0.922 0 0);      ← near-white
  ...
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  html { @apply font-sans; }          ← resolves to undefined → browser default sans
  button:not(:disabled) { cursor: pointer; }
}

.brand-gradient {                   ← Custom utility used by hero & footer-CTA
  background: linear-gradient(135deg, oklch(0.22 0.07 225) 0%, oklch(0.38 0.12 215) 50%, oklch(0.52 0.16 205) 100%);
}

.tier-1 { color: oklch(0.55 0.18 150); }       ← green
.tier-2 { color: oklch(0.65 0.18 80); }        ← amber/gold
.tier-3 { color: oklch(0.577 0.245 27.325); }  ← red
.tier-1-bg { background: oklch(0.96 0.04 150); border-color: oklch(0.75 0.12 150); }
.tier-2-bg { background: oklch(0.98 0.03 80);  border-color: oklch(0.85 0.12 80); }
.tier-3-bg { background: oklch(0.98 0.02 27);  border-color: oklch(0.85 0.15 27); }
```

### Tailwind config

**None.** `tailwind.config.ts` does not exist. Tailwind v4 reads all theme from the `@theme` block in `globals.css` plus the PostCSS plugin. This is the v4-native pattern — correct, but means the design-token surface lives entirely in CSS rather than in a TS file.

### `tokens.ts`

**Does not exist.** All design tokens are CSS-only. The rebuild plan adds `tokens.ts` as the typed source of truth (see `rebuild-plan.md` §5.1).

### Theme support

- **Light**: scaffolded and used (everything renders against `:root`).
- **Dark**: scaffolded in `.dark` block but the values are neutral gray (default shadcn dark), not tied to the brand palette. **No `<ThemeProvider>` or theme-toggle component is mounted**, so dark mode is unreachable from the UI. Effectively unused.

### Components installed but unused

- **All 8 sidebar tokens** (`--sidebar`, `--sidebar-foreground`, etc.) defined in `:root` and `.dark` but **no sidebar component exists**. Set by shadcn `base-nova` defaults; safe to keep but not in use.
- **Chart tokens 1–5** defined but no chart library installed. `CategoryScoreBar` uses CSS-only width and tier classes.

---

## 2.6 Supabase migrations & RLS surface

### Migrations present (6 files)

| File | Lines | Purpose |
|---|---|---|
| `001_initial_schema.sql` | 156 | All 9 tables + FK indexes |
| `002_rls_policies.sql` | ~250 | Row-level security per table |
| `003_custom_access_token_hook.sql` | ~60 | Inject `app_role` into JWT |
| `004_auth_trigger.sql` | ~40 | Mirror `auth.users` → `public.users` on insert |
| `005_seed_assessment_questions.sql` | ~430 | 30 SPD questions (5/category × 6 categories) |
| `006_rename_student_profile_columns.sql` | ~20 | Column rename |

### Tables (9 total — CLAUDE.md says 8; correct count is 9)

`users`, `student_profiles`, `assessment_questions`, `student_assessments`, `assessment_responses`, `hospital_profiles`, `externship_openings`, `applications`, `hospital_feedback`.

All tables have FK indexes (see `001_initial_schema.sql:147–155`).

### RLS verification

Detailed security verification appears in the DAL+security agent's report (in progress as of writing). The expected pattern per CLAUDE.md and STATE.md decisions:

- All tables have SELECT, INSERT, UPDATE, DELETE policies
- Policies use `(select auth.uid())` and `(select auth.jwt()->>'app_role')` wrappers
- IN-subquery joins (not nested joins) used for candidate-list-style lookups
- `app_role` JWT claim populated by `003_custom_access_token_hook.sql`

When the agent completes, this section is updated with per-table policy presence.

---

## 2.7 Critical pitfalls (per `.planning/STATE.md`)

Five guardrails the rebuild MUST NOT break:

1. **Never use `getSession()` for server-side authorization** — always `getUser()`.
2. **`@supabase/ssr` `setAll` handler** must write to BOTH `request.cookies` and `response.cookies`.
3. **One authoritative role source** = `public.users.role`; don't rely solely on JWT metadata.
4. **Every RLS table needs SELECT, INSERT, UPDATE, DELETE policies** — missing SELECT causes silent mutation failures.
5. **RLS policies must use IN-subquery, not joins**, to avoid candidate-list timeouts.

The rebuild plan in `rebuild-plan.md` §5.6 (Risk Register) carries these forward as constraints.

---

## 2.8 Test surface

| File | Purpose | Likely coverage |
|---|---|---|
| `tests/scoring.test.ts` | Readiness-scoring formula | Unit-level on the deterministic math |
| `tests/assessment.test.ts` | Assessment domain rules | Probably the cooldown + completion gates |

**No tests** for: components, pages, RLS policies, server actions, email templates. Visual / a11y / e2e coverage = zero.

This means the rebuild can refactor styling freely without breaking automated test coverage — but conversely, **there is no safety net for behavior regressions during the rebuild**. Risk recorded in `rebuild-plan.md` §5.6.

---

## Appendix — primitive component sources

> Verbatim source dumps moved to a separate appendix file to keep this inventory scannable. If needed for review, see the agent transcripts.

(Marketing+auth agent and DAL+security agent results, when complete, are appended here as raw evidence for any claim above.)
