# Feature Landscape: SPD Ready

**Domain:** Healthcare workforce readiness + externship placement platform
**Researched:** 2026-04-20
**Confidence:** MEDIUM-HIGH (grounded in project documents + training knowledge of clinical rotation systems, allied health placement UX, and healthcare workforce platforms — WebSearch unavailable for external verification)

---

## Table Stakes

Features users will expect on day one. Absence makes the product feel broken or untrustworthy.

### Student-Facing Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Email/password registration + magic link | Standard auth expectation; magic link is particularly expected in healthcare education where users are not tech-heavy | Low | Supabase Auth covers both. Both modes should work from day one. |
| Role-based onboarding split (student vs hospital) | Users need to land in their own context immediately after signup | Low | Role selection on first login, not buried in settings |
| Single-page profile intake with clear progress | Students in healthcare programs are time-constrained; a wall of fields causes abandonment | Medium | Multi-step wizard with section headers. Save-on-step-complete, not just on submit. |
| Assessment that feels domain-specific, not generic | SPD students will distrust a generic questionnaire. Questions must reference real SPD vocabulary and workflow scenarios | High | This is the core product and the hardest to get right. Questions should use terms like "decontamination," "IFU," "OR," "indicator," not generic "workplace scenarios." |
| Immediate results on assessment completion | Healthcare students have come to expect instant scoring from cert prep apps. Delay feels broken. | Medium | Score calculation is synchronous on submit; no async job needed for v1 |
| Results page with tier label + structured breakdown | A single number is not useful. Students need to know what they scored on and why. | Medium | Show per-category bars, strengths list, growth areas list, and the tier badge prominently |
| Clear "what happens next" after results | Without a next step, students abandon. They need to know: "Can I apply now? What do I do to improve?" | Low | Static copy driven by tier logic: Tier 1 = apply, Tier 2 = apply with caveats, Tier 3 = improvement path |
| Profile completeness indicator | Students in placement programs respond to visible progress. "Your profile is 60% complete" drives action. | Low | Simple percentage bar, not complex gamification |
| Ability to see open externship listings | Students need to know opportunities exist before they invest in assessment | Low | Read-only listing page available before assessment completion; apply action gated |
| Application status tracking (applied, under review, accepted, waitlisted, rejected) | Once a student applies, they will check status obsessively. No visibility = anxiety = support emails. | Low | Status label on application, updated by hospital action |
| Email notification on status change | Students will not poll the dashboard reliably. Email on accept/waitlist/reject is table stakes. | Low | Resend + simple template |
| Password reset flow | Forgotten password support; healthcare education users often have shared devices or long gaps between logins | Low | Supabase built-in, just needs UI hookup |

### Hospital / Coordinator-Facing Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Site profile creation with department details | Hospitals expect to describe their environment, not just their name. Coordinators want the platform to understand their site. | Medium | The profile inputs (capacity, teaching strength, complexity) directly feed the fit scoring model |
| Ability to create and manage externship openings | Without this, the hospital has nothing to post. This is the core transaction. | Medium | Create, edit, toggle status (open/closed/filled) |
| Ranked candidate list sorted by fit score | Coordinators want pre-sorted lists, not raw applicant dumps. The ranked view is a differentiator disguised as table stakes. | Medium | Sort by fit_score descending; show readiness tier badge inline |
| Full structured candidate profile view | Coordinators need more than a resume. They expect: tier, category breakdown, strengths, growth areas, fit rationale | Medium | This is what makes the product feel like intelligence, not a job board |
| Accept / Waitlist / Reject actions per candidate | Basic placement decision workflow. Without this, coordinators have no way to act inside the system. | Low | Status update + trigger email to student |
| Application notes field | Coordinators always want to add internal notes. This prevents them from using workarounds (spreadsheets, email threads). | Low | Internal only, not visible to student |
| Email notification when new candidates apply | Coordinators are busy; they will not poll the dashboard. Push on new applicant is expected. | Low | Resend trigger on application submit |
| Post-placement feedback form | Hospitals want to close the loop. The form should be simple and feel like a professional rating tool, not a survey. | Low | 5-6 scored attributes + free text. Submit once per placement. |

### Admin Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Student count + tier distribution view | Admin needs to understand the student pool quality at a glance | Low | Aggregated query, simple bar or donut chart |
| Active openings + application volume | Platform health at a glance | Low | Count queries |
| Placement count + feedback summary | The core outcome metric for the platform | Low | Join across applications and feedback tables |
| Basic list views for students and hospitals | Admin needs to find and review records without a support ticket | Low | Searchable/filterable tables with links to detail views |

---

## Differentiators

Features that set SPD Ready apart from generic job boards, clinical rotation systems, and allied health platforms. Not expected by default, but highly valued when present.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| SPD-specific situational judgment questions | Every other placement tool uses generic "tell me about yourself" or behavioral inventory forms. SPD-specific scenarios ("the OR is pressuring you to send a tray with a missing indicator — what do you do?") signal deep domain credibility to both students and hospital coordinators. | High | These questions are the moat. The question bank must be authored carefully with real SPD scenarios. |
| Tiered readiness label (not just a score) | Raw scores are hard to act on. "Tier 2 — Ready with support" is actionable for a coordinator who knows what that means. Tier-based communication is widely used in clinical credentialing and is immediately legible to hospital staff. | Low | Tier badge should be the most prominent element on the candidate card. |
| Per-category readiness breakdown | Showing that a student is strong on process discipline but weak on situational judgment gives coordinators coaching direction. No generic placement platform offers this. This is the structural advantage. | Medium | Render as labeled horizontal bars with color coding (green/yellow/red by threshold) |
| Fit score with visible rationale | Most matching systems give a score with no explanation. Showing "Geography: 20/20, Schedule: 15/20, Readiness tier: 12/20..." lets the coordinator trust the ranking and understand edge cases. | Medium | Fit score breakdown panel on candidate detail view. This is the "why" layer. |
| Candidate narrative summary | A 2–3 sentence structured narrative ("This candidate shows strong process discipline with moderate coaching needs in instrument recognition...") is far more scannable than a raw profile grid. Coordinators will read this before looking at numbers. | Medium | Generate from structured scoring inputs using template strings in v1; AI-generated in v2 |
| Improvement path for Tier 3 students | Most platforms reject low-scoring applicants with no recourse. SPD Ready can show Tier 3 students exactly which categories to improve and what "improvement" looks like. This turns a rejection into a re-engagement cycle. | Medium | Tier 3 results page shows: which categories are below threshold, what a passing score looks like, and suggested actions |
| Progression toward application unlock (meaningful gamification) | Gamification tied to placement eligibility — "Complete 2 more practice scenarios to become eligible" — is more motivating than badges. It models how cert prep apps (like IAHCSMM resources) work but applied to placement readiness. | Medium | This can be a simple progress bar tied to score threshold, not complex systems |
| Post-placement feedback loop visible to admin | Closing the loop (how did students perform at site?) and surfacing that data to admin creates a quality signal that no job board provides. Over time this creates a data moat. | Low | Even in MVP, capturing feedback enables future analytics |
| Hospital teaching capacity matching | Matching a Tier 2 student who needs coaching support to a high-teaching-capacity site — and showing that match rationale to the coordinator — is operationally useful in a way that LinkedIn or Indeed can never be. | Medium | Driven by support_alignment dimension in fit score model |

---

## Anti-Features

Features to deliberately exclude from v1. Each has a reason and a safer alternative.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| In-app messaging / inbox | Adds significant session-state complexity, notification infrastructure, and moderation surface. On a timeline aimed at a conference demo, this is a trap. Healthcare coordinators already have email workflows. | Email notifications via Resend. Notes fields for internal coordinator use. |
| Resume upload / parsing | Resumes are inconsistently formatted, hard to parse reliably, and shift focus from the structured readiness profile — which is the product's core value. If a hospital wants a resume, they can request it off-platform. | Structured profile fields replace resume. The readiness profile IS the credential. |
| Social / community feed | Students comparing scores, forums, activity feeds — adds complexity and moderability requirements. Not what hospital coordinators need. | Static informational content and next-step guidance |
| Student-to-hospital direct application without assessment completion | Allowing unscored applications destroys the quality signal that differentiates the platform from a generic job board | Gate application submission behind assessment completion (any tier can apply, but score must exist) |
| AI-generated matching (black box) | Opaque AI scoring will confuse coordinators, make the fit rationale untestable, and slow the build. The deterministic model is faster, explainable, and sufficient for v1. | Deterministic weighted formula. AI layer is Phase 2+ |
| Badges and achievement trophies for generic actions | "You completed your profile! Here's a badge." reads as childish to adult healthcare workers. Undermines professional credibility. | Progress indicators tied only to placement eligibility milestones |
| Assessment retake immediately without any gate | Unlimited instant retakes let students game the score. They'll retake until they hit Tier 1 and the readiness signal collapses. | 24-hour or 48-hour cooldown on retakes. Show improvement guidance between attempts. |
| Stripe / payment flow | Monetization before product-market fit creates friction and reduces the demo pool. Conference demo needs frictionless signups. | No payment in v1. Capture user data for future monetization. |
| Multi-hospital dashboard / enterprise accounts | White-label, multi-tenant hospital system accounts require significant auth and data scoping complexity. Not needed for conference demo. | Each hospital user maps 1:1 to a site. Multi-site is a future RBAC addition. |
| Student document uploads (vaccination records, ID, background check) | Compliance document management is a whole product category. HIPAA implications, storage policy, retention schedules. | Out of scope. Verification workflows are future modules. |
| Preceptor-specific role / login | Preceptors are a third distinct user type with different needs from site coordinators. Building a third role in v1 balloons the auth/routing complexity. | Post-placement feedback is handled by the site coordinator account. Preceptor tools are a named Phase 2 module. |
| Full LMS / learning content inside SPD Ready | Content belongs in SPD Cert Prep. If SPD Ready becomes an LMS, the product identity blurs. | Link to SPD Cert Prep for learning. SPD Ready owns readiness evaluation only. |
| Automated reference checks or background screening | Deep compliance requirements, third-party integrations, legal liability. Not an MVP problem. | Manual off-platform process. Platform captures feedback only post-placement. |

---

## UX Patterns That Work for This Audience

These are patterns from clinical rotation systems (like Exxat, MedHub, OneAcademy), allied health credentialing (like VerityStream), and healthcare education apps that consistently perform well with SPD's target users.

### Students (adult learners, many non-traditional, tech-moderate)

**Step-by-step wizard over long-form pages.**
Assessment completion and profile intake should be one question or one section at a time, not a wall of fields. Healthcare adult learners who are used to cert prep apps (often mobile-heavy, card-by-card) will abandon long pages. The Duolingo / cert prep "one question, then next" pattern applies here even on desktop.

**Progress bar at top of multi-step flows.**
"Step 3 of 6" or a percentage bar dramatically reduces drop-off in onboarding flows. This is validated across clinical rotation platforms (Exxat shows completion state persistently). Students need to know how long the investment will take before they commit.

**Tier badge as the hero element on the results page.**
After assessment completion, the tier label (Ready / Ready with Support / Not Ready Yet) should be the first thing the student sees, in a large, colored, unambiguous visual. The detailed breakdown comes second. This matches how cert prep score pages work (PASS/FAIL first, then category detail).

**Strength/weakness framing over deficit-only framing.**
Healthcare learners are often working adults with fragile confidence. "Your strengths include X and Y; your growth areas include Z" lands better than a list of what they got wrong. This is standard in clinical evaluation (nursing NCLEX score breakdowns use this pattern).

**Action-oriented next steps, not informational.**
Results pages that end with "keep learning!" are abandoned. Results pages that end with "You're eligible to apply — here are 3 open sites" drive action. Every results state (all three tiers) needs a clear, specific CTA.

**Suppress empty states aggressively.**
"No openings available in your area" with nothing else is a dead end. Replace with: "No openings in your area yet — you'll be notified when one opens." Always give the user something to do or wait for.

### Hospital Coordinators

**Card-based candidate list with inline tier badge.**
Coordinators reviewing candidates in platforms like Exxat or MD-Staff do not read tables. They scan cards. Each candidate card should show: name, tier badge (color-coded), fit score, and primary strength in ~3 lines. The detail view is for the committed reviewer.

**Action buttons immediately visible on candidate card.**
Accept / Waitlist / Reject should be accessible from the card view, not buried in the detail view. Coordinators making bulk decisions (reviewing 8 candidates for 2 slots) will not open each profile. They will act from the card.

**Fit rationale visible without clicking.**
Show the top 2 fit dimensions inline: "Geography: 20/20 | Schedule: 18/20." This is the one thing clinical rotation platforms almost universally fail at (they show a score with no explanation). Making the rationale scannable is a true differentiator.

**Simple, fast feedback form.**
Post-placement feedback should be completable in under 2 minutes. 5–6 attributes with a 1–5 scale plus a single text field for notes. Healthcare coordinators are time-pressed; a 10-minute feedback survey will not be completed. Models after ACGME milestone rating brevity.

**No required fields on hospital notes.**
Notes are for internal coordination. Requiring notes before an action (accept/reject) creates friction and reduces action rates. Make notes optional always.

### Admin

**Summary metrics first, detail second.**
The admin dashboard should lead with 4–5 KPI tiles (total students, tier distribution, active openings, placements this month, average readiness score). Detail tables below. This mirrors how clinical rotation coordinators use aggregate dashboards in MedHub.

**Tier distribution as a visual, not a table.**
A simple horizontal stacked bar (Tier 1 / Tier 2 / Tier 3 counts) communicates platform quality faster than a number. This is the metric that demonstrates platform value to a hospital executive or Healthmark stakeholder.

---

## Feature Dependencies

```
User account (auth) → Student profile intake
Student profile intake → Assessment access
Assessment completion → Results page
Results page → Application eligibility (any tier can apply, but score must exist)
Application eligibility → Opening application

Hospital account (auth) → Hospital profile
Hospital profile → Externship opening creation
Externship opening + Student applications → Candidate ranked list
Candidate ranked list → Accept / Waitlist / Reject actions
Accepted placement → Feedback form (unlocked after placement start date)

Admin account → All read-only views
```

---

## MVP Feature Recommendation

### Prioritize (build in v1)

1. Auth (student + hospital + admin roles, email/password + magic link)
2. Student profile intake wizard (8–10 fields, multi-step)
3. 30-question assessment flow (one question per screen, progress bar)
4. Scored results page with tier, category breakdown, strengths, growth areas, CTA
5. Hospital profile intake (11–12 fields)
6. Externship opening creation (6–7 fields, status toggle)
7. Fit score computation on application submit
8. Ranked candidate list for hospital (card view, tier badge, fit score)
9. Candidate detail view (full profile + fit rationale breakdown)
10. Accept / Waitlist / Reject actions + email notification to student
11. Post-placement feedback form (6 attributes + notes)
12. Admin dashboard (5 KPI tiles + basic list views)
13. Landing page with split CTA (Student / Hospital)

### Defer (Phase 2+)

- Assessment retake with cooldown and improvement tracking
- AI-generated candidate narrative summaries (v1 uses template strings)
- SPD Cert Prep data sync
- Preceptor role and tools
- Multi-site hospital accounts
- Compliance document management
- Advanced analytics and trend views
- Stripe payment integration

---

## Complexity Notes

| Area | Complexity | Primary Risk |
|------|------------|-------------|
| Assessment question design (30 SPD-specific questions) | High | Getting the question content right is harder than the UI. Questions that feel generic will undermine trust with hospital coordinators who are SPD subject matter experts. Needs domain review. |
| Fit score computation accuracy | Medium | The formula is simple, but geography matching (radius calculation from city/state without a paid geocoding API) may require approximation. Use state-level fallback if needed for v1. |
| Candidate narrative generation | Medium | Template-string generation is fast to build but may produce robotic copy. This is the highest candidate for an LLM call in Phase 2. In v1, keep templates explicit and test with real SPD scenarios. |
| Email notification reliability | Low | Resend is reliable. The main risk is testing all trigger points (application submitted, status changed, feedback received). Create a test seeding script to exercise all paths. |
| Assessment retake gating (anti-gaming) | Medium | A 24–48 hour cooldown prevents score gaming but requires tracking attempt timestamps and surfacing the cooldown state clearly in the UI so students are not confused. Defer full implementation but design the schema to support it. |
| Hospital onboarding drop-off | Medium | Coordinators often start profiles and abandon. The hospital profile should be completable without filling every field; allow partial saves. Only require fields that feed the fit model. |
| Role-based routing post-login | Low | Supabase RLS + role column on users table. The risk is forgetting to guard all routes; use middleware-level role checks, not just UI-level conditional rendering. |

---

## Sources and Confidence

| Area | Confidence | Basis |
|------|------------|-------|
| Student UX patterns | MEDIUM | Derived from clinical rotation system patterns (Exxat, MedHub behavior patterns), cert prep app conventions, allied health learner UX research in training knowledge. WebSearch unavailable for direct verification. |
| Hospital coordinator workflow | MEDIUM | Based on healthcare workforce credentialing platform conventions (VerityStream, MD-Staff, DirectShifts pattern knowledge) and project document descriptions of coordinator needs |
| Anti-features | HIGH | Directly grounded in PROJECT.md out-of-scope decisions and handoff document §18, augmented by general patterns of scope creep in similar platforms |
| SPD domain specificity | HIGH | Directly sourced from spd_ready_planning_handoff.md §8–§14; these reflect client-validated domain knowledge |
| Gamification guidance | MEDIUM-HIGH | Directly sourced from handoff document §14; aligned with healthcare education engagement research patterns |
| Feature dependencies | HIGH | Derived directly from the data model and workflow described in PROJECT.md and handoff §19–20 |
