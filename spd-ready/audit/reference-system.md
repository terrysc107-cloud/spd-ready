# Reference System — `spdcertprep.com`

> **Phase 1 deliverable.** Per the audit plan, this document captures the target aesthetic that SPD Ready should match. It is the citation source for every recommendation that follows in `gap-analysis.md` and `rebuild-plan.md`.

---

## ⚠️ Source provenance

`https://spdcertprep.com/` and its assets (`sitemap.xml`, `robots.txt`, Wayback mirror) all returned **HTTP 403 Forbidden** to programmatic fetch on 2026-05-28. The site is protected by a bot wall (likely Cloudflare). Direct DOM/CSS extraction was not possible from this environment.

To remain unblocked and finish the audit, this document combines:

- **Extracted** — verifiable product traits from independent search-engine summaries (cited per claim).
- **Inferred** — visual-direction recommendations synthesized from the extracted product traits plus the broader "premium healthcare-edtech SaaS" pattern language. Every inferred value is flagged.

If the user later supplies screenshots, exported CSS, or unblocked fetches, this file should be the first one revised. The token tables in `rebuild-plan.md` §5.1 reference the values here by ID and can be replaced in place.

---

## 0. Product context (extracted)

`spdcertprep.com` brands itself as **"SPD Cert Companion"** — a certification-prep web app for sterile-processing technicians. Confirmed traits across multiple search summaries:

- **Certifications covered:** CRCST, CHL, CER, plus a Situational Judgment (SJT) module.
- **Content volume:** 787–790+ questions (CRCST ~400, CHL ~240, CER ~147), categorized by domain, chapter, and difficulty.
- **Differentiators called out on the homepage:**
  - **AI study chat** ("expert answers about sterile processing, instruments, and exam concepts powered by Claude").
  - **Progress tracking** ("color-coded progress bars show weak spots before they cost you on exam day").
  - **Live score** ("updates as you practice, so you know whether you're ready before sitting at the testing center").
  - **Customized practice** ("filter by domain, difficulty, or chapter and build targeted practice sessions around specific gaps").
  - **Streaks** ("daily study streaks keep you accountable").
  - **Digital badge / shareable cert** ("download and share on LinkedIn").
- **Pricing model:** **Freemium**. Free tier = **20 questions per hour, no credit card required**. Paid tier exists but pricing not disclosed publicly to crawlers.
- **Form factor:** Web app, no download. Explicitly markets mobile + tablet + desktop.
- **Persona:** Individual SPD students prepping for HSPA / CBSPD certification exams. Single-role product (not multi-tenant).

**Implication for SPD Ready:** `spdcertprep.com` is a single-persona certification-prep funnel. SPD Ready is a three-persona placement engine. We adopt the visual register, density, and conversion polish — *not* the IA, content cadence, or pricing surface.

---

## 1. Colors

> **All values below are INFERRED** from product traits (clinical-but-warm, progress-coded UI with score rings and streaks). Hex values are a starting palette to be replaced when reference CSS is available.

### 1.1 Brand & UI palette (inferred)

| Token | Role | Value | Reasoning |
|---|---|---|---|
| `brand-600` | Primary brand, CTAs, links | `#0E7C66` (teal-emerald 600) | Healthcare/sterile = cool-clinical hue family; teal-emerald reads "medical but human" better than pure blue, distinguishes from generic SaaS blues, pairs well with warm amber accents for progress states |
| `brand-700` | Hover / pressed | `#0A6353` | Standard 1-step darker |
| `brand-50` | Tinted backgrounds, badge fill | `#ECFDF5` | Mint-white for soft highlight blocks |
| `accent-500` | Streaks, gamification, highlights | `#F59E0B` (amber 500) | Standard "flame/streak" warm pairing; high contrast on cool brand |
| `ink-900` | Body text | `#0F172A` (slate 900) | Near-black, not pure black — premium feel |
| `ink-700` | Heading text | `#1E293B` | One step lighter for nested headings |
| `ink-500` | Muted body | `#64748B` | Secondary copy, captions |
| `ink-400` | Disabled text, placeholders | `#94A3B8` | |
| `surface` | Page background | `#FFFFFF` | |
| `surface-muted` | Subtle section bg | `#F8FAFC` | Slate 50 — alternating-section pattern |
| `surface-elevated` | Card bg | `#FFFFFF` with shadow | |
| `border` | Default border | `#E2E8F0` | Slate 200 |
| `border-strong` | Input borders, table dividers | `#CBD5E1` | Slate 300 |

### 1.2 Semantic palette (inferred, tuned to "score tracking" use case)

| Token | Role | Value |
|---|---|---|
| `success-500` | Pass / Tier 1 / Ready | `#10B981` (emerald 500) |
| `warning-500` | At-risk / Tier 2 / Needs support | `#F59E0B` (amber 500) |
| `danger-500` | Fail / Tier 3 / Not ready | `#EF4444` (red 500) |
| `info-500` | Neutral notification | `#0EA5E9` (sky 500) |

**SPD Ready already uses OkLch tier colors in `globals.css` (`.tier-1`, `.tier-2`, `.tier-3`).** The rebuild keeps those identifiers — only the underlying values get retuned to map cleanly onto the success/warning/danger scale above. See `gap-analysis.md` row "Tier color system."

### 1.3 Dark mode (deferred)

Reference site has no public dark-mode signal we can verify. SPD Ready's `globals.css` already declares a `.dark` variant block — we keep it in place but defer polish to Phase D. See `rebuild-plan.md` §5.5.

---

## 2. Typography

> All values below are **INFERRED**. The extracted signal is only "modern, clean, mobile-readable" from the product description.

### 2.1 Font families

| Use | Family | Rationale |
|---|---|---|
| Display + Body (single family) | **Inter** (variable) | De-facto standard for premium healthcare-edtech SaaS (Notion, Linear, Vercel, Stripe). Already free, already self-hostable via `next/font/google`. Variable weight = one font file, all weights. |
| Monospace (code, score values) | **JetBrains Mono** or **Geist Mono** | For score readouts where consistent numeric width matters (e.g., `87/100`) |

**Note:** A second display face (e.g., **Plus Jakarta Sans** for headlines) is a viable upgrade option for stronger hero punch. Pick one and stay consistent — *do not* mix three families.

### 2.2 Type scale (inferred — 1.25 modular ratio, base 16px)

| Token | Size (rem) | Px | Use |
|---|---|---|---|
| `text-xs` | 0.75 | 12 | Captions, legal, table footnotes |
| `text-sm` | 0.875 | 14 | Body small, form helper text |
| `text-base` | 1.0 | 16 | Body default |
| `text-lg` | 1.125 | 18 | Lead paragraphs |
| `text-xl` | 1.25 | 20 | Card titles, section subheads |
| `text-2xl` | 1.5 | 24 | h3 |
| `text-3xl` | 1.875 | 30 | h2 / dashboard greeting |
| `text-4xl` | 2.25 | 36 | h1 (page titles) |
| `text-5xl` | 3.0 | 48 | Marketing h1 (desktop) |
| `text-6xl` | 3.75 | 60 | Hero only |

### 2.3 Weights

- **400** body
- **500** UI labels, links
- **600** card titles, nav, buttons
- **700** h1–h4
- **800** hero display (optional, marketing only)

### 2.4 Line height

| Element | Value |
|---|---|
| Headings (h1–h3) | 1.1 |
| h4–h6 | 1.25 |
| Body | 1.6 |
| UI controls | 1.0 |

### 2.5 Letter spacing

| Element | Value |
|---|---|
| Hero h1 | `-0.02em` (tight) |
| h2–h3 | `-0.01em` |
| Body | 0 (normal) |
| Eyebrow / overline | `0.08em` uppercase |
| Buttons | 0 |

### 2.6 Links

- Color: `brand-600`, hover `brand-700`
- Underline: not by default in nav/cards; underlined in body prose
- Focus: 2px `ring-2 ring-brand-500/50 ring-offset-2`

---

## 3. Spacing

> Tailwind default 4px-base scale. Confirmed appropriate for the premium edtech-SaaS pattern (Vercel, Linear, Resend all use 4px).

### 3.1 Container

| Token | Value | Use |
|---|---|---|
| `container-sm` | `640px` | Auth cards, narrow forms |
| `container-md` | `768px` | Article-width content |
| `container-lg` | `1024px` | Dashboard primary column |
| `container-xl` | `1280px` | Marketing main, hospital tables |
| `container-2xl` | `1440px` | Marketing max (rare) |

### 3.2 Vertical rhythm

| Token | Value | Use |
|---|---|---|
| Section padding (sm) | `py-12` (48px) | Mobile section gap |
| Section padding (md) | `py-16` (64px) | Tablet |
| Section padding (lg) | `py-24` (96px) | Desktop hero, marketing sections |
| Card padding | `p-6` (24px) | Default card interior |
| Card padding (compact) | `p-4` (16px) | Dense tables, list rows |

### 3.3 Common gaps

| Pattern | Gap |
|---|---|
| Between buttons in a row | `gap-3` (12px) |
| Between cards in a grid | `gap-6` (24px) |
| Between form fields | `gap-4` (16px) |
| Between sections | `gap-12` to `gap-24` |
| Between nav links | `gap-6` (24px) |

---

## 4. Components

> Patterns below describe the **target component contract**. Visual variants will be detailed in `rebuild-plan.md` §5.2 with TypeScript signatures.

### 4.1 Navigation

**Inferred pattern** (matches premium edtech-SaaS norm):

- **Sticky top nav**, `h-16` (64px), white background with `backdrop-blur` on scroll
- **Logo left** (clickable, returns to `/`), **primary nav center-left** (4–6 links max), **CTA right** (Sign in + filled "Get started" / "Start free")
- **Mobile breakpoint** `< md` (768px): hamburger triggers full-screen drawer with stacked links and pinned CTA at bottom
- **Active state** on nav links: `brand-600` text with subtle 2px bottom border in `brand-600`
- **Shadow on scroll** to disambiguate from page content (`shadow-sm` once `scrollY > 8`)

### 4.2 Hero (marketing)

- **Centered single-column** layout (more conversion-typical than split for cert-prep audiences), max-width `~768px` text container inside a `1280px` outer
- **Above headline:** small eyebrow badge with brand-tinted bg and brand-700 text (e.g., "For sterile-processing students")
- **Headline:** 2 lines, 5–9 words, `text-5xl md:text-6xl font-bold tracking-tight`
- **Subheadline:** 1–2 sentences, `text-lg md:text-xl text-ink-500 max-w-2xl`
- **CTA row:** two buttons side-by-side — primary `brand-600` filled + secondary outline. Mobile: stack with primary on top
- **Trust band below CTA:** "no credit card required" + tiny avatar stack or institution logos
- **Background:** subtle dotted-grid or radial gradient (NOT a stock photo)

### 4.3 Buttons

| Variant | Style |
|---|---|
| `primary` | bg `brand-600`, text white, hover `brand-700`, shadow on hover |
| `secondary` | bg white, border `border-strong`, text `ink-700`, hover bg `surface-muted` |
| `ghost` | transparent, text `ink-700`, hover bg `surface-muted` |
| `destructive` | bg `danger-500`, text white |
| `link` | underlined, brand color |

| Size | Height | Padding | Font |
|---|---|---|---|
| `sm` | 32px | `px-3` | `text-sm font-medium` |
| `md` | 40px | `px-4` | `text-sm font-semibold` |
| `lg` | 48px | `px-6` | `text-base font-semibold` |
| `xl` | 56px | `px-8` | `text-lg font-semibold` (hero only) |

States: `default`, `hover`, `active`, `focus-visible` (2px ring), `disabled` (opacity 60, no pointer), `loading` (spinner replaces icon, label stays).

Border radius: `rounded-lg` (8px) baseline; `rounded-full` for chips and pills.

### 4.4 Cards

- `rounded-xl` (12px) baseline
- `border` of `border` color (slate 200), no extra shadow at rest
- `shadow-sm` on hover when interactive
- Padding `p-6` default, `p-4` compact
- Optional header row with title + supporting badge + action (icon button)
- Optional footer row with separator above

### 4.5 Pricing tables

> SPD Ready does not ship pricing in v1 per CLAUDE.md (no Stripe). Pattern documented for the eventual paywall surface:

- 2–3 columns max, single recommended tier highlighted with `brand-600` top-border and "Most popular" badge
- Per-tier: name, price (large, currency superscript), 1-line value prop, bulleted feature list with check icons, full-width CTA
- Below grid: FAQ accordion + "Questions? Contact us" link

### 4.6 Forms

- Labels above inputs, `text-sm font-medium ink-700`
- Inputs: `h-10`, `border border-strong`, `rounded-md`, `px-3`, focus `ring-2 ring-brand-500/50`
- Helper text below input, `text-sm text-ink-500`
- Inline error: `text-sm text-danger-500`, error border `border-danger-500`
- Success: green check icon inline-right
- Required indicator: subtle red asterisk after label
- Submit button: full-width on auth screens, right-aligned on settings

### 4.7 Footer (marketing)

- 4 columns on desktop, stacked on mobile
- Columns: Product, Company, Resources, Legal
- Bottom row: logo + copyright + social icons + locale switcher (deferred)
- Background: `surface-muted` with `border-t`

### 4.8 Badges & pills

- Pill `rounded-full px-2.5 py-0.5 text-xs font-semibold`
- Intents: brand, success, warning, danger, info, neutral
- Each: light tint bg + saturated text (e.g., success bg `success-50`, text `success-700`)

### 4.9 Empty states (often missed)

- Centered illustration or large Lucide icon, `text-ink-400`
- Heading `text-lg font-semibold`
- Supporting text `text-sm text-ink-500`
- Primary action button below

### 4.10 Loading skeletons

- Card-shaped placeholders with `animate-pulse`, `bg-surface-muted`
- Match real component dimensions; never use generic spinners on full-page loads

### 4.11 Toasts

- Bottom-right on desktop, full-width-top on mobile
- Intent-tinted left border (4px), white bg, shadow-md
- Auto-dismiss after 5s for success/info; manual dismiss for warnings/errors

---

## 5. Layout

- **Outer max-width** `1280px` (`container-xl`), centered with `px-6` gutter on mobile, `px-8` on desktop
- **Marketing sections** alternate between `surface` (white) and `surface-muted` (slate-50) to create rhythm
- **Dashboard layouts** use a left sidebar (240–280px on desktop, drawer on mobile) and a main column with `max-w-6xl` content
- **Breakpoints (Tailwind defaults):** `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`, `2xl 1536px`
- **Touch targets:** all interactive controls ≥ 44×44px on mobile

---

## 6. Motion

> Inferred, premium-SaaS norms.

| Token | Value |
|---|---|
| `duration-fast` | 150ms |
| `duration-base` | 200ms |
| `duration-slow` | 300ms |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |

Patterns:
- **Hover transitions** on buttons/cards: `transition-all duration-fast ease-out`
- **Scroll-triggered reveals** on marketing sections: fade-up 16px, 400ms, once-only (use `framer-motion` or CSS `@starting-style`)
- **Page transitions:** none — Next.js App Router default is fine
- **Skeleton pulse:** `animate-pulse` from Tailwind (already loaded via `tw-animate-css`)
- **Streak / score ring fill:** animated stroke-dashoffset over 600ms when score updates

---

## 7. Imagery

- **Primary:** Lucide icons (already installed). No second icon library.
- **No stock photos.** Premium edtech-SaaS pattern is illustration-light, mostly UI-driven.
- **Optional spot illustrations** for empty states and the marketing hero — commission or use undraw.co with brand-tinted SVGs. NOT a v1 requirement.
- **Surgical-instrument SVGs in `public/instruments/`** are domain-relevant — keep them, restyle to be monoline with brand color where used.

---

## 8. Voice & copy patterns

> Patterns derived from extracted product traits ("show weak spots before they cost you", "know whether you're ready") and adapted for SPD Ready's placement-engine framing.

### 8.1 Headline formula

- **Outcome > feature.** "Get placed faster" beats "Multi-step assessment."
- Structure: `[outcome verb] [object] [time/qualifier]` — e.g., "Land your sterile-processing externship in weeks, not months."
- Length: ≤ 9 words for h1; ≤ 12 for h2

### 8.2 CTA verbs

| Surface | Verb |
|---|---|
| Hero primary | "Get started" / "Start free assessment" |
| Hero secondary | "See how it works" |
| Pricing primary | "Start free trial" / "Choose plan" |
| Repeat CTAs mid-page | "Take the assessment" |
| Hospital persona CTA | "Review candidates" / "Post an opening" |

### 8.3 Social proof placement

- **Just below hero CTA row:** "Trusted by [N] students at [X] programs" + small logo strip
- **Mid-page (after value props):** 1–3 quote cards with avatar + name + role
- **Footer:** "© 2026 SPD Ready" + institutional accreditation badges if applicable

### 8.4 Persona-aware framing

SPD Ready has three personas. The landing page needs **role pickers** above the fold (student / hospital / admin), each leading to a tailored mid-page section. This is a divergence from `spdcertprep.com`'s single-persona funnel and is correct for SPD Ready's product shape.

---

## 9. Conversion architecture

> Adapted from extracted freemium model (20 questions/hour free, no card). SPD Ready does not have Stripe in v1, so the "conversion" target is **assessment completion + profile completeness** for students, and **opening posting + candidate review** for hospitals.

### 9.1 Above the fold

- Logo + nav (5 items max) + sign-in + primary CTA
- Hero headline + sub + dual CTA + trust strip
- Mini-explainer ("How it works" 3-step) starts immediately under the trust strip

### 9.2 Mid-page

- Persona role-picker section (3 cards: Student / Hospital / Admin)
- Feature grid 3×2 with Lucide icons and short labels
- "How readiness scoring works" mini-section with the 6-domain breakdown visual
- Social proof / quotes

### 9.3 Below the fold

- FAQ accordion (5–7 questions)
- Repeat CTA in a `surface-muted` band
- Footer

### 9.4 Trust signals to deploy

- "No credit card required" inline near hero CTA
- "Built with OhioHealth-validated scoring" (per `.planning/phases/06` evidence in repo)
- Domain expertise: surgical-instrument SVGs as visual credibility marker (sparingly)
- Privacy/Security: SOC-2-style trust badge once available (deferred)

### 9.5 Primary conversion goal per page

| Page | Goal | Success event |
|---|---|---|
| `/` (marketing) | Student → Register | `student_register_clicked` |
| `/` (marketing) | Hospital → Schedule call | `hospital_lead_submitted` |
| `/register` | Account created | `account_created` |
| `/student/onboarding` | Profile complete | `student_onboarded` |
| `/student/assessment/start` | Assessment started | `assessment_started` |
| `/student/results` | Result shared / saved | `result_shared` |
| `/hospital/openings/new` | Opening posted | `opening_posted` |
| `/hospital/candidates` | Candidate contacted | `candidate_contacted` |

---

## 10. Open questions to resolve before tokens are locked

These are intentionally surfaced rather than answered, per the audit's transparency goal. They feed into the chat-summary clarifying question at end-of-audit.

1. **Brand palette anchor.** Should the primary hue be teal-emerald (recommended above), a more traditional medical blue, or something explicitly aligned to `spdcertprep.com`'s actual palette once a screenshot is supplied?
2. **Typeface.** Inter (safe) vs. Plus Jakarta Sans (more distinctive) vs. a paid display face (premium)?
3. **Dark mode in scope?** Currently scaffolded in `globals.css` but unused. Deferred unless the user asks otherwise.
4. **Logo direction.** Wordmark only, mark + wordmark, or animated mark? Affects favicon and OG strategy.

---

## 11. URLs detected on reference

Not extractable (bot wall). To be filled when reference becomes fetchable, or supplied manually:

- [ ] `/` — landing
- [ ] `/pricing` — pricing page
- [ ] `/signin` — auth
- [ ] `/signup` — auth
- [ ] `/dashboard` — post-auth (if accessible)
- [ ] `/faq` — FAQ
- [ ] `/about` — about
- [ ] `/contact` — contact
- [ ] `/privacy`, `/terms` — legal
