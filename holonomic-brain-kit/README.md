# Holonomic Brain Kit

A portable starter for running a project as a **shared multi-agent brain** across
different tools (Claude Code, Codex, Gemini CLI, Antigravity, OpenCode, …).

This kit is intentionally **minimal**. It carries only the universal pieces:

- the operating-model concept (what a Holonomic Brain is)
- the wiki schema (how agents write durable knowledge)
- the three project characters (Ko-bujang / Oh-gwajang / Jem-daeri)
- empty templates for per-project memory

Do **not** copy another project's memories, incidents, or wiki pages into a new
project. Each project grows its own brain from this seed.

## How to adopt in a new project

1. Copy this whole `holonomic-brain-kit/` folder into the target project root.
2. Rename it to whatever you like, or unpack its contents:
   - `characters/*.svg` → somewhere your UI or docs can reference
   - `templates/wiki/` → `docs/wiki/`
   - `templates/project-memory.json` → `.omc/project-memory.json`
3. Open `templates/wiki/strategy/holonomic-brain-operating-model.md` and fill in
   the placeholders (`<PROJECT_NAME>`, active agent roster, environments).
4. Add a short note to the project's `CLAUDE.md` / `AGENTS.md` pointing agents at
   `docs/wiki/SCHEMA.md` and `docs/wiki/strategy/holonomic-brain-operating-model.md`.
5. Start writing durable findings into the wiki. The brain evolves from there.

## Why only the seed?

The brain must **graph itself from the project's own evidence**, not inherit
another project's beliefs. The kit gives you:

- the *shape* (schema, layers, rules)
- the *cast* (characters as shared identity)
- the *protocol* (how multiple agents coordinate as one mind)

Everything else is grown in place.

## Layer model (same in every project)

1. **Raw** — `docs/raw/` — immutable sources (screenshots, transcripts, logs)
2. **Wiki** — `docs/wiki/` — curated markdown, compounds over time
3. **Schema** — `docs/wiki/SCHEMA.md` + root `CLAUDE.md` — the maintenance rules
4. **Operational memory** — `.omc/project-memory.json` — compact machine memory

## Characters

| Character | File | Role hint |
|-----------|------|-----------|
| Ko-bujang | `characters/Ko-bujang.svg` | Commander / orchestrator |
| Oh-gwajang | `characters/Oh-gwajang.svg` | Facts & planning |
| Jem-daeri | `characters/Jem-daeri.svg` | External signal / community |

Pixel art, render with `imageRendering: 'pixelated'`.

Assign the characters to whichever agents you actually use in the new project.
The mapping is per-project and lives in
`docs/wiki/strategy/holonomic-brain-operating-model.md`.
