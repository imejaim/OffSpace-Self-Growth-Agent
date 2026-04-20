# Graphify Knowledge Graph

## Scope

This page records how Graphify is applied to the Intercept Holonomic Brain.

## Current Status

Updated on 2026-04-14.

Graphify is installed and integrated into the working environments used by this project.

Confirmed integrations:

- Codex
- Gemini CLI
- OpenCode
- Google Antigravity

Current local graph status:

- `graphify-out/graph.json` exists
- `graphify-out/GRAPH_REPORT.md` exists
- code graph rebuild has been run successfully on this repository

## Why It Fits The Holonomic Brain

The Holonomic Brain needs a shared structural map across multiple agents and tools.

Graphify adds:

- persistent graph memory for code structure
- a shared `GRAPH_REPORT.md` entrypoint
- lower token cost for repeated architecture questions
- a common graph substrate that multiple assistants can consult

## Installed Integration Points

Known integration surfaces after setup:

- root `AGENTS.md` contains graphify rules for Codex-style sessions
- repo `.codex/hooks.json` injects graph awareness before Bash use
- repo `GEMINI.md` contains graphify rules
- user `~/.gemini/settings.json` has the BeforeTool hook
- user `~/.opencode/plugins/graphify.js` is installed
- repo `.agent/rules/graphify.md` and `.agent/workflows/graphify.md` are installed for Antigravity

## Current Graph Snapshot

The code-only rebuild on 2026-04-14 produced:

- 234 nodes
- 217 edges
- 73 communities

Benchmark snapshot:

- naive corpus cost: about 15,600 tokens
- average graph query cost: about 332 tokens
- token reduction: about 47.0x

Most connected nodes in the current report:

- `POST()`
- `getPayPalApiBase()`
- `generateAccessToken()`
- `GET()`
- `main()`

## Important Limitation

The current graph was built from the local code rebuild path, which is the safe deterministic part of Graphify.

That means:

- code structure is represented now
- the graph is useful immediately for architecture navigation
- docs, raw notes, images, and other multimodal material are not yet fully extracted into the graph in this session

To build the full multimodal graph, run the assistant workflow:

- Codex: `$graphify .`
- Gemini CLI: `/graphify .`
- Antigravity: `/graphify .`
- OpenCode: `/graphify .`

## Operational Rule

Use Graphify as a structural navigation layer, not as a replacement for the wiki.

The division of labor should stay:

- `docs/wiki/` = curated durable knowledge
- `graphify-out/` = generated structural graph and graph report

If Graphify reveals a durable architectural or operational insight, promote it back into the wiki.

## Related Pages

- [Holonomic Brain Operating Model](../strategy/holonomic-brain-operating-model.md)
- [LLM Wiki Adoption Plan](../strategy/llm-wiki-adoption-plan.md)
- [Auth And Session Model](./auth-and-session-model.md)
