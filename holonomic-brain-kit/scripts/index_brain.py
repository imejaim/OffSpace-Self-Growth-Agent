import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import argparse


def main():
    parser = argparse.ArgumentParser(description="Rebuild Holonomic Brain index")
    parser.add_argument("--project-root", type=str, default=None)
    args = parser.parse_args()

    root = Path(args.project_root).resolve() if args.project_root else Path.cwd().resolve()

    from brain_db import load_config, connect, rebuild_index

    cfg = load_config(root)
    db_path = root / cfg["brain_db_path"]
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = None
    try:
        conn = connect(db_path)
        count = rebuild_index(conn, root, cfg)
        print(f"[brain-index] indexed {count} documents into {db_path}")
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
