import sys
import argparse
import json
import shutil
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def detect_sources(root: Path) -> list:
    sources = []
    checks = [
        (root / "docs/wiki", {"glob": "docs/wiki/**/*.md", "source_type": "wiki"}),
        (root / "docs/knowledge", {"glob": "docs/knowledge/**/*.md", "source_type": "knowledge"}),
        (root / "docs/raw", {"glob": "docs/raw/**/*.md", "source_type": "raw"}),
        (root / "docs/rules", {"glob": "docs/rules/**/*.md", "source_type": "rules"}),
    ]
    for path, entry in checks:
        if path.is_dir():
            sources.append(entry)

    file_checks = [
        (root / ".omc/project-memory.json", {"path": ".omc/project-memory.json", "source_type": "memory"}),
        (root / "CLAUDE.md", {"path": "CLAUDE.md", "source_type": "doc"}),
        (root / "AGENTS.md", {"path": "AGENTS.md", "source_type": "doc"}),
        (root / "intercept/CLAUDE.md", {"path": "intercept/CLAUDE.md", "source_type": "doc"}),
        (root / "intercept/AGENTS.md", {"path": "intercept/AGENTS.md", "source_type": "doc"}),
        (root / "output/SESSION_HANDOFF.md", {"path": "output/SESSION_HANDOFF.md", "source_type": "handoff"}),
        (root / "logs/live_output.log", {"path": "logs/live_output.log", "source_type": "log"}),
    ]
    for path, entry in file_checks:
        if path.exists():
            sources.append(entry)

    if (root / "logs").is_dir() and list((root / "logs").glob("drift_report_*.json")):
        sources.append({"glob": "logs/drift_report_*.json", "source_type": "log"})

    return sources


def copy_templates(root: Path, wiki_dir: Path) -> list:
    templates_dir = SCRIPT_DIR.parent / "templates"
    copied = []
    targets = [
        ("user-operating-preferences.md", wiki_dir / "strategy" / "user-operating-preferences.md"),
        ("delegation-contract.md", wiki_dir / "strategy" / "delegation-contract.md"),
    ]
    for template_name, target in targets:
        src = templates_dir / template_name
        if src.exists() and not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, target)
            copied.append(str(target.relative_to(root)))
            print(f"[init] copied template → {target.relative_to(root)}")
        elif target.exists():
            print(f"[init] skipped (exists): {target.relative_to(root)}")
        else:
            print(f"[init] template not found: {src}")
    return copied


def update_gitignore(root: Path):
    gitignore = root / ".gitignore"
    entry = "data/brain/"
    if gitignore.exists():
        content = gitignore.read_text(encoding="utf-8")
        if entry in content:
            print(f"[init] .gitignore already contains {entry}")
            return
        with gitignore.open("a", encoding="utf-8") as f:
            f.write(f"\n{entry}\n")
    else:
        gitignore.write_text(f"{entry}\n", encoding="utf-8")
    print(f"[init] appended '{entry}' to .gitignore")


def main():
    parser = argparse.ArgumentParser(description="Holonomic Brain Kit initializer")
    parser.add_argument("--project-root", type=str, default=None)
    args = parser.parse_args()

    root = Path(args.project_root).resolve() if args.project_root else Path.cwd().resolve()
    print(f"[init] project root: {root}")

    print("[init] detecting knowledge sources...")
    sources = detect_sources(root)
    print(f"[init] found {len(sources)} sources")

    config = {
        "version": "1.0",
        "project_name": root.name,
        "brain_db_path": "data/brain/brain.db",
        "sources": sources,
    }
    config_path = root / "brain.config.json"
    config_path.write_text(json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[init] wrote config → {config_path}")

    templates_copied = []
    wiki_dir = root / "docs/wiki"
    if wiki_dir.is_dir():
        print("[init] copying templates...")
        templates_copied = copy_templates(root, wiki_dir)

    update_gitignore(root)

    print("[init] building index...")
    from brain_db import load_config, connect, rebuild_index
    cfg = load_config(root)
    db_path = root / cfg["brain_db_path"]
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = None
    try:
        conn = connect(db_path)
        count = rebuild_index(conn, root, cfg)
    finally:
        if conn:
            conn.close()

    print(f"\n[init] === summary ===")
    print(f"[init] config:    {config_path}")
    print(f"[init] sources:   {len(sources)}")
    print(f"[init] indexed:   {count} documents")
    print(f"[init] templates: {templates_copied if templates_copied else 'none'}")


if __name__ == "__main__":
    main()
