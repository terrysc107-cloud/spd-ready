# SPD Ready — Premium Design System Proposal

**Companion to:** `AUDIT.md`
**Lead role:** Frontend Builder
**Support roles:** Design Auditor, Systems Architect
**Status:** Proposal — awaiting product approval before implementation
**Branch:** `claude/upgrade-ui-premium-z0YzN`

---

## 0. North star

A hospital coordinator should open SPD Ready and react the way they react to **Linear, Vercel dashboards, Stripe, Notion, Cal.com**: *this is a serious product built by serious people*. A student should open it and feel like they're using a real career platform — not a school project.

Editorial / clinical / confident — not "fintech bro neon" and not "edtech kid colors."

We call this **Premium Clinical** as a working name.

---

## 1. Design principles (the constitution)

1. **Calm, not loud.** Whitespace is the default. Color is reserved for status, not decoration.
2. **Editorial typography.** Serif/grotesk display for headlines, modern sans for UI, tabular nums for data.
3. **Real iconography.** Lucide line icons everywhere. Zero emojis in product chrome. (Emoji is allowed *only* in user-generated content, never in our own UI.)
4. **One grammar.** Same nav shell, same page header, same stat card, same button sizes across every route group.
5. **Motion with intent.** Subtle entrance + state transitions. Always respect `prefers-reduced-motion`.
6. **Tokens, not literals.** Every color, radius, shadow, spacing reference goes through a token. No inline `oklch()` outside the token file.
7. **Trust over flash.** Data viz, citations, and validation badges are first-class. Hospitals don't trust gradients — they trust numbers and sources.
8. **Accessible by default.** WCAG AA contrast minimum, 44×44 minimum touch targets on primary actions, real focus rings, motion preferences honored.

---

## 2. Brand palette (Premium Clinical)

OKLCH because Tailwind v4 already uses it and it gives perceptually-uniform tints.

### Primary brand — "Clinical Indigo"
A confident deep indigo that reads as medical authority without going corporate-blue-boring.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--brand-50` | `oklch(0.98 0.012 250)` | `oklch(0.22 0.04 250)` | bg tint |
| `--brand-100` | `oklch(0.95 0.025 250)` | `oklch(0.27 0.06 250)` | hover bg |
| `--brand-500` | `oklch(0.56 0.16 250)` | `oklch(0.66 0.18 250)` | accent |
| `--brand-600` | `oklch(0.48 0.18 250)` | `oklch(0.58 0.20 250)` | primary action |
| `--brand-700` | `oklch(0.40 0.18 250)` | `oklch(0.50 0.18 250)` | primary action hover |
| `--brand-900` | `oklch(0.22 0.10 250)` | `oklch(0.86 0.06 250)` | text on light / heading on dark |

### Accent — "Sterile Teal" (replaces current cyan accent)
Used for callouts, judgment-score signal, "Next" pills.

`--accent-500: oklch(0.65 0.13 195)`
`--accent-600: oklch(0.55 0.14 195)`

### Tier semantic colors (formalize existing)
| Tier | Surface | Border | Text | Bar fill |
|---|---|---|---|---|
| Tier 1 — Ready | `--tier-1-bg: oklch(0.96 0.04 150)` | `oklch(0.78 0.10 150)` | `oklch(0.42 0.16 150)` | `oklch(0.55 0.16 150)` |
| Tier 2 — Support | `--tier-2-bg: oklch(0.98 0.03 75)` | `oklch(0.85 0.11 75)` | `oklch(0.50 0.16 75)` | `oklch(0.65 0.16 75)` |
| Tier 3 — Developing | `--tier-3-bg: oklch(0.98 0.02 28)` | `oklch(0.85 0.13 28)` | `oklch(0.50 0.20 28)` | `oklch(0.60 0.22 28)` |

### Neutral grays
Cool-tinted (slightly bluish) to feel clinical, not warm-beige.

`--neutral-0..1000` mapped to `oklch(L 0.008 250)` ramp from 0.99 → 0.10.

### Status palette
`success`, `warning`, `danger`, `info` — each with `-50/-500/-700` and `-fg` text variants. Already partially exists; formalize.

---

## 3. Typography

### Pairing
- **Display (headlines, marketing hero, page H1):** `Instrument Serif` or `Fraunces` — editorial serif with personality, free on Google Fonts. (Vote for `Fraunces` — variable axis for SOFT and opsz lets us go from credible to friendly within the same family.)
- **UI sans (body, buttons, nav, forms):** **Geist Sans** — keep it, it's excellent.
- **Mono (scores, IDs, tabular):** **Geist Mono** — keep it.

### Type scale (fluid)
```css
--text-xs:   clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem);
--text-sm:   clamp(0.875rem, 0.84rem + 0.18vw, 0.9375rem);
--text-base: clamp(1rem, 0.96rem + 0.2vw, 1.0625rem);
--text-lg:   clamp(1.125rem, 1.08rem + 0.23vw, 1.1875rem);
--text-xl:   clamp(1.25rem, 1.18rem + 0.35vw, 1.375rem);
--text-2xl:  clamp(1.5rem, 1.4rem + 0.5vw, 1.75rem);
--text-3xl:  clamp(1.875rem, 1.72rem + 0.78vw, 2.25rem);
--text-4xl:  clamp(2.25rem, 2.0rem + 1.25vw, 3rem);
--text-5xl:  clamp(2.75rem, 2.3rem + 2.25vw, 4rem);
--text-6xl:  clamp(3.5rem, 2.8rem + 3.5vw, 5.5rem);
```

### Pairing rules
- Display headlines: `font-display` (Fraunces), `tracking-tight`, `text-balance`, `font-medium` (display fonts never go bold).
- Body: `font-sans`, `text-pretty`, default weight 400, headings 500–600.
- Numbers: `tabular-nums` always — scores, dates, counts.

---

## 4. Spacing, radius, shadow, motion

### Spacing
Keep Tailwind's default 4px scale. Standardize section padding:
- `--space-section: clamp(4rem, 8vw, 7rem)` (was `py-20` in some places, `py-28` in others)
- `--space-page: clamp(1.5rem, 4vw, 3rem)`
- `--space-card: 1.25rem` (was `p-5` / `p-6` mixed)

### Radius
Already defined as a scale; formalize:
- `--radius-sm: 6px` (badges, pills, small buttons)
- `--radius-md: 10px` (inputs, secondary buttons)
- `--radius-lg: 14px` (cards, primary buttons)
- `--radius-xl: 20px` (hero panels, modals)
- `--radius-2xl: 28px` (feature cards, dialogs)

### Shadow
Custom subtle shadows; no Tailwind defaults (they're too gray and too heavy):
```css
--shadow-xs: 0 1px 2px oklch(0.20 0.04 250 / 0.04);
--shadow-sm: 0 2px 4px oklch(0.20 0.04 250 / 0.04), 0 1px 2px oklch(0.20 0.04 250 / 0.06);
--shadow-md: 0 6px 12px -2px oklch(0.20 0.04 250 / 0.08), 0 2px 4px oklch(0.20 0.04 250 / 0.04);
--shadow-lg: 0 14px 24px -8px oklch(0.20 0.04 250 / 0.10), 0 4px 8px oklch(0.20 0.04 250 / 0.06);
--shadow-glow: 0 0 0 1px var(--brand-200), 0 8px 24px -8px var(--brand-500/0.25);
```

### Motion
Add `motion` (the new Framer Motion successor, ~13kb) or `motion-dom` for primitives. Standard easings:
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* "snappy out" */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1); /* "smooth both" */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* "satisfying" */
--duration-fast: 150ms;
--duration-normal: 240ms;
--duration-slow: 420ms;
```

All animations wrap in `@media (prefers-reduced-motion: reduce)` to fall back to a 0ms duration.

---

## 5. Component upgrades

### 5.1 New shared components (build before re-skinning pages)
| Component | Path | Purpose |
|---|---|---|
| `<AppShell>` | `components/shell/AppShell.tsx` | shared chrome: nav, user menu, mobile drawer, breadcrumbs, signed-in identity |
| `<PageHeader>` | `components/shell/PageHeader.tsx` | title + eyebrow + actions + optional gradient banner variant |
| `<StatCard>` | `components/data/StatCard.tsx` | big number + trend arrow + delta + period selector + sparkline slot |
| `<Sparkline>` | `components/data/Sparkline.tsx` | tiny inline trend chart (SVG, no chart lib needed) |
| `<ScoreRing>` | `components/data/ScoreRing.tsx` | the conic-gradient ring, but with tick marks, threshold lines, entrance animation |
| `<TierBadge>` | already exists — upgrade to use tokens, icon, optional explainer tooltip |
| `<EmptyState>` | `components/shell/EmptyState.tsx` | illustration slot + headline + body + primary action |
| `<HeroBanner>` | `components/shell/HeroBanner.tsx` | replaces the duplicated brand-gradient header on dashboard + candidate pages |
| `<CommandPalette>` | `components/shell/CommandPalette.tsx` | Cmd-K for power users (search candidates, jump to openings) — strong premium signal |

### 5.2 shadcn primitives to add
Run from the shadcn registry:
```bash
npx shadcn@latest add dialog tooltip tabs table skeleton avatar alert dropdown-menu sheet sonner command
```

### 5.3 Icon system migration
- Adopt **Lucide** project-wide (already installed).
- Build `src/lib/icons.ts` that re-exports the ~30 icons we actually use, so the bundler tree-shakes cleanly and tags every icon site uses with intent.
- Emoji-to-Lucide mapping (initial pass):

| Emoji | Replacement (Lucide) | Context |
|---|---|---|
| 🏥 | `Hospital` | hospital callouts |
| 🎓 | `GraduationCap` | student callouts |
| 📚 | `BookOpen` | study domains |
| 📊 | `BarChart3` / `Gauge` | scores / readiness |
| 🎯 | `Target` | goals, study domains |
| ⚡ | `Zap` | XP, speed signals |
| 🔥 | `Flame` | streaks |
| 🧠 | `Brain` | judgment score |
| 📈 | `TrendingUp` | progress |
| 🏆 | `Trophy` | mastery |
| 📁 | `FolderOpen` | applications |
| ✏️ | `Pencil` | edit |
| 📝 | `ClipboardList` | assessment |
| 👤 | `User` | profile |
| 🔄 | `RefreshCcw` / `Workflow` | pipeline |
| 📋 | `Clipboard` | readiness score |
| ✅ | `CheckCircle2` | tier 1 ready |
| ← | `ArrowLeft` | back nav |
| → | `ArrowRight` | CTAs |

### 5.4 Button overhaul
- Primary: `h-11` (44px) — meets touch target, premium scale.
- Secondary: `h-10`.
- Small (table actions): `h-8` — current default; keep but rename to "compact."
- Add a `gradient` variant for hero CTAs (subtle brand gradient + glow shadow).
- All buttons get optional leading/trailing icon slots already supported by Base UI primitives.

### 5.5 Card overhaul
- Single canonical Card with three variants: `default`, `elevated` (shadow-md), `interactive` (hover lift + shadow-md).
- Remove `border-2` usage — replace with `ring-1 ring-border` + `--shadow-xs`.
- Standardize padding via `data-size` already in shadcn v4 Card.

---

## 6. Hero / decorative treatments

### 6.1 New "Aurora" hero
Replace `brand-gradient` (3-stop linear) with a layered treatment:
1. Base: solid deep `--brand-900`
2. SVG mesh gradient overlay (3–4 radial blobs, very low opacity, slowly drifting via CSS animation)
3. Subtle 1px noise grain (`<svg>` filter, `feTurbulence`, multiply blend, 4% opacity) — kills the banding and screams "production-grade"
4. Foreground content with `--shadow-lg` on key elements

Reusable as `<HeroBanner variant="aurora">`.

### 6.2 Honoring `prefers-reduced-motion`
Mesh + grain are static when reduced motion is set. No JS hooks needed — pure CSS media query.

---

## 7. Page-level upgrades (sketch)

### 7.1 Marketing landing
- New aurora hero with serif `font-display` headline
- Replace problem/solution emoji blocks with Lucide icons in soft circular tint chips
- "How it works" cards: numbered step rings instead of giant step numbers in the corner
- "Two scores" section: split into a wider editorial layout with a side-by-side comparison illustration
- OhioHealth trust block: redesign as a **research-paper-style citation card** — pill "Validated", lead headline, 4 stats with hairline dividers, source line styled like a footnote — anchored by a small "View case study" link
- Footer CTA: same aurora treatment, no duplicate gradient soup

### 7.2 Auth (login/register)
- Keep split-screen but on the brand side: add a rotating testimonial (3 quotes from different roles), a small live "stats this week" widget for trust, and a subtle aurora
- Form side: tighter card, social/SSO ready slot (even if disabled), better error treatment with `Alert` primitive, password strength meter on register

### 7.3 Student dashboard
- Top: `<HeroBanner>` with greeting + first-name + role chip + streak inline (no emoji)
- Below: 4-up `<StatCard>` row (Streak, XP, Domains Mastered, Days to Tier 1) — each with sparkline showing 7-day trend
- Main: large `<ScoreRing>` left + 4 action cards right in a 2x2 grid with proper icons + status pills
- Bottom: study progress with horizontal bars + "Next" pill driven by tokens

### 7.4 Hospital dashboard (biggest opportunity for B2B trust)
- `<PageHeader>` with org name + site picker (if multi-site eventually)
- 4-up `<StatCard>` with **real trends**: Open Positions (+1 vs. last week), Pending Reviews (–3, you're caught up!), Tier-1 in Pipeline (sparkline), Avg Score of pipeline
- Below: a `<Table>` of openings using shadcn Table with sortable columns, status chips, applicant count column with mini stacked bar (tier breakdown), row actions dropdown
- Side panel (right rail on xl+): "Recent activity" feed — students who hit Tier 1 this week, new applications, applications going stale (>5 days)

### 7.5 Hospital candidate pipeline
- Add a sticky filter bar: tier, shift, location radius, judgment-score floor, cert status, search-by-name
- The existing card design is strong; upgrade with: avatar circle (initials fallback), better data-density via `<Tooltip>` on every score, "Compare" action to multi-select 2–3 candidates side-by-side
- Add saved views ("My shortlist," "Tier 1 nights only")

### 7.6 Candidate profile (`/hospital/candidates/[id]`)
- Premium-grade reading layout (think Patient Chart x Behance profile)
- Hero panel with full identity + tier ring + judgment ring side by side
- Tabs: Overview / Readiness Breakdown / Judgment Detail / Activity Timeline / Notes (coordinator-private)
- Strong primary CTA: "Match to opening →"

### 7.7 Assessment flow
- One question per page is correct UX. Upgrade with: progress meter that shows category boundaries (you're in "Process Discipline" section now), keyboard hints (1/2/3/4 + Enter), subtle confidence selector after each answer (lower-friction than a separate Likert)
- After submission: confetti-free, results-page-style "your readiness profile updated" pattern

### 7.8 Admin
Out of scope for this proposal — note for later.

---

## 8. New tokens layer

Create `src/styles/tokens.css` (imported once from `globals.css`):

```css
@layer tokens {
  :root {
    /* brand */
    --brand-50: oklch(0.98 0.012 250);
    --brand-100: oklch(0.95 0.025 250);
    --brand-200: oklch(0.90 0.045 250);
    --brand-500: oklch(0.56 0.16 250);
    --brand-600: oklch(0.48 0.18 250);
    --brand-700: oklch(0.40 0.18 250);
    --brand-900: oklch(0.22 0.10 250);

    /* tiers */
    --tier-1: oklch(0.55 0.16 150);
    --tier-1-bg: oklch(0.96 0.04 150);
    --tier-1-border: oklch(0.78 0.10 150);
    /* tier-2, tier-3 same pattern */

    /* fluid type */
    --text-xs:  clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem);
    /* … through --text-6xl */

    /* motion */
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    /* … */

    /* shadow */
    --shadow-sm: 0 2px 4px oklch(0.20 0.04 250 / 0.04), 0 1px 2px oklch(0.20 0.04 250 / 0.06);
    /* … */
  }

  .dark {
    /* fully redefined brand + tier surfaces for dark, not just neutralized */
  }
}

@theme inline {
  --color-brand-50: var(--brand-50);
  /* … expose every token to Tailwind utilities */
}
```

This makes `bg-brand-600`, `text-tier-1`, `border-tier-1-border`, `shadow-glow` all real Tailwind utilities — and **kills every inline `oklch(...)` string in the codebase**.

---

## 9. Migration plan (4 PRs)

To keep PRs reviewable and reversible:

### PR 1 — Tokens & icons foundation (no visual regression)
- Add `src/styles/tokens.css` with full token scale
- Wire `@theme inline` to expose tokens as Tailwind utilities
- Build `src/lib/icons.ts` Lucide barrel
- Add `font-display` (Fraunces via `next/font/google`)
- Add `motion` to dependencies
- Add missing shadcn primitives (Dialog, Tooltip, Tabs, Table, Skeleton, Avatar, Alert, DropdownMenu, Sheet, Sonner toast, Command)
- **No page changes yet.** This PR should not change any rendered pixels.

### PR 2 — App shell & shared components
- Build `<AppShell>`, `<PageHeader>`, `<HeroBanner>` (aurora variant)
- Build `<StatCard>` with sparkline slot
- Build `<ScoreRing>`, upgrade `<TierBadge>`, build `<EmptyState>`
- Refactor `(student)` + `(hospital)` layouts to use `<AppShell>` (one nav grammar, user menu, mobile drawer, active route)
- No page-body changes — only the chrome.

### PR 3 — Page re-skins (emoji → icons, oklch → tokens)
- Marketing landing — full re-skin
- Student dashboard — full re-skin
- Hospital dashboard — data viz upgrade
- Hospital candidate pipeline — filter bar + avatar + tooltips
- Auth pages — refined split-screen
- All other pages — bulk emoji→Lucide + inline-oklch→token sweep

### PR 4 — Career prep additions (per user request, scoped after audit approval)
The user asked to defer this until the audit was in front of them. Sketch only:
- **Interview Prep**: scenario bank + mock-interview practice mode, scored on professionalism + clinical reasoning
- **Career Roadmap**: visual milestones (Externship → CRCST cert → Tech I → Tech II) with progress and unlock conditions
- **Professional Readiness**: separate module for resume tips, dress-code, communication patterns, etc.
- See `CAREER-PREP-SCOPING.md` (to be written after this proposal is approved).

---

## 10. Out of scope (explicit non-goals)

- No backend schema changes (this is UI only).
- No copywriting overhaul (we keep current product voice).
- No internationalization.
- No new product features beyond the career-prep additions in PR 4.
- No replacement of Tailwind / shadcn — we strengthen them.

---

## 11. Risk register

| Risk | Mitigation |
|---|---|
| Token PR accidentally breaks current rendering | Visual diff every page on Vercel preview before merging PR 1 |
| Lucide bundle size growth | Use individual icon imports + barrel; tree-shaking with Next 16 SWC is fine |
| Motion lib + reduced-motion regressions | Wrap every entrance animation in `prefers-reduced-motion` check |
| Premium look slows dev | Once shell + tokens are in, page work *speeds up* (less hand-rolled chrome) |
| Dark mode rebuild adds scope | If unwanted, ship light-only and remove `.dark` toggle entirely — clean slate beats half-built |

---

## 12. Approval checklist

Before opening PR 1, the user should confirm:

- [ ] Yes to "Premium Clinical" direction (editorial light theme — not dark neon)
- [ ] Yes to Fraunces (or pick alternative: Instrument Serif / GT Sectra / Newsreader)
- [ ] Yes to Lucide as the icon family (alternative: Phosphor)
- [ ] Yes to dropping/rebuilding dark mode (current dark is broken)
- [ ] Yes to the 4-PR migration plan
- [ ] Yes to the career-prep elements being deferred to PR 4

Once approved, PR 1 lands within a session. PR 2 in a follow-up session. PR 3 page-by-page. PR 4 last.

---

**Status:** Awaiting approval.
