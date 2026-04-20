# 🧠 Holonomic Brain System Bootstrap Guide

**AI 에이전트님께:** 이 문서는 현재 프로젝트를 `Holonomic Brain System` 구조로 마이그레이션하기 위한 모든 명령어와 파일 소스를 담고 있는 부트스트랩 스크립트입니다. 이 지시사항을 처음부터 끝까지 순차적으로 실행하여 시스템을 복제해 주십시오.

---

## 1단계: 디렉토리 초기화
다음 명령어를 실행하여 필수 디렉토리 구조를 생성하세요. `docs/raw` 폴더를 비롯해 시스템 구동에 필요한 모든 경로가 만들어집니다.

```bash
mkdir -p docs/raw docs/wiki/architecture docs/wiki/incidents docs/wiki/strategy .omc scripts graphify-out
```

---

## 2단계: 핵심 프레임워크 파일 생성

### 1) `.omc/project-memory.json` 작성
초기 머신 가독형 메모리 파일입니다. 비워두지 말고 아래 뼈대로 파일을 생성하세요.
```json
{
  "version": "1.0.0",
  "projectRoot": "./",
  "customNotes": [
    "프로젝트 두뇌는 docs/wiki에 보관됨.",
    "모든 에이전트는 docs/wiki/strategy/holonomic-brain-operating-model.md 를 준수하여 하나처럼 동작해야 함."
  ],
  "hotPaths": [] 
}
```

### 2) `docs/wiki/SCHEMA.md` 작성
모든 에이전트가 지식을 기록하는 룰셋입니다. 파일로 생성하세요.
```markdown
# Wiki Schema

## Purpose
채팅의 휘발성 기억이 아닌, 위키 레이어에 영구 지식을 기록하라.

## Core Rules
1. **Raw Sources**: `docs/raw/` 폴더에 원본 데이터 보관.
2. **Wiki**: `docs/wiki/` 에 정제된 지식 보관 (구조: architecture/, 장애: incidents/, 방향성: strategy/).
3. **Omc Memory**: `.omc/project-memory.json` 에 현재 프로젝트 주요 맥락 압축 보관.
4. **Holonomic Brain Policy**: 모든 에이전트는 독립된 개체가 아닌, 이 위키와 메모리를 공유하는 하나의 두뇌로 동작해야 한다. 새로운 발견은 무조건 위키에 업데이트하라.
```

### 3) `docs/wiki/strategy/holonomic-brain-operating-model.md` 작성
공유 두뇌에 관한 자기 참조형 문서입니다.
```markdown
# Holonomic Brain Operating Model

- **개념**: 단일 AI의 기억에 의존하지 않고, 여러 에이전트와 환경이 하나로 움직이는 공유 프로젝트 두뇌.
- **의무**: 
  - 에러와 중요한 아키텍처는 채팅창에만 두지 말고 위키 문서로 영속화할 것.
  - `project-memory.json`을 항상 최신으로 유지하여 새로 투입되는 에이전트가 단번에 맥락을 파악할 수 있도록 할 것.
```

### 4) `CLAUDE.md` / `.cursorrules` 등 글로벌 프롬프트 파일 수정
로컬에 프롬프트 파일이 존재한다면, 다음 문구를 최상단에 **반드시** 추가하세요. 없는 경우 `CLAUDE.md`로 신규 생성하세요.
```markdown
**Holonomic Brain Policy:** 
"이 프로젝트는 다중 에이전트 공유 두뇌 체제입니다. 무언가를 수정하기 전 반드시 `docs/wiki/` 와 `.omc/project-memory.json` 을 읽어 맥락을 파악하고, 에러나 새 아키텍처를 해결한 후에는 즉시 위키 문서로 박제하여 다른 에이전트에게 지식을 동기화하세요."
```

---

## 3단계: Graphify 및 시각화(HTML) 스크립트 구축

호로노믹 브레인의 전체 지식/코드 토폴로지를 시각화하는 파이썬 스크립트입니다.
아래 코드를 복사하여 `scripts/build_brain_viz.py` 로 저장하세요.

```python
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAPH_JSON = ROOT / "graphify-out" / "graph.json"
WIKI_DIR = ROOT / "docs" / "wiki"
RAW_DIR = ROOT / "docs" / "raw"
MEMORY_JSON = ROOT / ".omc" / "project-memory.json"
OUT_HTML = ROOT / "graphify-out" / "holonomic-brain.html"

def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")

def load_code_layer():
    if not GRAPH_JSON.exists(): return [], []
    data = json.loads(GRAPH_JSON.read_text(encoding="utf-8"))
    nodes = [{"id": f"code::{n['id']}", "label": n.get("label", n["id"]), "layer": "code"} for n in data.get("nodes", [])]
    edges = []
    # (코드 단순화: 원래 Graphify 스크립트를 이곳에 붙여넣습니다)
    return nodes, edges

# 에이전트 지시사항: 이 파일(build_brain_viz.py)은 원본 프로젝트의 스크립트를 100% 미러링하거나 프로젝트 상황에 맞게 커스텀하여 사용하십시오.
# OUT_HTML 폴더가 존재하지 않는다면 에이전트가 mkdir -p graphify-out 를 수행해야 합니다.
```
*(참고: 너무 길어 축약했으나 실제 복제 시 원본 프로젝트의 `scripts/build_brain_viz.py` 파일의 전문을 그대로 복사해서 쓰시면 됩니다.)*

---

## 4단계: 시각화(HTML) 테스트 수행
마지막으로 셋업이 제대로 되었는지 파이썬 스크립트를 실행해 HTML 시각화 파일을 만듭니다.

```bash
python scripts/build_brain_viz.py
```
- 성공 시 `graphify-out/holonomic-brain.html` 파일이 생성됩니다. 이 HTML을 브라우저에서 열면, 프로젝트 코드와 지식 위키 모델이 그래픽으로 연결된 "공유 두뇌의 시각화 맵"을 볼 수 있습니다.
