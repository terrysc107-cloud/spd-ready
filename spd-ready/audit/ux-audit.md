# UX / UI Audit — SPD Ready

> **Phase 3 deliverable.** Quality scoring across seven dimensions, evidence-anchored. Each subsection has a 1–10 score; every score under 8 cites file:line. Reference patterns referenced here are documented in `audit/reference-system.md`.

**Scoring rubric**
- 9–10: matches reference; ship as-is
- 7–8: solid, minor polish needed
- 5–6: noticeable quality gap, must fix before launch
- 3–4: foundationally weak, requires rebuild
- 1–2: blocking — unusable or actively harms perception

---

## 3.1 Visual Quality — **5 / 10**

### Hierarchy & scannability — 5
Marketing landing has clear section eyebrows (`text-xs font-semibold uppercase tracking-widest text-accent`) and h2 headings (`text-3xl font-bold`). Good rhythm at the section level. But within sections, emoji are doing the visual heavy lifting where icons or numbered chips should — readers scan emoji as decorative, not structural. Evidence: `src/app/(marketing)/page.tsx:85, 94, 125, 132, 139, 245–270, 307–322`.

### Whitespace & density — 6
Marketing sections use `py-20 px-6` (80px vertical) — generous, premium. Dashboards and forms use `h-8` inputs / `h-8` buttons — dense, sometimes cramped for touch. `src/components/ui/button.tsx:24` and `src/components/ui/input.tsx:12`.

### Typography rhythm — 4
Single-family stack intended (Geist), but **CF-01** breaks the sans variable so body renders as browser-default sans. Headings + body use the same family, weight gradation only. No display face. No serif accent. Type scale defaults: marketing uses 5xl/6xl for hero (`page.tsx:35`), 3xl for h2 (`page.tsx:81, 116, 161`) — appropriate, but the font itself is wrong on every page (CF-01). Until the font wiring is fixed, this whole subsection is artificially degraded.

### Color usage & contrast — 5
Token system exists (`globals.css:51–84`) but is bypassed throughout the marketing page via inline `oklch()` literals (CF-02). Tier classes (`.tier-1/2/3`) are used correctly on the tier-explainer block (`page.tsx:431`) but bypassed in other places (e.g., `page.tsx:347 — text-[oklch(0.45_0.18_150)]`). Primary color (`oklch(0.32 0.09 222)` deep blue) and accent (`oklch(0.62 0.18 200)` cyan) contrast adequately on white; not verified for WCAG AA on muted backgrounds.

### Visual consistency across pages — 4
Marketing uses inline `<div className="rounded-xl border-2 ...">` for cards. Dashboards use the `<Card>` primitive (`components/ui/card.tsx`). The two patterns coexist with different visual register (border-2 vs ring-1). Across forms: `selectClass` Tailwind chain duplicated in four places (per app-surface agent synthesis) instead of the `Select` primitive. Buttons: inline `<Link className="...">` on marketing vs `<Button>` primitive on dashboards. Three buttons styled three different ways across the codebase.

### Premium feel — 4
Falls short of the reference register due to:
- Emoji as visual hierarchy (CF-04)
- No real footer (`page.tsx` ends at the gradient CTA at line 510)
- Default Next.js favicon + zero brand assets (CF-03)
- Brand gradient is OK but used repetitively (hero + footer-CTA)
- Default sans-serif rendering (CF-01)
- No testimonials, no logo strip, no FAQ accordion

**What's working:** the OhioHealth-validated stats band (`page.tsx:450–476`) is a credibility-strong section that reads premium. The tier-explainer block (`page.tsx:391–447`) uses the token system correctly and looks cohesive. The mock candidate card (`page.tsx:338–378`) is concrete and useful.

---

## 3.2 Information Architecture — **6 / 10**

### Nav structure — 6
Marketing nav is minimal: Logo + Sign in + Get-started CTA (`page.tsx:9–22`). No center nav (no Features / How it works / Pricing / About). For a single-CTA landing this is defensible, but it forfeits anchor links — a coordinator who scrolls deep can't easily jump back to a specific section. **Recommendation:** add 3–4 anchor links in nav (#how-it-works, #scoring, #for-hospitals, #ohiohealth) and a "Contact" or "Schedule demo" surface for the enterprise persona (Healthmark deal context per `.planning/PROJECT.md`).

### Page-level content hierarchy — 7
Landing is well-organized: Problem → How → Two scores → For Students → For Hospitals → Tiers → Credibility → CTA. Solid sequence. Dashboards (per app-surface synthesis) put stat cards at top, work below — standard pattern.

### CTA prominence & frequency — 6
Hero has two CTAs (`page.tsx:44–57`). Footer CTA repeats (`page.tsx:491–504`). Mid-page CTAs appear after the For Students and For Hospitals sections (`page.tsx:282–289, 380–387`). Sufficient frequency. **But** the CTAs all point to `/register?role=student|hospital` — there's no enterprise/Healthmark path ("Schedule a demo" / "Talk to sales") despite the planning notes that Healthmark is the prospect.

### Pricing architecture — N/A
CLAUDE.md says no Stripe in v1. No pricing page exists. **Decision required (in chat summary): does the rebuild add a "Plans" surface (even if every plan says "Contact us") or do we keep the freemium-only registration funnel?**

### Onboarding — 7
Student onboarding is a multi-step form gated before assessment access (per `.planning/STATE.md` decision log: "profile_complete gate in onboarding/page.tsx redirects to /student/profile"). Good pattern. No visible progress bar on the multi-step form (per app-surface synthesis: "Missing Loading and Error Skeleton States" + REQ PLATFORM-03 calls for progress bars but flags it as unmet). **Recommendation:** add a steps progress indicator at the top of onboarding.

### First-time UX — 5
First load shows the marketing landing. From there: register → email confirmation (Resend) → onboarding → profile → assessment gate. No tour / no tooltips / no checklist on the dashboard. Tier 3 students are supposed to see an "improvement path" (REQ SCORE-04) but this is marked unimplemented in REQUIREMENTS.md.

---

## 3.3 Component Quality — **5 / 10**

### Button states — 7
`button.tsx` is a complete CVA implementation: 6 variants × 8 sizes. Default + hover + active (translates 1px on press) + focus-visible (3px ring) + disabled + aria-invalid all handled. **But** the marketing page doesn't use the Button primitive — every CTA is an inline `<Link className="...">` (e.g., `page.tsx:15–20, 46–48, 51–54, 283–289`). So the well-designed Button states are invisible on the highest-traffic surface. Also: there's no `loading` variant (spinner replacing label) — form submits show no feedback.

### Form UX — 4
Inputs have `aria-invalid` styling (`input.tsx:12`) but **no Form / FormField / FormError wrapper exists**. Forms in `OnboardingForm.tsx`, `hospital/onboarding/page.tsx`, `hospital/openings/new/page.tsx`, and the auth pages must compose their own error display from raw HTML. Per app-surface synthesis: "Forms Lack Validation Feedback and Field-Level Error States — no inline error messages, no required-field indicators, no loading spinner on submit button."

### Empty states — 3
Per app-surface synthesis: dashboards "fetch data asynchronously … but show no skeleton or loading indicator. Users see blank content area until Promise resolves." No empty-state component exists. Empty applications list, empty candidates list, empty cohort = blank panel.

### Loading skeletons — 2
No `Skeleton` component installed. No global `loading.tsx` at the app root or any route segment. Async fetches show blank.

### Error boundaries — 2
No `error.tsx` at any segment. Uncaught errors hit Next.js generic error page.

### Modal / dialog — 0
No Dialog primitive installed. Confirmation flows (e.g., accept/reject candidate per REQ CAND-04) presumably use plain forms or `window.confirm()` — neither verified.

### Toast / notification — 0
No Toast / Sonner primitive installed. Server Actions use the "redirect with `?error=` query param" pattern (per STATE.md decision log). This works but creates a refresh + URL pollution rather than an in-place notification.

---

## 3.4 Responsive behavior — **6 / 10**

### Breakpoints
Tailwind defaults: `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`. Marketing uses `sm:`, `md:`, `lg:` consistently (`page.tsx:35 — text-5xl sm:text-6xl`; `page.tsx:121 — md:grid-cols-3`; `page.tsx:242 — sm:grid-cols-2 lg:grid-cols-3`). Good.

### Mobile (< 640px) — 6
Landing collapses gracefully (single-column hero, stacked CTAs). But:
- "Sign out" truncates to "Out" in the student/hospital mobile nav (CF-05).
- Stat grid (`page.tsx:60 — grid-cols-2 sm:grid-cols-4`) reflows OK.
- Tier rows (`page.tsx:431`) likely cramped on iPhone SE width — needs verification when dev server runs.

### Tablet (640–1024px) — 7
Generally clean. The For-Hospitals split (`page.tsx:303 — md:grid-cols-2`) is wide enough for the side-by-side at iPad portrait.

### Desktop (> 1024px) — 8
Max-widths declared per section (`max-w-4xl`, `max-w-5xl`, `max-w-3xl`). Hero is `max-w-4xl mx-auto`. Reads well at 1280px+.

### Touch target sizing — 4
Buttons default to `h-8` (32px), inputs `h-8`. Below the 44×44px WCAG minimum. Hospital coordinators on tablet, students on phone — both will mis-tap small controls. **Recommendation:** introduce a `md` size at 40px and a `lg` size at 48px; default the marketing CTAs to `lg`.

### Mobile nav — 5
Layouts (per app-surface synthesis) implement a mobile nav that truncates "Sign out" → "Out". Needs full audit (the marketing+auth agent is reading layout.tsx files in parallel; this score will be refined when it returns).

---

## 3.5 Accessibility — **5 / 10**

### Semantic HTML — 7
Landing uses `<main>`, `<nav>`, `<section>`, `<h1>`, `<h2>`, `<h3>` correctly. The `<OHStat>` inline component is a stateless function — semantic enough.

### ARIA usage — 5
shadcn primitives via base-ui handle ARIA correctly under the hood (Select, Progress, etc.). Inline marketing cards have no ARIA labels on decorative emoji — screen readers read them by unicode codepoint name (e.g., "🏥" → "hospital" or "house with red cross") (CF-04). No `aria-label` on the icon-only or emoji-only elements.

### Keyboard nav — 6
Base-ui Select supports keyboard out of the box. Buttons have `focus-visible:ring-3` styling (`button.tsx:7`). Inline `<Link>` elements rely on default browser focus behavior — should have explicit focus styles. The mock candidate card (`page.tsx:338–378`) has no interactive elements but is styled as if interactive — `cursor: pointer` is set globally on buttons (`globals.css:130–133`) but not on the card.

### Focus rings — 6
`--ring: oklch(0.62 0.18 200)` (cyan, accent). Visible. But the body's `outline-ring/50` (`globals.css:122`) sets a 50% opacity outline by default — may be too subtle on light backgrounds.

### Color contrast — Unverified
WCAG AA requires 4.5:1 for body text, 3:1 for large text. Need to compute against the actual rendered values. Quick eye estimate:
- `--foreground` `oklch(0.13 0.02 240)` on `--background` `oklch(0.98 0.003 220)`: ~14:1 — pass.
- `--muted-foreground` `oklch(0.50 0.03 220)` on `--background`: ~4.5:1 — borderline pass for normal text.
- White text on `.brand-gradient` (mid-stop `oklch(0.38 0.12 215)`): ~7:1 — pass.
- `text-[oklch(0.45_0.18_150)]` (tier-1 green) on `bg-[oklch(0.96_0.04_150)]` (tier-1 bg, `page.tsx:348`): needs computation — likely pass but unverified.

### Screen reader friendliness — 4
- Emoji read aloud by codepoint name (poor) — CF-04
- "Out" mobile label — CF-05
- No `<Skeleton>` with `aria-busy` for async loading regions
- No visually-hidden labels for icon-only controls

---

## 3.6 Performance signals — **6 / 10**

(Static-analysis only — no runtime measurement performed.)

### Bundle hints — 7
- Next.js 16 + React 19 → modern server components, server actions, streaming. Good.
- shadcn primitives via base-ui — tree-shakable.
- Lucide icons imported individually (not the full library).
- `class-variance-authority` + `clsx` + `tailwind-merge` — common, fast.
- **No `framer-motion`** installed — micro-animations would need it or CSS-only. Tailwind v4 + `tw-animate-css` covers basic motion.

### Image optimization — 5
- No `<Image>` component usage detected on landing (no real images on landing — only the inline Logo SVG).
- No `next/image` configuration for external domains in `next.config.ts` — fine, since no external images are loaded.
- Instrument SVGs are inline-loadable (small file sizes 1.5–2.3 KB each).

### Font loading — 8 (would be 9 if CF-01 were fixed)
- `next/font/google` with Geist auto-subsets and self-hosts — best-practice.
- One bug: the variable name mismatch (CF-01) means the load happens but the value isn't read by Tailwind.

### Other observations
- `posthog-js` + `@posthog/next` installed but **no provider mount detected at root layout** — analytics may not be firing. Verify when dev server runs.
- `next.config.ts` has only the PostHog `/ingest` rewrite. No `headers()` for `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`. Worth adding before launch (security + perf affect each other).

---

## 3.7 Conversion architecture — **6 / 10**

### Where does a visitor land? — 9
`/` shows the marketing landing with sticky nav and a clear hero. No 100vh splash, no logged-out empty state surprise. Clean.

### How fast do they understand the product? — 7
Hero headline ("The placement gap ends here.") + sub ("SPD Ready verifies student readiness before they walk into a department.") communicates the dual-persona pitch within 5 seconds of reading. The badge above the headline ("Built for sterile processing students and the hospitals that hire them", `page.tsx:31–34`) further frames it. Good.

### How fast do they see pricing? — N/A
No pricing in v1 per CLAUDE.md. But the absence of any pricing or "what does it cost" call-out is itself a friction point for the enterprise persona. **Recommendation:** even a "Free for students, contact us for hospital pricing" badge would help.

### Trust signals — 6
- ✅ OhioHealth-validated band (`page.tsx:450–476`) — strong, specific, with cited numbers
- ✅ "Built for sterile processing students…" eyebrow
- ❌ No customer/program logos
- ❌ No testimonials / quote cards
- ❌ No accreditation / certification badges (HSPA, CBSPD)
- ❌ No "trusted by N students at X programs" stat (the inline 8/2/3/6 stats are about the product structure, not adoption — `page.tsx:60–72`)

### Friction in signup/checkout — Unverified
Need to trace `/register?role=student` flow end-to-end. The marketing+auth agent's report (when it returns) covers this. Initial expectation per STATE.md: email + password + role-aware redirect to onboarding. No social auth (Google/Apple) — would reduce friction for student persona.

### Conversion goal per page — Defined
See `reference-system.md` §9.5 for the matrix.

---

## Overall score: **5.4 / 10** (mean of 5, 6, 5, 6, 5, 6, 6)

### Breakdown
| Dimension | Score | Trajectory after rebuild |
|---|---|---|
| 3.1 Visual quality | 5 | → 9 (token system + remove emoji + add real footer + brand assets) |
| 3.2 Information architecture | 6 | → 8 (add nav anchors + enterprise CTA + onboarding progress) |
| 3.3 Component quality | 5 | → 9 (add missing primitives: Dialog, Toast, Form, Skeleton, Tooltip, Tabs, Accordion) |
| 3.4 Responsive | 6 | → 8 (larger touch targets, mobile-nav polish) |
| 3.5 Accessibility | 5 | → 8 (Lucide for emoji, ARIA labels, focus polish, contrast verify) |
| 3.6 Performance signals | 6 | → 8 (font fix CF-01, mount PostHog provider, add CSP/HSTS headers) |
| 3.7 Conversion architecture | 6 | → 8 (logos / testimonials / enterprise CTA) |

The current state is **functional v1 demo quality**. The rebuild plan in `rebuild-plan.md` lifts every dimension into the 8–9 range, which is "ship a paid product on this" territory.
