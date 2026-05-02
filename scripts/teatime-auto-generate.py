#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, io, sys
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

"""
teatime-auto-generate.py

수집된 raw 뉴스 JSON 을 입력으로 받아 Gemini 2.5-flash 로 5카테고리 티타임 MD 를 작성합니다.

사용법:
    python scripts/teatime-auto-generate.py output/raw/teatime-raw-2026-05-01.json
    python scripts/teatime-auto-generate.py output/raw/teatime-raw-2026-05-01.json \
        --output output/teatime/2026-05-01_AI동향_티타임.md

환경변수:
    GEMINI_API_KEY (필수)
    TEATIME_VOL    (선택, 미지정 시 N)

동작:
    1. raw JSON 로드
    2. Gemini REST API 호출 (responseSchema 강제)
    3. JSON 응답 → MD 변환 (스켈레톤 형식 준수)
    4. 산출 MD 덮어쓰기

의존성: requests
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

try:
    import requests
except ImportError:
    print("[ERROR] requests 누락. pip install requests")
    sys.exit(1)

WEEKDAYS_KO = ["월", "화", "수", "목", "금", "토", "일"]

GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)

CATEGORY_ORDER = [
    "AI 핫뉴스",
    "AI 에이전트",
    "AI 논문과 모델",
    "AI 로봇 / 피지컬 AI",
    "보너스",
]

CHARACTER_IDS = ("kobu", "oh", "jem")
CHARACTER_NAME_KO = {"kobu": "코부장", "oh": "오과장", "jem": "젬대리"}

# ---------------------------------------------------------------------------
# 시스템 프롬프트 (고정) — Vol.12 톤 기준
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """당신은 Offspace 티타임의 시니어 편집팀입니다.
오늘 (KST) 일어난 AI/테크 뉴스를 5개 카테고리로 정리한 일일 브리핑을 작성합니다.

[고정 카테고리 — 순서·이름 절대 변경 금지]
1. AI 핫뉴스 — 빅테크 / 투자·인수·IPO / 경영진 변동
2. AI 에이전트 — 프레임워크 / 프로토콜 표준 / 배포 사례 (IPO·HR 금지)
3. AI 논문과 모델 — 모델 릴리즈 / 벤치마크 / 오픈소스 / 추론 인프라
4. AI 로봇 / 피지컬 AI — 휴머노이드 / 자율주행 / 온디바이스 HW
5. 보너스 — 규제 / 사회 이슈 / 재미

[캐릭터 페르소나]
- 코부장 (Tech Lead, characterId="kobu"): 공식 블로그·논문·기술 문서 인용. 권위 있고 날카롭게 분석·마무리.
- 오과장 (Strategist, characterId="oh"): HackerNews·시장 보고서·숫자 보강. 정밀, 데이터 중심.
- 젬대리 (Community Scout, characterId="jem"): Reddit·YouTube·X·GitHub·Discord 인용. 활기차고 감각적.

[엄격한 룰]
- 각 토픽 messages 4~6턴. 한 캐릭터 3연속 발언 금지. 젬대리가 먼저 커뮤니티에서 "이거 떴어요" → 오과장이 숫자 보강 → 코부장이 기술 분석/마무리 의 흐름을 기본으로.
- 토픽당 references 최소 3개. 전체 12개 이상. SNS/커뮤니티 출처 (Reddit/HN/YouTube/X/GitHub) 2개 이상.
- references 각 항목에 rating (1~5) 별점. 공식 발표=5, 메이저 매체=4, 커뮤니티=3.
- 각 references date는 YYYY.MM.DD 형식.
- (발생 M/D · 보도 M/D) 시점을 messages 안에 자연스럽게 병기. 보도일만 알면 보도일만 표기.
- 추측 금지. 입력 raw_news 에 없는 사실·URL·숫자 절대 만들지 않는다.
- 한국어로 작성. 마크다운 코드펜스 금지. 순수 JSON 1개만 반환.
- 모든 references.url 은 raw_news 의 url 을 그대로 사용. 새 URL 생성 금지.

[출력 JSON 스키마 — 정확히 이 구조로]
{
  "vol": <number>,
  "date": "YYYY-MM-DD",
  "weekday_ko": "<요일 1자>",
  "intro": "<인트로 상황극 1~2문장. 시간대·분위기 묘사 + 캐릭터 한두 명 등장.>",
  "topics": [
    {
      "category": "AI 핫뉴스",
      "subtitle": "<짧고 후크 있는 서브타이틀, 두 가지 키 토픽 결합 가능>",
      "image_hint": "<대표 이미지로 쓸 raw_news 의 url 1개. 토픽 첫 messages 가 그 기사를 인용해야 함.>",
      "messages": [
        { "characterId": "jem", "content": "..." },
        { "characterId": "oh",  "content": "..." },
        { "characterId": "kobu","content": "..." }
      ],
      "references": [
        { "title": "<원문 제목>", "url": "<raw_news 의 url 그대로>", "source": "<매체명>", "date": "YYYY.MM.DD", "rating": 4 }
      ]
    }
  ],
  "summary": [
    { "category": "AI 핫뉴스", "keyword": "...", "oneLiner": "..." }
  ],
  "outro": [
    { "characterId": "kobu", "content": "<코부장 마무리 한 줄, 행동 묘사 포함>" },
    { "characterId": "oh",   "content": "<오과장 마무리 한 줄>" },
    { "characterId": "jem",  "content": "<젬대리 마무리 한 줄>" }
  ]
}

topics 배열은 정확히 5개. 카테고리 순서 위 1→5 그대로 유지. summary 도 5개. outro 는 정확히 3개 (kobu, oh, jem 순)."""


# ---------------------------------------------------------------------------
# Few-shot — Vol.12 일부 (톤 가이드)
# ---------------------------------------------------------------------------
FEW_SHOT = """[톤 가이드 예시 — Vol.12 발췌]

intro 예: "목요일 오전. 오과장이 Google Cloud Next 라이브 중계 창 열어둔 채 '어제 라스베가스에서 숫자 엄청 나왔어요' 하며 들어왔다. 젬대리는 X 타임라인 스크롤하며 '대표님, SpaceX가 Cursor를 $60B에 사겠다는 소식 보셨어요?' 물었다."

젬대리 메시지 예: "어제 저녁 X·뉴스피드 가장 뜨거운 게 이거예요 — SpaceX가 Cursor에 $10B 협업 계약 + $60B 인수 옵션 묶어서 딜을 걸었어요. (발생 4/21 · 보도 4/21~22)"

오과장 메시지 예: "Cursor 숫자는 말이 안 돼요. 2025년 1월 ARR $100M → 6월 $500M → 11월 $1B → 2026년 2월 $2B. 3년 만에 $2B ARR 도달이면 B2B SaaS 역사상 최고 속도예요."

코부장 메시지 예: "한 발 물러서서 보면 — SpaceX는 IPO 앞두고 '우리 AI 회사다'라는 포지셔닝이 필요했던 거야. 코딩 AI는 지금 월가가 가장 높은 멀티플 주는 카테고리고."

outro 예: "*코부장이 키보드에서 손 떼며* '오늘 가장 큰 신호는 SpaceX·Cursor 딜이 아니라 Google Cloud Next야.'"
"""


# ---------------------------------------------------------------------------
# 응답 스키마 (Gemini responseSchema)
# ---------------------------------------------------------------------------
RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["vol", "date", "weekday_ko", "intro", "topics", "summary", "outro"],
    "properties": {
        "vol": {"type": "integer"},
        "date": {"type": "string"},
        "weekday_ko": {"type": "string"},
        "intro": {"type": "string"},
        "topics": {
            "type": "array",
            "minItems": 5,
            "maxItems": 5,
            "items": {
                "type": "object",
                "required": ["category", "subtitle", "messages", "references"],
                "properties": {
                    "category": {"type": "string"},
                    "subtitle": {"type": "string"},
                    "image_hint": {"type": "string"},
                    "messages": {
                        "type": "array",
                        "minItems": 4,
                        "items": {
                            "type": "object",
                            "required": ["characterId", "content"],
                            "properties": {
                                "characterId": {"type": "string", "enum": list(CHARACTER_IDS)},
                                "content": {"type": "string"},
                            },
                        },
                    },
                    "references": {
                        "type": "array",
                        "minItems": 3,
                        "items": {
                            "type": "object",
                            "required": ["title", "url", "source", "date", "rating"],
                            "properties": {
                                "title": {"type": "string"},
                                "url": {"type": "string"},
                                "source": {"type": "string"},
                                "date": {"type": "string"},
                                "rating": {"type": "integer", "minimum": 1, "maximum": 5},
                            },
                        },
                    },
                },
            },
        },
        "summary": {
            "type": "array",
            "minItems": 5,
            "maxItems": 5,
            "items": {
                "type": "object",
                "required": ["category", "keyword", "oneLiner"],
                "properties": {
                    "category": {"type": "string"},
                    "keyword": {"type": "string"},
                    "oneLiner": {"type": "string"},
                },
            },
        },
        "outro": {
            "type": "array",
            "minItems": 3,
            "maxItems": 3,
            "items": {
                "type": "object",
                "required": ["characterId", "content"],
                "properties": {
                    "characterId": {"type": "string", "enum": list(CHARACTER_IDS)},
                    "content": {"type": "string"},
                },
            },
        },
    },
}


def build_user_prompt(raw_data: dict, vol: int) -> str:
    """raw JSON → user prompt 텍스트."""
    date_str = raw_data["date"]
    weekday_ko = raw_data["weekday_ko"]
    next_day = (datetime.strptime(date_str, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    next_dow = WEEKDAYS_KO[(datetime.strptime(date_str, "%Y-%m-%d") + timedelta(days=1)).weekday()]

    lines = [
        f"오늘 날짜: {date_str} ({weekday_ko})",
        f"Vol 번호: {vol}",
        f"다음 발행일: {next_day} ({next_dow})",
        "",
        "[수집된 raw 뉴스 — 카테고리별 사전 분류]",
        "",
    ]
    for cat in CATEGORY_ORDER:
        items = raw_data["categories"].get(cat, [])
        lines.append(f"## {cat} ({len(items)}건)")
        for it in items:
            published = (it.get("published") or "")[:10]
            star = "★" * int(it.get("trust", 3))
            summary_short = (it.get("summary") or "").replace("\n", " ")[:200]
            lines.append(
                f"- [{it['source']} | {published} | {star}] {it['title']}"
            )
            lines.append(f"  url: {it['url']}")
            if summary_short:
                lines.append(f"  summary: {summary_short}")
        lines.append("")

    lines.append(
        "위 raw 뉴스만 사용해 5카테고리 티타임을 작성하세요. "
        "JSON 외 텍스트 금지. references.url 은 위 url 그대로 사용."
    )
    return "\n".join(lines)


def call_gemini(system_prompt: str, user_prompt: str, api_key: str) -> dict:
    """Gemini 2.5-flash REST 호출 → JSON dict 반환."""
    payload = {
        "systemInstruction": {
            "role": "system",
            "parts": [{"text": system_prompt + "\n\n" + FEW_SHOT}],
        },
        "contents": [
            {"role": "user", "parts": [{"text": user_prompt}]},
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
            "responseSchema": RESPONSE_SCHEMA,
        },
    }
    url = f"{GEMINI_ENDPOINT}?key={api_key}"
    last_err = None
    for attempt in range(3):
        try:
            resp = requests.post(url, json=payload, timeout=120)
            if resp.status_code == 200:
                data = resp.json()
                # candidates[0].content.parts[0].text
                cand = (data.get("candidates") or [{}])[0]
                parts = ((cand.get("content") or {}).get("parts") or [])
                text = ""
                for p in parts:
                    if "text" in p:
                        text += p["text"]
                if not text:
                    raise RuntimeError(f"빈 응답: {data}")
                return json.loads(text)
            elif resp.status_code in (429, 500, 502, 503, 504):
                last_err = f"HTTP {resp.status_code}: {resp.text[:300]}"
                wait = 2 ** attempt
                print(f"  [retry] {last_err} — {wait}s 후 재시도")
                time.sleep(wait)
                continue
            else:
                raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:500]}")
        except requests.RequestException as e:
            last_err = str(e)
            time.sleep(2 ** attempt)
    raise RuntimeError(f"Gemini 호출 실패 (3회 시도): {last_err}")


# ---------------------------------------------------------------------------
# JSON → MD 렌더링
# ---------------------------------------------------------------------------

def render_md(data: dict, raw_data: dict) -> str:
    date_str = data["date"]
    weekday_ko = data.get("weekday_ko") or raw_data.get("weekday_ko", "")
    vol = data["vol"]
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    next_day = dt + timedelta(days=1)
    next_dow = WEEKDAYS_KO[next_day.weekday()]

    out: list[str] = []
    out.append(f"# Offspace 티타임 Vol.{vol} — {dt.year}년 {dt.month}월 {dt.day}일 ({weekday_ko})")
    out.append("")
    out.append(f"> {data.get('intro', '').strip()}")
    out.append("")
    out.append("---")
    out.append("")

    topics = data.get("topics", [])
    for i, t in enumerate(topics, start=1):
        cat = t.get("category", CATEGORY_ORDER[min(i - 1, 4)])
        # 카테고리 정합성 강제 — index 순서 사용
        cat = CATEGORY_ORDER[i - 1]
        subtitle = t.get("subtitle", "").strip().strip('"').strip("“”")
        out.append(f'## {i}. {cat} — "{subtitle}"')
        out.append("")
        # 이미지 힌트 — 첫 references[0] 또는 image_hint 의 url
        image_hint = t.get("image_hint") or ""
        first_ref_url = (t.get("references") or [{}])[0].get("url", "")
        image_url = image_hint or first_ref_url
        first_title = (t.get("references") or [{}])[0].get("title", "")
        if image_url:
            alt = first_title or f"{cat} 대표 이미지"
            out.append(f"![{alt}]({image_url})")
            out.append("")
        # messages
        for m in t.get("messages", []):
            cid = m.get("characterId", "")
            name = CHARACTER_NAME_KO.get(cid)
            content = re.sub(r"\s+", " ", m.get("content", "").strip())
            if not name or not content:
                continue
            out.append(f"**{name}**: {content}")
        out.append("")
        # references
        out.append("> 📎 **이번 토픽 참고 링크**")
        for ref in t.get("references", []):
            stars = "★" * max(1, min(5, int(ref.get("rating", 3))))
            out.append(
                f"> - [{ref.get('title','').strip()}]({ref.get('url','').strip()}) "
                f"| {ref.get('source','').strip()} "
                f"| {ref.get('date','').strip()} | {stars}"
            )
        out.append("")
        out.append("---")
        out.append("")

    # 요약 테이블
    out.append("## 티타임 요약")
    out.append("")
    out.append("| 카테고리 | 키워드 | 한줄 정리 |")
    out.append("|---------|--------|----------|")
    summary = data.get("summary", [])
    # 카테고리 순서 강제
    by_cat = {s.get("category"): s for s in summary}
    for cat in CATEGORY_ORDER:
        s = by_cat.get(cat, {})
        keyword = (s.get("keyword") or "").replace("|", "/").strip()
        one = (s.get("oneLiner") or "").replace("|", "/").strip()
        # MD 행 표기는 "AI 로봇" 으로 단축 (Vol.12 패턴)
        cat_label = "AI 로봇" if cat.startswith("AI 로봇") else cat
        out.append(f"| {cat_label} | {keyword} | {one} |")
    out.append("")
    out.append("---")
    out.append("")

    # outro
    outro = data.get("outro", [])
    by_cid = {o.get("characterId"): o for o in outro}
    for cid in ("kobu", "oh", "jem"):
        o = by_cid.get(cid)
        if not o:
            continue
        name = CHARACTER_NAME_KO.get(cid, "")
        content = re.sub(r"\s+", " ", o.get("content", "").strip())
        # *행동 묘사* prefix 가 없으면 단순 인용
        out.append(f"> *{name}* {content}".replace(f"*{name}* *", f"*{name}* ").strip())
    out.append("")

    out.append(f"> **Offspace 티타임 Vol.{vol}** | 작성: 코부장 | 참여: 오과장, 젬대리")
    out.append(f"> 다음 티타임: {next_day.strftime('%Y-%m-%d')} ({next_dow})")
    out.append("")
    return "\n".join(out)


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="raw 뉴스 JSON → Gemini 2.5-flash → 티타임 MD 자동 생성"
    )
    parser.add_argument("raw_json", help="output/raw/teatime-raw-YYYY-MM-DD.json 경로")
    parser.add_argument("--output", help="출력 MD 경로 (기본: output/teatime/<date>_AI동향_티타임.md)")
    parser.add_argument(
        "--vol",
        type=int,
        default=int(os.environ.get("TEATIME_VOL", "0")) or None,
        help="Vol 번호 (생략 시 자동 추정)",
    )
    args = parser.parse_args()

    raw_path = Path(args.raw_json).resolve()
    if not raw_path.exists():
        print(f"[ERROR] raw json 없음: {raw_path}")
        sys.exit(1)

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        print("[ERROR] GEMINI_API_KEY 환경변수가 비었습니다.")
        sys.exit(1)

    raw_data = json.loads(raw_path.read_text(encoding="utf-8"))

    # Vol 추정 — output/teatime 의 기존 발행물 수 + 1 (간단 휴리스틱)
    vol = args.vol
    if not vol:
        teatime_dir = raw_path.resolve().parent.parent / "teatime"
        try:
            existing = list(teatime_dir.glob("*_AI동향_티타임.md"))
            vol = len(existing) + 1
        except Exception:
            vol = 13

    print(f"[INFO] 대상 날짜: {raw_data['date']} ({raw_data.get('weekday_ko','?')})")
    print(f"[INFO] Vol: {vol}")
    counts = {c: len(raw_data["categories"].get(c, [])) for c in CATEGORY_ORDER}
    print(f"[INFO] raw 항목: {counts}")

    user_prompt = build_user_prompt(raw_data, vol)
    print(f"[INFO] user prompt 길이: {len(user_prompt)} chars")

    print(f"[INFO] Gemini 호출 ({GEMINI_MODEL})...")
    parsed = call_gemini(SYSTEM_PROMPT, user_prompt, api_key)
    # vol/date 강제 덮어쓰기 (모델이 임의 변경 방어)
    parsed["vol"] = vol
    parsed["date"] = raw_data["date"]
    parsed.setdefault("weekday_ko", raw_data.get("weekday_ko", ""))

    md = render_md(parsed, raw_data)

    out_path = args.output
    if not out_path:
        date_str = raw_data["date"]
        out_path = f"output/teatime/{date_str}_AI동향_티타임.md"
    out = Path(out_path).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(md, encoding="utf-8")
    print(f"[OK] MD 저장: {out}  ({len(md)} chars, {md.count(chr(10))} lines)")

    # 디버그 — 전체 응답 JSON 도 같이 저장 (다음 디버깅용)
    dbg = out.parent.parent / "raw" / f"teatime-gen-{raw_data['date']}.json"
    dbg.parent.mkdir(parents=True, exist_ok=True)
    dbg.write_text(json.dumps(parsed, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] 디버그 JSON: {dbg}")


if __name__ == "__main__":
    main()
