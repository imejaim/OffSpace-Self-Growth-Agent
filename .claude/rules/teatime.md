---
paths:
  - "output/teatime/**"
  - "scripts/teatime-*"
---

# Teatime Publishing Rules (MANDATORY)

## Publishing Channels (정의: 2026-04-21)
티타임은 3개 채널로 발행된다. 이 룰 파일은 **채널 1 (내부 MD)** 기준이며, 가장 엄격한 검증이 적용된다. 채널 2·3 는 이 MD 를 소스로 사용한다.

| # | 채널 | 산출물 | 이 룰 적용? |
|---|------|--------|-----------|
| 1 | 내부 MD | `output/teatime/*.md` | **Yes — 원본** |
| 2 | Tistory 블로그 | (Track 2 계획 문서 참조) | MD 기반 변환 |
| 3 | Intercept 서비스 | `intercept/src/lib/teatime-*` | MD 기반 변환 |

## Date Verification
- Before writing: `python scripts/teatime-skeleton.py YYYY-MM-DD`
- After completion: `python scripts/teatime-skeleton.py --validate <filepath>`
- **Do not publish before validation passes**

## Fixed Categories (order/names immutable)
1. **AI 핫뉴스** — BigTech moves, investment/M&A/IPO, executive changes
2. **AI 에이전트** — Agent frameworks, protocol standards, deployment cases (no IPO/HR)
3. **AI 논문과 모델** — Model releases, benchmarks, open source, inference infra
4. **AI 로봇 / 피지컬 AI** — Humanoids, autonomous driving, on-device HW
5. **보너스 / 그 외** — Regulation, social issues, fun

Format: `## N. [Category] — "Subtitle"`

## Source/Image Minimums
- 3+ links per topic, 12+ total, 2+ SNS/community (Reddit, YouTube, X.com, HN)
- 2+ images minimum — actual representative images from news articles (no reuse, no AI-generated)
- (Date occurred · Date reported) required

## Link Verification (MANDATORY · 2026-04-21 추가)
- **모든 외부 참고 링크는 WebFetch 로 실제 HTTP 응답 확인을 거친 URL만 사용.** writer 에이전트가 패턴을 추정·조합한 URL 은 금지 (2026-04-20 Vol.10·11 에서 404 URL 삽입 사건 재발 방지).
- 404·타임아웃 URL 즉시 제거 또는 교체. 가짜 URL 잔존 금지.
- 403 bot-block 응답은 실존 가능성 있으므로 **도메인 자체가 유효** 한 경우 유지 허용 (예: crunchbase, therobotreport). 단 메모에 "bot-blocked — 실브라우저 확인 권장" 주석.
- 전수 검증이 불가할 때 최소: 토픽당 랜덤 2 샘플 WebFetch 검증 의무.

## Image Localization (MANDATORY · 2026-04-21 추가)
- 외부 이미지 URL 직접 삽입 **금지** — hotlink 차단·링크 rot·호스트 404 리스크.
- 필수 절차: 기사 페이지 og:image 크롤링 → 로컬 저장 → 상대 경로 참조.
- 자동화 도구: `python scripts/teatime-fetch-images.py <md-file>` — og:image 확보·다운로드·MD 경로 치환·캡션 삽입까지 한 번에.
- 저장 위치: `output/teatime/images/YYYY-MM-DD/{slug}.{ext}`
- 각 이미지 아래 캡션 의무: `> 출처: {매체명}` 또는 `> 출처: {설명}` (저작권 크레딧).
- og:image 확보 실패 시 해당 이미지 블록 제거 허용. 단 "이미지 2+" 규칙은 여전히 충족해야 함 (다른 유효 기사로 보충).

## 3-Step Publish Gate (MANDATORY · 2026-04-21 추가)
발행 완료를 선언하기 전에 다음 3 단계를 순서대로 통과해야 한다.
1. `python scripts/teatime-skeleton.py --validate <file>` — 구조/카테고리/최소 링크·이미지 수 검증
2. `python scripts/teatime-fetch-images.py <file>` — 외부 이미지 → 로컬화, 실패 이미지 제거, 캡션 삽입
3. `python scripts/teatime-skeleton.py --validate <file>` — 재검증 (errors 0, warnings 0 필수)

어느 단계라도 실패하면 원인 수정 후 1단계부터 재실행.

## Character Channel Assignment
- **젬대리**: Reddit, YouTube, X.com, GitHub → community catch
- **오과장**: HackerNews, Crunchbase, market reports → facts/numbers
- **코부장**: Official blogs, papers, tech docs → technical analysis, wrap-up
