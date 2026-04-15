# Holonomic Brain Operating Model

Project: **<PROJECT_NAME>**
Updated: <YYYY-MM-DD>
Status: evolving

## Purpose

This project is operated as a shared multi-agent brain, not as a single assistant
with isolated memory.

The concept is a `Holonomic Brain`:

- many agents
- many tools
- many execution environments
- one evolving project mind

## Core Principle

Multiple models may work in parallel or at different times, but the project should
accumulate knowledge as if **one brain** is learning.

This means:

- durable knowledge must be written into the wiki
- compact operating memory must be updated from the wiki
- temporary chat context must not remain the only place where important beliefs exist
- identity, environment, and role knowledge are first-class project knowledge

## Known Working Environments

<!-- Fill in only the environments actually used in this project. Remove the rest. -->

- Claude Code
- Codex
- Gemini CLI
- Antigravity IDE
- OpenCode (OMO plugin)

These are not separate knowledge systems. They are execution surfaces for the same
project brain.

## Active Agent Roster

<!-- Assign characters/nicknames to the agents actually in use. -->

- `Ko-bujang` — <which environment / role>
- `Oh-gwajang` — <which environment / role>
- `Jem-daeri` — <which environment / role>
- `<new-alias>` — <environment / role>

Prefer stable romanized aliases so naming stays readable across tools.

## Shared Brain Rules

To function as one brain, agents must:

- write durable findings back into `docs/wiki/`
- update `.omc/project-memory.json` when operating rules change
- avoid treating one agent's chat context as private truth
- prefer shared artifacts over ephemeral conversation history
- record incidents, architecture changes, and strategic shifts in the wiki
- use a generated code graph (e.g. `graphify-out/`) as a shared navigation shortcut
  when one exists

## Concurrency & WIP Synchronization Protocol

When multiple agents operate simultaneously:

1. **Broadcast active tasks** — register ongoing work in `docs/wiki/active-tasks.md`
   (or `.omc/active-tasks.json`) before starting complex modifications.
2. **Locking & sequencing** — if another agent is already modifying a critical path,
   wait or ask the human driver for sequencing priority.
3. **Completion & cleanup** — mark the task `[DONE]` or remove it when finished so
   others know the lock is released.

## What Must Be Remembered

The Holonomic Brain must preserve at least:

- project identity
- product direction
- environment topology
- active agent roster and nicknames
- known failures and fixes
- workflows that proved reliable
- assumptions that were superseded

## Revision Policy

Update this page when:

- a new agent joins the working roster
- an environment stops being used
- the team changes naming conventions
- the coordination model changes
- the project learns that an earlier self-description was incomplete or wrong

## Relationship To The LLM Wiki

- The **LLM Wiki** is the storage and maintenance pattern (see `../SCHEMA.md`).
- The **Holonomic Brain** is this project's interpretation of that pattern — what
  the shared brain must remember about itself.
- A generated code graph (if present) is a cheap shared navigation layer over the
  codebase for all agents.
