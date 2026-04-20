반영 범위를 확정했습니다. 런타임을 크게 흔들지 않고 아래만 넣겠습니다.

- USER 계층 추가: 프로젝트 기억과 사용자/운영 선호를 분리
- delegation contract 추가: 서브에이전트는 항상 무지 상태에서 시작한다는 원칙 문서화
- SQLite brain index 추가: docs/knowledge, docs/rules, .omc/project-memory.json, 주요 로그를 FTS로 검색

  이건 Hermes 개념 흡수치고는 과하지 않고, 현재 저장소에 바로 쓸 수 있는 수준입니다.

• Edited 9 files (+474 -6)
  └ .omc\project-memory.json (+4 -2)
    43      "프로젝트 두뇌의 실질 정본은 docs/knowledge 이며, docs/wiki 는 가이드 호환용 진입 레이어다.",
    44 -    "모든 에이전트는 docs/wiki/strategy/holonomic-brain-operating-model.md 와 docs/knowledge/PROTOCOL.md 를 함께 준수하여 하나처럼 동작해야 한
         다."
    44 +    "모든 에이전트는 docs/wiki/strategy/holonomic-brain-operating-model.md 와 docs/knowledge/PROTOCOL.md 를 함께 준수하여 하나처럼 동작해야 한
         다.",
    45 +    "사용자 선호/보고 스타일은 docs/knowledge/USER.md 에 별도 계층으로 분리한다.",
    46 +    "검색용 SQLite 인덱스는 data/brain/brain.db 에 두며, 정본은 docs/knowledge 와 docs/rules 이다."
    47    ],
    ⋮
    452    "userDirectives": []
    451 -}
    453 +}

  └ batoo_binance\utils\brain_db.py (+252 -0)
    1 +"""SQLite-backed search index for the holonomic brain.
    2 +
    3 +This is a lightweight local equivalent of Hermes-style searchable session memory.
    4 +It does not replace docs/knowledge as the source of truth; it indexes it for retrieval.
    5 +"""
    6 +
    7 +from__future__ import annotations
    8 +
    9 +import json
    10 +import sqlite3
    11 +from dataclasses import dataclass
    12 +from pathlib import Path
    13 +from typing import Iterable
    14 +
    15 +from batoo_binance.config import PROJECT_ROOT
    16 +
    17 +
    18 +BRAIN_DIR = PROJECT_ROOT / "data" / "brain"
    19 +BRAIN_DB_PATH = BRAIN_DIR / "brain.db"
    20 +
    21 +
    22 +@dataclass(frozen=True)
    23 +class BrainDocument:
    24 +    """Single indexed document."""
    25 +
    26 +    doc_id: str
    27 +    source_type: str
    28 +    path: str
    29 +    title: str
    30 +    category: str
    31 +    tags: str
    32 +    content: str
    33 +    updated_at: str
    34 +
    35 +
    36 +def _extract_frontmatter_value(text: str, key: str) -> str:
    37 +    lines = text.splitlines()
    38 +    if not lines or lines[0].strip() != "---":
    39 +        return ""
    40 +    for line in lines[1:]:
    41 +        if line.strip() == "---":
    42 +            break
    43 +        if line.startswith(f"{key}:"):
    44 +            return line.split(":", 1)[1].strip()
    45 +    return ""
    46 +
    47 +
    48 +def _normalize_text(text: str) -> str:
    49 +    return text.replace("\r\n", "\n").strip()
    50 +
    51 +
    52 +def _doc_id_for(path: Path) -> str:
    53 +    return path.relative_to(PROJECT_ROOT).as_posix()
    54 +
    55 +
    56 +def _markdown_title(text: str, fallback: str) -> str:
    57 +    title = _extract_frontmatter_value(text, "title")
    58 +    if title:
    59 +        return title
    60 +    for line in text.splitlines():
    61 +        if line.startswith("# "):
    62 +            return line[2:].strip()
     63 +    return fallback
    64 +
    65 +
    66 +def _markdown_category(text: str, fallback: str = "doc") -> str:
    67 +    return _extract_frontmatter_value(text, "category") or fallback
    68 +
    69 +
    70 +def _markdown_tags(text: str) -> str:
    71 +    return _extract_frontmatter_value(text, "tags")
    72 +
    73 +
    74 +def _iter_markdown_documents() -> Iterable[BrainDocument]:
    75 +    roots = [
    76 +        (PROJECT_ROOT / "docs" / "knowledge", "knowledge"),
    77 +        (PROJECT_ROOT / "docs" / "rules", "rules"),
    78 +        (PROJECT_ROOT / "docs" / "wiki", "wiki"),
    79 +    ]
    80 +    for root, source_type in roots:
    81 +        if not root.exists():
    82 +            continue
    83 +        for path in sorted(root.rglob("*.md")):
    84 +            text = _normalize_text(path.read_text(encoding="utf-8"))
    85 +            rel = path.relative_to(PROJECT_ROOT).as_posix()
    86 +            yield BrainDocument(
    87 +                doc_id=_doc_id_for(path),
    88 +                source_type=source_type,
    89 +                path=rel,
    90 +                title=_markdown_title(text, path.stem),
    91 +                category=_markdown_category(text, source_type),
    92 +                tags=_markdown_tags(text),
    93 +                content=text,
    94 +                updated_at=str(path.stat().st_mtime_ns),
    95 +            )
    96 +
    97 +
    98 +def _iter_json_documents() -> Iterable[BrainDocument]:
    99 +    project_memory = PROJECT_ROOT / ".omc" / "project-memory.json"
    100 +    if project_memory.exists():
    101 +        raw = project_memory.read_text(encoding="utf-8")
    102 +        try:
    103 +            parsed = json.loads(raw)
    104 +            content = json.dumps(parsed, ensure_ascii=False, indent=2)
    105 +        except json.JSONDecodeError:
    106 +            content = raw
    107 +        yield BrainDocument(
    108 +            doc_id=_doc_id_for(project_memory),
    109 +            source_type="memory",
    110 +            path=project_memory.relative_to(PROJECT_ROOT).as_posix(),
    111 +            title="project-memory.json",
    112 +            category="memory",
    113 +            tags="project-memory,omc",
    114 +            content=content,
    115 +            updated_at=str(project_memory.stat().st_mtime_ns),
    116 +        )
    117 +
    118 +    logs_dir = PROJECT_ROOT / "logs"
    119 +    for path in sorted(logs_dir.glob("drift_report_*.json")):
    120 +        raw = path.read_text(encoding="utf-8")
    121 +        try:
    122 +            parsed = json.loads(raw)
    123 +            title = parsed.get("timestamp_kst", path.stem)
    124 +            content = json.dumps(parsed, ensure_ascii=False, indent=2)
    125 +        except json.JSONDecodeError:
    126 +            title = path.stem
    127 +            content = raw
    128 +        yield BrainDocument(
    129 +            doc_id=_doc_id_for(path),
    130 +            source_type="log",
    131 +            path=path.relative_to(PROJECT_ROOT).as_posix(),
    132 +            title=title,
    133 +            category="drift-report",
    134 +            tags="log,drift,json",
    135 +            content=content,
    136 +            updated_at=str(path.stat().st_mtime_ns),
    137 +        )
    138 +
    139 +
    140 +def _iter_text_documents() -> Iterable[BrainDocument]:
    141 +    live_output = PROJECT_ROOT / "logs" / "live_output.log"
    142 +    if live_output.exists():
    143 +        text = _normalize_text(live_output.read_text(encoding="utf-8"))
    144 +        yield BrainDocument(
    145 +            doc_id=_doc_id_for(live_output),
    146 +            source_type="log",
    147 +            path=live_output.relative_to(PROJECT_ROOT).as_posix(),
    148 +            title="live_output.log",
    149 +            category="live-output",
    150 +            tags="log,live-output",
    151 +            content=text,
    152 +            updated_at=str(live_output.stat().st_mtime_ns),
    153 +        )
    154 +
    155 +
    156 +def iter_documents() -> Iterable[BrainDocument]:
    157 +    """Enumerate all documents that should be searchable."""
    158 +    yield from _iter_markdown_documents()
    159 +    yield from _iter_json_documents()
    160 +    yield from _iter_text_documents()
    161 +
    162 +
    163 +def connect(db_path: Path | None = None) -> sqlite3.Connection:
    164 +    """Open the SQLite database and enable WAL mode."""
    165 +    path = db_path or BRAIN_DB_PATH
    166 +    path.parent.mkdir(parents=True, exist_ok=True)
    167 +    conn = sqlite3.connect(path)
    168 +    conn.row_factory = sqlite3.Row
    169 +    conn.execute("PRAGMA journal_mode=WAL")
    170 +    conn.execute("PRAGMA foreign_keys=ON")
    171 +    return conn
    172 +
    173 +
    174 +def init_db(conn: sqlite3.Connection) -> None:
    175 +    """Create base tables and FTS index."""
    176 +    conn.executescript(
    177 +        """
    178 +        CREATE TABLE IF NOT EXISTS documents (
    179 +            doc_id TEXT PRIMARY KEY,
    180 +            source_type TEXT NOT NULL,
    181 +            path TEXT NOT NULL,
    182 +            title TEXT NOT NULL,
    183 +            category TEXT NOT NULL,
    184 +            tags TEXT NOT NULL,
    185 +            content TEXT NOT NULL,
    186 +            updated_at TEXT NOT NULL
    187 +        );
    188 +
    189 +        CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
    190 +            doc_id UNINDEXED,
    191 +            path,
    192 +            title,
    193 +            category,
    194 +            tags,
    195 +            content
    196 +        );
    197 +        """
    198 +    )
    199 +    conn.commit()
    200 +
    201 +
    202 +def rebuild_index(conn: sqlite3.Connection) -> int:
    203 +    """Rebuild the index from filesystem sources."""
    204 +    init_db(conn)
    205 +    docs = list(iter_documents())
    206 +    conn.execute("DELETE FROM documents")
    207 +    conn.execute("DELETE FROM documents_fts")
    208 +    conn.executemany(
    209 +        """
    210 +        INSERT INTO documents (doc_id, source_type, path, title, category, tags, content, updated_at)
    211 +        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    212 +        """,
    213 +        [
    214 +            (
    215 +                doc.doc_id,
    216 +                doc.source_type,
    217 +                doc.path,
    218 +                doc.title,
    219 +                doc.category,
    220 +                doc.tags,
    221 +                doc.content,
    222 +                doc.updated_at,
    223 +            )
    224 +            for doc in docs
    225 +        ],
    226 +    )
    227 +    conn.executemany(
    228 +        """
    229 +        INSERT INTO documents_fts (doc_id, path, title, category, tags, content)
    230 +        VALUES (?, ?, ?, ?, ?, ?)
    231 +        """,
    232 +        [
    233 +            (doc.doc_id, doc.path, doc.title, doc.category, doc.tags, doc.content)
    234 +            for doc in docs
    235 +        ],
    236 +    )
    237 +    conn.commit()
    238 +    return len(docs)
    239 +
    240 +
    241 +def search(conn: sqlite3.Connection, query: str, limit: int = 10) -> list[sqlite3.Row]:
    242 +    """Search indexed documents via FTS5."""
    243 +    sql = """
    244 +    SELECT d.doc_id, d.path, d.title, d.category, d.source_type, d.tags,
    245 +           snippet(documents_fts, 5, '[', ']', ' ... ', 18) AS snippet
    246 +    FROM documents_fts
    247 +    JOIN documents d ON d.doc_id = documents_fts.doc_id
    248 +    WHERE documents_fts MATCH ?
    249 +    ORDER BY rank
    250 +    LIMIT ?
    251 +    """
    252 +    return list(conn.execute(sql, (query, limit)))

  └ docs\knowledge\GRAPH.md (+5 -1)
    6  priority: P1
    7 -last_updated: 2026-04-15
    7 +last_updated: 2026-04-16
    8  owner: 바사장(AI)
    ⋮
    26  -`README` — tags: [onboarding], status: active
    27 +-`USER` — tags: [user, preferences], status: active, P1
    28
    ⋮
    83  -`ENTRY` → `PROTOCOL` [헌법 먼저 로드] (1.0)
    84 +-`ENTRY` → `USER` [현재 상태와 별개로 사용자 선호 로드] (0.9)
    85  -`ENTRY` → `moc/strategy` [전략 작업 진입] (1.0)
    ⋮
    88  -`PROTOCOL` → `GRAPH` [쓰기 규칙 적용 대상] (0.8)
    89 +-`PROTOCOL` → `USER` [메모리 계층 규칙] (0.8)
    90  -`HOLONOMIC` → `PROTOCOL` [철학이 규칙의 근거] (0.9)
    ⋮
    153  - 2026-04-16: evolution/2026-04-16 노드 및 drift 재검증 엣지 추가. (오과장)
    154 +- 2026-04-16: USER 노드 및 메모리 계층/검색 레이어 관련 엣지 추가. (오과장)

  └ docs\knowledge\PROTOCOL.md (+27 -1)
    6  priority: P0
    7 -last_updated: 2026-04-13
    7 +last_updated: 2026-04-16
    8  owner: 바사장(AI)
    ⋮
    18
    19 +### 메모리 계층
    20 +
    21 +-`[[ENTRY]]` = 현재 프로젝트 상태
    22 +-`[[USER]]` = 사용자 선호/운영 스타일
    23 +-`.omc/project-memory.json` = 세션 간 압축 기억
    24 +-`data/brain/brain.db` = 검색 전용 인덱스 (정본 아님)
    25 +
    26  ### 작업 유형 → 진입 페이지
    ⋮
    161
    162 +## 11. Delegation Contract
    163 +
    164 +서브에이전트/하위 세션 위임 시에는`docs/rules/delegation_contract.md`를 따른다.
    165 +
    166 +핵심:
    167 +- 서브에이전트는 아무것도 모른다고 가정
    168 +- 최소 컨텍스트 패킷을 부모가 명시적으로 전달
    169 +- 결과는 코드 diff 또는 위키/로그 업데이트로 남김
    170 +
    171 +## 12. SQLite Search Layer
    172 +
    173 +- 목적: 정본 문서를 바꾸지 않고 검색성만 높인다
    174 +- 경로:`data/brain/brain.db`
    175 +- 재생성:`python scripts/index_brain.py`
    176 +- 검색:`python scripts/search_brain.py <query>`
    177 +- 최종 보고 시에는 반드시 원본 문서를 다시 열어 source를 확인한다
    178 +
    179  ## 교차 참조
    ⋮
    185  - [[README]]
    186 +- [[USER]]
    187
    ⋮
    190  - 2026-04-13: 초판 (바사장). 홀로노믹 브레인 헌법 수립.
    191 +- 2026-04-16: USER 계층, delegation contract, SQLite 검색 레이어 추가. (오과장)

  └ docs\knowledge\README.md (+32 -2)
    2  title: 바사장 지식 위키 사용 규칙
    3 -last_updated: 2026-04-13
    3 +last_updated: 2026-04-16
    4  owner: 바사장(AI)
    ⋮
    18  |`~/.claude/projects/.../memory/MEMORY.md` + 개별 md | auto memory. **짧은 사실/피드백/호칭**을 인덱스로 관리 | 세션 지속(장기) |
    19 +|`docs/knowledge/USER.md` | **사용자 선호/보고 스타일/운영 성향**. 프로젝트 사실과 분리된 유저 계층 | 영구 |
    20  |`.omc/wiki/` (OMC 제공) | 일반 OMC 워크플로우용 위키. **현재 미사용** | - |
    ⋮
    25  |`docs/past_mistakes_audit.md` | 사고 전수 조사 원장. `incidents/`에서 참조 | 영구 |
    26 +|`data/brain/brain.db` | **검색 전용 SQLite 인덱스**. `docs/knowledge`, `docs/rules`, `.omc/project-memory.json`, 주요 로그를 FTS5로 검색 | 재
         생성 가능 |
    27
    26 -**원칙**: auto memory는 "기억의 목차", 이 위키는 "기억의 본문".
    28 +**원칙**: auto memory는 "기억의 목차", 이 위키는 "기억의 본문", `USER.md`는 "사용자 계층", SQLite 인덱스는 "검색 레이어"다.
    29  auto memory가 한 줄로 요약한 것을 이 위키가 원문 인용과 근거로 뒷받침한다.
    30
    31 +## 0.1 Hermes식으로 해석한 현재 구조
    32 +
    33 +-`docs/knowledge/*`: 프로젝트 정본 지식
    34 +-`docs/knowledge/USER.md`: 사용자 프로필 계층
    35 +-`.omc/project-memory.json`: 세션 간 압축 기억
    36 +-`data/brain/brain.db`: 검색 전용 인덱스
    37 +
    38 +검색 레이어는 정본이 아니며, 언제든 재생성 가능해야 한다.
    39 +
    40  ## 1. 읽어야 할 때 (Read triggers)
    ⋮
    122
    123 +## 7.1 SQLite 검색 레이어
    124 +
    125 +Hermes의 searchable session storage 개념을 경량 적용한다.
    126 +
    127 +- 인덱스 구축:`python scripts/index_brain.py`
    128 +- 검색:`python scripts/search_brain.py drift`
    129 +- 인덱스 대상:
    130 +  -`docs/knowledge/**/*.md`
    131 +  -`docs/rules/**/*.md`
    132 +  -`docs/wiki/**/*.md`
    133 +  -`.omc/project-memory.json`
    134 +  -`logs/live_output.log`
    135 +  -`logs/drift_report_*.json`
    136 +
    137 +주의:
    138 +- SQLite DB는**정본이 아니다**
    139 +- 문서 수정 후 검색 품질이 필요하면 다시 인덱싱한다
    140 +- FTS 결과는 탐색용이며, 최종 보고는 원본 문서를 다시 열어 인용한다
    141 +
    142  ## 8. 금지사항

  └ docs\knowledge\USER.md (+59 -0)
    1 +---
    2 +title: USER — 윤회장님 작업 선호 및 운영 스타일
    3 +slug: USER
    4 +category: meta
    5 +status: active
    6 +priority: P1
    7 +last_updated: 2026-04-16
    8 +owner: 오과장(AI)
    9 +tags: [user, preferences, operating-style]
    10 +---
    11 +
    12 +# USER — 윤회장님 작업 선호 및 운영 스타일
    13 +
    14 +## TL;DR
    15 +
    16 +- 한국어로 짧고 정확하게 보고한다.
    17 +- 수치는 추정이 아니라 검증 후 보고한다.
    18 +- 전략 변경보다 먼저 실제 운영 상태와 SSOT 충돌을 확인하는 흐름을 선호한다.
    19 +
    20 +## 1. 보고 스타일
    21 +
    22 +- 한국어 우선. 코드, 경로, 키 이름만 영어 그대로 사용한다.
    23 +- 장황한 설명보다 현재 상태, 충돌, 다음 액션을 압축해서 바로 말한다.
    24 +- source 없는 수치 보고를 싫어한다. 특히 확정PnL, 미실현PnL, 순자산 혼동을 강하게 경계한다.
    25 +
    26 +source:
    27 +-`docs/rules/reporting_rules.md`
    28 +-`docs/past_mistakes_audit.md`
    29 +-`docs/knowledge/ENTRY.md`
    30 +
    31 +## 2. 운영 원칙
    32 +
    33 +-`config.json`을 단일 진실 원천으로 두는 방향을 선호한다.
    34 +- 봇 상태는 코드 논리보다 먼저`live_output.log`, drift report, 거래소 실측으로 확인한다.
    35 +- 멀티 에이전트 협업 시`active_tasks`와 홀로노믹 브레인 동기화를 중요하게 본다.
    36 +
    37 +source:
    38 +-`docs/knowledge/ENTRY.md`
    39 +-`docs/knowledge/PROTOCOL.md`
    40 +-`docs/knowledge/active_tasks.md`
    41 +
    42 +## 3. 기술 선호
    43 +
    44 +- 바로 저장소에 반영 가능한 실용적 개선을 선호한다.
    45 +- 큰 프레임워크 전체 도입보다 핵심 개념만 흡수해 경량 적용하는 쪽을 선호한다.
    46 +- SQLite처럼 내장 가능하고 관리 부담이 적은 구성은 수용 가능성이 높다.
    47 +
    48 +source:
    49 +- live session 2026-04-16 KST
    50 +
    51 +## 교차 참조
    52 +
    53 +- [[ENTRY]]
    54 +- [[PROTOCOL]]
    55 +- [[HOLONOMIC]]
    56 +
    57 +## 변경 이력
    58 +
    59 +- 2026-04-16: 초판. 사용자 작업/보고 선호를 프로젝트 기억과 분리. (오과장)

  └ docs\rules\delegation_contract.md (+44 -0)
    1 +# Delegation Contract
    2 +
    3 +## 목적
    4 +
    5 +서브에이전트는 부모 세션의 암묵적 맥락을 공유하지 않는다는 전제로 작업한다.
    6 +Hermes의 delegation 원칙을 바투 홀로노믹 브레인 운영 규칙에 맞게 경량화한 문서다.
    7 +
    8 +## 핵심 규칙
    9 +
    10 +1. 서브에이전트는**아무것도 모른다고 가정**한다.
    11 +2. 부모는 작업 시작 전에 최소 컨텍스트를 명시적으로 넘긴다.
    12 +3. 작업 결과는 반드시`docs/knowledge` 또는 관련 로그/코드 diff로 귀결돼야 한다.
    13 +4. 같은 파일을 병렬 수정할 때는`active_tasks`에 락을 먼저 기록한다.
    14 +
    15 +## 최소 컨텍스트 패킷
    16 +
    17 +서브에이전트에게 아래를 함께 전달한다.
    18 +
    19 +- 작업 목표 1문장
    20 +- 읽어야 할 브레인 문서
    21 +  -`docs/knowledge/ENTRY.md`
    22 +  -`docs/knowledge/PROTOCOL.md`
    23 +  - 작업별 MOC 1개
    24 +- 수정 허용 경로와 금지 경로
    25 +- 현재 확정된 수치와 출처
    26 +- 완료 조건
    27 +
    28 +## 금지
    29 +
    30 +- "알아서 이어서 해" 같은 암묵적 위임
    31 +- source 없는 수치 전달
    32 +- 다른 에이전트가 점유 중인 파일을 덮어쓰기
    33 +
    34 +## 적용 예시
    35 +
    36 +- 드리프트 디버깅 위임:
    37 +  - 읽기:`ENTRY`, `PROTOCOL`, `moc/incidents`, 최근 `evolution/*`
    38 +  - 쓰기 허용:`batoo_binance/strategy/*`, `scripts/check_drift.py`
    39 +  - 완료 조건: ghost count 재측정 또는 원인 코드 식별
    40 +
    41 +- 문서 정리 위임:
    42 +  - 읽기:`ENTRY`, `PROTOCOL`, `GRAPH`
    43 +  - 쓰기 허용:`docs/knowledge/*`, `docs/rules/*`
    44 +  - 완료 조건: MOC/GRAPH/변경 이력 동기화

  └ scripts\index_brain.py (+16 -0)
    1 +"""Build or rebuild the SQLite index for the holonomic brain."""
     2 +
    3 +from batoo_binance.utils.brain_db import BRAIN_DB_PATH, connect, rebuild_index
    4 +
    5 +
    6 +def main() -> None:
    7 +    conn = connect()
    8 +    try:
    9 +        count = rebuild_index(conn)
    10 +    finally:
    11 +        conn.close()
    12 +    print(f"[brain-index] indexed {count} documents into {BRAIN_DB_PATH}")
    13 +
    14 +
    15 +if__name__ == "__main__":
    16 +    main()

  └ scripts\search_brain.py (+35 -0)
    1 +"""Search the SQLite-backed holonomic brain index."""
    2 +
    3 +import sys
    4 +
    5 +from batoo_binance.utils.brain_db import connect, search
    6 +
    7 +
    8 +def main() -> int:
    9 +    if len(sys.argv) < 2:
    10 +        print("usage: python scripts/search_brain.py`<fts-query>` [limit]")
    11 +        return 1
    12 +
    13 +    query = sys.argv[1]
    16 +    conn = connect()
    17 +    try:
    18 +        rows = search(conn, query, limit=limit)
    19 +    finally:
    20 +        conn.close()
    21 +
    22 +    if not rows:
    23 +        print("[brain-search] no matches")
    24 +        return 0
    25 +
    26 +    for idx, row in enumerate(rows, start=1):
    27 +        print(f"{idx}. {row['title']}")
    28 +        print(f"   path: {row['path']}")
    29 +        print(f"   category: {row['category']} | source: {row['source_type']} | tags: {row['tags']}")
    30 +        print(f"   snippet: {row['snippet']}")
    31 +    return 0
    32 +
    33 +
    34 +if __name__ == "__main__":
    35 +    raise SystemExit(main())

─ Worked for 1m 47s ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• 문서와 구현은 넣었습니다. 이제 실제로 SQLite 인덱스를 생성하고 검색이 되는지 확인하겠습니다. 브레인 계층을 추가만 하고 안 돌리면 반영이 반쪽이라 여기
  까지 마무리하겠습니다.

• Running python -m py_compile batoo_binance\utils\brain_db.py scripts\index_brain.py scripts\search_brain.py

• Running python scripts/index_brain.py

• Ran python scripts/index_brain.py
  └ Traceback (most recent call last):
    File "C:\Project\16_BaToo_bynance\scripts\index_brain.py", line 3, in`<module>`
    from batoo_binance.utils.brain_db import BRAIN_DB_PATH, connect, rebuild_index
    ModuleNotFoundError: No module named 'batoo_binance'

• Ran python -m py_compile batoo_binance\utils\brain_db.py scripts\index_brain.py scripts\search_brain.py
  └ (no output)

• Ran python scripts/search_brain.py drift 5
  └ Traceback (most recent call last):
    File "C:\Project\16_BaToo_bynance\scripts\search_brain.py", line 5, in`<module>`
    from batoo_binance.utils.brain_db import connect, search
    ModuleNotFoundError: No module named 'batoo_binance'

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
• 실행 경로 이슈만 남았습니다. scripts/*.py를 직접 호출할 때 루트 패키지가 안 잡히는 상태라, 스크립트 진입부에서 프로젝트 루트를 sys.path에 올리도록 정
  리하겠습니다.

• Edited 2 files (+12 -0)
  └ scripts\index_brain.py (+7 -0)
    4 +import sys
     5 +
     6 +ROOT = Path(__file__).resolve().parent.parent
     7 +if str(ROOT) not in sys.path:
     8 +    sys.path.insert(0, str(ROOT))
     9 +
    10  from batoo_binance.utils.brain_db import BRAIN_DB_PATH, connect, rebuild_index

  └ scripts\search_brain.py (+5 -0)
     2
     3 +from pathlib import Path
     4  import sys
     5
     6 +ROOT = Path(__file__).resolve().parent.parent
     7 +if str(ROOT) not in sys.path:
     8 +    sys.path.insert(0, str(ROOT))
     9 +
    10  from batoo_binance.utils.brain_db import connect, search

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
• Running python scripts/index_brain.py

• Ran python -m py_compile batoo_binance\utils\brain_db.py scripts\index_brain.py scripts\search_brain.py
  └ (no output)

• Ran python scripts/search_brain.py drift 5
  └ Traceback (most recent call last):
      File "C:\Project\16_BaToo_bynance\scripts\search_brain.py", line 40, in `<module>`
    … +6 lines (ctrl + t to view transcript)
                    ~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^
    sqlite3.OperationalError: no such table: documents_fts

• Ran python scripts/index_brain.py
  └ [brain-index] indexed 44 documents into C:\Project\16_BaToo_bynance\data\brain\brain.db

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• 인덱스 생성은 됐는데 검색 시 가상 테이블이 안 보이는 상태입니다. 테이블 생성 경로를 한 번 확인해서, FTS5 지원 문제인지 스키마 생성 순서 문제인지 바로
  분리하겠습니다.

• Running @'
  │ import sqlite3
  │ from pathlib import Path
  │ … +9 lines

• Ran @'
  │ import sqlite3
  │ print(sqlite3.sqlite_version)
  │ … +9 lines
  └ 3.45.3
• Ran @'
  │ import sqlite3
  │ from pathlib import Path
  │ … +9 lines
  └ documents table
    CREATE TABLE documents (
    … +36 lines (ctrl + t to view transcript)
    None
    ---

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• SQLite/FTS5 자체는 지원됩니다. 문제는 검색 SQL 쪽입니다. FTS 가상 테이블 alias와 snippet() 호출 형태를 더 보수적으로 바꿔서 바로 고치겠습니다.

• Edited batoo_binance\utils\brain_db.py (+2 -2)
    246      FROM documents_fts
    247 -    JOIN documents d ON d.doc_id = documents_fts.doc_id
    247 +    JOIN documents AS d ON d.doc_id = documents_fts.doc_id
    248      WHERE documents_fts MATCH ?
    249 -    ORDER BY rank
    249 +    ORDER BY bm25(documents_fts)
    250      LIMIT ?

• Running python -m py_compile batoo_binance\utils\brain_db.py scripts\index_brain.py scripts\search_brain.py

• Running python scripts/index_brain.py

• Ran python -m py_compile batoo_binance\utils\brain_db.py scripts\index_brain.py scripts\search_brain.py
  └ (no output)

• Ran python scripts/index_brain.py
  └ [brain-index] indexed 44 documents into C:\Project\16_BaToo_bynance\data\brain\brain.db

• Ran python scripts/search_brain.py drift 5
  └ 1. 2026-04-16 진화 로그
    path: docs/knowledge/evolution/2026-04-16.md
    … +39 lines (ctrl + t to view transcript)
    snippet:  ... 고변동성 종목 단일 청산 → 봇 로컬/거래소 괴리 발견 → 재동기화 + P1 3건 배포
    tags: [evolution, round2_0, [drift] ...

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
• 핵심 반영은 동작 확인까지 끝났습니다. 검색도 실제로 drift 질의에 대해 문서와 로그를 함께 찾아오고 있습니다. 마지막으로 진화 로그와 진입점에 이번 반영
  사실만 남기겠습니다.
  └ docs\knowledge\ENTRY.md (+1 -0)
    110  - [[PROTOCOL]] — 쓰기/링크/품질 규칙
    111 +- [[USER]] — 사용자 선호/운영 스타일
    112  - [[HOLONOMIC]] — 왜 "홀로노믹 브레인"인가 (철학)

  └ docs\knowledge\evolution\2026-04-16.md (+12 -0)
    47
    48 +## 4. Hermes 개념 경량 반영
    49 +
    50 +- `docs/knowledge/USER.md` 추가: 프로젝트 지식과 사용자/운영 선호를 분리
    51 +- `docs/rules/delegation_contract.md` 추가: 서브에이전트는 무지 상태에서 시작한다는 위임 계약 명시
    52 +- `data/brain/brain.db` + `scripts/index_brain.py` + `scripts/search_brain.py` 추가
    53 +- 검색 레이어는 정본이 아니며, `docs/knowledge`, `docs/rules`, `.omc/project-memory.json`, 주요 로그를 FTS5로 검색하는 용도
    54 +
    55 +예시:
    56 +- `python scripts/index_brain.py`
    57 +- `python scripts/search_brain.py drift`
    58 +
    59  ## 교차 참조
       ⋮
    68  - 2026-04-16: 초판. drift 재검증 결과와 잔여 ghost 4건 기록. (오과장)
    69 +- 2026-04-16: Hermes 개념을 USER 계층, delegation contract, SQLite 검색 레이어로 경량 반영. (오과장)

• Running git status --short

• Running python scripts/search_brain.py USER 5

• Ran git status --short
  └  M docs/knowledge/ENTRY.md
    M docs/knowledge/GRAPH.md
    … +10 lines (ctrl + t to view transcript)
    warning: unable to access 'C:\Users\asiti/.config/git/ignore': Permission denied
    warning: unable to access 'C:\Users\asiti/.config/git/ignore': Permission denied

• Ran python scripts/search_brain.py USER 5
  └ Traceback (most recent call last):
    File "C:\Users\CodexSandboxOffline\.codex\.sandbox\cwd\b87618d9813f7b69\scripts\search_brain.py", line 40, in `<module>`
    … +4 lines (ctrl + t to view transcript)
    ~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^
    UnicodeEncodeError: 'cp949' codec can't encode character '\u2014' in position 8: illegal multibyte sequence

• Ran Get-ChildItem data\brain | Select-Object Name,Length,Mode
  └
    Name     Length Mode
    … +2 lines (ctrl + t to view transcript)

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
• 마지막 남은 건 Windows 콘솔 인코딩입니다. 검색 결과 출력에서 cp949에 걸렸으니, 검색 스크립트도 UTF-8 출력 고정으로 맞추겠습니다.


Edited scripts\search_brain.py (+3 -0)
     9
    10 +if hasattr(sys.stdout, "reconfigure"):
    11 +    sys.stdout.reconfigure(encoding="utf-8")
    12 +
    13  from batoo_binance.utils.brain_db import connect, search

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• Windows 출력 문제까지 맞췄습니다. 검색 스크립트 재확인하고 마무리하겠습니다.

• Running python -m py_compile scripts\search_brain.py

• Ran python -m py_compile scripts\search_brain.py
  └ (no output)

• Ran python scripts/search_brain.py USER 5
  └ 1. USER — 윤회장님 작업 선호 및 운영 스타일
    path: docs/knowledge/USER.md
    … +41 lines (ctrl + t to view transcript)

    - [[reference_bot/02_position ...

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• 바로 반영 가능한 것들은 넣어뒀습니다. Hermes에서 가져온 핵심은 “기억 계층 분리”, “무지 상태 위임 계약”, “검색 가능한 브레인 레이어” 세 가지입니다.

  구체적으로는 docs/knowledge/USER.md를 추가해서 프로젝트 정본 지식과 사용자/운영 선호를 분리했고, docs/rules/delegation_contract.md로 서브에이전트는 항
  상 명시적 컨텍스트만 받고 시작한다는 규칙을 넣었습니다. 또 batoo_binance/utils/brain_db.py, scripts/index_brain.py, scripts/search_brain.py를 추가해서
  docs/knowledge, docs/rules, docs/wiki, .omc/project-memory.json, logs/live_output.log, logs/drift_report_*.json를 SQLite FTS5로 검색할 수 있게 했습니
  다.

  실제로 인덱스도 생성했습니다. data/brain/brain.db가 만들어졌고, python scripts/index_brain.py로 44개 문서를 색인했고, python scripts/search_brain.py
  drift와 python scripts/search_brain.py USER 검색까지 확인했습니다. 관련 문서는 docs/knowledge/ENTRY.md, docs/knowledge/PROTOCOL.md, docs/knowledge/
  README.md, docs/knowledge/GRAPH.md, docs/knowledge/USER.md, docs/rules/delegation_contract.md, docs/knowledge/evolution/2026-04-16.md에 반영했습니다.

  한 가지는 그대로 둔 게 있습니다. brain.db는 정본이 아니라 재생성 가능한 검색 인덱스라서, 커밋할지 말지는 정책을 정해야 합니다. 제 권고는 DB 파일은 보
  통 커밋하지 않고, 스크립트와 문서만 커밋하는 쪽입니다. 원하시면 다음으로 .gitignore 처리까지 같이 정리하겠습니다.
