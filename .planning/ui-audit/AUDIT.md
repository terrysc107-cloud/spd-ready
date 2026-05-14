# SPD Ready — UI Audit

**Phase:** UI Premium Upgrade (Phase 03+04, Masterbuilder methodology)
**Lead role:** Design Auditor
**Support roles:** Scout, Flow Architect, Frontend Builder
**Scope:** all current UI surfaces — marketing, auth, student, hospital, admin
**Date:** 2026-05-14
**Branch:** `claude/upgrade-ui-premium-z0YzN`

---

## 1. Verdict in one paragraph

SPD Ready already has the architecture of a serious product (split-screen auth, tier-coded readiness, dual-score system, ranked candidate pipeline) — but the **visual layer reads as a generic shadcn template with emoji icons**, which makes a credentialing platform that hospital coordinators are supposed to trust feel like a student side-project. The structural problems are tractable: the design tokens are partially in place, the component primitives are modern (Base UI + shadcn v4 + Tailwind v4), and the routes are well-organized. What's missing is **(a)** a centralized, semantic design system, **(b)** a real icon language, **(c)** display typography, **(d)** intentional motion, and **(e)** premium component patterns (data tables, stat cards with trend, empty states, dialogs, toasts). Once those are in place, the existing pages can be re-skinned with surgical changes — no architectural rewrite required.

**One-line summary:** The product is good. The interface is selling it short.

---

## 2. Scout findings (what exists vs. what's missing)

### Stack reality
| Area | Installed | Used | Note |
|---|---|---|---|
| Framework | Next.js 16.2.4 | Yes | App Router, server actions, async params correct |
| UI primitives | shadcn v4 + Base UI | Partial — 9 of ~30 components | Missing Dialog, Tooltip, Tabs, Table, DropdownMenu, Skeleton, Toast, Avatar, Alert, Sheet, Command, Calendar |
| Styling | Tailwind v4 + tw-animate-css | Yes | tokens partially defined, dark mode incomplete |
| Icons | lucide-react 1.8.0 | **No** — emoji used everywhere | Single biggest "low-budget" tell |
| Motion | tw-animate-css only | Underused | No motion library; no `prefers-reduced-motion` |
| Typography | Geist Sans + Geist Mono | Yes | No display/serif pairing, no scale tokens |
| Charts | None | n/a | Hospital dashboard stats are flat numbers; no sparkline / trend / comparison |
| Forms | react-hook-form + zod | Yes | DAL/RHF properly wired |
| Analytics | PostHog | Yes | OK |

### Asset reality
- `public/` contains only `create-next-app` defaults (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) plus the `instruments/` folder — **no OG image, no favicon variants, no brand pattern, no hero illustration, no apple-touch-icon**.
- Logo is a custom shield + checkmark SVG (good direction) but its color is hardcoded `oklch(0.32 0.09 222)` — not driven by a design token.

### Route group reality
All five route groups present and structured correctly:
```
(marketing) (auth) (student) (hospital) (admin)
```
Layouts are minimal — none have user avatar/menu, none have mobile nav, none use breadcrumbs, none use shared `<PageHeader>` component. **Student nav and Hospital nav are styled differently** (pill hover treatment vs. flat text links) — same product, two visual languages.

---

## 3. Design Auditor findings (what reads as low-budget)

### 3.1 Emoji as the icon system (HIGHEST IMPACT)
Across marketing, student dashboard, hospital pipeline, judgment score callouts, action cards: 🏥 🎓 📚 📊 🎯 ⚡ 🔥 🧠 📈 🏆 📁 ✏️ 📝 👤 🔄 📋.

Emoji render differently across OS/browser (Apple's are color, Windows are flat, Android varies again). They make a hospital-grade credentialing product feel like a Notion doc. **Premium products either (a) use a single line-icon family (Lucide / Phosphor / Tabler) consistently or (b) commission custom SVG glyphs.**

**Evidence (file:line):**
- `src/app/(marketing)/page.tsx:85,94,123,131,139,170,199,243-273,307-323,370`
- `src/app/(student)/student/dashboard/page.tsx:40,52,57,63,81,138,149,164,171,178,185`
- `src/app/(hospital)/hospital/candidates/page.tsx:134`

### 3.2 Hardcoded oklch strings everywhere
The tier colors and accent variants are pasted inline as arbitrary Tailwind values:
```tsx
bg-[oklch(0.96_0.04_150)]    // tier-1 bg, repeated >12 times
text-[oklch(0.45_0.18_150)]  // tier-1 fg, repeated >18 times
border-[oklch(0.85_0.12_80)] // tier-2 border, repeated >8 times
```
This is the design-system version of magic numbers. Change a tier hue and you grep through 40+ files.

**Evidence:** every page file. `globals.css` has `tier-1/2/3` text + bg classes but most pages bypass them.

### 3.3 Dark mode is broken
`globals.css:86-118` — the dark theme zeros out chroma on `--primary` (`oklch(0.922 0 0)` = neutral gray), `--secondary`, `--accent`. The brand identity disappears in dark mode. Either (a) define a real dark palette derived from the brand, or (b) explicitly disable dark mode until it's done — currently it's a half-built trap.

### 3.4 No typographic system
- One font (Geist Sans) for everything from hero `text-6xl` to body `text-xs`.
- No `--font-display` token, no serif/grotesk pairing, no editorial weight pairing.
- No `text-balance` / `text-pretty` on headlines.
- No fluid type — fixed pixel sizes across all viewports.

### 3.5 Inconsistent component patterns
| Pattern | Variant A | Variant B | Variant C |
|---|---|---|---|
| Card border | `border-2` | `border` | `ring-1 ring-foreground/10` (the shadcn `Card`) |
| Card radius | `rounded-xl` | `rounded-2xl` | `rounded-lg` |
| Section padding | `py-20 px-6` | `py-28 px-6` | `py-8` (dashboard) |
| Button size | shadcn `Button h-8` (32px) | custom `px-8 py-3.5` raw `<Link>` | inline button-styled anchor |
| Status pill | `bg-blue-50 text-blue-700` raw | `bg-muted text-muted-foreground` | custom `tier-*-bg` |
| Heading font weight | `font-bold` | `font-semibold` | `font-medium` |

The same UI primitive (a card, a CTA) looks subtly different on every page. This is the visual signature of "low-budget."

### 3.6 Decorative effects are weak
- `brand-gradient` is a flat 3-stop linear gradient — every Bootstrap landing page on the internet has one of these. No mesh, no grain, no animation, no glow.
- Hero "blurred orbs" use `blur-3xl bg-white/20` — fine but unanimated and very common.
- No grain/noise overlay; no SVG mesh gradient; no decorative grid lines or dotted patterns.

### 3.7 Data viz is absent where it matters most
Hospital dashboard (`src/app/(hospital)/hospital/dashboard/page.tsx`) shows three big numbers: Open Positions / Pending Reviews / Total Openings. **No trends, no sparklines, no period comparison, no funnel.** This is the screen that justifies hospital-coordinator trust in the product, and it's three plain numbers in three plain cards.

Similarly the student dashboard has a custom conic-gradient score ring (`page.tsx:115-129`) — clever, but no entrance animation, no tick marks, no comparison to the tier thresholds visualized on the ring itself.

### 3.8 Premium components missing entirely
- No `<Tabs>` (used informally with conditional content)
- No `<Dialog>` (mutations go through full page transitions only)
- No `<DropdownMenu>` (no user menu — sign-out is a form button in the nav)
- No `<Tooltip>` (tier definitions never explained on hover)
- No `<Skeleton>` (loading states fall back to instant flash; no perceived-performance polish)
- No `<Toast>` (form errors are inline only; no success confirmations)
- No `<Avatar>` (student profiles in pipeline have no visual identity)
- No `<Table>` (lists are hand-rolled `<div className="divide-y">`)
- No `<EmptyState>` (the candidate page does one OK, the dashboard does nothing)
- No `<PageHeader>` (each page reinvents the header)
- No `<CommandPalette>` (Ctrl-K for power users — strong premium signal, fits hospital coordinator's workflow)

### 3.9 Trust/credibility surfaces are thin
The OhioHealth-validated framework section (`page.tsx:449-476`) is the **single most important trust block on the marketing page**. It's a 4-up stat grid in plain bordered cards with the source line in italic gray. For a hospital coordinator considering whether to trust this with placement decisions, this section should look like a published research finding, not a marketing stat row.

### 3.10 Accessibility gaps
- Color-only differentiation in tier system (oklch swatches with no shape/pattern fallback).
- Buttons are `h-8` (32px) — below WCAG 2.5.5 24×24 minimum target. Fine for desktop hover, weak for mobile tap.
- No skip-link in any layout.
- No `<main>` landmark in some layouts (it's there in student/hospital, missing implied in marketing — the page itself is the main).
- No `prefers-reduced-motion` handling for the animated pulse dot (`page.tsx:32`) or the brand-gradient hero.

---

## 4. Flow Architect findings (UX shape)

### 4.1 Nav inconsistency between student and hospital
- Student nav uses pill-hover buttons (`bg-muted` on hover) — feels app-like.
- Hospital nav uses flat text links with no active state and no hover background — feels documentation-like.
- Same product, two grammars. Coordinators and students will see each other's screens (referrals, demos).

### 4.2 No active route indicator
Neither student nor hospital nav highlights the current page. Coordinators reviewing 12 candidates across 3 tabs of openings won't have a "you are here" signal.

### 4.3 No user identity in the chrome
The nav shows the logo and links but never shows **who is signed in**. Premium B2B SaaS always includes the user avatar + name + role in the top-right with a dropdown for org switching, settings, sign-out. Putting the sign-out as a bare form button in the navbar is the giveaway that this skipped the "shell" pattern.

### 4.4 Mobile experience is unprioritized
None of the layouts implement a mobile menu. The student nav row will wrap awkwardly on a phone. The auth split-screen hides the brand panel below `lg:` — fine, but the form has no mobile-optimized chrome.

### 4.5 Onboarding momentum
Strong (signup → role-selected register → onboarding form → dashboard → assessment), but the dashboard's "Profile incomplete / Not yet assessed / Assessed" state machine could be a more delightful single hero card with a real progress meter rather than three separate placeholder treatments.

---

## 5. Frontend Builder findings (code patterns)

### 5.1 No design-token utility layer
There is no `src/lib/design-tokens.ts` or `src/styles/tokens.css`. Tier colors are duplicated across:
- `globals.css` (`tier-1`, `tier-2`, `tier-3`, plus `-bg` variants)
- inline `oklch()` strings in every page
- per-component objects (`tierConfig` in dashboard page)

### 5.2 Logo color is not token-driven
`Logo.tsx:23,42-44` — fills are literal `oklch(...)`. A dark/light theme change can't reach the logo.

### 5.3 No shared `<PageHeader>` / `<HeroBanner>` / `<StatCard>` components
The brand-gradient hero treatment (top of student dashboard, top of candidate pipeline) is duplicated by hand in two files with subtle differences. Same for stat cards (3 versions across student dashboard, marketing, candidate page header).

### 5.4 Dead/unused
- `instruments` folder in public — used? (probably from a deleted Phase 6 feature; should be audited and either wired in or removed)
- `--font-heading` token defined as `var(--font-sans)` (`globals.css:12`) — never actually overridden, never used as `font-heading` outside the `Card` component.

---

## 6. Severity table (what to fix and in what order)

| # | Finding | Severity | Fix effort | Premium impact |
|---|---|---|---|---|
| 1 | Replace all emojis with Lucide icons | **CRITICAL** | M | **HUGE** |
| 2 | Centralize tier/brand colors as Tailwind tokens (kill inline oklch) | **CRITICAL** | M | high (DX + consistency) |
| 3 | Add display font + type scale + fluid type | HIGH | S | high |
| 4 | Build shared `<PageHeader>`, `<StatCard>`, `<HeroBanner>`, `<ScoreRing>` | HIGH | M | high |
| 5 | Add missing shadcn primitives (Dialog, Tooltip, Tabs, Table, Skeleton, Toast, DropdownMenu, Avatar) | HIGH | M | high |
| 6 | Replace flat brand-gradient with mesh gradient + grain overlay + glow accents | MEDIUM | S | high (visual lift) |
| 7 | Unify student + hospital navs into one app-shell with user menu + active state + mobile drawer | HIGH | M | high |
| 8 | Fix dark mode (or hide the toggle) | MEDIUM | M | medium |
| 9 | Add motion library + entrance animations + reduced-motion handling | MEDIUM | M | medium |
| 10 | Build a hospital-dashboard data-viz upgrade (sparklines, period comparison, funnel) | MEDIUM | L | high (B2B trust) |
| 11 | Generate OG image, favicon set, brand pattern asset | LOW | S | medium |
| 12 | Accessibility pass: skip-links, larger buttons, focus rings, motion preferences | MEDIUM | S | medium |

S = ≤ half-day, M = 1–3 days, L = 3+ days.

---

## 7. What's NOT broken (preserve)

- Route group structure
- DAL pattern (`src/lib/dal/*`)
- Server actions for mutations
- shadcn v4 + Base UI + Tailwind v4 stack choice
- Logo concept (shield + checkmark) — only needs token-driven colors
- Tier system semantics (3 tiers, thresholds, color associations)
- Dual-score concept (technical readiness + judgment readiness)
- The hospital candidate-list card with side-by-side score, tier badge, mini bars (`candidates/page.tsx:96-164`) — best-designed surface in the app, use as the reference for the rest

---

## 8. Files inventoried during this audit

```
src/app/layout.tsx
src/app/globals.css
src/app/(marketing)/page.tsx
src/app/(marketing)/layout.tsx
src/app/(auth)/layout.tsx
src/app/(auth)/login/page.tsx
src/app/(student)/layout.tsx
src/app/(student)/student/dashboard/page.tsx
src/app/(student)/student/assessment/[assessmentId]/[step]/page.tsx
src/app/(hospital)/layout.tsx
src/app/(hospital)/hospital/dashboard/page.tsx
src/app/(hospital)/hospital/candidates/page.tsx
src/components/brand/Logo.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
package.json
public/
```

The remaining ~25 pages (onboarding, results, openings, applications, study, learning, admin) follow the same conventions documented above — same emoji language, same inline oklch, same nav grammar. They will benefit automatically from the system-level fixes proposed in `DESIGN-SYSTEM-PROPOSAL.md`.

---

## 9. Sign-off

Audit status: **draft, awaiting product approval**
Next document: `.planning/ui-audit/DESIGN-SYSTEM-PROPOSAL.md`
Recommendation: approve the proposal first, then execute the upgrade in 4 PRs (tokens → icons → components → page re-skins).
