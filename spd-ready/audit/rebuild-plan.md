# Rebuild Plan — SPD Ready

> **Phase 5 deliverable.** Master execution document for lifting SPD Ready from "functional v1 demo" to "premium product worth selling to Healthmark." Anchored to `audit/reference-system.md` (target aesthetic) and `audit/gap-analysis.md` (concrete deltas).
>
> Implementation happens in a **separate session** after this plan is approved. Nothing in `src/**` has been modified during the audit pass.

---

## 5.1 Design system spec

### Source of truth

Two coupled artifacts. `tokens.ts` is **authored**; `globals.css` is **derived**.

- `src/lib/design/tokens.ts` — TypeScript module exporting `tokens` const. Imported by:
  - Chart libraries (if introduced)
  - Framer Motion configs
  - Email templates (Resend + React Email)
  - Tests that assert color contrast
- `src/app/globals.css` — Tailwind v4 `@theme` block mirrors the same values as CSS custom properties so Tailwind utilities (`bg-primary`, `text-ink-900`, etc.) resolve at runtime.

**Why `tokens.ts` is the source:** typed access in React/Node code, refactorable with rename-symbol, fewer string-typed surfaces. CSS layer is required because Tailwind v4 reads from CSS, but it's a one-way mirror — never edit `globals.css` color values directly.

A small script `scripts/sync-tokens.mjs` reads `tokens.ts` and rewrites the `@theme` block + `:root` block in `globals.css`. Run as `npm run tokens:sync`; also wired as a pre-commit check.

### `tokens.ts` shape

```ts
// src/lib/design/tokens.ts

export const colors = {
  // Brand
  brand: {
    50:  '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#0E7C66',   // PRIMARY — used everywhere "primary" is referenced
    700: '#0A6353',
    800: '#075042',
    900: '#053D32',
  },
  accent: {
    500: '#F59E0B',   // amber — streaks, gamification
    600: '#D97706',
  },
  // Neutral (ink + surface)
  ink: {
    900: '#0F172A',   // body text
    800: '#1E293B',
    700: '#334155',
    600: '#475569',
    500: '#64748B',   // muted body
    400: '#94A3B8',
    300: '#CBD5E1',
    200: '#E2E8F0',
    100: '#F1F5F9',
    50:  '#F8FAFC',
  },
  surface: {
    DEFAULT: '#FFFFFF',
    muted:   '#F8FAFC',
    elevated:'#FFFFFF',
    inverse: '#0F172A',
  },
  // Semantic
  success: { 50: '#ECFDF5', 500: '#10B981', 700: '#047857' },
  warning: { 50: '#FFFBEB', 500: '#F59E0B', 700: '#B45309' },
  danger:  { 50: '#FEF2F2', 500: '#EF4444', 700: '#B91C1C' },
  info:    { 50: '#F0F9FF', 500: '#0EA5E9', 700: '#0369A1' },
  // Tier aliases (point at semantic; do not redefine values)
  tier: {
    1: { fg: '#047857', bg: '#ECFDF5', border: '#6EE7B7' },  // success
    2: { fg: '#B45309', bg: '#FFFBEB', border: '#FCD34D' },  // warning
    3: { fg: '#B91C1C', bg: '#FEF2F2', border: '#FCA5A5' },  // danger
  },
} as const

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
    mono: 'var(--font-geist-mono), ui-monospace, monospace',
    // Optionally swap sans to "Plus Jakarta Sans" if user picks the more-distinctive option
  },
  fontSize: {
    xs:   ['0.75rem',  { lineHeight: '1rem' }],
    sm:   ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem',     { lineHeight: '1.5rem' }],
    lg:   ['1.125rem', { lineHeight: '1.75rem' }],
    xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
    '2xl':['1.5rem',   { lineHeight: '2rem' }],
    '3xl':['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em' }],
    '4xl':['2.25rem',  { lineHeight: '2.5rem',  letterSpacing: '-0.015em' }],
    '5xl':['3rem',     { lineHeight: '1.1',     letterSpacing: '-0.02em' }],
    '6xl':['3.75rem',  { lineHeight: '1.05',    letterSpacing: '-0.025em' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const

export const spacing = {
  // Tailwind defaults (4px base) — pinned to avoid drift
  px: '1px', 0: '0',
  0.5: '0.125rem', 1: '0.25rem', 1.5: '0.375rem', 2: '0.5rem',
  2.5: '0.625rem', 3: '0.75rem', 3.5: '0.875rem', 4: '1rem',
  5: '1.25rem', 6: '1.5rem', 7: '1.75rem', 8: '2rem',
  10: '2.5rem', 12: '3rem', 14: '3.5rem', 16: '4rem',
  20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem',
} as const

export const radii = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px — buttons, inputs
  lg: '0.75rem',    // 12px — cards
  xl: '1rem',       // 16px — large cards
  '2xl': '1.5rem',  // 24px — hero cards
  full: '9999px',
} as const

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
  premium: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
  brand: '0 8px 24px -4px rgb(16 185 129 / 0.20)',
} as const

export const motion = {
  duration: { fast: '150ms', base: '200ms', slow: '300ms', slower: '500ms' },
  easing: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const

export const tokens = { colors, typography, spacing, radii, shadows, motion } as const
export type Tokens = typeof tokens
```

### `globals.css` mirror (excerpt)

```css
/* DO NOT EDIT COLOR VALUES HERE — run `npm run tokens:sync` */
@theme inline {
  --color-background:           #FFFFFF;
  --color-foreground:           #0F172A;
  --color-primary:              #0E7C66;
  --color-primary-foreground:   #FFFFFF;
  --color-accent:               #F59E0B;
  --color-accent-foreground:    #FFFFFF;
  --color-muted:                #F8FAFC;
  --color-muted-foreground:     #64748B;
  --color-border:               #E2E8F0;
  --color-input:                #CBD5E1;
  --color-ring:                 #0E7C66;
  --color-destructive:          #EF4444;

  --color-tier-1-fg:     #047857;
  --color-tier-1-bg:     #ECFDF5;
  --color-tier-1-border: #6EE7B7;
  --color-tier-2-fg:     #B45309;
  --color-tier-2-bg:     #FFFBEB;
  --color-tier-2-border: #FCD34D;
  --color-tier-3-fg:     #B91C1C;
  --color-tier-3-bg:     #FEF2F2;
  --color-tier-3-border: #FCA5A5;

  --font-sans:    var(--font-geist-sans);   /* FIX FOR CF-01 */
  --font-mono:    var(--font-geist-mono);
  --font-heading: var(--font-geist-sans);

  --radius: 0.5rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
}

.tier-1 { color: var(--color-tier-1-fg); }
.tier-2 { color: var(--color-tier-2-fg); }
.tier-3 { color: var(--color-tier-3-fg); }
.tier-1-bg { background: var(--color-tier-1-bg); border-color: var(--color-tier-1-border); }
.tier-2-bg { background: var(--color-tier-2-bg); border-color: var(--color-tier-2-border); }
.tier-3-bg { background: var(--color-tier-3-bg); border-color: var(--color-tier-3-border); }

/* Brand gradient — kept, retuned for the new brand palette */
.brand-gradient {
  background: linear-gradient(135deg, #053D32 0%, #0A6353 50%, #0E7C66 100%);
}
```

**Note on color choice:** Brand 600 is set to `#0E7C66` (teal-emerald) per `reference-system.md` §1.1 reasoning. **The user must confirm or replace** this anchor color when spdcertprep.com tokens become available. Every other color in the system pivots around it, so this is the single most consequential decision in the rebuild.

---

## 5.2 Component library plan

**Default library:** shadcn/ui (`base-nova` style, already configured) + Tailwind v4 (already configured) + `@base-ui/react` (already installed, replaces Radix) + Lucide (already installed). **No new dependencies for primitives.** Optional adds (justified below if needed): `sonner` for toasts, `framer-motion` for marketing motion.

### Primitives — keep & extend

| Primitive | Action | Variants needed | Replaces | Priority |
|---|---|---|---|---|
| `Button` | Extend | Add `md` (40px) + `xl` (56px) sizes; add `loading` prop with `<Loader2 />` spinner; add `asChild` polymorphism via `useRender` | Inline `<Link className="rounded-lg bg-primary ...">` in marketing | **P0** |
| `Card` | Extend | Add `interactive` (hover affordance), `featured` (brand-border) variants; standardize on 1px `border` not `ring-1` | Inline `<div className="rounded-xl border-2 ...">` cards in marketing | **P0** |
| `Input` | Extend | Add `md` (40px) + `lg` (48px) sizes; pair with `Form` wrappers | Raw `<input>` in forms | **P0** |
| `Label` | Extend | Add `required` variant (red asterisk) | Raw `<label>` | **P1** |
| `Badge` | Extend | Add `tier-1/2/3` variants, `dot` variant (with leading colored dot) | `TierBadge.tsx` (refactor to use this) | **P1** |
| `Progress` | Keep | None | None | **OK** |
| `Select` | Keep | Already complete | `selectClass` duplication across 4 pages | **P0** |
| `Separator` | Keep | None | None | **OK** |

### Primitives — net new (add via `npx shadcn add <name>`)

| Primitive | Variants | TS signature (abbreviated) | Priority |
|---|---|---|---|
| `Form` (RHF wrapper) | `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` | Standard shadcn form pattern | **P0** |
| `Dialog` | `default`, `destructive` (red accent) | `<Dialog open onOpenChange children />` with `DialogTrigger/Content/Title/Description/Footer` | **P0** |
| `Sheet` | `left`, `right` (mobile nav drawer) | Same shape as Dialog, different positioner | **P0** |
| `Toast` (Sonner) | `success`, `warning`, `danger`, `info` | `toast(msg, opts)` global imperative API | **P0** |
| `Tooltip` | `default` | `<Tooltip content="..." children />` | **P1** |
| `Tabs` | `pills`, `underline` | `<Tabs defaultValue><TabsList><TabsTrigger /></TabsList><TabsContent />` | **P1** |
| `Accordion` | `single`, `multiple` | shadcn standard | **P1** (FAQ section) |
| `Skeleton` | None — utility | `<Skeleton className="h-4 w-32" />` | **P0** |
| `Alert` | `info`, `success`, `warning`, `danger` | `<Alert intent="warning"><AlertTitle/><AlertDescription/></Alert>` | **P1** |
| `Avatar` | `xs`, `sm`, `md`, `lg` | `<Avatar><AvatarImage/><AvatarFallback/></Avatar>` | **P1** |
| `DropdownMenu` | None | shadcn standard | **P1** (user menu in nav) |
| `Table` | `default`, `dense` | `<Table><TableHeader/><TableBody/><TableRow/><TableCell/>` | **P0** (hospital tables) |
| `EmptyState` | None | `<EmptyState icon={Icon} title="…" description="…" action={<Button>…</Button>} />` | **P0** |
| `PageHeader` | `default`, `with-actions` | `<PageHeader title eyebrow description actions />` | **P1** |
| `StatCard` | `default`, `delta` (with trend arrow) | `<StatCard label value delta hint />` | **P1** |
| `ScoreRing` | `sm` (40px), `md` (96px), `lg` (160px) | `<ScoreRing score tier label />` — extracts the duplicated conic-gradient pattern | **P0** |
| `MarketingCard` | `default`, `featured`, `problem`, `solution` | Pre-composed marketing card with eyebrow + icon + title + body | **P1** |
| `SectionHeader` | `default`, `centered` | `<SectionHeader eyebrow title description />` for marketing sections | **P1** |
| `Footer` | App footer with 4-col layout | `<Footer columns links social />` | **P0** |
| `NavBar` | `marketing`, `app` | Composable nav with `<NavBar variant="marketing">` | **P0** |
| `MobileNav` | Drawer-based | Uses Sheet primitive | **P0** |

### Domain components — keep, refactor, or absorb

| Current | Action |
|---|---|
| `student/AssessmentQuestion.tsx` | **Refactor** to use Form primitive; keep `useFormStatus` pattern |
| `student/AssignedModuleCard.tsx` | **Refactor** to use Card primitive |
| `student/CategoryScoreBar.tsx` | **Refactor** to use Progress primitive with tier-color variants |
| `student/CertificateList.tsx` | **Refactor** to use Card + Avatar |
| `student/ConfidenceTapPrompt.tsx` | **Keep**, restyle via tokens |
| `student/KnowledgeConfidenceDelta.tsx` | **Refactor** to use a new `<Delta>` primitive (trend arrow + number) |
| `student/LikertSelfAssessment.tsx` | **Refactor** to use Tabs or radio-like base-ui primitive |
| `student/MasteryCard.tsx` | **Refactor** to use Card + ScoreRing |
| `student/OnboardingForm.tsx` | **Refactor** to use Form + multi-step `<Stepper>` primitive (new) |
| `student/StudyQuiz.tsx` | **Refactor** to use Card + AssessmentQuestion composition |
| `student/TierBadge.tsx` | **Absorb** into Badge with `variant="tier-1|2|3"` |
| `hospital/AddStudentForm.tsx` | **Refactor** Form |
| `hospital/AssignModuleForm.tsx` | **Refactor** Form |
| `hospital/CohortTable.tsx` | **Refactor** to use Table primitive |
| `hospital/ROIProjection.tsx` | **Refactor** to use Card + StatCard composition |
| `brand/Logo.tsx` | **Refactor** to read `/public/logo.svg`; props remain (`size`, `variant`); colors via tokens |

---

## 5.3 Page-by-page rebuild blueprint

### `/` — Marketing landing

**Current** (515 lines, `src/app/(marketing)/page.tsx`): rich content (problem, how-it-works, dual-score, students, hospitals, tiers, OhioHealth, footer-CTA) but emoji-heavy, inline color literals, no footer, no FAQ, no testimonials, no enterprise CTA, Button primitive bypassed.

**Target**: premium dual-persona landing using the design system tokens, real `<Footer>`, `<FAQ>` accordion, enterprise contact path, testimonials placeholder. Same core narrative — same length give or take 20% — but every section composed from primitives.

**Section-by-section wireframe**

```
NavBar (sticky, backdrop-blur, shadow-on-scroll)
├── Logo (left)
├── Center nav: How it works · Scoring · For students · For hospitals · OhioHealth
└── Right: Sign in (text) · Get started (Button primary md) · For institutions (Button outline md)

HeroSection (centered, max-w-3xl text, max-w-7xl outer)
├── Eyebrow Badge "For sterile-processing students and hospitals"
├── h1 "The placement gap ends here." (text-5xl md:text-6xl)
├── Sub "SPD Ready verifies readiness before the department. Hospitals see scored, ranked candidates."
├── Button row: "Start free as a student" (lg primary) · "I'm a coordinator" (lg outline)
├── Trust microcopy: "No credit card · 30-question readiness assessment · 4-hour cooldown"
└── Stat strip 4 cols (replace 8/2/3/6 with adoption stats when available; placeholder fine for now)

ProblemSection
├── SectionHeader eyebrow="The Problem" title="A broken pipeline on both sides"
└── Grid 2 cols of MarketingCard variant="problem" — one per persona
    ├── Lucide icon (Building2 / GraduationCap)
    ├── Title, body
    └── (no emoji)

SolutionBand (synthesis call-out under the two problem cards)
└── MarketingCard variant="solution" with brand-50 bg

HowItWorks
├── SectionHeader eyebrow="The Platform" title="Study. Score. Get placed."
└── Grid 3 cols of MarketingCard variant="step"
    ├── Step number chip "01" "02" "03"
    ├── Lucide icon (BookOpen / BarChart3 / Hospital)
    └── Title + body

DualScore
├── SectionHeader title="Two scores. A complete picture."
└── Grid 2 cols of Card variant="featured"
    ├── Left: Readiness Score breakdown (6 dimensions with weights)
    └── Right: Judgment Readiness Score (6 categories)
        └── Each row: dot + label + description

ForStudents (alternating bg via section-muted)
├── SectionHeader
├── Grid 3 cols × 2 rows of MarketingCard variant="feature"
└── CTA Button lg primary "Start building your readiness profile"

ForHospitals
├── SectionHeader
├── Grid 2 cols
│   ├── Left: 4 bullets, each row [Lucide icon · Title · Body]
│   └── Right: Sample Candidate Card (extracted as <SampleCandidateCard>)
└── CTA Button lg primary "Access the candidate pipeline"

TierExplainer (max-w-3xl)
├── SectionHeader title="Three tiers. Clear decisions."
└── Stack of 3 TierRow components (Tier 1 / 2 / 3) — keep current pattern, restyle via Badge

OhioHealthBand (KEEP AS-IS, restyle via tokens)
├── SectionHeader eyebrow="OhioHealth-validated framework" title="Built on the only published SPD training methodology with measured ROI"
└── 4-col StatCard grid

Testimonials (NEW)
├── SectionHeader
└── Grid 3 cols of Card with Avatar + quote + role

FAQ (NEW)
├── SectionHeader title="Common questions"
└── Accordion (7 items)

EnterpriseCTA (NEW)
├── max-w-4xl card with brand-gradient
├── h2 "Bringing SPD Ready to your institution?"
├── body
└── Button row: "Talk to our team" (primary) · "View pricing" (outline) [pricing optional]

FooterCTA (keep current band, restyle)
└── Same dual CTA, retuned gradient, no emoji

Footer (NEW)
├── Logo + tagline
├── 4 columns: Product / For institutions / Resources / Legal
├── Social row (LinkedIn primary; X if used)
└── © 2026 SPD Ready · Privacy · Terms
```

**Components required**: NavBar, HeroSection, MarketingCard, SectionHeader, Card, Badge, Button (md + lg), Avatar, Accordion, StatCard, ScoreRing, Footer, Logo, Lucide icons.

**Copy direction**: keep current voice (outcome-led, dual-persona). Trim sub-headline by ~30%. Add an enterprise persona paragraph in the EnterpriseCTA block. Replace all emoji with Lucide; revise alt-text-equivalent label patterns.

**Conversion goal**: Student → register · Hospital → register · Institution → "Talk to our team" lead form.

---

### `/login`, `/register`, `/reset-password`

**Current**: Auth pages exist (per `.planning/STATE.md`). Use Server Actions with redirect-with-`?error=` pattern. Likely raw forms — to be confirmed when the marketing+auth agent's report arrives.

**Target**: Single split layout. Left: brand panel with `.brand-gradient` + tagline + 1 testimonial. Right: form card (max-w-md). Trust microcopy below form.

**Wireframe**

```
AuthLayout (children)
├── Left panel (hidden < lg)
│   ├── Logo (light variant)
│   ├── Tagline "Built on the OhioHealth-validated SPD framework"
│   └── Quote card
└── Right panel
    └── Card (no border, just shadow-md)
        ├── h1 "Sign in" / "Create an account" / "Reset your password"
        ├── Sub
        ├── Form (RHF + zod)
        │   ├── FormField email
        │   ├── FormField password
        │   ├── (register only) Role select student/hospital
        │   └── Submit Button lg primary with loading
        ├── Separator with "or"
        ├── (deferred) Google + Apple OAuth buttons
        └── Footer link to /login or /register
```

**Conversion goal**: Account created (Resend confirmation) → onboarding.

---

### `/student/onboarding`

**Current**: `OnboardingForm.tsx` — multi-step. No visible progress bar.

**Target**: Stepper at top showing N steps with current highlighted. Each step is a single Form. Submit returns to current step on validation error; advances on success. Final submit redirects to `/student/dashboard`.

**Wireframe**

```
PageHeader title="Welcome to SPD Ready" eyebrow="Step N of 5"
Stepper (5 steps: Name · Location · Program · Availability · Preferences)
Card (form container, max-w-2xl)
  Form (RHF + zod schema per step)
  Footer: Back · Continue (lg primary, loading on pending)
```

**Conversion goal**: Profile complete → `profile_complete=true` → eligible for assessment.

---

### `/student/dashboard`

**Current**: Per app-surface synthesis — streak, score ring (conic-gradient inline), domain progress grid. No loading skeletons.

**Target**: AppLayout (sidebar + top bar) → 3-row dashboard.

**Wireframe**

```
AppLayout
└── PageHeader title="Welcome back, {firstName}" eyebrow="Student dashboard"

Row 1: Hero stat row
├── ScoreRing md showing current readiness score with tier badge
├── StatCard "Days until next assessment window" (cooldown)
├── StatCard "Study streak" with Flame icon
└── StatCard "Domain progress" "5/8 domains active"

Row 2: Two-column
├── Left (2/3 width): DomainProgressGrid — Progress bars per domain via CategoryScoreBar
└── Right (1/3 width): Card "Next steps" with 3 action items

Row 3: AssignedModules
├── SectionHeader "Assigned by your coordinator"
└── Grid 3 cols of AssignedModuleCard
```

**Conversion goal**: Begin/resume assessment OR open next study domain.

Empty states for: no assessment yet (CTA "Take readiness assessment"), no modules assigned, no streak yet.

---

### `/student/assessment/[id]/[step]`

**Current**: Per-question screen with `useFormStatus`. Resumable.

**Target**: Same flow, restyled. Add header progress bar (`Step N of 30`).

**Wireframe**

```
AssessmentLayout (minimal — no sidebar, just top bar with progress + exit)
└── ProgressBar at top (e.g., 12/30)
  └── Card (max-w-2xl, centered)
    ├── Eyebrow category name + question N of 30
    ├── h2 question prompt (text-2xl)
    ├── RadioGroup of 4 options as Card-styled labels
    └── Button row: Previous (ghost) · Skip (ghost) · Next (lg primary)
```

**Conversion goal**: Advance through all 30 questions → submit → result.

---

### `/student/results`

**Current**: Overall + per-category + strengths + growth + tier.

**Target**: Hero score reveal → breakdown → next steps.

**Wireframe**

```
ResultsLayout
└── HeroBanner with brand-gradient
    ├── ScoreRing lg showing overall %
    ├── Badge size="lg" variant="tier-{N}"
    └── h1 "You're {Tier1Label}"

CategoryBreakdown
└── Grid 2x3 of Card with CategoryScoreBar per domain

StrengthsAndGrowth
├── Two-column Card
│   ├── Left: top 2 strengths (CheckCircle icons)
│   └── Right: bottom 2 growth areas (TrendingUp icons)

NextStepsForTier (conditional)
├── Tier 1: "View open externships" CTA
├── Tier 2: "Build support targets" CTA + recommended modules
└── Tier 3: "Your improvement path" — specific modules + retake date

ShareCard (mock CE certificate — keep Phase 6 feature)
└── Download badge / Share to LinkedIn buttons
```

**Conversion goal**: Tier 1 → apply to opening · Tier 2 → start improvement · Tier 3 → start improvement path.

---

### `/hospital/dashboard`

**Current**: Overview cards with emoji.

**Target**: Coordinator command-center layout. KPIs top, candidate pipeline middle, openings status bottom.

**Wireframe**

```
AppLayout
├── PageHeader title="Coordinator dashboard" actions={Button "Post opening" primary}
├── Row 1: 4 StatCards — total candidates, ready (Tier 1), reviewing, placed
├── Row 2: Two-column
│   ├── Left (2/3): Table "Top candidates" sorted by readiness score
│   └── Right (1/3): Card "Activity" recent status changes
└── Row 3: Table "Openings" with status pills
```

**Conversion goal**: Open candidate review · Open new-opening flow · Open candidate profile.

---

### `/hospital/candidates/[studentId]`

**Current**: Full candidate readiness profile.

**Target**: Two-column with student summary + scoring panel; sticky action bar at bottom for Accept/Waitlist/Reject.

**Wireframe**

```
AppLayout
├── PageHeader with breadcrumb "Candidates › Jordan M."
├── Row 1: Profile header card (Avatar + name + location + program + tier badge + fit score)
├── Row 2: Two-column
│   ├── Left (2/3):
│   │   ├── Card "Readiness breakdown" (6 CategoryScoreBars)
│   │   ├── Card "Strengths" + "Growth areas"
│   │   └── Card "Narrative summary" (template-string text)
│   └── Right (1/3):
│       ├── Card "Application details" (opening, applied date, status)
│       ├── Card "Availability" (shifts, transportation, environment)
│       └── Card "Geography" (city, state, travel radius, distance to site)
└── StickyActionBar
    └── Button row: Reject (ghost destructive) · Waitlist (outline) · Accept (lg primary)
        + Confirmation Dialog before submit
```

**Conversion goal**: Status decision recorded → email notification fires.

---

### `/hospital/openings/new`

**Current**: Form for new opening.

**Target**: Two-step form (Details → Requirements → Review) using Form primitive.

---

### `/admin/dashboard`

**Current**: Platform-wide counts.

**Target**: Grid of KPI StatCards + 2 charts (tier distribution, application status). Charts use Tremor or hand-rolled SVG (keep dep-light).

---

### `404` (`app/not-found.tsx`) — NEW

```
CenteredCard
├── Lucide icon (Compass)
├── h1 "We couldn't find that page"
├── Body "It may have moved, or the link may be wrong."
└── Button row: Home (primary) · Sign in (ghost)
```

### `unauthorized` page — restyle

Already exists. Apply same centered-card pattern. Add "Sign in as different account" link.

---

## 5.4 Logo & brand identity recommendations

### Current `<Logo />` assessment

- Shape: rounded shield with a checkmark interior. Clear meaning (verified readiness).
- Colors: hardcoded `oklch(0.32 0.09 222)` (primary deep blue) and `oklch(0.62 0.18 200)` (cyan accent) — will be retuned when the brand palette locks.
- Wordmark: "SPD Ready" + "Readiness Platform" label below (in md/lg sizes).
- Variants: `dark` / `light` based on background.
- Sizes: `sm` (28px), `md` (36px), `lg` (48px).

**Verdict:** **Refresh, do not replace.** The shield+checkmark is on-brand for a sterile-processing readiness platform. Recolor it via tokens, extract it to a standalone SVG file, and generate the asset set from there.

### Required deliverables

| File | Purpose |
|---|---|
| `public/logo.svg` | Primary, full color, with wordmark |
| `public/logo-mono.svg` | Monochrome (single brand-600 fill) |
| `public/logo-mark.svg` | Just the shield+check (no wordmark) — source for icons |
| `public/favicon.ico` | 32×32 + 16×16 multi-resolution ico |
| `public/favicon-32.png`, `favicon-16.png` | Raster fallback |
| `public/apple-touch-icon.png` | 180×180 |
| `public/android-chrome-192.png` | 192×192 |
| `public/android-chrome-512.png` | 512×512 |
| `public/maskable-icon.png` | 512×512 with 20% safe-area padding |
| `public/site.webmanifest` | PWA install metadata |
| `public/og-image.png` | 1200×630 for `metadata.openGraph` |
| `public/og-image-twitter.png` | 1200×675 for `metadata.twitter` |
| `public/robots.txt` | Static "Allow: /" |
| `app/sitemap.ts` | Dynamic sitemap (Next.js convention) |

**Generation flow:** author `logo-mark.svg` first; use a single one-time script with `sharp` (offline) or a tool like RealFaviconGenerator (manual) to produce the raster + manifest. Commit all outputs to `/public`. No CDN, no third-party hosting.

### Icon system recommendation

**Lucide.** Already installed (`lucide-react ^1.8.0`). Single library, tree-shakable, consistent stroke style. **Do not introduce Heroicons or a second library.** Emoji removed everywhere they're load-bearing (CF-04).

### Photography

Skip in v1. Premium edtech-SaaS pattern is illustration-light. The 8 surgical-instrument SVGs in `/public/instruments/` are domain-relevant — use 1–2 sparingly (e.g., as a faint background watermark in the OhioHealth band).

---

## 5.5 Implementation roadmap

> Units: **half-days** of focused work, single dev with Claude Code. Add 20% buffer when committing to a date.

### Phase A — Foundation (3 half-days)

| Task | Half-days |
|---|---|
| Fix font variable (CF-01) | 0.1 |
| Author `tokens.ts` + sync script + globals.css mirror | 1.0 |
| Replace all inline `oklch()` literals with tokens (`page.tsx`, dashboards) | 0.5 |
| Generate logo SVG files + favicon set + OG image + manifest | 1.0 |
| Add Lucide icon mapping for all emoji (CF-04) — find/replace | 0.4 |

**Verification gate:** every page renders with Geist; no `oklch()` literals remain in `src/**` outside `tokens.ts` and `globals.css`; favicon and OG show correctly on `localhost:3000` and a deployed preview.

### Phase B — Core components (4 half-days)

| Task | Half-days |
|---|---|
| Extend Button (md, lg, xl sizes + loading state) | 0.3 |
| Extend Card (interactive, featured variants) | 0.3 |
| Extend Input (md, lg sizes) | 0.2 |
| Add Form primitive (shadcn) | 0.3 |
| Add Dialog, Sheet, Toast (Sonner), Skeleton primitives | 0.6 |
| Add Tooltip, Tabs, Accordion, Alert, Avatar, DropdownMenu, Table | 0.8 |
| Build EmptyState, PageHeader, StatCard, ScoreRing, MarketingCard, SectionHeader, Footer, NavBar, MobileNav | 1.5 |

**Verification gate:** every primitive has a story-style demo page at `/dev/components` (gated behind env var) showing all variants in light + dark. Type-checks pass.

### Phase C — Page rebuilds (8 half-days)

In conversion-impact order:

| Task | Half-days |
|---|---|
| `/` Marketing landing rebuild | 2.0 |
| `/login`, `/register`, `/reset-password` rebuild | 1.0 |
| `/student/onboarding` (Stepper + Form) | 1.0 |
| `/student/dashboard` (sidebar + dashboard rows) | 1.0 |
| `/student/results` (HeroBanner + breakdown) | 0.5 |
| `/student/assessment/[id]/[step]` (per-question polish) | 0.5 |
| `/hospital/dashboard` + `/hospital/candidates/[id]` (with sticky action bar + dialog) | 1.5 |
| `/hospital/openings/*` and `/admin/dashboard` | 0.5 |

**Verification gate:** every page loads, looks correct in 320px / 768px / 1280px viewports, and passes a Lighthouse mobile A11y score of ≥ 90.

### Phase D — Polish (3 half-days)

| Task | Half-days |
|---|---|
| Add scroll-triggered reveals (marketing) | 0.5 |
| Add ScoreRing animation on update | 0.3 |
| Loading skeletons for every async surface (per route group `loading.tsx`) | 0.7 |
| Error boundaries (`error.tsx` per route group + root) | 0.4 |
| 404 (`not-found.tsx`) + restyle `unauthorized` | 0.3 |
| Mount PostHog provider + page-view capture | 0.3 |
| Add CSP / HSTS / X-Frame-Options headers in `next.config.ts` | 0.2 |
| Robots.txt + sitemap + metadata polish | 0.3 |

### Phase E — QA pass (2 half-days)

| Task | Half-days |
|---|---|
| Manual a11y pass (keyboard, screen reader on hero + key forms) | 0.5 |
| Manual responsive pass (Chrome devtools breakpoints, real iPhone if available) | 0.5 |
| Contrast audit (all token combinations vs WCAG AA) | 0.3 |
| Cross-browser smoke test (Chrome / Safari / Firefox) | 0.3 |
| Stripe-out: remove all "removed" leftover comments, confirm no `oklch()` literals, confirm no emoji | 0.4 |

### Total: **20 half-days = 10 working days** for the full premium rebuild.

Phase A and Phase B can run in parallel with two devs (or two terminals). Phase C is the bulk of the work and benefits from being sequenced page-by-page.

---

## 5.6 Risk register

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R-01 | Brand palette changes after `tokens.ts` is shipped | Medium | All color literals route through tokens; a palette change is a one-file edit + sync script run |
| R-02 | Auth flow regressions during page rebuild | High | The 5 critical pitfalls in `STATE.md` are constraints; don't touch `src/lib/supabase/*` during the UI pass; add a basic auth e2e test before Phase C |
| R-03 | RLS coupling — UI changes that expose unintended data | Medium | DAL pattern enforced; never call Supabase from a component; reuse existing DAL functions |
| R-04 | Next.js 16 quirks vs. familiar Next.js 14/15 patterns | Medium | `AGENTS.md` explicitly warns. `proxy.ts` already in place. Don't downgrade. |
| R-05 | `@base-ui/react` ≠ Radix — shadcn primitives use base-ui patterns | Medium | When `npx shadcn add` pulls a new primitive, it may pull Radix-based code. Need to swap to base-ui equivalents at install time. |
| R-06 | PostHog event names tied to current DOM structure | Low | Audit `data-attr` / `data-ph-*` calls; preserve event names where they exist |
| R-07 | SEO impact of marketing-page changes (URL stays `/`, content stays similar) | Low | URLs don't change; titles/descriptions improve, not regress; sitemap added |
| R-08 | Resend email templates coupling | Low | Email template tokens read from `tokens.ts` after migration; one round of test sends before launch |
| R-09 | Phase 6 in-memory data | High (engineering, not UI) | Flagged separately to engineering owner — migrate Learning/Mastery/Cohort/Certificate data to Supabase before launch |
| R-10 | `node_modules` not installed in this audit container | Low (process) | Implementation session installs deps first; CI verifies `npm ci && npm run build` succeeds |
| R-11 | Mobile nav truncation ("Out") fix risks breaking layouts | Low | One-line change; visual smoke test on iPhone SE width |
| R-12 | Touch target enlargement breaks dense tables | Low | Add size variants without changing default for table cell controls |
| R-13 | Footer + privacy/terms pages — legal copy unfinished | Medium | Stub with placeholder language and a "Last updated TBD" marker; legal review before launch |
| R-14 | Enterprise CTA leads — no lead-capture pipeline yet | Medium | First version emails `terrysc107@gmail.com` via Resend; full CRM integration is post-launch |

---

## 5.7 Out of scope (future work)

| Item | Why deferred | When to reconsider |
|---|---|---|
| Stripe / paid plans | CLAUDE.md explicitly excludes Stripe from v1 | When freemium → paid demand signals appear |
| AI-generated candidate narrative | v1 uses template strings (per STATE.md decision); LLM upgrade is v2 | When narrative quality from templates plateaus |
| SPD Cert Prep integration | Both products must stabilize first | After both are live for a quarter |
| In-app messaging inbox | Coordinators use email; over-engineered for v1 | If Resend reply-handling proves insufficient |
| Native mobile app | Web-first | Phase 2+ |
| Dark mode polish | Scaffolded but no consumer demand verified | After light-mode rebuild ships |
| Preceptor role | Third auth role adds complexity | After hospital-side adoption proves model |
| Deep geocoding for geography score | State-level fallback works for v1 | When mismatches appear in real placements |
| Multi-tenant / white-label | Enterprise-tier feature | After Healthmark deal closes |
| Compliance / audit intelligence module | Future product line | Phase 3+ |
| Translations / i18n | English-only v1 | When non-US partners appear |
| OAuth (Google / Apple) for student signup | Email/password is sufficient for now | When student signup drop-off > 30% |
| Accessibility WCAG AAA target | AA is the audit target | After AA is confirmed across all pages |

---

## How to use this plan

1. **Approve the brand-palette anchor (`#0E7C66` or substitute)** — this is the single gating decision before Phase A starts.
2. Open a fresh Claude Code session referencing this file as the source of truth.
3. Execute **Phase A** first — token + asset foundation. Do not start Phase B until Phase A passes its verification gate.
4. Run Phases B and C in their listed order. Each task is small enough to commit independently.
5. After Phase E, re-run the audit pass to verify scores moved from 5–6 range into 8–9 range.
