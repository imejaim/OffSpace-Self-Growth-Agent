import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import argparse


def main():
    parser = argparse.ArgumentParser(description="Search Holonomic Brain index")
    parser.add_argument("query", nargs="?", default=None)
    parser.add_argument("limit", nargs="?", type=int, default=10)
    parser.add_argument("--project-root", type=str, default=None)
    args = parser.parse_args()

    if not args.query:
        print("[brain-search] error: query argument required", file=sys.stderr)
        sys.exit(1)

    root = Path(args.project_root).resolve() if args.project_root else Path.cwd().resolve()

    from brain_db import load_config, connect, search

    cfg = load_config(root)
    db_path = root / cfg["brain_db_path"]
    conn = None
    try:
        conn = connect(db_path)
        results = search(conn, args.query, limit=args.limit)
        if not results:
            print("[brain-search] no matches")
        else:
            for i, row in enumerate(results, 1):
                title = row["title"]
                path = row["path"]
                category = row["category"] or row["source_type"]
                tags = row["tags"]
                snippet = row["snippet"]
                meta = " | ".join(filter(None, [category, tags]))
                print(f"{i}. {title}")
                print(f"   {path}  [{meta}]")
                if snippet:
                    print(f"   {snippet}")
                print()
    finally:
        if conn:
            conn.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
