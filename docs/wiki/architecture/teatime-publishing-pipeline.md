# Teatime Publishing Pipeline

Updated: 2026-05-01
Status: stable (v1)

## Overview

티타임 발행은 두 가지 모드로 운영된다. 두 모드는 동일한 5단계 파이프라인을 공유한다.

## 두 가지 발행 모드

### 정기발행 (Scheduled)

- 트리거: GitHub Actions cron
- 스케줄: KST 매일 06:30 실행 → 07:00 노출 목표
- 성공 조건: 검증 통과 → 무인 머지 + Cloudflare Pages 자동 deploy
- 실패 조건: 텔레그램 알림 발송 + 전날 글 유지 (롤백 없음, 현상 유지)

### 인터셉트 발행 (Intercept Publish)

- 트리거: 대표님 수동
- 명령: `npm run teatime:intercept -- YYYY-MM-DD`
- 동작: 정기발행과 동일한 파이프라인을 즉석 호출

## 공통 5단계 파이프라인

```
CRON (또는 수동 트리거)
  │
  ▼
1. skeleton.py
   빈 뼈대 MD 생성 (날짜·카테고리 구조 포함)
  │
  ▼
2. fetch-images
   뉴스 대표 이미지를 로컬 경로로 다운로드
   (AI 생성 이미지 금지, 공식 블로그/뉴스 이미지만)
  │
  ▼
3. validate-links
   모든 외부 링크 HTTP 200 확인
  │
  ▼
4. skeleton.py --validate
   콘텐츠 품질 검증 게이트
   - errors: 0 이어야 통과
   - 카테고리 5개 존재 확인
   - 출처 12개 이상 확인
   - 이미지 2장 이상 확인
   - SNS/커뮤니티 출처 2개 이상 확인
  │
  ▼
5. md-to-archive --register
   완성된 MD를 아카이브 등록 + Supabase DB 반영
  │
  ▼
git commit → wrangler deploy → 텔레그램 성공 알림
```

## 산출물 위치

| 항목 | 경로 |
|------|------|
| 원본 MD (소스 오브 트루스) | `output/teatime/YYYY-MM-DD_AI동향_티타임.md` |
| 로컬 이미지 | `output/teatime/images/YYYY-MM-DD/` |
| 아카이브 DB | Supabase `teatime_archive` 테이블 |

## 콘텐츠 카테고리 (고정 5개)

1. AI 핫뉴스
2. AI 에이전트
3. AI 논문과 모델
4. AI 로봇·피지컬 AI
5. 보너스·그 외

각 카테고리 제목 뒤 서브타이틀 필수: `## 1. AI 핫뉴스 — "Anthropic이 바이오를 삼켰다"`

## 캐릭터 채널 분담

| 캐릭터 | 역할 |
|--------|------|
| 코부장 | 기술 분석 정리 |
| 오과장 | 팩트·수치 보강 |
| 젬대리 | 커뮤니티 캐치 (Reddit, YouTube, X, HN) |

## 사용자 권한 정책

- 사용자는 토픽 편집 불가
- **끼어들기(intercept)만 허용** — 브랜드 정체성("당신만의 뉴스")과 일치하는 의도적 설계

## GitHub Actions 설정 위치

- 워크플로우 파일: `.github/workflows/teatime-scheduled.yml`
- 비밀 변수: GitHub Repository Secrets (TELEGRAM_BOT_TOKEN, SUPABASE_ACCESS_TOKEN 등)

## Related Pages

- [Local-First Development Workflow](./local-first-development.md)
- [Cloudflare Workers Deploy Checklist](./cloudflare-workers-deploy-checklist.md)
- [Teatime Publishing — Tistory](../strategy/teatime-publishing-tistory.md)
- [Teatime Intercept Service Upgrade](../strategy/teatime-intercept-service-upgrade.md)
