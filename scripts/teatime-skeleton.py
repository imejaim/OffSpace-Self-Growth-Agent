#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

"""
티타임 스켈레톤 생성기

사용법:
  python scripts/teatime-skeleton.py              # 오늘 날짜
  python scripts/teatime-skeleton.py 2026-04-07   # 특정 날짜
  python scripts/teatime-skeleton.py --validate output/teatime/티타임_2026-04-06.md  # 기존 파일 검증

날짜/요일 자동 계산, 카테고리 구조 강제, 발행 전 체크리스트 자동 검증.
"""

import sys
import re
from datetime import datetime

WEEKDAYS_KO = ["월", "화", "수", "목", "금", "토", "일"]

FIXED_CATEGORIES = [
    "AI 핫뉴스",
    "AI 에이전트",
    "AI 논문과 모델",
    "AI 로봇 / 피지컬 AI",
    "보너스",
]


def get_date_info(date_str=None):
    if date_str:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    else:
        dt = datetime.now()
    weekday_ko = WEEKDAYS_KO[dt.weekday()]
    return dt, weekday_ko


def generate_skeleton(dt, weekday_ko, vol_num=None):
    date_str = dt.strftime("%Y-%m-%d")
    year = dt.year
    month = dt.month
    day = dt.day

    if vol_num is None:
        vol_num = "N"

    skeleton = f"""# Offspace 티타임 Vol.{vol_num} — {year}년 {month}월 {day}일 ({weekday_ko})

> [도입 상황극 1~2줄 — 시간대/분위기 설정]

---

## 1. AI 핫뉴스 — "[서브타이틀]"

![[뉴스 대표 이미지 설명]](URL)

**젬대리**: [SNS/커뮤니티에서 발견한 소식] (발생일 · 보도일)
**오과장**: [팩트/숫자 보강]
**코부장**: [기술적 분석]

> 📎 참고 링크 (최소 3개, SNS 포함)
> - [매체명](URL) · 날짜 · ★★★★
> - [Reddit/X.com](URL) · 날짜 · ★★★
> - [추가](URL) · 날짜 · ★★★

---

## 2. AI 에이전트 — "[서브타이틀]"

[에이전트 프레임워크/표준/배포 뉴스만. IPO/경영진 뉴스 금지]

> 📎 참고 링크 (최소 3개)

---

## 3. AI 논문과 모델 — "[서브타이틀]"

![[모델/벤치마크 관련 이미지]](URL)

[모델 릴리즈/벤치마크/인프라 뉴스만]

> 📎 참고 링크 (최소 3개)

---

## 4. AI 로봇 / 피지컬 AI — "[서브타이틀]"

[로봇/자율주행/온디바이스 HW 뉴스만]

> 📎 참고 링크 (최소 3개)

---

## 5. 보너스 — "[서브타이틀]"

[규제/사회 이슈/재미 소식]

> 📎 참고 링크 (최소 3개)

---

## 티타임 요약

| 카테고리 | 키워드 | 한줄 정리 |
|---------|--------|----------|
| AI 핫뉴스 | | |
| AI 에이전트 | | |
| AI 논문과 모델 | | |
| AI 로봇 | | |
| 보너스 | | |

---

> [마무리 상황극 — 캐릭터 각 한마디]

> **Offspace 티타임 Vol.{vol_num}** | 작성: 코부장 | 참여: 오과장, 젬대리
> 다음 티타임: [다음 영업일]
"""
    return skeleton


def validate_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    errors = []
    warnings = []

    # 1. 날짜/요일 검증
    date_match = re.search(r"(\d{4})년 (\d{1,2})월 (\d{1,2})일 \((.)\)", content)
    if date_match:
        y, m, d, dow = date_match.groups()
        dt = datetime(int(y), int(m), int(d))
        expected_dow = WEEKDAYS_KO[dt.weekday()]
        if dow != expected_dow:
            errors.append(f"요일 오류: {m}/{d}은 ({expected_dow})인데 ({dow})로 표기됨")
    else:
        errors.append("날짜/요일 패턴을 찾을 수 없음")

    # 2. 고정 카테고리 확인
    for i, cat in enumerate(FIXED_CATEGORIES, 1):
        pattern = rf"## {i}\.\s*{re.escape(cat)}"
        if not re.search(pattern, content):
            # 보너스는 "그 외"도 허용
            if cat == "보너스":
                alt_pattern = rf"## {i}\.\s*(보너스|그 외)"
                if not re.search(alt_pattern, content):
                    errors.append(f"카테고리 {i} 누락 또는 오명: '{cat}' 필요")
            else:
                errors.append(f"카테고리 {i} 누락 또는 오명: '{cat}' 필요")

    # 3. 이미지 확인
    images = re.findall(r"!\[.*?\]\(.*?\)", content)
    if len(images) < 2:
        errors.append(f"이미지 {len(images)}장 — 최소 2장 필요")

    # 4. 출처 링크 수 확인
    links = re.findall(r"\[.+?\]\(https?://.+?\)", content)
    # 요약 테이블과 footer 링크 제외, 참고 링크만 카운트
    if len(links) < 12:
        warnings.append(f"전체 링크 {len(links)}개 — 최소 12개 권장")

    # 5. SNS/커뮤니티 소스 확인
    sns_keywords = ["reddit", "x.com", "twitter", "youtube", "hackernews", "hacker news", "github.com", "discord"]
    sns_count = sum(1 for kw in sns_keywords if kw.lower() in content.lower())
    if sns_count < 2:
        warnings.append(f"SNS/커뮤니티 언급 {sns_count}종 — 최소 2종 권장")

    # 6. (발생일 · 보도일) 패턴 확인
    date_pair = re.findall(r"\d+/\d+\s*발생.*?보도|발생.*?보도", content)
    if not date_pair:
        warnings.append("(발생일 · 보도일) 병기 패턴이 없음")

    # 7. 캐릭터 독백 체크 (같은 캐릭터가 3연속 발언)
    speakers = re.findall(r"\*\*(\w+)\*\*:", content)
    for i in range(len(speakers) - 2):
        if speakers[i] == speakers[i + 1] == speakers[i + 2]:
            warnings.append(f"'{speakers[i]}' 3연속 발언 — 독백 의심")
            break

    # 결과 출력
    print(f"\n{'='*50}")
    print(f"  티타임 검증: {filepath}")
    print(f"{'='*50}")

    if errors:
        print(f"\n  ERRORS ({len(errors)}건) — 수정 필수:")
        for e in errors:
            print(f"    [x] {e}")
    else:
        print("\n  ERRORS: 없음")

    if warnings:
        print(f"\n  WARNINGS ({len(warnings)}건) — 확인 권장:")
        for w in warnings:
            print(f"    [!] {w}")
    else:
        print("\n  WARNINGS: 없음")

    total_issues = len(errors) + len(warnings)
    if total_issues == 0:
        print(f"\n  결과: ALL PASS")
    else:
        print(f"\n  결과: {len(errors)} errors, {len(warnings)} warnings")

    print(f"{'='*50}\n")
    return len(errors) == 0


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--validate":
        if len(sys.argv) < 3:
            print("Usage: python teatime-skeleton.py --validate <filepath>")
            sys.exit(1)
        success = validate_file(sys.argv[2])
        sys.exit(0 if success else 1)
    elif len(sys.argv) > 1:
        dt, dow = get_date_info(sys.argv[1])
    else:
        dt, dow = get_date_info()

    print(generate_skeleton(dt, dow))
