# Decisions

## Product Brief

**Building:** SPD Ready — a readiness-to-placement engine for sterile processing students and hospital externship sites.

**For:**
- Sterile processing students who need a verified credential to get placed
- Hospital SPD coordinators who need a trusted, ranked candidate pipeline

**Success:**
- A student studies, takes a 30-question assessment, gets a scored profile with a tier (1/2/3), and surfaces in hospital pipelines if Tier 1.
- A coordinator opens the platform and sees ranked candidates with technical + judgment scores side by side — placement decisions become low-risk.

## Active Phase

**Phase 03 — Frontend Foundation** (extended into Phase 04 Core Experience Completion)
**Active branch:** `claude/upgrade-ui-premium-z0YzN`
**Status:** Audit complete; design system proposal awaiting product approval before implementation.

## Decision Log

### 2026-05-14 — Activate Masterbuilder framework
- Copied `terrysc107-cloud/masterbuilder` (public) into `.masterbuilder/` to provide the multi-agent + phase playbook system without overwriting spd-ready's existing CLAUDE.md/AGENTS.md/.planning/ artifacts.
- Adopted the 13-specialist agent roster (Chief Builder, Scout, Product Architect, Flow Architect, Frontend Builder, Design Auditor, Content Systems Builder, Assessment Builder, Offer Strategist, Backend Builder, Systems Architect, Verifier, Learning Steward).
- Adopted the 11-phase model. Current product is at the front of Phase 03 (Frontend Foundation) and will iterate into Phase 04 (Core Experience Completion).
- Ruflo runtime is NOT activated (no daemon/swarm running) — we use the framework as a methodology only, not as a runtime. Avoids new infra inside an existing Vercel/Supabase product.

### 2026-05-14 — UI premium upgrade approach
- User feedback: current UI looks "low budget / not serious." Need premium feel.
- Approach approved: **audit first, then propose design system, then implement in 4 PRs.**
- Direction selected: "Premium Clinical" — editorial light theme, Fraunces display + Geist sans, Lucide icons, no emoji in product chrome, formalized token layer, aurora hero treatment, app-shell unification across student + hospital.
- Career-prep elements (interview prep, career roadmap, professional readiness) deferred to PR 4 — scope decided after audit approval. See `.planning/ui-audit/CAREER-PREP-SCOPING.md`.

### Output of this session
- `.planning/ui-audit/AUDIT.md` — Scout + Design Auditor + Flow Architect findings, severity-ranked
- `.planning/ui-audit/DESIGN-SYSTEM-PROPOSAL.md` — Premium Clinical proposal with tokens, components, migration plan
- `.planning/ui-audit/CAREER-PREP-SCOPING.md` — placeholder for the PR 4 scope decision

## Rules

- Audit before implementation. Audit findings drive what we change.
- One phase active at a time.
- Tokens not literals — no more inline `oklch(...)` strings in component code once the token PR lands.
- Emoji belongs in user-generated content, never in our own UI chrome.
- Dark mode either gets rebuilt properly or gets removed — half-built dark mode is a trust killer.
