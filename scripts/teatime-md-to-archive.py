#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, io, sys
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

"""
teatime-md-to-archive.py

MD 파일(output/teatime/YYYY-MM-DD_*.md)을 TypeScript archive로 변환합니다.
산출물: intercept/src/lib/teatime-archive/YYYY-MM-DD.ts
이미지:  output/teatime/images/YYYY-MM-DD/* → intercept/public/teatime-images/YYYY-MM-DD/*

사용법:
    python scripts/teatime-md-to-archive.py output/teatime/2026-04-23_AI동향_티타임.md
    python scripts/teatime-md-to-archive.py output/teatime/2026-04-23_AI동향_티타임.md --register
    python scripts/teatime-md-to-archive.py output/teatime/2026-04-23_AI동향_티타임.md --dry-run

의존성: Python 표준 라이브러리만 사용 (requests/bs4 불필요)
"""

import re
import json
import shutil
import argparse
from pathlib import Path
from datetime import datetime

# ---------------------------------------------------------------------------
# 프로젝트 루트 기준 경로
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
INTERCEPT_ROOT = PROJECT_ROOT / "intercept"
ARCHIVE_DIR = INTERCEPT_ROOT / "src" / "lib" / "teatime-archive"
PUBLIC_IMAGES_BASE = INTERCEPT_ROOT / "public" / "teatime-images"
TEATIME_DATA_TS = INTERCEPT_ROOT / "src" / "lib" / "teatime-data.ts"

# ---------------------------------------------------------------------------
# 고정 카테고리 → id slug 매핑
# ---------------------------------------------------------------------------
CATEGORY_SLUGS = {
    "AI 핫뉴스": "hotnews",
    "AI 에이전트": "agents",
    "AI 논문과 모델": "models",
    "AI 로봇 / 피지컬 AI": "robots",
    "보너스": "bonus",
    "그 외": "bonus",
}

# ---------------------------------------------------------------------------
# 캐릭터명 → characterId 매핑
# ---------------------------------------------------------------------------
CHARACTER_IDS = {
    "코부장": "kobu",
    "오과장": "oh",
    "젬대리": "jem",
}


# ---------------------------------------------------------------------------
# 유틸
# ---------------------------------------------------------------------------

def ts_escape(s: str) -> str:
    """TypeScript 문자열 이스케이프 (백틱 템플릿용 → 일반 따옴표 사용)."""
    return s.replace("\\", "\\\\").replace("'", "\\'")


def extract_date(filepath: Path) -> str:
    """파일명 또는 콘텐츠에서 YYYY-MM-DD 추출."""
    m = re.search(r"(\d{4}-\d{2}-\d{2})", filepath.name)
    if m:
        return m.group(1)
    raise ValueError(f"파일명에서 날짜 추출 실패: {filepath.name}")


def extract_vol(content: str) -> int:
    """# Offspace 티타임 Vol.N 에서 볼륨 번호 추출."""
    m = re.search(r"Vol\.(\d+)", content)
    return int(m.group(1)) if m else 0


def extract_intro(content: str) -> str:
    """첫 번째 > 로 시작하는 도입 상황극 추출."""
    m = re.search(r"^>\s+(.+)$", content, re.MULTILINE)
    if m:
        return m.group(1).strip()
    # fallback: 첫 줄 이후 --- 이전 텍스트
    lines = content.split("\n")
    for line in lines[1:]:
        line = line.strip()
        if line and not line.startswith("#") and not line.startswith("---") and not line.startswith(">"):
            return line
    return ""


def extract_title_from_header(content: str) -> str:
    """# Offspace 티타임 Vol.N — YYYY년 ... 헤더 추출."""
    m = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    return m.group(1).strip() if m else "Offspace 티타임"


def split_topics(content: str) -> list[dict]:
    """## N. 카테고리 — "서브타이틀" 블록 분리."""
    # 각 ## N. 섹션을 분리 (티타임 요약 / 마무리 제외)
    pattern = re.compile(
        r"^## (\d+)\.\s+(AI 핫뉴스|AI 에이전트|AI 논문과 모델|AI 로봇 / 피지컬 AI|보너스|그 외)"
        r'(?:\s+—\s+["“”](.+?)["“”])?\s*$',
        re.MULTILINE,
    )
    matches = list(pattern.finditer(content))
    if not matches:
        return []

    topics = []
    for i, m in enumerate(matches):
        num = int(m.group(1))
        category = m.group(2).strip()
        subtitle = m.group(3).strip() if m.group(3) else ""

        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
        body = content[start:end]

        topics.append({
            "num": num,
            "category": category,
            "subtitle": subtitle,
            "body": body,
        })
    return topics


def parse_images(body: str, date_str: str) -> list[dict]:
    """
    MD 이미지 블록 파싱.
    패턴: ![alt](./images/YYYY-MM-DD/filename.ext)
    캡션: 바로 다음 줄 > 출처: ...
    TS 경로: /teatime-images/YYYY-MM-DD/filename.ext
    """
    img_pattern = re.compile(
        r"!\[([^\]]*)\]\((\.\/images\/" + re.escape(date_str) + r"\/([^\)]+))\)"
    )
    caption_pattern = re.compile(r">\s*출처:\s*(.+)")

    images = []
    for m in img_pattern.finditer(body):
        alt = m.group(1).strip()
        rel_path = m.group(2)
        filename = m.group(3).strip()

        # 캡션 — 이미지 태그 이후 처음 나오는 > 출처: 라인
        after = body[m.end():]
        cap_m = caption_pattern.search(after.split("\n\n")[0])  # 가까운 단락 안에서만
        source = cap_m.group(1).strip() if cap_m else alt

        images.append({
            "src": f"/teatime-images/{date_str}/{filename}",
            "alt": alt,
            "source": source,
        })
    return images


def parse_messages(body: str) -> list[dict]:
    """
    **캐릭터명**: 내용 패턴 파싱.
    참고 링크 섹션(> 📎 또는 > -) 이전까지만 파싱.
    """
    # 참고 링크 섹션 이전 영역만 사용
    ref_section = re.search(r"\n>\s*📎|\n>\s*-\s*\[", body)
    parse_body = body[:ref_section.start()] if ref_section else body

    # 각 **이름**: 블록을 분리 — 다음 **이름**: 또는 > (인용 블록) 전까지
    pattern = re.compile(
        r"^\*\*([^*]+)\*\*:\s*(.+?)(?=\n\*\*[^*]+\*\*:|\n>|\Z)",
        re.MULTILINE | re.DOTALL,
    )
    messages = []
    msg_idx = 1
    for m in pattern.finditer(parse_body):
        name = m.group(1).strip()
        char_id = CHARACTER_IDS.get(name)
        if not char_id:
            continue
        # 연속 공백/줄바꿈 정리
        text = re.sub(r"\n+", " ", m.group(2)).strip()
        text = re.sub(r"\s{2,}", " ", text)
        messages.append({
            "id": f"msg-{msg_idx}",
            "characterId": char_id,
            "content": text,
            "type": "normal",
        })
        msg_idx += 1
    return messages


def parse_references(body: str) -> list[dict]:
    """
    > - [제목](URL) | 매체 | YYYY.MM.DD | ★★★★★ 패턴 파싱.
    여러 형식 지원.
    """
    # 형식 1: > - [제목](URL) | 매체 | 날짜 | ★★★★★
    pattern1 = re.compile(
        r">\s+-\s+\[([^\]]+)\]\((https?://[^\)]+)\)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(★+)"
    )
    # 형식 2: > - [제목](URL) | 매체 | 날짜  (별점 없음)
    pattern2 = re.compile(
        r">\s+-\s+\[([^\]]+)\]\((https?://[^\)]+)\)\s*\|\s*([^|]+)\s*\|\s*([^|\n]+)"
    )

    refs = []
    seen_urls = set()
    for m in pattern1.finditer(body):
        url = m.group(2).strip()
        if url in seen_urls:
            continue
        seen_urls.add(url)
        date_raw = m.group(4).strip()
        # YYYY.MM.DD → YYYY-MM-DD
        date_norm = re.sub(r"\.", "-", date_raw).strip()
        # 날짜 형식 정규화 (YYYY-MM만 있을 경우 그대로)
        stars = m.group(5).count("★")
        refs.append({
            "title": m.group(1).strip(),
            "url": url,
            "source": m.group(3).strip(),
            "date": date_norm,
            "rating": stars,
        })

    # pattern1 미매칭 URL에 pattern2 적용
    for m in pattern2.finditer(body):
        url = m.group(2).strip()
        if url in seen_urls:
            continue
        seen_urls.add(url)
        date_raw = m.group(4).strip()
        date_norm = re.sub(r"\.", "-", date_raw).strip()
        refs.append({
            "title": m.group(1).strip(),
            "url": url,
            "source": m.group(3).strip(),
            "date": date_norm,
            "rating": 3,
        })

    return refs


# ---------------------------------------------------------------------------
# TypeScript 직렬화 헬퍼
# ---------------------------------------------------------------------------

def ts_string(s: str) -> str:
    return "'" + ts_escape(s) + "'"


def ts_bilingual(ko: str, en: str = "") -> str:
    if not en:
        en = ko
    return "{ ko: " + ts_string(ko) + ", en: " + ts_string(en) + " }"


def ts_image(img: dict, indent: int = 8) -> str:
    pad = " " * indent
    lines = [
        pad + "{",
        pad + f"  src: {ts_string(img['src'])},",
        pad + f"  alt: {ts_bilingual(img['alt'])},",
        pad + f"  source: {ts_bilingual(img['source'])},",
        pad + "}",
    ]
    return "\n".join(lines)


def ts_message(msg: dict, indent: int = 8) -> str:
    pad = " " * indent
    lines = [
        pad + "{",
        pad + f"  id: {ts_string(msg['id'])},",
        pad + f"  characterId: {ts_string(msg['characterId'])},",
        pad + f"  content: {ts_bilingual(msg['content'])},",
        pad + f"  type: 'normal',",
        pad + "}",
    ]
    return "\n".join(lines)


def ts_reference(ref: dict, indent: int = 8) -> str:
    pad = " " * indent
    lines = [
        pad + "{",
        pad + f"  title: {ts_string(ref['title'])},",
        pad + f"  url: {ts_string(ref['url'])},",
        pad + f"  source: {ts_string(ref['source'])},",
        pad + f"  date: {ts_string(ref['date'])},",
        pad + f"  rating: {ref['rating']},",
        pad + "}",
    ]
    return "\n".join(lines)


def ts_topic(topic_data: dict, date_str: str, topic_idx: int) -> str:
    slug = CATEGORY_SLUGS.get(topic_data["category"], f"topic-{topic_idx}")
    topic_id = f"{date_str.replace('-', '')}-{slug}"

    cat_ko = topic_data["category"]
    subtitle_ko = topic_data["subtitle"]
    title_ko = f"{cat_ko} — \"{subtitle_ko}\"" if subtitle_ko else cat_ko

    images = parse_images(topic_data["body"], date_str)
    messages = parse_messages(topic_data["body"])
    refs = parse_references(topic_data["body"])

    lines = [
        "    {",
        f"      id: {ts_string(topic_id)},",
        f"      category: {ts_bilingual(cat_ko)},",
        f"      subtitle: {ts_bilingual(subtitle_ko)},",
        f"      title: {ts_bilingual(title_ko)},",
    ]

    if images:
        lines.append("      images: [")
        for img in images:
            lines.append(ts_image(img, indent=8))
            lines.append(",")
        lines.append("      ],")

    lines.append("      messages: [")
    for msg in messages:
        lines.append(ts_message(msg, indent=8))
        lines.append(",")
    lines.append("      ],")

    lines.append("      references: [")
    for ref in refs:
        lines.append(ts_reference(ref, indent=8))
        lines.append(",")
    lines.append("      ],")

    lines.append("    }")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 메인 변환
# ---------------------------------------------------------------------------

def convert(md_path: Path, dry_run: bool = False, register: bool = False) -> str:
    date_str = extract_date(md_path)
    content = md_path.read_text(encoding="utf-8")

    vol = extract_vol(content)
    title_ko = extract_title_from_header(content)
    intro_ko = extract_intro(content)

    # 날짜 → publishedAt (KST 07:00)
    published_at = f"{date_str}T07:00:00+09:00"
    const_name = "TEATIME_" + date_str.replace("-", "_")
    archive_id = f"teatime-{date_str}"

    topics_data = split_topics(content)
    if not topics_data:
        print(f"[WARN] 카테고리 섹션을 찾지 못했습니다: {md_path.name}")

    # TS 생성
    topic_blocks = []
    for i, t in enumerate(topics_data):
        topic_blocks.append(ts_topic(t, date_str, i + 1))

    topics_str = ",\n".join(topic_blocks)

    ts_content = f"""// AUTO-GENERATED by scripts/teatime-md-to-archive.py
// Source: {md_path.name}
// Do not edit manually — re-run the script to regenerate.
import type {{ RawTeaTime }} from '../teatime-data';

export const {const_name}: RawTeaTime = {{
  id: {ts_string(archive_id)},
  date: {ts_string(date_str)},
  title: {ts_bilingual(title_ko)},
  intro: {ts_bilingual(intro_ko)},
  topics: [
{topics_str},
  ],
}};
"""

    if dry_run:
        print("\n[DRY-RUN] TypeScript 출력 미리보기 (파일 미저장):")
        print("-" * 60)
        print(ts_content[:3000])
        if len(ts_content) > 3000:
            print(f"... (총 {len(ts_content)}자)")
        print("-" * 60)
        return ts_content

    # 디렉토리 생성
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    out_ts = ARCHIVE_DIR / f"{date_str}.ts"
    out_ts.write_text(ts_content, encoding="utf-8")
    print(f"[OK] TS 파일 생성: {out_ts}")

    # 이미지 복사
    src_img_dir = md_path.parent / "images" / date_str
    if src_img_dir.exists():
        dst_img_dir = PUBLIC_IMAGES_BASE / date_str
        dst_img_dir.mkdir(parents=True, exist_ok=True)
        copied = 0
        for img_file in src_img_dir.iterdir():
            if img_file.is_file():
                shutil.copy2(img_file, dst_img_dir / img_file.name)
                copied += 1
        print(f"[OK] 이미지 복사: {src_img_dir} → {dst_img_dir} ({copied}개)")
    else:
        print(f"[INFO] 이미지 디렉토리 없음 (건너뜀): {src_img_dir}")

    # --register: teatime-data.ts ALL_TEATIMES prepend
    if register:
        _register_archive(date_str, const_name, out_ts)

    print(f"\n완료: {out_ts.relative_to(PROJECT_ROOT)}")
    return ts_content


def _register_archive(date_str: str, const_name: str, archive_ts: Path) -> None:
    """
    intercept/src/lib/teatime-data.ts 에 archive import + ALL_TEATIMES prepend.
    ALL_TEATIMES 배열이 없으면 스킵 (사용자 수동 추가 안내).
    """
    if not TEATIME_DATA_TS.exists():
        print(f"[WARN] teatime-data.ts 없음 — 자동 등록 스킵")
        return

    content = TEATIME_DATA_TS.read_text(encoding="utf-8")

    # 이미 import 되어 있으면 스킵
    archive_rel = f"./teatime-archive/{date_str}"
    if archive_rel in content:
        print(f"[INFO] 이미 import 됨 — 등록 스킵: {archive_rel}")
        return

    # import 라인 추가 (마지막 import 블록 뒤)
    import_line = f"import {{ {const_name} }} from '{archive_rel}';"
    last_import = max(
        (i for i, line in enumerate(content.splitlines()) if line.startswith("import ")),
        default=-1,
    )
    lines = content.splitlines()
    if last_import >= 0:
        lines.insert(last_import + 1, import_line)
        content = "\n".join(lines)
        print(f"[OK] import 추가: {import_line}")
    else:
        content = import_line + "\n" + content
        print(f"[OK] import 추가 (파일 상단): {import_line}")

    # ALL_TEATIMES 배열 prepend
    all_pattern = re.compile(r"(export const ALL_TEATIMES[^=]*=\s*\[)")
    m = all_pattern.search(content)
    if m:
        insert_pos = m.end()
        content = content[:insert_pos] + f"\n  {const_name}," + content[insert_pos:]
        print(f"[OK] ALL_TEATIMES prepend: {const_name}")
    else:
        print(f"[INFO] ALL_TEATIMES 배열 없음 — 수동으로 추가하세요:")
        print(f"       import {{ {const_name} }} from '{archive_rel}';")
        print(f"       ALL_TEATIMES 배열에 {const_name} 추가")

    TEATIME_DATA_TS.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="티타임 MD → TypeScript archive 변환기"
    )
    parser.add_argument("md_file", help="입력 MD 파일 경로 (output/teatime/YYYY-MM-DD_*.md)")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="파일을 저장하지 않고 TS 출력만 미리보기",
    )
    parser.add_argument(
        "--register",
        action="store_true",
        help="teatime-data.ts ALL_TEATIMES에 자동 prepend",
    )
    args = parser.parse_args()

    md_path = Path(args.md_file).resolve()
    if not md_path.exists():
        print(f"[ERROR] 파일 없음: {md_path}")
        sys.exit(1)

    convert(md_path, dry_run=args.dry_run, register=args.register)


if __name__ == "__main__":
    main()
