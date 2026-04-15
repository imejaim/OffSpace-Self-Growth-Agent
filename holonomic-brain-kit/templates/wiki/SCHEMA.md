# Project Wiki Schema

This file defines how agents maintain the wiki for **<PROJECT_NAME>**.

## Purpose

The wiki is a persistent, compounding knowledge layer for this project.
Raw sources live in `docs/raw/`. Compiled knowledge lives in `docs/wiki/`.
Chat output is not the source of truth unless it is crystallized into wiki pages.

## Core Model

Four layers:

1. **Raw sources** — `docs/raw/` — immutable inputs (articles, logs, screenshots,
   transcripts, external research).
2. **Wiki** — `docs/wiki/` — curated markdown pages maintained by agents.
3. **Schema** — this file plus root `CLAUDE.md` / `AGENTS.md`.
4. **Operational memory** — `.omc/project-memory.json` (compact, machine-readable).

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
- If the source changes a standing belief, update the affected page and mark the
  old belief as superseded.

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

- `architecture/` — system shape, data flow, auth, deploy, component boundaries
- `incidents/` — failures, regressions, root cause, prevention rules
- `strategy/` — product, positioning, knowledge-system design, operating model

Project identity, agent roles, and long-term operating model belong under `strategy/`.

## Writing Rules

- Prefer short factual sections over long narrative prose.
- Link related pages with relative markdown links.
- Include exact dates for incidents and important decisions.
- Separate facts from inferences.
- For incidents, always include: symptom, impact, root cause, fix, guardrails, verification.
- For identity and operating-model pages, always include: exact date of the belief,
  which environment or agent it applies to, and whether it is stable / evolving / provisional.

## Confidence and Supersession

- Newer, directly verified production evidence beats older assumptions.
- Production evidence beats speculative discussion.
- Build output beats stale meeting notes.
- If a claim is replaced, mark the older claim as superseded instead of silently deleting.

## Shared Memory Policy

Durable knowledge belongs in `docs/wiki/` and `.omc/project-memory.json`.
Temporary working notes belong in ephemeral locations (meeting logs, session handoff,
`.omc/plans/`). Do not let temporary notes become the only place where important
knowledge exists.

## Holonomic Brain Policy

This project may be operated by a coordinated multi-agent system across multiple
tools and IDE environments. The wiki should therefore maintain:

- a stable description of the shared brain
- the current roster of participating agents and nicknames
- the environments they work in
- any updates to how they divide work or share knowledge

This self-model is durable knowledge and should be updated whenever the team
composition or operating environment changes.
