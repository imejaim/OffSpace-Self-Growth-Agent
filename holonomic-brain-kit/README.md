# Holonomic Brain Kit v1.0

A portable brain-search layer for multi-agent projects. Drop into any project, run init, get FTS5
full-text search over your wiki, docs, and machine memory — no external services required.

## Prerequisites

Python 3.10+ (uses `sqlite3` with FTS5, included in the standard library)

## Quick Start

1. Copy `holonomic-brain-kit/` into your project root (or keep it centralized and pass
   `--project-root /path/to/project` to each script).

2. Initialize:
   ```
   cd your-project
   python holonomic-brain-kit/scripts/init_brain.py
   ```
   - Auto-detects `docs/wiki/`, `docs/knowledge/`, `docs/raw/`, `docs/rules/` directories
   - Generates `brain.config.json` from the example config
   - Copies strategy templates into `docs/wiki/` if the directory exists
   - Runs the first index pass automatically

3. Search:
   ```
   python holonomic-brain-kit/scripts/search_brain.py "your query"
   ```

4. Re-index after changes:
   ```
   python holonomic-brain-kit/scripts/index_brain.py
   ```

## Directory Structure

```
holonomic-brain-kit/
  README.md
  brain.config.example.json
  scripts/
    init_brain.py        # one-time project setup
    index_brain.py       # ingest sources into SQLite FTS5
    search_brain.py      # query the index
  templates/
    user-operating-preferences.md
    delegation-contract.md
    holonomic-brain-operating-model.md
```

## Config Format

`brain.config.json` (generated from `brain.config.example.json`) controls which files are indexed
and where the DB lives. Each entry in `sources` is either a `glob` (pattern) or a `path`
(single file), plus a `source_type` label used as a filter in search results.

See `brain.config.example.json` for the full schema.

## What Gets Indexed

| source_type | Typical path pattern |
|-------------|----------------------|
| `wiki`      | `docs/wiki/**/*.md` |
| `knowledge` | `docs/knowledge/**/*.md` |
| `raw`       | `docs/raw/**/*.md` |
| `rules`     | `docs/rules/**/*.md` |
| `memory`    | `.omc/project-memory.json` |
| `doc`       | `CLAUDE.md`, `AGENTS.md` |
| `handoff`   | `output/SESSION_HANDOFF.md` |

## Important

The SQLite DB is NOT the source of truth. It is a regenerable search index. The real knowledge
lives in your wiki and docs. Deleting the DB and re-running `index_brain.py` must always produce
an equivalent result.

## Origin

Developed for the Intercept project's Holonomic Brain system. Ported from the BaToo
Binance project's initial implementation, with all known failure modes pre-fixed before the first
public release.

## Known Failure Modes Pre-Fixed

- `sys.path` resolution: scripts resolve their own location at runtime, not from cwd
- `ORDER BY rank` replaced with `ORDER BY bm25(...)` for correct FTS5 relevance sorting
- Windows cp949 stdout encoding: all scripts force `utf-8` on stdout/stderr at startup
- FTS5 virtual table must exist before any `DELETE` or `INSERT` — init order enforced
