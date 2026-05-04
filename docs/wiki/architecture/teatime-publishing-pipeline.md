# Teatime Publishing Pipeline

Updated: 2026-05-01
Status: stable (v2 — local scheduler)

## Overview

티타임 발행은 두 가지 모드로 운영된다. 두 모드는 동일한 5단계 파이프라인을 공유한다.

> **2026-05-01 변경**: 정기발행 트리거를 GitHub Actions → **로컬 Windows Task Scheduler** 로 이전했다.
> 사유:
> - 단일 진실 = 로컬 (.env.local 만 secrets 보관, GitHub Secrets 동기화 불필요)
> - 기술 스택 단순화 (Cloudflare + Supabase + Telegram 외 외부 의존 0)
> - 인터셉트 발행과 동일 환경 → 디버깅·재현 용이

## 두 가지 발행 모드

### 정기발행 (Scheduled)

- 트리거: **Windows Task Scheduler — `TeatimeDailyPublish`**
- 실행 주체: 로컬 호스트 (대표님 PC, KST 시계 기준)
- 스크립트: `scripts/teatime-daily-publish.ps1`
- 등록 도우미: `scripts/install-teatime-scheduler.ps1` (1회 실행, 관리자 권한 권장)
- 스케줄: KST 매일 06:30 실행 → 07:00 노출 목표
- 성공 조건: 검증 통과 → git commit/push + `npm run deploy` 자동 실행
- 실패 조건: 텔레그램 알림 발송 + 전날 글 유지 (롤백 없음, 현상 유지)

### 인터셉트 발행 (Intercept Publish)

- 트리거: 대표님 수동
- 명령: `npm run teatime:intercept -- YYYY-MM-DD`
- 동작: 정기발행과 동일한 파이프라인을 즉석 호출

## 공통 5단계 파이프라인

```
Task Scheduler (정기) 또는 수동 트리거 (인터셉트)
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

## Windows Task Scheduler 설정

### 위치
- 메인 스크립트: `scripts/teatime-daily-publish.ps1`
- 등록 도우미: `scripts/install-teatime-scheduler.ps1`
- Task 이름: `TeatimeDailyPublish`
- 트리거: 매일 06:30 (호스트 로컬 시계, KST 가정)
- 옵션: `-WakeToRun`, `-StartWhenAvailable`, 실패 재시도 1회 (10분 후), 실행 제한 30분

### Secrets 위치
모두 **`intercept/.env.local`** 에서 로드 (파일은 `.gitignore` 등록됨, 절대 commit 금지).

| 키 | 용도 | 필수 |
|----|------|------|
| `GEMINI_API_KEY` | Gemini 2.5-flash 합성 | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 아카이브 등록 | ✅ |
| `SUPABASE_ACCESS_TOKEN` | CLI 자동화 | 권장 |
| `TELEGRAM_BOT_TOKEN` | 정기발행 알림 송신 | 권장 (없으면 stdout 만) |
| `TELEGRAM_CHAT_ID` | 정기발행 알림 대상 | 권장 |
| `TAVILY_API_KEY` | collect-news Phase 2 보충 | 선택 |

### 인터셉트 발행과의 관계
정기발행과 인터셉트 발행은 **같은 Python 스크립트(skeleton/collect/auto-generate/fetch-images/validate-links/md-to-archive)** 를 호출한다. 트리거만 다르다.

- 정기발행: `TeatimeDailyPublish` 작업이 `teatime-daily-publish.ps1` 호출
- 인터셉트 발행: 대표님이 `npm run teatime:intercept -- YYYY-MM-DD` 수동 호출
  - 정기발행 실패 시 텔레그램 알림에 동일 명령이 안내된다.

### 설치 / 제거
```powershell
# 등록 (관리자 권한 권장)
powershell -ExecutionPolicy Bypass -File scripts/install-teatime-scheduler.ps1

# 재등록
powershell -ExecutionPolicy Bypass -File scripts/install-teatime-scheduler.ps1 -Reinstall

# 제거
powershell -ExecutionPolicy Bypass -File scripts/install-teatime-scheduler.ps1 -Uninstall
# 또는
Unregister-ScheduledTask -TaskName TeatimeDailyPublish -Confirm:$false

# 수동 실행 (테스트)
Start-ScheduledTask -TaskName TeatimeDailyPublish

# DryRun (deploy/commit/push 생략, MD/검증/아카이브까지만)
powershell -ExecutionPolicy Bypass -File scripts/teatime-daily-publish.ps1 -DryRun
```

### 로그 위치
- 단일 실행 로그: `output/teatime/logs/YYYY-MM-DD.log` (stdout/stderr 병합 기록)
- 실패 시 텔레그램 메시지에 로그 경로가 포함된다.

## Related Pages

- [Local-First Development Workflow](./local-first-development.md)
- [Cloudflare Workers Deploy Checklist](./cloudflare-workers-deploy-checklist.md)
- [Teatime Publishing — Tistory](../strategy/teatime-publishing-tistory.md)
- [Teatime Intercept Service Upgrade](../strategy/teatime-intercept-service-upgrade.md)
