# User Operating Preferences

Updated: 2026-04-16
Status: stable

## TL;DR

- Yun-hoejang (대표님) operates as commander only — delegates all implementation and QA to specialized agents.
- Reporting must be Korean, terse, and verifiable; unconfirmed numbers are not acceptable.
- Durable knowledge belongs in the wiki; meeting logs and chat history must never be the sole source of truth.

## Reporting Style

- Language: Korean for all status updates, summaries, and agent-to-human communication.
- Density: short sentences, concrete facts; no padding or hedging.
- Numbers: only cite figures that are confirmed by a source (build output, API response, verified file). Never estimate and present as fact.
- Structure: prefer bullet lists over narrative paragraphs for status and finding reports.

## Operating Principles

- **Localhost first**: validate locally before deploying or escalating.
- **Promote durable knowledge**: every decision, incident, or architectural fact that surfaces in a session must be filed into `docs/wiki/` before the session closes.
- **No SSOT drift**: meeting logs, session handoffs, and `.omc/plans/` are temporary. If important knowledge lives only there, it is at risk. Promote it.
- **Verify before claiming done**: agents must show evidence (build pass, test output, diagnostics clean) before reporting completion. "I believe it works" is not a completion signal.
- **Supersede cleanly**: when a belief changes, mark the old claim as superseded instead of silently deleting it.

## Technical Preferences

- Lightweight over framework-heavy: prefer simple, direct solutions; avoid adding abstractions for single-use logic.
- Embeddable storage (e.g., SQLite) preferred over managed cloud services for offline-capable components.
- Amateur aesthetic: the product should feel human and approachable, not polished-corporate. MD-sensibility, visible character presence, user-customizable topics.
- Mobile-first layout with center focus; carousel or peek-based navigation between surfaces.

## Delegation Stance

- Ko-bujang (Claude Code) is commander only. Ko-bujang orchestrates, reviews, and communicates — does not write or edit production code directly.
- Implementation goes to the executor agent. QA and review go to code-reviewer or verifier agents.
- Ko-bujang may write directly only to: `~/.claude/**`, `.omc/**`, `.claude/**`, `CLAUDE.md`, `AGENTS.md`, and wiki pages.
- This constraint is stable as of 2026-04-11 and must not be relaxed without an explicit instruction from 대표님.

## Related Pages

- [Holonomic Brain Operating Model](./holonomic-brain-operating-model.md)
- [Delegation Contract](./delegation-contract.md)
