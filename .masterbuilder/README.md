# Builder System Repo

This repo is a reusable multi-agent operating system for building rich, high-quality apps and websites.

It is designed so any capable LLM can step into the process, understand the team model, and execute work in a methodical order instead of improvising the build.

## What This Repo Gives You

- a concrete specialist agent roster
- clear role boundaries and ownership
- reusable prompts for each agent
- a phase-based execution system
- templates for planning, auditing, reviews, and signoff
- a learning loop so the system improves as phases complete

## Repo Structure

- `docs/TEAM.md`: agent roster, responsibilities, and ownership model
- `docs/AGENT-PROMPTS.md`: reusable prompts for each specialist agent
- `docs/MASTER-PLAN.md`: the operating system for running builds
- `docs/PHASE-MODEL.md`: generic phase sequence for app and website builds
- `docs/LEARNING-LOOP.md`: how the system learns, records decisions, and improves
- `docs/NEXT-STEPS.md`: what to do right after adopting this system
- `docs/MAX-POTENTIAL.md`: how to use the system at full strength
- `docs/BOOTSTRAP-A-PROJECT.md`: how to apply this system to a fresh repo
- `docs/COMMANDS.md`: copy-ready execution prompts
- `docs/SPECIALISTS.md`: optional advanced agents for specialized builds
- `docs/SYSTEM-IMPROVEMENT-PROTOCOL.md`: how to evolve the builder system after real use
- `docs/COMMERCIAL-USE-AND-SALE.md`: how to package this repo for private use, client delivery, or sale
- `docs/RELEASE-AND-VERSIONING.md`: how to manage versions and releases over time
- `templates/`: reusable templates for project kickoff, phase contracts, audits, and reviews
- `phases/`: reusable per-phase playbooks
- `memory/`: placeholders for decisions, learnings, debt, and patterns

## How To Use This Repo

1. Start with `docs/MASTER-PLAN.md`.
2. Read `docs/MAX-POTENTIAL.md`.
3. Read `docs/TEAM.md`, `docs/AGENT-PROMPTS.md`, and `docs/PHASE-MODEL.md`.
4. Use `docs/BOOTSTRAP-A-PROJECT.md` when applying this system to a real product repo.
5. Copy the phase templates or use the files in `phases/` directly.
6. Create a new project folder or clone these docs into a target product repo.
7. Run one phase at a time.

## Best Starting Order

1. `docs/MASTER-PLAN.md`
2. `docs/MAX-POTENTIAL.md`
3. `docs/BOOTSTRAP-A-PROJECT.md`
4. `templates/PROJECT-KICKOFF-TEMPLATE.md`
5. the appropriate phase playbook in `phases/`

## Best Test Flow

If you want to test the system immediately:

1. pick a real app or website repo
2. copy this system into that repo
3. run the bootstrap command from `docs/COMMANDS.md`
4. let the system choose the first active phase
5. execute one phase fully, including review and learning update

That is the fastest way to see whether the system is doing real work instead of sounding smart.

## Default Command Pattern

Use instructions like:

`Execute Phase 01 using phases/PHASE-01-product-clarity.md and follow docs/MASTER-PLAN.md.`

Or:

`Act as Chief Builder. Read docs/MASTER-PLAN.md and templates/PROJECT-KICKOFF-TEMPLATE.md, then set up this new project for execution.`

## Core Rule

Only one phase is active at a time. A build gets better when order is protected.
