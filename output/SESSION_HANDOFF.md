# 세션 핸드오프 — 2026-04-11

> 다음 세션에서 이 문서를 읽고 이어서 진행하세요.

## 프로젝트 개요

**Intercept (끼어들기)** — AI 캐릭터들의 뉴스 대화에 사용자가 끼어드는 인터랙티브 뉴스 플랫폼.
GitHub: https://github.com/imejaim/OffSpace-Self-Growth-Agent
도메인: https://interceptnews.app (Cloudflare, 2026-04-11 구매)

---

## 현재 돌아가는 것들

### intercept 웹앱 (http://localhost:3000 / PM2 포트 4000)

| 기능 | 상태 |
|------|------|
| 티타임 대화 페이지 (MD 감성 디자인) | ��� 정상 |
| 끼어들기 기능 (Gemini 2.5-flash) | ��� 정상 |
| 캐릭터 인터랙션 (FloatingCharacters.tsx) | ✅ 정상 |
| Supabase Auth (Google OAuth + Anonymous) | ✅ 구현 완료 |
| PayPal 결제 (구독 + 크레딧) | ✅ 샌드박스 |
| **포트원 V2 결제 (간편결제/카드/이체/휴대폰)** | ✅ 테스트 모드 (NEW) |
| 소셜 피드 (공개/팔로우) | ✅ 구현 완료 |
| 마이페이지 (끼어들기 히스토리) | ✅ 구현 완료 |
| 소식지 컴포넌트 (EditableTopic, GossipSection) | ✅ 구현 완료 |
| **Cloudflare Pages 배포 설정** | ✅ wrangler.toml + @opennextjs/cloudflare (NEW) |
| 빌드 (`npm run build`) | ✅ PASS (27 라우트) |

### 인프라 / 외부 서비스

| 서비스 | 상태 | 비고 |
|--------|------|------|
| Supabase (us-east-1) | 프로젝트 생성됨 | DB 마이그레이션 아직 미적용 |
| PayPal Sandbox | 앱 생성됨 | Billing Plan ID 미생성 |
| 포트원 V2 | 테스트 채널 연결 | 토스페이먼츠 테스트 PG |
| Cloudflare Pages | wrangler.toml 준비 | 프로젝트 연결 + 도메인 설정 필요 |
| interceptnews.app | 도메인 구매 완료 | Cloudflare Registrar |

### 캐릭터 시스템

| 캐릭터 | 파일 | 색상 | 역할 |
|--------|------|------|------|
| 코부장 | `Ko-bujang.svg` | 오렌지 곰고양이 | 테크 분석, 팀 리드 |
| 오과장 | `Oh-gwajang.svg` | 초록 개구리 | 팩트/숫자, 기획 |
| 젬대리 | `Jem-daeri.svg` | 인디고 고양이 | 커뮤니티, 뒷담화 |

픽셀아트 스타일 — `imageRendering: 'pixelated'` 적용

---

## 울트라플랜 Phase 진행 상황

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 0.0 | Supabase SSR + proxy.ts PoC | ✅ 코드 완료 |
| Phase 0 | 인프라 (DB + Auth + Rate Limit) | ✅ 코드 완료 |
| Phase 1 | 로그인 시스템 | �� 코드 완료 |
| Phase 2 | PayPal 결제 | ✅ 코드 완료 |
| Phase 3 | 소셜 기능 (Feed + Follow) | ✅ ���드 완료 |
| Phase 4 | 소식지 구조 개편 | ✅ 컴포넌트 완료 |
| Phase 5 | 포트원 V2 간편결제 | ✅ 코드 완료 + 보안 리뷰 통과 |

**전 Phase 코드 구현 완료. Supabase DB 마이그레이션 + 외부 서비스 설정 후 실사용 가능.**

---

## 대표님 해야 할 것 (외부 대시보드 작업)

| # | 할 일 | 어디서 |
|---|-------|--------|
| 1 | 포트원 웹훅 URL 등록 | admin.portone.io → 웹훅 설정 |
| 2 | 포트원 웹훅 시크릿 복사 → .env.local | 위 화면에서 발급 |
| 3 | Cloudflare Pages 프로젝트 연결 | dash.cloudflare.com → Pages |
| 4 | Supabase Google OAuth 설정 | supabase.com → Auth → Providers |
| 5 | Supabase DB 마이그레이션 실행 | supabase CLI or Dashboard |
| 6 | PayPal Billing Plan ID 생성 | developer.paypal.com |

---

## 다음 해야 할 것들 (코부장 담당)

### 1순위 — 바로 시작 가능
- [ ] Workers AI (Gemma 4) 라우팅 구현 (진행 중)
- [ ] DB 마이그레이션 후 실제 Auth 플로우 E2E 테스트
- [ ] 끼어들기 → 공개피드 전체 플로우 테스트

### 2순위 — 대표님 외부 설정 완료 후
- [ ] Cloudflare Pages 첫 배포 (`npm run deploy`)
- [ ] interceptnews.app 커스텀 도메인 연결 확인
- [ ] 포트원 실결제 테스트 (샌드박스)
- [ ] PayPal 구독 Billing Plan 연결

### 3순위 — 폴리싱
- [ ] 모바일 반응형 최종 점검
- [ ] 소식지 생성 API (`/api/newsletter/generate`) 구현
- [ ] 뒷담화 섹션 데이터 파이프라인 (Reddit/X/YouTube)
- [ ] 일별 사용량 리셋 크론잡

---

## 알려진 이슈

| 이슈 | 상태 | 비고 |
|------|------|------|
| in-memory rate limiter | 서버리스에서 무효 | Cloudflare KV 또는 Upstash Redis 전환 필요 |
| 모바일 FloatingCharacters | 미검증 | 터치 코드는 있음, 실기기 확인 필요 |
| 티타임 자동화 | 수동 운영 중 | git push 인증 미해결 |

---

## 환경변수 요약

### intercept/.env.local (현재)
- `GEMINI_API_KEY` ✅
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` ✅
- `NEXT_PUBLIC_SUPABASE_URL` / `PUBLISHABLE_KEY` ✅
- `NEXT_PUBLIC_PORTONE_STORE_ID` / `CHANNEL_KEY` ✅ (NEW)
- `PORTONE_TEST_SECRET_KEY` / `TEST_CLIENT_KEY` ✅ (NEW)
- `PORTONE_WEBHOOK_SECRET` ⚠️ PLACEHOLDER (포트원 콘솔에서 발급 필요)

### wrangler.toml secrets (배포 시 설정)
- `PORTONE_TEST_SECRET_KEY`
- `PORTONE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_SECRET`
- `GEMINI_API_KEY`

---

## 세션별 완료 내역

| 세션 | 날짜 | 주요 완료 |
|------|------|----------|
| 세션 1 | 2026-04-02~03 | CLAUDE.md, 티타임 Vol.1~2, 사업분석 Go판정 |
| 세션 2 | 2026-04-03 | INTERCEPT MVP, MD감성 디자인, 끼어들기 API |
| ��션 3 | 2026-04-04 | 캐릭터 픽셀아트 전 페이지 반영 |
| 세션 4 | 2026-04-05 | 파일명 변경, 젬대리 SVG 수정, 야식타임 |
| 세션 5 | 2026-04-06 | 티타임 Vol.4 발행 |
| 세션 6 | 2026-04-07 | FloatingCharacters 인터랙션, Pretext 통합 |
| 세션 7 | 2026-04-10 | 로그인/결제 시스템 전체 구현 (Supabase Auth + PayPal + 크레딧) |
| **세션 8** | **2026-04-11** | **포트원 V2 결제, 소셜피드, Cloudflare 배포 설정, 보안 리뷰 6건 수정, 도메인 구매** |

---

## 대표님 확정 결정사항

- 서비스명: **Intercept (인터셉트)**
- 도메인: **interceptnews.app** (Cloudflare)
- 사업용 이메일: **offspace.intercept@gmail.com**
- 배포: **Cloudflare Pages** (무료 플랜)
- DB/Auth: **Supabase** (us-east-1)
- 결제: **PayPal** (해외) + **포트원 V2** (국내)
- 가격: Free 2/day, Basic $2.99/150mo, Pro $8/500mo, PPU $1/10
- 글로벌 서비스 지향, 영어 기본 + 한국어 i18n
- 아마추어 감성, MD 느낌 유지

---

*최종 업데이트: 코부장 (2026-04-11)*
