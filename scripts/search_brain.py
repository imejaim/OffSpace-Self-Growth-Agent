from __future__ import annotations

import sys
from pathlib import Path

# Must come before any local imports so `python scripts/search_brain.py` works from any cwd
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Guard: Windows cp949 console encoding breaks unicode output (em-dash etc.)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import brain_db  # noqa: E402


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/search_brain.py <query> [limit]", file=sys.stderr)
        return 1

    query = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) >= 3 else 10

    conn = brain_db.connect()
    try:
        rows = brain_db.search(conn, query, limit)
    finally:
        conn.close()

    if not rows:
        print(f"No results for: {query!r}")
        return 0

    for rank, row in enumerate(rows, 1):
        meta = " | ".join(
            filter(None, [row["category"], row["source_type"], row["tags"]])
        )
        print(f"[{rank}] {row['title']}")
        print(f"     {row['path']}")
        print(f"     {meta}")
        print(f"     {row['snippet']}")
        print()

    return 0


if __name__ == "__main__":
    sys.exit(main())
