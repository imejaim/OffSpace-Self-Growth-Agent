#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, io, sys
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

"""
teatime-collect-news.py

24시간 내 RSS 뉴스를 수집해 5카테고리로 사전 분류하고 JSON 으로 저장합니다.

사용법:
    python scripts/teatime-collect-news.py
    python scripts/teatime-collect-news.py --date 2026-05-01
    python scripts/teatime-collect-news.py --date 2026-05-01 --output output/raw/teatime-raw-2026-05-01.json

산출물:
    output/raw/teatime-raw-YYYY-MM-DD.json — 카테고리 별 raw 항목 dict

JSON 스키마:
    {
      "date": "YYYY-MM-DD",
      "weekday_ko": "수",
      "collected_at": "ISO8601",
      "categories": {
        "AI 핫뉴스":      [{title, url, source, published, summary, author?}, ...],
        "AI 에이전트":    [...],
        "AI 논문과 모델": [...],
        "AI 로봇 / 피지컬 AI": [...],
        "보너스":         [...]
      },
      "sources_attempted": [...],
      "sources_failed":    [...]
    }

Phase 1 — RSS 단독 동작.
Phase 2 (선택) — Tavily Search API 보충 (TAVILY_API_KEY 환경변수 있을 때만 활성).

의존성: requests, feedparser
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse

try:
    import requests
    import feedparser
except ImportError:
    print("[ERROR] 의존성 누락. 다음 명령어로 설치하세요:")
    print("  pip install requests feedparser")
    sys.exit(1)

WEEKDAYS_KO = ["월", "화", "수", "목", "금", "토", "일"]

# ---------------------------------------------------------------------------
# RSS 소스 — Phase 1 권장 7~10개
# 캐릭터 채널 분담:
#   젬대리: Reddit, YouTube, X.com, GitHub  (community)
#   오과장: HackerNews, market reports       (facts/numbers)
#   코부장: 공식 블로그, papers              (technical)
# ---------------------------------------------------------------------------
RSS_SOURCES = [
    # --- 코부장 채널 (공식 블로그·기업 발표) ---
    {"name": "TechCrunch AI", "url": "https://techcrunch.com/category/artificial-intelligence/feed/", "trust": 4},
    {"name": "Anthropic News", "url": "https://www.anthropic.com/news/rss.xml", "trust": 5},
    {"name": "Google AI Blog", "url": "https://blog.google/technology/ai/rss/", "trust": 5},
    {"name": "OpenAI News", "url": "https://openai.com/news/rss.xml", "trust": 5},
    {"name": "Microsoft AI Blog", "url": "https://blogs.microsoft.com/ai/feed/", "trust": 5},
    {"name": "DeepMind Blog", "url": "https://deepmind.google/blog/rss.xml", "trust": 5},
    # --- 오과장 채널 (HN, market) ---
    {"name": "Hacker News (front page)", "url": "https://hnrss.org/frontpage", "trust": 3},
    # --- 젬대리 채널 (community) ---
    {"name": "Reddit r/MachineLearning", "url": "https://www.reddit.com/r/MachineLearning/.rss", "trust": 3},
    {"name": "Reddit r/LocalLLaMA", "url": "https://www.reddit.com/r/LocalLLaMA/.rss", "trust": 3},
    # --- arXiv ML new (모델/논문) ---
    {"name": "arXiv cs.LG", "url": "http://export.arxiv.org/rss/cs.LG", "trust": 4},
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; OffspaceTeatimeBot/1.0; "
        "+https://interceptnews.app)"
    ),
    "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
}
TIMEOUT = 20

# ---------------------------------------------------------------------------
# 카테고리 분류 키워드 — 우선순위 높은 카테고리부터 매칭 (한 항목은 1개 카테고리만)
# ---------------------------------------------------------------------------
CATEGORY_KEYWORDS = {
    # 가장 좁은 정의가 위에 — 매칭 순서가 의미 있음.
    "AI 로봇 / 피지컬 AI": [
        "humanoid", "robot", "robotics", "optimus", "figure 02", "figure ai",
        "tesla bot", "boston dynamics", "agility digit", "physical ai",
        "self-driving", "autonomous driving", "waymo", "embodied",
        "휴머노이드", "로봇", "자율주행", "온디바이스",
    ],
    "AI 에이전트": [
        "agent", "agentic", "mcp", "model context protocol", "a2a",
        "agent framework", "autogen", "crewai", "langgraph", "smol",
        "assistant", "copilot",
        "에이전트", "어시스턴트",
    ],
    "AI 논문과 모델": [
        "release", "released", "open source", "open-source", "open weights",
        "benchmark", "swe-bench", "mmlu", "humaneval", "arxiv",
        "model card", "fine-tune", "fine-tuning", "rlhf", "vllm",
        "gguf", "llama", "qwen", "mistral", "gemma", "claude opus",
        "claude sonnet", "gpt-5", "gpt-6", "o1", "o3", "o4",
        "transformer", "attention", "diffusion",
        "모델", "벤치마크", "오픈소스", "논문",
    ],
    "AI 핫뉴스": [
        "ipo", "acquires", "acquisition", "raises", "funding",
        "valuation", "billion", "ceo", "coo", "cto", "fired",
        "layoff", "stake", "investment",
        "인수", "투자", "상장", "ipo", "경영진",
    ],
    # 보너스는 fallback (매칭 없으면 여기로).
    "보너스": [
        "regulation", "act", "law", "lawsuit", "court", "ruling",
        "ethic", "policy", "election", "deepfake",
        "규제", "법안", "윤리", "정책",
    ],
}

CATEGORY_ORDER = [
    "AI 핫뉴스",
    "AI 에이전트",
    "AI 논문과 모델",
    "AI 로봇 / 피지컬 AI",
    "보너스",
]


def get_kst_window(date_str: str | None):
    """KST 기준 24시간 윈도우 [start, end) 반환. UTC datetime 기준."""
    if date_str:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    else:
        # KST 오늘
        utc_now = datetime.now(timezone.utc)
        kst = utc_now + timedelta(hours=9)
        dt = datetime(kst.year, kst.month, kst.day)
    # KST 자정 기준 24시간 전 ~ 발행 시점(KST 06:30 가정)까지
    # 실용적으로 "전날 KST 00:00 ~ 오늘 KST 06:30" 윈도우 사용.
    kst_today_start = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    kst_window_start = kst_today_start - timedelta(hours=24)
    kst_window_end = kst_today_start + timedelta(hours=6, minutes=30)
    # UTC 변환 (KST = UTC+9)
    utc_start = kst_window_start - timedelta(hours=9)
    utc_end = kst_window_end - timedelta(hours=9)
    return utc_start.replace(tzinfo=timezone.utc), utc_end.replace(tzinfo=timezone.utc), dt


def parse_published(entry) -> datetime | None:
    """feedparser entry 에서 published_parsed 또는 updated_parsed 를 UTC datetime 으로."""
    for attr in ("published_parsed", "updated_parsed"):
        val = getattr(entry, attr, None) or entry.get(attr) if hasattr(entry, "get") else None
        if val:
            try:
                return datetime(*val[:6], tzinfo=timezone.utc)
            except (TypeError, ValueError):
                continue
    return None


def classify_entry(text: str) -> str:
    """제목+요약 텍스트 → 카테고리 (1개)."""
    lower = text.lower()
    for category in ["AI 로봇 / 피지컬 AI", "AI 에이전트", "AI 논문과 모델", "AI 핫뉴스"]:
        for kw in CATEGORY_KEYWORDS[category]:
            if kw.lower() in lower:
                return category
    # 보너스 키워드 매칭 시 보너스, 아니면 핫뉴스로 폴백
    for kw in CATEGORY_KEYWORDS["보너스"]:
        if kw.lower() in lower:
            return "보너스"
    # AI 관련 일반 키워드 — 매칭되면 핫뉴스
    if any(k in lower for k in ["ai", "ml", "llm", "gpt", "claude", "gemini", "인공지능"]):
        return "AI 핫뉴스"
    return "보너스"


def fetch_rss(source: dict) -> list[dict]:
    """단일 RSS 소스 fetch + 항목 정규화. 실패 시 빈 리스트."""
    url = source["url"]
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if resp.status_code != 200:
            print(f"  [SKIP] {source['name']}: HTTP {resp.status_code}")
            return []
        feed = feedparser.parse(resp.content)
    except Exception as e:
        print(f"  [SKIP] {source['name']}: {e}")
        return []

    items = []
    for entry in feed.entries[:30]:  # 소스당 최대 30개
        title = (entry.get("title") or "").strip()
        link = (entry.get("link") or "").strip()
        if not title or not link:
            continue
        # summary
        summary = entry.get("summary", "") or entry.get("description", "")
        # HTML 태그 제거
        summary = re.sub(r"<[^>]+>", "", summary)
        summary = re.sub(r"\s+", " ", summary).strip()[:600]
        # author
        author = entry.get("author", "") or ""
        published_dt = parse_published(entry)
        published_iso = published_dt.isoformat() if published_dt else ""
        items.append({
            "title": title,
            "url": link,
            "source": source["name"],
            "trust": source["trust"],
            "published": published_iso,
            "summary": summary,
            "author": author,
            "_published_dt": published_dt,
        })
    return items


def maybe_tavily_supplement(missing_categories: list[str], date_str: str) -> dict[str, list[dict]]:
    """
    Phase 2 옵션 — TAVILY_API_KEY 가 있을 때만 부족한 카테고리를 검색으로 보충.
    Phase 1: 기본 비활성. API 키 없으면 빈 dict 반환.
    """
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key or not missing_categories:
        return {}

    queries = {
        "AI 핫뉴스": "latest AI big tech news today (acquisition, IPO, investment)",
        "AI 에이전트": "AI agent framework MCP A2A protocol release news",
        "AI 논문과 모델": "new AI model release benchmark this week",
        "AI 로봇 / 피지컬 AI": "humanoid robot deployment news this week",
        "보너스": "AI regulation policy law news this week",
    }
    extras: dict[str, list[dict]] = {}
    for cat in missing_categories:
        q = queries.get(cat)
        if not q:
            continue
        try:
            r = requests.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": api_key,
                    "query": q,
                    "search_depth": "basic",
                    "max_results": 5,
                    "include_answer": False,
                    "topic": "news",
                    "days": 2,
                },
                timeout=TIMEOUT,
            )
            if r.status_code != 200:
                continue
            data = r.json()
            results = data.get("results", []) or []
            picked = []
            for it in results[:5]:
                picked.append({
                    "title": it.get("title", ""),
                    "url": it.get("url", ""),
                    "source": "Tavily Search",
                    "trust": 3,
                    "published": it.get("published_date", ""),
                    "summary": (it.get("content") or "")[:600],
                    "author": "",
                })
            extras[cat] = picked
            print(f"  [Tavily] {cat}: +{len(picked)}건 보충")
        except Exception as e:
            print(f"  [Tavily 실패] {cat}: {e}")
    return extras


def collect(date_str: str | None) -> dict:
    utc_start, utc_end, target_dt = get_kst_window(date_str)
    weekday_ko = WEEKDAYS_KO[target_dt.weekday()]
    target_date = target_dt.strftime("%Y-%m-%d")

    print(f"[INFO] 발행 대상 KST 날짜: {target_date} ({weekday_ko})")
    print(f"[INFO] 수집 윈도우 (UTC): {utc_start.isoformat()} ~ {utc_end.isoformat()}")

    sources_attempted: list[str] = []
    sources_failed: list[str] = []
    raw_items: list[dict] = []

    for src in RSS_SOURCES:
        sources_attempted.append(src["name"])
        print(f"\n[FETCH] {src['name']}")
        items = fetch_rss(src)
        if not items:
            sources_failed.append(src["name"])
            continue
        # 24시간 필터 적용 — published 없으면 통과 (HN 등 일부 RSS 가 None 반환)
        filtered = []
        for it in items:
            pub = it.get("_published_dt")
            if pub is None:
                filtered.append(it)
                continue
            if utc_start <= pub <= utc_end:
                filtered.append(it)
        # 필터 결과가 0이면 가장 최신 5개 fallback
        if not filtered:
            filtered = items[:5]
        print(f"  -> {len(items)}건 중 {len(filtered)}건 선택")
        raw_items.extend(filtered)

    # 카테고리 분류
    categories: dict[str, list[dict]] = {c: [] for c in CATEGORY_ORDER}
    seen_urls: set[str] = set()
    for it in raw_items:
        url = it["url"]
        if url in seen_urls:
            continue
        seen_urls.add(url)
        cat = classify_entry(f"{it['title']} {it['summary']}")
        # _published_dt 는 직렬화 불가
        clean = {k: v for k, v in it.items() if k != "_published_dt"}
        categories[cat].append(clean)

    # 카테고리당 최대 10개 (신뢰도 desc + published desc)
    for cat in CATEGORY_ORDER:
        categories[cat].sort(
            key=lambda x: (x.get("trust", 0), x.get("published", "")),
            reverse=True,
        )
        categories[cat] = categories[cat][:10]

    # 부족한 카테고리는 Tavily 보충 시도 (선택)
    deficient = [c for c in CATEGORY_ORDER if len(categories[c]) < 3]
    if deficient:
        extras = maybe_tavily_supplement(deficient, target_date)
        for cat, items in extras.items():
            existing = {x["url"] for x in categories[cat]}
            for it in items:
                if it["url"] not in existing:
                    categories[cat].append(it)

    # 보고
    print("\n" + "=" * 60)
    print("  카테고리별 수집 결과:")
    print("=" * 60)
    total = 0
    for cat in CATEGORY_ORDER:
        cnt = len(categories[cat])
        total += cnt
        flag = "[OK]" if cnt >= 3 else "[!!]"
        print(f"  {flag} {cat:25s} : {cnt}건")
    print(f"\n  총 수집: {total}건  /  실패 소스: {len(sources_failed)}/{len(sources_attempted)}")
    if sources_failed:
        print(f"  실패: {', '.join(sources_failed)}")
    print("=" * 60)

    return {
        "date": target_date,
        "weekday_ko": weekday_ko,
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "window_utc": {
            "start": utc_start.isoformat(),
            "end": utc_end.isoformat(),
        },
        "categories": categories,
        "sources_attempted": sources_attempted,
        "sources_failed": sources_failed,
    }


def main():
    parser = argparse.ArgumentParser(
        description="티타임 정기발행용 RSS 수집·카테고리 분류기"
    )
    parser.add_argument("--date", help="대상 KST 날짜 (YYYY-MM-DD), 비우면 오늘", default=None)
    parser.add_argument("--output", help="출력 JSON 경로", default=None)
    args = parser.parse_args()

    data = collect(args.date)

    out_path = args.output
    if not out_path:
        out_path = f"output/raw/teatime-raw-{data['date']}.json"
    out = Path(out_path).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[OK] 저장: {out}")


if __name__ == "__main__":
    main()
