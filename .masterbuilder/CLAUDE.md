# Masterbuilder — Claude Code Instructions

This is a Ruflo-powered multi-agent build system. When you open this repo,
follow the activation and build instructions below exactly.

## On First Open (New Project From Template)

Run this setup sequence once:

```bash
curl -fsSL https://raw.githubusercontent.com/ruvnet/ruflo/main/scripts/install.sh | bash --full
ruflo init --full
ruflo daemon start && ruflo memory init && ruflo swarm init
```

Then ask the user: "What are you building, who is it for, and what does success look like?"
Write their answers to `memory/DECISIONS.md` under `## Product Brief` before doing anything else.

## On Every Session (Resuming a Project)

Ruflo auto-starts via the session hook. Confirm it's running:

```bash
ruflo swarm status
```

Then read `memory/DECISIONS.md` to get current context before responding to any task.

## How to Build

This system uses 11 phases. Each phase has a Ruflo workflow in `workflows/`.

**Run a phase:**
```bash
./workflows/run-phase.sh 01   # Phase 01: Product Clarity
./workflows/run-phase.sh 02   # Phase 02: Core User Flow
# ... through 11
```

**Always complete phases in order.** Do not skip unless the user explicitly instructs it.

**Phase sequence:**
| # | Phase | Lead Agent |
|---|-------|-----------|
| 01 | Product Clarity | Product Architect |
| 02 | Core User Flow | Flow Architect |
| 03 | Frontend Foundation | Frontend Builder |
| 04 | Core Experience Completion | Frontend Builder |
| 05 | Content & Resource System | Content Systems Builder |
| 06 | Assessment & Feedback Layer | Assessment Builder |
| 07 | Offer & Monetization | Offer Strategist |
| 08 | Backend & Data Reality | Backend Builder |
| 09 | Intelligence & Personalization | Systems Architect |
| 10 | Production Hardening | Verifier |
| 11 | Launch Readiness | Chief Builder |

## The Agent Team

13 specialists. Each owns a domain. Only one leads per phase.

- **Chief Builder** — scope control, signoff, launch
- **Scout** — repo audit, reality check
- **Product Architect** — product promise, user outcomes
- **Flow Architect** — onboarding, navigation, momentum
- **Frontend Builder** — UI implementation
- **Design Auditor** — hierarchy, accessibility, polish
- **Content Systems Builder** — prompts, resources, structured assets
- **Assessment Builder** — checkpoints, feedback loops
- **Offer Strategist** — pricing, premium paths
- **Backend Builder** — auth, persistence, APIs
- **Systems Architect** — architecture, long-term shape
- **Verifier** — regression, definition of done
- **Learning Steward** — captures decisions, improves the system

## Memory Files (Agents Write Here Automatically)

- `memory/DECISIONS.md` — what was decided and why
- `memory/LEARNINGS.md` — what was discovered
- `memory/PATTERNS.md` — reusable patterns
- `memory/DEBT.md` — deferred items and known gaps

Always read these before starting any task. Agents write to them after each phase.

## Rules

- Do what has been asked; nothing more, nothing less
- Complete one phase fully before starting the next
- ALWAYS read `memory/DECISIONS.md` before any task
- NEVER create files unless the phase contract requires it
- NEVER commit secrets, credentials, or .env files
- Keep files under 500 lines
- Validate input at system boundaries

## Agent Coordination (SendMessage-First)

Agents coordinate via `SendMessage`, not polling.

```javascript
// Spawn ALL agents in ONE message
Agent({ prompt: "...", name: "lead", run_in_background: true })
Agent({ prompt: "Wait for lead. ...", name: "support", run_in_background: true })
// Then kick off
SendMessage({ to: "lead", message: "[context]" })
```

- ALWAYS name agents so they are addressable
- After spawning: STOP and wait — agents message back when done
- NEVER poll status

## Swarm Config

- Topology: hierarchical-mesh
- Max Agents: 15
- Memory: hybrid + HNSW

## Key Docs

- `docs/TEAM.md` — full agent roster
- `docs/PHASE-MODEL.md` — phase goals and support structure
- `docs/MASTER-PLAN.md` — how to run the build OS
- `docs/AGENT-PROMPTS.md` — reusable agent prompts
- `BOOTSTRAP.md` — full setup guide
