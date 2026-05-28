# Gap Analysis — Reference vs. Current

> **Phase 4 deliverable.** One table per major area. Reference column cites `audit/reference-system.md`; Current column cites file:line in this repo. Severity:
>
> - **P0** — blocks premium feel, must fix for a credible launch
> - **P1** — noticeable quality gap, fix in the first polish cycle
> - **P2** — refinement, ship later

---

## Brand identity

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 1 | Logo file | Standalone SVG primary + monochrome + mark-only, available in `/public` | Inline SVG inside `src/components/brand/Logo.tsx:22–46`; no `/public/logo*.svg` | Extract logo to `/public/logo.svg`, `/public/logo-mono.svg`, `/public/logo-mark.svg`; refactor `<Logo>` to render `<Image>` with the SVGs | **P0** |
| 2 | Favicon | Branded `.ico` + `.png` at 16/32/180/192/512 + `site.webmanifest` | Default Next.js `src/app/favicon.ico` only | Generate full favicon set from `logo-mark.svg`; add `apple-touch-icon`, `android-chrome-{192,512}`, `manifest.json` | **P0** |
| 3 | OG share image | 1200×630 PNG with logo + tagline | Absent | Author `/public/og-image.png` and reference via `metadata.openGraph.images` in root `layout.tsx` | **P0** |
| 4 | Wordmark style | Single typeface, single weight, consistent across surfaces | Hardcoded `oklch(...)` text colors in `Logo.tsx:16, 17, 53`, no `.dark` adaptation | Move wordmark colors to tokens; auto-switch in `.dark` | **P1** |
| 5 | Logo variants | `dark` / `light` for use on white vs colored backgrounds | Exists (`Logo.tsx:9`) but light variant assumes white text — won't read on light gradients | Add `auto` variant that picks based on `<ThemeProvider>` ambient | **P2** |

---

## Color system

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 6 | Primary hue | Teal-emerald `#0E7C66` (or whatever spdcertprep.com locks once unblocked) | Deep blue `oklch(0.32 0.09 222)` (`globals.css:58`) | Discuss with user — see chat-summary clarifying question | **P0** |
| 7 | Tier color tokens | Three semantic tokens (success/warning/danger) mapped to tier-1/2/3 | Six classes in `globals.css:140–146` plus inline `text-[oklch(...)]` literals scattered across pages | Single source: semantic tokens in `tokens.ts`; tier classes become aliases | **P0** |
| 8 | Dark mode palette | Brand-tinted dark (e.g., near-black with brand-saturated surfaces) | Neutral gray `.dark` block (`globals.css:86–118`) — no brand hue carried over | Re-tune `.dark` from brand or explicitly defer dark mode | **P1** |
| 9 | Inline `oklch()` literals | All colors referenced via tokens | 20+ inline `oklch()` literals in marketing page (CF-02) | Replace with `bg-primary/5`, `tier-1-bg`, etc. | **P1** |
| 10 | Chart palette | Defined and used by a single chart lib | 5 chart tokens defined (`globals.css:70–74`) but no chart lib installed — unused | Either install Recharts/Tremor and use them, or remove the unused tokens | **P2** |

---

## Typography

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 11 | Sans font loading | Family loads + variable name matches across CSS and font config | **Broken**: `--font-sans: var(--font-sans);` in `globals.css:10` self-references; `layout.tsx:6` declares `--font-geist-sans` | One-line fix (CF-01) | **P0** |
| 12 | Type scale | 1.25 modular ratio, 9-step scale, defined as tokens | Tailwind v4 defaults inherited; no explicit scale tokens | Encode the scale in `tokens.ts` + `@theme` (extends default but pins values) | **P1** |
| 13 | Letter spacing | `-0.02em` on hero, `-0.01em` on h2–h3, `0.08em` on eyebrows | Hero uses `tracking-tight` (`page.tsx:35`) — Tailwind default `-0.025em`. Eyebrows use `tracking-widest` (`page.tsx:80`) — Tailwind default `0.1em`. Close enough but not pinned. | Pin in tokens for repeatability | **P2** |
| 14 | Heading face | Optional separate display face for hero | None (`--font-heading: var(--font-sans)` in `globals.css:12`) | Decide if a display face joins the system or stay single-family | **P2** |
| 15 | Line height | `1.1` heading / `1.6` body | Tailwind defaults | Pin in tokens | **P2** |

---

## Navigation

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 16 | Marketing nav | Logo + 3–5 anchor links + Sign-in + primary CTA | Logo + Sign-in + Get-started only (`(marketing)/page.tsx:9–22`) | Add #how-it-works, #scoring, #for-hospitals, #ohiohealth anchors plus a "Talk to us" enterprise link | **P1** |
| 17 | Mobile nav (logged in) | Drawer with full labels and `aria-label` on icon controls | "Out" truncation (CF-05) per app-surface synthesis | Use full "Sign out" or icon-only + aria-label | **P1** |
| 18 | Sticky behavior | Sticky + `backdrop-blur` + shadow-on-scroll | Sticky + backdrop-blur ✓ (`page.tsx:9`); no shadow-on-scroll behavior | Add `shadow-sm` once `scrollY > 8` (small client component) | **P2** |
| 19 | Active state | Brand-color text + 2px bottom border on current section | N/A (no anchor links exist yet) | Implement with the new nav | **P1** |
| 20 | Logged-in nav | Role-aware shell with persistent left rail on desktop + top bar | Top bar only per app-surface synthesis | Add left rail for desktop; keep top bar for mobile + tablet | **P1** |

---

## Hero

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 21 | Background | Subtle dotted-grid or radial gradient — not a stock photo | `.brand-gradient` with two blurred white circles (`page.tsx:25–29`) — overpowers content | Tone down: dotted grid + a single soft radial; reduce gradient intensity | **P1** |
| 22 | Headline copy | ≤9 words, outcome-led | "The placement gap ends here." (`page.tsx:35–38`) ✓ | None | **OK** |
| 23 | Sub-headline | 1–2 sentences, ≤30 words, restates value | 3 sentences (~40 words) (`page.tsx:39–43`) | Trim to 2 sentences, keep "verifies … before they walk in" + one beneficiary line | **P2** |
| 24 | CTA row | Primary filled + secondary outline | Dual filled-ish (`page.tsx:46–57`) | Make secondary outline-on-gradient, not low-alpha fill | **P2** |
| 25 | Stat strip | 4 product-validation stats below CTA | 4 stats present (`page.tsx:60–72`) ✓ but they describe product structure not adoption | Replace with adoption metrics ("N students scored", "M coordinators reviewing") when data exists; for now keep but reframe | **P2** |
| 26 | Trust microcopy | "No credit card required" or "Free for students" | Absent | Add inline below CTA row | **P1** |

---

## Pricing / plans (deferred per CLAUDE.md, but architecture stub recommended)

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 27 | Pricing page | 2–3 plans with feature lists, highlighted recommended tier | Does not exist | **Decision needed**: stub the page now (placeholder "Contact us" CTAs) or wait for Stripe phase | **P1** (decision-gated) |
| 28 | "How it works" before pricing | Mandatory before any plan reveal | Exists (`page.tsx:112–154`) ✓ | None | **OK** |

---

## Cards & containers

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 29 | Card primitive | Single `<Card>` used everywhere | Two patterns: `<Card>` (`components/ui/card.tsx`) on dashboards, inline `<div className="rounded-xl border-2 ...">` on marketing | Unify on `<Card>` everywhere or extract a `<MarketingCard>` variant with the marketing styling | **P1** |
| 30 | Card border | `border` (1px) by default | Marketing uses `border-2` (`page.tsx:84, 145, 169, 198, 275, 338, 431`); primitive uses `ring-1` (`card.tsx:15`) | Pick one — recommend `border` 1px with subtle ring on hover | **P1** |
| 31 | Card padding | `p-6` default, `p-4` compact | Inline marketing cards use `p-5` and `p-6` mixed (`page.tsx:145, 169, 275, 432`) | Standardize on token values | **P2** |
| 32 | Card hover affordance | `shadow-sm` + slight scale or border darkening for interactive cards | Marketing cards have no hover affordance even when wrapping a link | Add hover state to clickable cards | **P2** |

---

## Buttons

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 33 | Button primitive used everywhere | Yes | Marketing uses inline `<Link className="rounded-lg bg-primary ...">` (`page.tsx:15–20, 46–48, 51–54, 283–289, 381–386, 491–504`) — Button primitive unused on highest-traffic surface | Refactor marketing CTAs to use `<Button asChild>` pattern | **P0** |
| 34 | Default height | 40px (≥44px on mobile for touch) | 32px (`h-8` in `button.tsx:24`) | Add `md` variant at 40px + `lg` at 48px; default marketing CTAs to `lg` | **P0** |
| 35 | Loading state | Spinner replaces icon, label stays | Not implemented | Add `loading` prop + spinner variant | **P1** |
| 36 | Icon position | `data-icon=inline-start / inline-end` slots | Already implemented (`button.tsx:23–32`) ✓ | None | **OK** |
| 37 | Focus ring | 3px brand-tinted ring at 50% alpha | Implemented (`button.tsx:7 focus-visible:ring-3 focus-visible:ring-ring/50`) ✓ | None | **OK** |

---

## Forms

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 38 | Form primitive | `<Form>`, `<FormField>`, `<FormError>`, `<FormDescription>` wrappers (shadcn) | Not installed | Add via `npx shadcn add form` | **P0** |
| 39 | Input height | 40px | 32px (`input.tsx:12`) | Add `md`/`lg` sizes; default to 40px on marketing/auth surfaces | **P1** |
| 40 | Required indicator | Subtle red asterisk after label | Not implemented | Add `<Label required>` variant | **P1** |
| 41 | Inline error display | `text-sm text-destructive` below input, error border | aria-invalid border ✓ (`input.tsx:12`) but no error text | Add Form primitives (#38 covers it) | **P0** |
| 42 | Submit feedback | Disabled + spinner on pending | Server Action redirects on error; no disabled state during pending | useFormStatus integration in submit buttons | **P1** |
| 43 | Auth provider variety | Google / Apple OAuth in addition to email | Email/password only | Optional — adds friction reduction for student persona | **P2** |

---

## Footer

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 44 | Site footer | 4-column footer with Product / Company / Resources / Legal | Does not exist (`page.tsx` ends at line 510 with the gradient CTA) | Build footer component, mount in `(marketing)/layout.tsx` | **P0** |
| 45 | Copyright row | Logo + © + social + locale | Absent | Add as part of #44 | **P0** |
| 46 | Legal pages | Privacy + Terms + Acceptable Use | Routes do not exist | Add `/privacy`, `/terms`, `/acceptable-use` even if placeholder | **P1** |

---

## Icons & imagery

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 47 | Icon source | Single library — Lucide | Lucide installed ✓ but emoji used in marketing + dashboards (CF-04) | Replace 11+ emoji with Lucide equivalents (see CF-04 mapping) | **P0** |
| 48 | Icon sizing | Token-driven (`size-4 / size-5 / size-6`) | Button has implicit `size-4` (`button.tsx:7`) — consistent inside primitives | Apply same convention to inline icons in marketing rebuild | **P1** |
| 49 | Domain imagery | Surgical instrument SVGs used sparingly as credibility markers | 8 instrument SVGs available in `/public/instruments/` but not visibly used | Use 1–2 on the landing (e.g., as accents in the "Two Scores" section or as background watermark on the OhioHealth band) | **P2** |
| 50 | Photography | None (premium-SaaS pattern is illustration-light) | None | None | **OK** |

---

## Spacing & rhythm

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 51 | Section padding | `py-24` desktop / `py-16` tablet / `py-12` mobile | `py-20 px-6` flat across (`page.tsx:77, 112, 157, 233, 294, 392`) | Responsive padding | **P2** |
| 52 | Container width | `max-w-7xl` (1280px) | Mixed: `max-w-4xl` (hero, problem, dual-score, tier), `max-w-5xl` (how-it-works, students, hospitals, ohiohealth), `max-w-3xl` (tier explainer) | Standardize on `max-w-6xl` for content, `max-w-7xl` for outer; declare in tokens | **P2** |
| 53 | Section background alternation | `surface` / `surface-muted` rhythm | Implemented (`page.tsx:112 bg-muted/30`, `page.tsx:233 bg-muted/30`, `page.tsx:392 bg-muted/30`, `page.tsx:450 bg-muted/30`) ✓ | None | **OK** |
| 54 | Card gap | `gap-6` (24px) between cards | Mixed (`gap-5`, `gap-6` across `page.tsx`) | Standardize | **P2** |

---

## Motion

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 55 | Hover transitions | `transition-all duration-150 ease-out` everywhere | `transition-colors` on `<Link>`s (`page.tsx:13, 17, 47, 53, 285, 384, 494, 500`); inconsistent | Standardize on `transition-all` + token durations | **P2** |
| 56 | Scroll reveals | Fade-up 16px on section visibility | Not implemented | Add via CSS `@starting-style` or a tiny IntersectionObserver hook | **P2** |
| 57 | Score ring animation | Animated stroke-dashoffset on score update | Not implemented (conic-gradient is static) | Add when rebuilding `<ScoreRing>` | **P2** |
| 58 | Pulse on accent dots | Subtle animated pulse for "live" feel | Implemented (`page.tsx:32 animate-pulse`) ✓ | None | **OK** |
| 59 | Skeleton pulse | `animate-pulse` for loading states | No skeletons exist | Add Skeleton primitive + loading boundaries | **P0** |

---

## Empty / loading / error states

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 60 | Empty state component | Icon + heading + sub + action | Not implemented | Add `<EmptyState>` primitive | **P0** |
| 61 | Loading skeletons | Card-shaped placeholders matching real dimensions | Not implemented | Add `<Skeleton>` primitive + `loading.tsx` per route group | **P0** |
| 62 | Error boundary | Friendly fallback with retry | Not implemented | Add `error.tsx` per route group + root | **P0** |
| 63 | 404 page | Branded, with "Go home" + "Search" CTAs | Default Next.js | Add `app/not-found.tsx` | **P0** |

---

## Dark mode

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 64 | Dark mode tokens | Brand-tinted, full coverage | Scaffolded but neutral gray (`globals.css:86–118`); no ThemeProvider mounted | Either retune values + add ThemeProvider OR explicitly remove the `.dark` block until ready | **P2** |
| 65 | Dark mode toggle | Settings menu | Not implemented | Add when palette is retuned | **P2** |

---

## Conversion architecture

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 66 | Enterprise CTA | "Schedule a demo" / "Talk to sales" path | Absent — only student/hospital register CTAs | Add — Healthmark is in PROJECT.md as a prospect; current site has no path for them | **P0** |
| 67 | Trust microcopy | "No credit card required" inline | Absent | Add | **P1** |
| 68 | Testimonials | 1–3 quote cards mid-page | Absent | Add even with placeholder names until real ones exist | **P1** |
| 69 | Logo strip | "Trusted by N programs / hospitals" | Absent (OhioHealth band is close but is a stats band, not a logo strip) | Add logo strip when partner logos are available | **P2** |
| 70 | FAQ | 5–7 questions accordion | Absent | Add as `<Accordion>` primitive (P0) + `<FAQ>` section (P1) | **P1** |

---

## Configuration / infra

| # | Area | Reference (target) | Current repo | Delta | Severity |
|---|---|---|---|---|---|
| 71 | Security headers | CSP, HSTS, X-Frame-Options | Not configured (`next.config.ts:1–14`) | Add `headers()` in `next.config.ts` | **P1** |
| 72 | `robots.txt` + `sitemap.xml` | Present | Absent | Add static `public/robots.txt` + dynamic sitemap via `app/sitemap.ts` | **P1** |
| 73 | PostHog provider | Mounted in root layout | Not detected (per static read of `layout.tsx`) | Mount the `<PostHogProvider>` in root layout, capture pageviews | **P1** |
| 74 | Phase 6 persistence | Database-backed | In-memory `src/lib/local-db/*` (per agent inventory) | Migrate Learning/Mastery/Cohort/Certificate data to Supabase | **P0** (engineering, not UI — flagged for owner) |

---

## Summary tally

| Severity | Count |
|---|---|
| P0 | 18 |
| P1 | 27 |
| P2 | 22 |
| OK | 7 |

Rebuild order is set by P0 grouping in `rebuild-plan.md` §5.5.
