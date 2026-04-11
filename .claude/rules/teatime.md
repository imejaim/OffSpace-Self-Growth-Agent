---
paths:
  - "output/teatime/**"
  - "scripts/teatime-*"
---

# Teatime Publishing Rules (MANDATORY)

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

## Character Channel Assignment
- **젬대리**: Reddit, YouTube, X.com, GitHub → community catch
- **오과장**: HackerNews, Crunchbase, market reports → facts/numbers
- **코부장**: Official blogs, papers, tech docs → technical analysis, wrap-up
