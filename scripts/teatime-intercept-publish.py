#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, io, sys
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

"""
teatime-intercept-publish.py

인터셉트 발행 헬퍼 — validate → md-to-archive 파이프라인을 한 줄로 실행합니다.

사용법:
    python scripts/teatime-intercept-publish.py 2026-04-23
    python scripts/teatime-intercept-publish.py 2026-04-23_AI동향_티타임.md
    python scripts/teatime-intercept-publish.py 2026-04-23 --register
    python scripts/teatime-intercept-publish.py 2026-04-23 --dry-run

파이프라인:
    1. MD 파일 위치 확인
    2. teatime-skeleton.py --validate  (구조/카테고리/링크/이미지 검증)
    3. teatime-md-to-archive.py        (TS 변환 + 이미지 복사)
    실패 시 즉시 중단.
"""

import subprocess
import argparse
import glob
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
TEATIME_DIR = PROJECT_ROOT / "output" / "teatime"


def find_md_file(arg: str) -> Path:
    """날짜(YYYY-MM-DD) 또는 파일명에서 MD 경로 결정."""
    # 절대/상대 경로로 직접 지정된 경우
    p = Path(arg)
    if p.exists():
        return p.resolve()

    # output/teatime/ 기준 상대경로
    candidate = TEATIME_DIR / arg
    if candidate.exists():
        return candidate.resolve()

    # YYYY-MM-DD 날짜만 준 경우 — 와일드카드 탐색
    date_str = arg.strip()
    if len(date_str) == 10 and date_str[4] == "-":
        matches = list(TEATIME_DIR.glob(f"{date_str}_*.md"))
        if len(matches) == 1:
            return matches[0].resolve()
        if len(matches) > 1:
            print(f"[ERROR] 날짜 {date_str}에 해당하는 MD 파일이 여러 개입니다:")
            for m in matches:
                print(f"  {m.name}")
            print("파일명을 정확히 지정하세요.")
            sys.exit(1)

    print(f"[ERROR] MD 파일을 찾을 수 없습니다: {arg}")
    print(f"  탐색 위치: {TEATIME_DIR}")
    sys.exit(1)


def run_step(label: str, cmd: list[str]) -> None:
    """서브프로세스 실행. 실패 시 즉시 중단."""
    print(f"\n{'='*60}")
    print(f"  STEP: {label}")
    print(f"  CMD:  {' '.join(str(c) for c in cmd)}")
    print(f"{'='*60}")

    result = subprocess.run(cmd, cwd=str(PROJECT_ROOT))
    if result.returncode != 0:
        print(f"\n[FAIL] {label} 실패 (exit {result.returncode})")
        print("파이프라인 중단. 오류를 수정한 뒤 다시 실행하세요.")
        sys.exit(result.returncode)

    print(f"[OK] {label} 통과")


def main():
    parser = argparse.ArgumentParser(
        description="인터셉트 발행 헬퍼 — validate + md-to-archive 통합 실행"
    )
    parser.add_argument(
        "target",
        help="날짜(YYYY-MM-DD) 또는 MD 파일명/경로",
    )
    parser.add_argument(
        "--register",
        action="store_true",
        help="teatime-data.ts ALL_TEATIMES에 자동 prepend",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="TS 파일을 저장하지 않고 미리보기만 (validate는 실행됨)",
    )
    args = parser.parse_args()

    md_path = find_md_file(args.target)
    print(f"\n대상 MD: {md_path}")

    python = sys.executable

    # Step 1: validate
    run_step(
        "MD 구조 검증 (teatime-skeleton --validate)",
        [python, str(SCRIPT_DIR / "teatime-skeleton.py"), "--validate", str(md_path)],
    )

    # Step 2: md-to-archive
    archive_cmd = [
        python,
        str(SCRIPT_DIR / "teatime-md-to-archive.py"),
        str(md_path),
    ]
    if args.dry_run:
        archive_cmd.append("--dry-run")
    if args.register:
        archive_cmd.append("--register")

    run_step(
        "TS archive 변환 + 이미지 복사 (teatime-md-to-archive)",
        archive_cmd,
    )

    print(f"\n{'='*60}")
    print(f"  인터셉트 발행 파이프라인 완료")
    print(f"  MD: {md_path.name}")
    if not args.dry_run:
        from datetime import datetime
        import re
        date_m = re.search(r"(\d{4}-\d{2}-\d{2})", md_path.name)
        if date_m:
            date_str = date_m.group(1)
            ts_out = PROJECT_ROOT / "intercept" / "src" / "lib" / "teatime-archive" / f"{date_str}.ts"
            print(f"  TS: {ts_out.relative_to(PROJECT_ROOT)}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
