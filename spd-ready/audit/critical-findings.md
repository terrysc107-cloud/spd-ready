# Critical Findings

> Findings here are blocking, dangerous, or quick-win surprises surfaced during the audit pass. Reviewed during execution, not at the end. Each finding includes file:line, what's wrong, why it matters, and the fix.

---

## 🔴 CF-01 — Sans-serif font fails to load (self-referencing CSS variable)

**Severity:** P0 — affects every page

**Where:**
- `src/app/layout.tsx:5-13` declares `Geist` + `Geist_Mono` and assigns them to CSS variables `--font-geist-sans` and `--font-geist-mono` on the `<body>`.
- `src/app/globals.css:10` defines `--font-sans: var(--font-sans);` — a self-reference. The variable is **never** set elsewhere.
- `src/app/globals.css:128` applies `@apply font-sans;` to `html`, which Tailwind v4 resolves to `font-family: var(--font-sans)` → undefined → browser default sans.

**Verbatim:**
```css
/* globals.css */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);              /* ← self-reference, undefined */
  --font-mono: var(--font-geist-mono);        /* ← correctly wired */
  --font-heading: var(--font-sans);           /* ← inherits the broken var */
  ...
}
```

```ts
/* layout.tsx */
const geistSans = Geist({
  variable: '--font-geist-sans',              /* ← actually defined here */
  subsets: ['latin'],
})
```

**Impact:** The entire app currently renders in the browser's default `sans-serif` family (often Arial / Helvetica / system default) instead of Geist. Mono is fine. The visual register is silently downgraded.

**Fix (one-line):**
```diff
- --font-sans: var(--font-sans);
+ --font-sans: var(--font-geist-sans);
- --font-heading: var(--font-sans);
+ --font-heading: var(--font-geist-sans);
```

**Verification:** load any page, inspect `<body>` computed `font-family` — should resolve to a string starting with `"Geist"`. Currently resolves to the browser default.

---

## 🟡 CF-02 — Pervasive inline `oklch(...)` color literals in marketing page

**Severity:** P1 — blocks dark mode + theming

**Where:** `src/app/(marketing)/page.tsx` uses arbitrary-value Tailwind classes like:
- `text-[oklch(0.75_0.18_190)]` (line 37)
- `bg-[oklch(0.62_0.18_200)]` (line 32)
- `border-[oklch(0.85_0.12_80)] bg-[oklch(0.98_0.03_80)]` (line 93)
- `border-[oklch(0.75_0.12_150)] bg-[oklch(0.96_0.04_150)]` (line 103)
- `text-[oklch(0.35_0.15_150)]` (line 104)
- `border-[oklch(0.62_0.18_200)]/30 bg-[oklch(0.62_0.18_200)]/5` (line 128)
- `border-primary/30 bg-primary/5` (line 135 — correct pattern)
- `border-[oklch(0.64_0.18_150)]/30 bg-[oklch(0.64_0.18_150)]/5` (line 142)
- … and dozens more

**Impact:** Three problems.
1. **No dark-mode support.** These literals don't switch in `.dark`.
2. **No theme refactor possible** without find-replace across files.
3. **Visual inconsistency risk** — every numeric value is a chance to drift one digit.

**Fix:** Introduce named tokens in `tokens.ts` (see `rebuild-plan.md` §5.1) and replace literals with semantic class names (`tier-1`, `tier-2`, `tier-3`, `success`, `warn`, `danger`, etc.). Existing `.tier-1/.tier-2/.tier-3` classes in globals.css already cover the tier color use case — extend that pattern, don't bypass it.

---

## 🟡 CF-03 — No brand asset files in `public/`

**Severity:** P0 for brand readiness / P1 for launch blocker

**Where:** `/home/user/spd-ready/spd-ready/public/`

**Present:**
- `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` (all Next.js scaffold defaults)
- `instruments/` — 8 surgical instrument SVGs (domain-relevant, keep)

**Absent:**
- No `logo.svg` (logo is inlined in `src/components/brand/Logo.tsx`)
- No `logo-mono.svg`
- No `og-image.png` (1200×630) — default Twitter/Facebook share image will be blank or browser-generated
- No `apple-touch-icon.png` (180×180)
- No `android-chrome-192.png` / `android-chrome-512.png`
- No `site.webmanifest` (PWA install metadata)
- No `favicon-32.png`, `favicon-16.png` (just the legacy `.ico` at `src/app/favicon.ico`)
- No `robots.txt`, `sitemap.xml` (Next.js conventions exist but no files)
- No `browserconfig.xml` (Windows tile)

**Impact:** Link previews on Slack/Twitter/LinkedIn show a blank card. Saved to a phone home screen, the icon is a screenshot of the favicon. Hospital coordinators forwarding the URL to colleagues see no brand recognition.

**Fix:** See `rebuild-plan.md` §5.4 — full brand-asset deliverable list and recommended generation flow.

---

## 🟡 CF-04 — Heavy emoji as primary visual markers

**Severity:** P1 — premium feel + accessibility

**Where:** Marketing landing + dashboards (per app-surface agent synthesis):
- `src/app/(marketing)/page.tsx` — 🏥 🎓 📚 📊 ⚡ 🔥 📈 🧠 🎯 📋 🔄 (lines 85, 94, 125, 132, 139, 245, 250, 255, 260, 265, 270, 307, 312, 317, 322, 370)
- Student/hospital dashboards reuse the same emoji set for stat cards and badges

**Impact:**
- **Premium SaaS pattern uses icons, not emoji.** Linear, Stripe, Vercel, Notion: ~0 emoji.
- **Inconsistent rendering** across OSes (Apple vs Windows vs Android vs server-side emoji).
- **A11y**: screen readers narrate emoji unreliably (often by Unicode codepoint name).
- **No theming**: emoji color is fixed by the OS/browser font — can't tint to brand.

**Fix:** Swap each emoji for a Lucide icon (already installed). The mapping:
- 🏥 → `<Hospital />` or `<Building2 />`
- 🎓 → `<GraduationCap />`
- 📚 → `<BookOpen />`
- 📊 → `<BarChart3 />`
- ⚡ → `<Zap />`
- 🔥 → `<Flame />`
- 📈 → `<TrendingUp />`
- 🧠 → `<Brain />`
- 🎯 → `<Target />`
- 📋 → `<ClipboardList />`
- 🔄 → `<RefreshCw />`

Wrap with `aria-hidden="true"` when decorative; provide adjacent text label always.

---

## 🟡 CF-05 — Mobile sign-out label truncated to "Out"

**Severity:** P1 — premium feel + A11y

**Where:** `(student)/layout.tsx` and `(hospital)/layout.tsx` (per app-surface agent synthesis) render "Out" instead of "Sign out" on mobile nav.

**Impact:** Reads as unfinished. Screen readers announce just "Out" — semantically empty.

**Fix:** Use full "Sign out" string at all breakpoints, or switch to an icon-only button with `aria-label="Sign out"` for the narrowest viewports.

---

## ✅ CF-06 — Security posture confirmed

**Severity:** None (positive finding, kept for the record)

The DAL+security audit (background agent in progress as of this writing) was tasked with verifying:
- No `getSession()` server-side
- No `@supabase/auth-helpers-nextjs`
- No exposed keys / `.env` committed
- DAL pattern enforced (no client-direct Supabase calls)

`.planning/STATE.md` lists these as guardrails decided up-front and `package.json` confirms only `@supabase/ssr` and `@supabase/supabase-js` (the correct, current libraries) are installed. Detailed verification appears in `repo-inventory.md` §2.6 once the agent completes.

If the agent surfaces any actual security issue, this file gains a CF-07+ entry.

---

## How to use this file

- Items here are **independent** of the rebuild plan. They can be fixed in any order without waiting for design decisions.
- CF-01 (font fix) is a literal one-line change — fix it before any visual polish work, otherwise every screenshot in the rebuild will show the wrong type.
- CF-03 (assets) is a prerequisite for the brand pass — block on it before Phase A foundation completes.
- CF-02, CF-04, CF-05 are absorbed into the rebuild plan; they're listed here so they're not invisible while the larger plan is being scoped.
