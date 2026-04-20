# LLM Wiki Adoption Plan

Updated: 2026-04-14
Status: evolving

## Why This Matters For Intercept

Intercept already has many documents, but they are distributed across:

- meeting notes
- handoff files
- output reports
- ad hoc plans
- machine memory

That is usable for a short period, but it does not compound cleanly. Important knowledge can remain trapped in session notes or chat.

The better model for this project is:

- raw sources are preserved
- wiki pages hold compiled knowledge
- schema governs how agents write and maintain that knowledge
- memory is updated as a compact machine-readable projection of the wiki

## Source Pattern

This plan follows the recent `LLM Wiki` pattern described by Andrej Karpathy, where the LLM maintains a persistent markdown wiki instead of rediscovering knowledge from raw sources on every query. The central idea is to keep a structured wiki between the agent and the raw sources, with explicit ingest, query, and lint operations.

Two recent references shape the Intercept version directly:

- Andrej Karpathy, `LLM Wiki`, published on 2026-04-04
- `LLM Wiki v2`, updated on 2026-04-13, extending the pattern with production memory lessons

An immediately relevant extension is the recent `LLM Wiki v2` writeup, which adds production lessons from persistent agent memory systems:

- memory lifecycle matters
- confidence and supersession matter
- shared multi-agent coordination matters
- audit trails matter

Those additions are especially relevant to Intercept because this repository already mixes product decisions, incidents, deployment notes, and multi-session agent work.

## Intercept Adaptation

### Layer 1: Raw sources

Use `docs/raw/` for immutable inputs:

- clipped articles
- screenshots
- deployment logs
- bug traces
- meeting exports
- external research

### Layer 2: Wiki

Use `docs/wiki/` for compiled project knowledge:

- architecture
- incidents
- strategy

This is the durable human-readable source of truth for the evolving project brain.

### Layer 3: Schema

Use:

- `docs/wiki/SCHEMA.md`
- root `CLAUDE.md`
- `intercept/AGENTS.md`

These files define how agents ingest, write back, and maintain consistency.

### Layer 4: Machine memory

Use `.omc/project-memory.json` as a compact, query-friendly summary for agents.
It should mirror stable knowledge from the wiki, not replace it.

## What We Adopt Now

We are adopting the minimum viable version first:

- raw sources
- wiki pages
- schema
- index
- log
- incident discipline

This is enough to change the behavior of future sessions without introducing extra infrastructure.

## What We Add Next

As the wiki grows, add:

1. Confidence and supersession
   - newer verified production facts should explicitly supersede older assumptions
2. Scheduled linting
   - stale pages, contradictions, and orphan pages should be reviewed routinely
3. Typed entities
   - pages for systems like Supabase, PayPal, PortOne, Cloudflare, Characters, Pricing
4. Search tooling
   - if markdown scale grows, adopt a local markdown search tool such as `qmd`
5. Crystallization
   - valuable debugging sessions and research threads should be filed back as first-class wiki pages

## What We Apply Immediately

The useful part for this repository is not a full memory platform. It is a disciplined operating model.

We will apply these rules right away:

1. Incidents become pages
   - production bugs do not remain only in chat or meeting notes
2. Architecture knowledge becomes pages
   - auth, billing, deploy, and routing behavior should have stable reference pages
3. Session output is temporary unless crystallized
   - a good debugging session must be promoted into wiki pages and machine memory
4. Newer production evidence supersedes older assumptions
   - especially for deploy, auth, routing, and payment behavior
5. Search stays simple until the wiki is large
   - `index.md` remains the main entrypoint for now
   - local search tooling is deferred until page count and query cost justify it

## Operational Hooks For This Project

This repository is already close to an event-driven workflow even without extra infrastructure.

The manual hooks are:

- on deploy incident: create or update an incident page
- on auth or billing change: update the matching architecture page
- on session close: crystallize durable findings into wiki plus `.omc/project-memory.json`
- on major strategy shift: update a strategy page instead of burying the decision in a handoff file

If the wiki grows materially, the next automation step should be lightweight scripts for:

- stale-page checks
- orphan-page checks
- missing index entry checks
- recent log review

## Search And Scale Decision

Karpathy's original pattern is correct for the current size of this repository: a maintained markdown index is enough.

Inference from recent tool ecosystem activity:
if `docs/wiki/` grows past a few hundred pages or if agents begin spending noticeable time scanning markdown manually, the right next step is a local-first markdown search layer such as `qmd`, because it supports:

- BM25 keyword retrieval
- vector retrieval
- reranking
- MCP and CLI access for agents

That is not required yet. It is the next scale step, not the current dependency.

## How This Changes Agent Behavior

Agents working on this repository should stop treating chat as the only memory substrate.

Expected behavior:

- bugs become incident pages
- architecture changes become architecture pages
- strategic shifts become strategy pages
- session notes remain useful, but only as temporary operational material

## Immediate Payoff

- Login fixes will not be rediscovered from scratch later.
- Future auth or routing work has a written failure model.
- Product knowledge can accumulate rather than drift across handoffs.
- The project gains a second brain that improves with every meaningful session.

## External References

- Karpathy gist: <https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>
- LLM Wiki v2 gist: <https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2>
- QMD repository: <https://github.com/tobi/qmd>
