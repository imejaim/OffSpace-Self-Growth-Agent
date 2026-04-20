# Docs Guide

`docs/` now has two different roles and they should stay separate.

## Durable Knowledge

Use `docs/wiki/` for maintained project knowledge:

- architecture
- incidents
- strategy

Start from:

- `docs/wiki/index.md`
- `docs/wiki/SCHEMA.md`
- `docs/wiki/log.md`

## Raw And Temporary Material

Use `docs/raw/` for immutable source material such as:

- research clips
- screenshots
- exported logs
- meeting exports

Legacy working documents still live at the top of `docs/` for now:

- `AnCo_Meeting.md`

These should be treated as operational or historical notes, not the long-term source of truth.

Archived plan snapshots live under:

- `docs/archive/plans/`

## Maintenance

Run the local wiki checks with:

```bash
python scripts/wiki_lint.py
```

The purpose is simple:

- catch broken wiki links
- make sure new pages are listed in `docs/wiki/index.md`
- keep the Holonomic Brain structure from silently drifting
