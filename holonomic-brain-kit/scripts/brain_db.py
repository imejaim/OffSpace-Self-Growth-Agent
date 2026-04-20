"""
brain_db.py — Holonomic Brain Kit v1.0
Config-driven SQLite FTS5 search engine for project knowledge.
All paths are resolved at runtime from project_root; no module-level side effects.
"""

import json
import re
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

def load_config(project_root: Path) -> dict:
    """Read brain.config.json from project_root. Raises FileNotFoundError if missing."""
    config_path = project_root / "brain.config.json"
    if not config_path.exists():
        raise FileNotFoundError(
            f"brain.config.json not found at {config_path}. "
            "Create it at the kit root (sibling to scripts/)."
        )
    with config_path.open(encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Document model
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class BrainDocument:
    doc_id: str       # relative posix path from project_root
    source_type: str
    path: str         # same as doc_id
    title: str        # frontmatter "title:", first "# " heading, or filename stem
    category: str     # frontmatter "category:", config entry, or source_type
    tags: str         # frontmatter "tags:" or ""
    content: str
    updated_at: str   # file mtime as string


# ---------------------------------------------------------------------------
# Frontmatter helpers
# ---------------------------------------------------------------------------

def _extract_frontmatter_value(text: str, key: str) -> str:
    """Parse a single value from YAML-like frontmatter between --- fences."""
    match = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return ""
    block = match.group(1)
    pattern = re.compile(rf"^{re.escape(key)}\s*:\s*(.+)$", re.MULTILINE)
    m = pattern.search(block)
    if not m:
        return ""
    return m.group(1).strip().strip('"').strip("'")


def _markdown_title(text: str, fallback: str) -> str:
    """frontmatter title → first '# ' heading → fallback."""
    fm = _extract_frontmatter_value(text, "title")
    if fm:
        return fm
    m = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    if m:
        return m.group(1).strip()
    return fallback


def _markdown_category(text: str, fallback: str) -> str:
    """frontmatter category → fallback."""
    fm = _extract_frontmatter_value(text, "category")
    return fm if fm else fallback


def _markdown_tags(text: str) -> str:
    """frontmatter tags → ''."""
    return _extract_frontmatter_value(text, "tags")


# ---------------------------------------------------------------------------
# Document iteration
# ---------------------------------------------------------------------------

def iter_documents(project_root: Path, config: dict) -> Iterable[BrainDocument]:
    """Yield BrainDocument for every file matched by config sources."""
    for source in config.get("sources", []):
        source_type: str = source.get("source_type", "doc")
        config_category: str = source.get("category", source_type)

        if "glob" in source:
            files = sorted(project_root.glob(source["glob"]))
            files = [f for f in files if f.is_file()]
        elif "path" in source:
            candidate = project_root / source["path"]
            files = [candidate] if candidate.is_file() else []
        else:
            continue

        for file_path in files:
            doc = _build_document(file_path, project_root, source_type, config_category)
            if doc is not None:
                yield doc


def _build_document(
    file_path: Path,
    project_root: Path,
    source_type: str,
    config_category: str,
) -> "BrainDocument | None":
    suffix = file_path.suffix.lower()
    doc_id = file_path.relative_to(project_root).as_posix()
    updated_at = str(file_path.stat().st_mtime)

    if suffix == ".json":
        try:
            raw = file_path.read_text(encoding="utf-8", errors="replace")
            parsed = json.loads(raw)
            content = json.dumps(parsed, ensure_ascii=False, indent=2)
        except Exception:
            content = file_path.read_text(encoding="utf-8", errors="replace")
        title = file_path.stem
        category = config_category
        tags = ""
    elif suffix == ".md":
        content = file_path.read_text(encoding="utf-8", errors="replace")
        content = content.replace("\r\n", "\n").replace("\r", "\n")
        title = _markdown_title(content, file_path.stem)
        category = _markdown_category(content, config_category)
        tags = _markdown_tags(content)
    elif suffix == ".log":
        content = file_path.read_text(encoding="utf-8", errors="replace")
        content = content.replace("\r\n", "\n").replace("\r", "\n")
        title = file_path.stem
        category = config_category
        tags = ""
    else:
        # Generic text fallback
        try:
            content = file_path.read_text(encoding="utf-8", errors="replace")
            content = content.replace("\r\n", "\n").replace("\r", "\n")
        except Exception:
            return None
        title = file_path.stem
        category = config_category
        tags = ""

    return BrainDocument(
        doc_id=doc_id,
        source_type=source_type,
        path=doc_id,
        title=title,
        category=category,
        tags=tags,
        content=content,
        updated_at=updated_at,
    )


# ---------------------------------------------------------------------------
# SQLite operations
# ---------------------------------------------------------------------------

def connect(db_path: Path) -> sqlite3.Connection:
    """Open (or create) the SQLite database with WAL mode and row_factory."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    """Create documents and documents_fts tables if they do not exist."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            doc_id      TEXT PRIMARY KEY,
            source_type TEXT NOT NULL,
            path        TEXT NOT NULL,
            title       TEXT NOT NULL,
            category    TEXT NOT NULL,
            tags        TEXT NOT NULL,
            content     TEXT NOT NULL,
            updated_at  TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts
        USING fts5(
            doc_id UNINDEXED,
            path,
            title,
            category,
            tags,
            content
        )
    """)
    conn.commit()


def rebuild_index(conn: sqlite3.Connection, project_root: Path, config: dict) -> int:
    """Drop and rebuild full-text index. Returns count of indexed documents."""
    init_db(conn)
    conn.execute("DELETE FROM documents_fts")
    conn.execute("DELETE FROM documents")
    conn.commit()

    count = 0
    for doc in iter_documents(project_root, config):
        conn.execute(
            "INSERT INTO documents (doc_id, source_type, path, title, category, tags, content, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (doc.doc_id, doc.source_type, doc.path, doc.title,
             doc.category, doc.tags, doc.content, doc.updated_at),
        )
        conn.execute(
            "INSERT INTO documents_fts (doc_id, path, title, category, tags, content) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (doc.doc_id, doc.path, doc.title, doc.category, doc.tags, doc.content),
        )
        count += 1

    conn.commit()
    return count


def search(conn: sqlite3.Connection, query: str, limit: int = 10) -> list[sqlite3.Row]:
    """FTS5 BM25-ranked search. Returns list of Row objects with snippet."""
    rows = conn.execute(
        """
        SELECT
            d.doc_id,
            d.source_type,
            d.path,
            d.title,
            d.category,
            d.tags,
            d.updated_at,
            snippet(documents_fts, 5, '[', ']', ' ... ', 18) AS snippet
        FROM documents_fts
        JOIN documents AS d ON d.doc_id = documents_fts.doc_id
        WHERE documents_fts MATCH ?
        ORDER BY bm25(documents_fts)
        LIMIT ?
        """,
        (query, limit),
    ).fetchall()
    return rows
