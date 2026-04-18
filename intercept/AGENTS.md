<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Wiki

Durable knowledge for this project is maintained in the root wiki layer:

- `../docs/raw/` for immutable source material
- `../docs/wiki/` for compiled knowledge
- `../docs/wiki/SCHEMA.md` for wiki maintenance rules

When a meaningful bug or architecture change is discovered:
- document the incident in `../docs/wiki/incidents/`
- update the relevant architecture page in `../docs/wiki/architecture/`
- append the change to `../docs/wiki/log.md`

## Holonomic Brain

This codebase may be touched by multiple agents working from different tools.

Treat them as one shared project brain:
- update `../docs/wiki/strategy/holonomic-brain-operating-model.md` when roster or environment assumptions change
- update `../.omc/project-memory.json` when stable operating rules change
- prefer shared wiki artifacts over chat-local memory
