# Holonomic Brain Operating Model

Updated: 2026-04-14
Status: evolving

## Purpose

Intercept is operated as a shared multi-agent brain, not as a single assistant with isolated memory.

The right concept for this repository is not only a "second brain" but a `Holonomic Brain`:

- many agents
- many tools
- many execution environments
- one evolving project mind

## Core Principle

Multiple models may work in parallel or at different times, but the project should accumulate knowledge as if one brain is learning.

This means:

- durable knowledge must be written into the wiki
- compact operating memory must be updated from the wiki
- temporary chat context must not remain the only place where important beliefs exist
- identity, environment, and role knowledge are first-class project knowledge

## Known Working Environments

As of 2026-04-14, the project is known to operate across these environments:

- Antigravity IDE
- Claude Code
- Codex environment
- Gemini CLI
- OpenCode with the OMO plugin

These are not separate knowledge systems. They are execution surfaces for the same project brain.

## Active Agent Roster

As of 2026-04-14, the known roster is:

- `Ko-bujang`: Claude Code
- `An-teamjang`: the AI model working inside Antigravity IDE
- `O-gwajang`: Codex
- `Jem-daeri`: Gemini CLI
- `Si-bujang`: Sisyphus via OpenCode with the OMO plugin

## Important Historical Note

`O-gwajang` was previously used together with Claude Code through a Codex plugin.
Running `O-gwajang` as a separately called environment is described as a first in this project context on 2026-04-14.

## Shared Brain Rules

To function as one brain, the agents must behave this way:

- write durable findings back into `docs/wiki/`
- update `.omc/project-memory.json` when operating rules change
- avoid treating one agent's chat context as private truth
- prefer shared artifacts over ephemeral conversation history
- record incidents, architecture changes, and strategic shifts in the wiki
- use `graphify-out/GRAPH_REPORT.md` as a shared structural shortcut when a current graph exists

## Concurrency & WIP (Work-In-Progress) Synchronization Protocol

When multiple agents (`An-teamjang`, `Ko-bujang`, `O-gwajang`, etc.) are operating simultaneously:

1. **Broadcast Active Tasks**: Agents must register their current ongoing work in a shared location (e.g., `docs/wiki/active-tasks.md` or `.omc/active-tasks.json`) before starting complex modifications. 
2. **Locking & Sequencing**: If an agent discovers that another agent is already modifying a critical path, it must wait or ask the human driver for sequencing priority to avoid Git conflicts, file overwrites, or broken states.
3. **Completion & Cleanup**: Once a task is complete (or pushed), the agent must remove or mark the task as `[DONE]` so other agents are aware the lock is released.

## What Must Be Remembered

The Holonomic Brain must preserve at least these categories:

- project identity
- product direction
- environment topology
- active agent roster and nicknames
- known failures and fixes
- workflows that proved reliable
- assumptions that were superseded

## Revision Policy

This page is intentionally not final.

It should be updated when:

- a new agent joins the working roster
- an environment stops being used
- the team changes naming conventions
- the coordination model changes
- the project learns that an earlier self-description was incomplete or wrong

## Relationship To The LLM Wiki

The LLM Wiki is the storage and maintenance pattern.
The Holonomic Brain is the project-specific interpretation of that pattern.

In this repository:

- `LLM Wiki` explains the maintenance mechanism
- `Holonomic Brain` explains what the shared brain must remember about itself
- `Graphify` provides the generated structural graph layer that helps multiple agents navigate the same codebase cheaply

## Related Pages

- [LLM Wiki Adoption Plan](./llm-wiki-adoption-plan.md)
- [Graphify Knowledge Graph](../architecture/graphify-knowledge-graph.md)
- [Wiki Schema](../SCHEMA.md)
- [Wiki Index](../index.md)
