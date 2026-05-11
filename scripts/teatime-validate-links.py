#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, io, sys
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

"""
teatime-validate-links.py

티타임 MD 의 모든 외부 링크에 HEAD/GET 검증을 수행하고, 4xx/5xx/timeout
링크는 즉시 제거합니다 (룰북: "404 URL 즉시 제거 또는 교체. 가짜 URL 잔존 금지").

사용법:
    python scripts/teatime-validate-links.py output/teatime/2026-05-01_AI동향_티타임.md

동작:
    1. MD 에서 모든 https?:// URL 추출 (이미지·일반 링크 모두 + 참고 링크 줄)
    2. 각 URL HEAD 요청 (timeout 12s) — HEAD 405/501 시 GET fallback
    3. 200/3xx 통과
    4. 403 bot-block 은 도메인 화이트리스트(crunchbase, therobotreport, fortune, wsj 등)
       에 한해 유지 (룰북 §"Link Verification") — 외에는 제거
    5. 4xx/5xx/timeout 은 해당 참고 링크 줄 자체 제거 (`> - [...](...)` 패턴 line-wise drop)
    6. 검증 후 토픽당 ≥3 / 전체 ≥12 룰 점검 → 부족 시 stderr 경고 (exit 0 유지)

이미지 URL (`![...](...)`) 은 fetch-images 에서 별도 처리하므로 본 스크립트는
MD 내 "참고 링크" 섹션의 외부 URL 만 정리한다.

의존성: requests
"""

import argparse
import re
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("[ERROR] requests 누락. pip install requests")
    sys.exit(1)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}
TIMEOUT = 12

# bot-blocked 응답을 받아도 "도메인이 살아 있다" 가 거의 확실한 곳들.
# 403/406/429 등 bot-block status 일 때 이 화이트리스트 도메인은 유지한다.
BOT_BLOCK_WHITELIST_DOMAINS = (
    "crunchbase.com",
    "therobotreport.com",
    "wsj.com",
    "ft.com",
    "bloomberg.com",
    "fortune.com",
    "reuters.com",
    "nytimes.com",
    "linkedin.com",
    "x.com",
    "twitter.com",
    "instagram.com",
)

REF_LINE_PATTERN = re.compile(r"^>\s*-\s*\[[^\]]+\]\((https?://[^\)]+)\)")


def domain_of(url: str) -> str:
    m = re.match(r"https?://([^/]+)", url)
    return m.group(1).lower() if m else ""


def in_whitelist(url: str) -> bool:
    d = domain_of(url)
    return any(d == w or d.endswith("." + w) for w in BOT_BLOCK_WHITELIST_DOMAINS)


def probe(url: str) -> tuple[int, str]:
    """
    (status, reason) 반환.
    status:
       0   = OK
       1   = bot-blocked (whitelisted, 유지)
       2   = invalid (제거 대상)
    """
    try:
        r = requests.head(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        sc = r.status_code
        if sc in (405, 501) or sc == 0:
            r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True, stream=True)
            sc = r.status_code
        if 200 <= sc < 400:
            return 0, f"HTTP {sc}"
        if sc in (401, 403, 406, 429, 451):
            if in_whitelist(url):
                return 1, f"HTTP {sc} (bot-blocked, whitelisted)"
            return 2, f"HTTP {sc} (blocked, not whitelisted)"
        return 2, f"HTTP {sc}"
    except requests.Timeout:
        return 2, "timeout"
    except requests.ConnectionError as e:
        # DNS 실패·SSL 등 — whitelisted 면 살림 (RSS 일시 장애 가능)
        if in_whitelist(url):
            return 1, f"ConnectionError (whitelisted)"
        return 2, f"ConnectionError: {str(e)[:80]}"
    except Exception as e:
        return 2, f"error: {str(e)[:80]}"


def count_topic_refs(md: str) -> dict[int, int]:
    """## N. 섹션별 참고 링크 줄 수."""
    counts: dict[int, int] = {}
    section = 0
    for line in md.splitlines():
        m = re.match(r"^##\s+(\d+)\.", line)
        if m:
            section = int(m.group(1))
            counts.setdefault(section, 0)
            continue
        if section and REF_LINE_PATTERN.match(line):
            counts[section] = counts.get(section, 0) + 1
    return counts


def validate(md_path: Path, dry_run: bool = False) -> int:
    content = md_path.read_text(encoding="utf-8")

    # 모든 참고 링크 줄에서 URL 수집 (중복 제거 안 함 — line 단위 처리 위해)
    lines = content.splitlines()
    targets: list[tuple[int, str]] = []  # (line_idx, url)
    for i, line in enumerate(lines):
        m = REF_LINE_PATTERN.match(line)
        if m:
            targets.append((i, m.group(1)))

    print(f"\n{'='*60}")
    print(f"  링크 검증: {md_path.name}")
    print(f"  참고 링크 줄: {len(targets)}개")
    print(f"{'='*60}")

    cache: dict[str, tuple[int, str]] = {}
    drop_lines: set[int] = set()
    keep_count = 0
    bot_count = 0
    drop_count = 0

    for idx, (line_no, url) in enumerate(targets, 1):
        if url in cache:
            status, reason = cache[url]
        else:
            status, reason = probe(url)
            cache[url] = (status, reason)
        if status == 0:
            keep_count += 1
            tag = "OK  "
        elif status == 1:
            bot_count += 1
            tag = "WARN"
        else:
            drop_count += 1
            drop_lines.add(line_no)
            tag = "DROP"
        print(f"  [{idx:2d}] {tag}  {reason:40s}  {url[:80]}")

    if dry_run:
        print(f"\n[DRY-RUN] 변경사항 적용 안 함")
    elif drop_lines:
        new_lines = [ln for i, ln in enumerate(lines) if i not in drop_lines]
        new_content = "\n".join(new_lines)
        # 끝에 trailing newline 보장
        if not new_content.endswith("\n"):
            new_content += "\n"
        md_path.write_text(new_content, encoding="utf-8")
        print(f"\n[OK] {drop_count}줄 제거 후 저장: {md_path}")
    else:
        print(f"\n[OK] 제거할 링크 없음")

    # 룰 점검 — 토픽당 3+ / 전체 12+
    after_content = md_path.read_text(encoding="utf-8")
    per_topic = count_topic_refs(after_content)
    total = sum(per_topic.values())
    print(f"\n{'='*60}")
    print(f"  검증 결과:")
    print(f"  - OK 유지       : {keep_count}")
    print(f"  - bot-block 유지: {bot_count}")
    print(f"  - 제거          : {drop_count}")
    print(f"  - 토픽별 참고 링크: {per_topic}")
    print(f"  - 전체 참고 링크 : {total}")
    print(f"{'='*60}")

    # NOTE: stdout 으로 출력해야 함. PowerShell 5.1 의 Invoke-Native 가
    # 2>&1 로 stderr 를 ErrorRecord 로 wrap 하기 때문에, 단순 경고도
    # ErrorActionPreference=Stop 환경에서 throw 로 변환되어 발행이 abort 됨.
    short_topics = [t for t, c in per_topic.items() if c < 3]
    if short_topics:
        print(f"[WARN] 토픽 {short_topics} 가 3개 미만 — 룰북 위반 위험")
    if total < 12:
        print(f"[WARN] 전체 참고 링크 {total} 개 — 룰북 12+ 미달")

    return drop_count


def main():
    parser = argparse.ArgumentParser(
        description="티타임 MD 외부 링크 검증·정리 (404/timeout 제거)"
    )
    parser.add_argument("md_file", help="MD 파일 경로")
    parser.add_argument("--dry-run", action="store_true", help="변경 없이 검증만")
    args = parser.parse_args()

    md_path = Path(args.md_file).resolve()
    if not md_path.exists():
        print(f"[ERROR] 파일 없음: {md_path}")
        sys.exit(1)

    validate(md_path, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
