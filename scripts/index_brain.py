from __future__ import annotations

import sys
from pathlib import Path

# Must come before any local imports so `python scripts/index_brain.py` works from any cwd
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import brain_db  # noqa: E402  (imported after sys.path patch)


def main() -> None:
    conn = brain_db.connect()
    try:
        count = brain_db.rebuild_index(conn)
        print(f"[brain-index] indexed {count} documents into {brain_db.BRAIN_DB_PATH}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
