from __future__ import annotations

import json
import re
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Generator, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BRAIN_DB_PATH = PROJECT_ROOT / "data" / "brain" / "brain.db"


@dataclass(frozen=True)
class BrainDocument:
    doc_id: str
    source_type: str
    path: str
    title: str
    category: str
    tags: str
    content: str
    updated_at: str


def _extract_frontmatter(text: str) -> dict:
    """Extract YAML-ish frontmatter fields: title, category, tags."""
    meta: dict = {}
    if not text.startswith("---"):
        return meta
    end = text.find("\n---", 3)
    if end == -1:
        return meta
    block = text[3:end]
    for line in block.splitlines():
        m = re.match(r"^(\w+)\s*:\s*(.+)$", line.strip())
        if m:
            meta[m.group(1).lower()] = m.group(2).strip()
    return meta


def _first_heading(text: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return ""


def _doc_title(meta: dict, text: str, path: Path) -> str:
    return (
        meta.get("title")
        or _first_heading(text)
        or path.stem.replace("-", " ").replace("_", " ")
    )


def _doc_tags(meta: dict) -> str:
    raw = meta.get("tags", "")
    # support YAML list style [a, b] or plain comma string
    return re.sub(r"[\[\]]", "", raw).strip()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _make_doc_id(path: Path) -> str:
    return str(path.relative_to(PROJECT_ROOT)).replace("\\", "/")


def _read_md(path: Path, source_type: str, category: str = "") -> Optional[BrainDocument]:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    meta = _extract_frontmatter(text)
    return BrainDocument(
        doc_id=_make_doc_id(path),
        source_type=source_type,
        path=str(path.relative_to(PROJECT_ROOT)).replace("\\", "/"),
        title=_doc_title(meta, text, path),
        category=meta.get("category", category),
        tags=_doc_tags(meta),
        content=text,
        updated_at=_now_iso(),
    )


def iter_documents() -> Generator[BrainDocument, None, None]:
    # wiki
    wiki_root = PROJECT_ROOT / "docs" / "wiki"
    for p in sorted(wiki_root.rglob("*.md")):
        # derive category from subdir name
        parts = p.relative_to(wiki_root).parts
        cat = parts[0] if len(parts) > 1 else "wiki"
        doc = _read_md(p, "wiki", cat)
        if doc:
            yield doc

    # raw
    raw_readme = PROJECT_ROOT / "docs" / "raw" / "README.md"
    if raw_readme.exists():
        doc = _read_md(raw_readme, "raw", "raw")
        if doc:
            yield doc

    raw_payment = PROJECT_ROOT / "docs" / "raw" / "payment"
    if raw_payment.is_dir():
        for p in sorted(raw_payment.glob("*.md")):
            doc = _read_md(p, "raw", "payment")
            if doc:
                yield doc

    # agent/project docs
    doc_files = [
        (PROJECT_ROOT / "intercept" / "AGENTS.md", "doc", "agents"),
        (PROJECT_ROOT / "intercept" / "CLAUDE.md", "doc", "claude"),
        (PROJECT_ROOT / "CLAUDE.md", "doc", "claude"),
        (PROJECT_ROOT / "docs" / "HOLONOMIC_BRAIN_SETUP_GUIDE.md", "doc", "holonomic"),
    ]
    for path, stype, cat in doc_files:
        if path.exists():
            doc = _read_md(path, stype, cat)
            if doc:
                yield doc

    # machine memory (.omc/project-memory.json)
    mem_path = PROJECT_ROOT / ".omc" / "project-memory.json"
    if mem_path.exists():
        try:
            raw = mem_path.read_text(encoding="utf-8", errors="replace")
            pretty = json.dumps(json.loads(raw), ensure_ascii=False, indent=2)
        except (OSError, json.JSONDecodeError):
            pretty = mem_path.read_text(encoding="utf-8", errors="replace")
        yield BrainDocument(
            doc_id=_make_doc_id(mem_path),
            source_type="memory",
            path=str(mem_path.relative_to(PROJECT_ROOT)).replace("\\", "/"),
            title="Project Memory",
            category="memory",
            tags="memory,project",
            content=pretty,
            updated_at=_now_iso(),
        )

    # session handoff
    handoff = PROJECT_ROOT / "output" / "SESSION_HANDOFF.md"
    if handoff.exists():
        doc = _read_md(handoff, "handoff", "handoff")
        if doc:
            yield doc


def connect(db_path: Optional[Path] = None) -> sqlite3.Connection:
    target = db_path or BRAIN_DB_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(target))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.row_factory = sqlite3.Row
    return conn


_INIT_SQL = """
CREATE TABLE IF NOT EXISTS documents (
    doc_id      TEXT PRIMARY KEY,
    source_type TEXT NOT NULL,
    path        TEXT NOT NULL,
    title       TEXT NOT NULL,
    category    TEXT NOT NULL,
    tags        TEXT NOT NULL,
    content     TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
    doc_id UNINDEXED,
    path,
    title,
    category,
    tags,
    content,
    content=documents,
    content_rowid=rowid
);
"""


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(_INIT_SQL)
    conn.commit()


def rebuild_index(conn: sqlite3.Connection) -> int:
    init_db(conn)
    conn.execute("DELETE FROM documents_fts")
    conn.execute("DELETE FROM documents")
    conn.commit()

    docs = list(iter_documents())
    conn.executemany(
        """
        INSERT OR REPLACE INTO documents
            (doc_id, source_type, path, title, category, tags, content, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (d.doc_id, d.source_type, d.path, d.title, d.category, d.tags, d.content, d.updated_at)
            for d in docs
        ],
    )
    conn.executemany(
        """
        INSERT INTO documents_fts (rowid, doc_id, path, title, category, tags, content)
        SELECT rowid, doc_id, path, title, category, tags, content
        FROM documents WHERE doc_id = ?
        """,
        [(d.doc_id,) for d in docs],
    )
    conn.commit()
    return len(docs)


def search(conn: sqlite3.Connection, query: str, limit: int = 10) -> list:
    sql = """
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
        JOIN documents AS d ON documents_fts.doc_id = d.doc_id
        WHERE documents_fts MATCH ?
        ORDER BY bm25(documents_fts)
        LIMIT ?
    """
    return conn.execute(sql, (query, limit)).fetchall()
