# Intercept Wiki Schema

This file defines how agents maintain the project wiki for Intercept.

## Purpose

The wiki is a persistent, compounding knowledge layer for this project.
Raw sources live in `docs/raw/`.
Compiled knowledge lives in `docs/wiki/`.
Chat output should not be treated as the source of truth unless it is crystallized into wiki pages.

## Core Model

There are six layers:

1. Raw sources
   - Immutable inputs such as articles, logs, screenshots, meeting notes, transcripts, and external research.
   - Stored under `docs/raw/`.
2. Wiki
   - Curated markdown pages maintained by agents.
   - Stored under `docs/wiki/`.
3. Schema
   - This file plus root instructions in `CLAUDE.md` and `intercept/AGENTS.md`.
4. Operational memory
   - `.omc/project-memory.json` for compact machine-readable project memory.
5. USER preferences
   - 대표님의 reporting style, operating principles, and technical preferences.
   - Lives in `docs/wiki/strategy/user-operating-preferences.md`.
   - Separate from project facts; updated when operator preferences change.
6. Search index
   - `data/brain/brain.db` — regenerable SQLite FTS5 index over the brain. NOT the source of truth.
   - Rebuild with `python scripts/index_brain.py`.

The wiki must also preserve the project's self-model:

- project identity
- operating environments
- active agent roster and nicknames
- how multiple agents coordinate as one brain
- how these beliefs can be revised over time

## Required Operations

### Ingest

When a new source is introduced:
- Read the raw source.
- Update one or more wiki pages.
- Update `docs/wiki/index.md`.
- Append an entry to `docs/wiki/log.md`.
- If the source changes a standing belief, update the affected page and mark the old belief as superseded.

### Query

When answering project questions:
- Prefer the wiki layer over rediscovering from scattered files.
- If the answer creates durable project knowledge, file it back into the wiki.
- If the answer is transient, keep it in chat only.

### Lint

Periodically check the wiki for:
- stale claims
- contradictions
- orphan pages
- missing cross-links
- open questions without owners
- incidents without follow-up rules

## Page Types

Use these folders:
- `architecture/` for system shape, data flow, auth, deploy, and component boundaries
- `incidents/` for failures, regressions, root cause, prevention rules
- `strategy/` for product, positioning, knowledge-system design

When the knowledge concerns project identity, agent roles, or the long-term operating model of the repository, prefer `strategy/`.

## Writing Rules

- Prefer short factual sections over long narrative prose.
- Link related pages with relative markdown links.
- Include exact dates for incidents and important decisions.
- Separate facts from inferences.
- For incidents, always include:
  - symptom
  - impact
  - root cause
  - fix
  - guardrails
  - verification
- For identity and operating-model pages, always include:
  - exact date of the belief or update
  - which environment or agent the knowledge applies to
  - whether the statement is stable, evolving, or provisional

## Confidence and Supersession

- Newer, directly verified production evidence beats older assumptions.
- Production evidence beats speculative discussion.
- Build output beats stale meeting notes.
- If a claim is replaced, mark the older claim as superseded instead of silently deleting the history.

## Shared Memory Policy

Durable knowledge belongs in:
- `docs/wiki/`
- `.omc/project-memory.json`

Temporary working notes belong in:
- `docs/AnCo_Meeting.md`
- `output/SESSION_HANDOFF.md`
- `.omc/plans/`

Do not let temporary notes become the only place where important knowledge exists.

## Delegation Contract

Subagents start ignorant. The parent agent must pass an explicit minimum context packet (goal, relevant wiki links, constraints, prior decisions). Subagents must not assume shared state. See `docs/wiki/strategy/delegation-contract.md`.

## Holonomic Brain Policy

This project is not operated by a single model instance. It is operated by a coordinated multi-agent system across multiple tools and IDE environments.

The wiki should therefore maintain:

- a stable description of the shared brain
- the current roster of participating agents and nicknames
- the environments they work in
- any updates to how they divide work or share knowledge

This self-model is durable knowledge and should be updated whenever the team composition or operating environment changes.
