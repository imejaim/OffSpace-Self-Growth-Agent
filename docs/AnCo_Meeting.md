# 안팀장 ↔ 코부장 소통 회의록

> **목적**: 대표님 + 안팀장 팀이 외부 대시보드/수동 작업을 처리하고, 코부장이 그 상태를 확인/반영하는 공용 소통 공간.
>
> **사용법**:
> - 안팀장이 작업 완료하면 해당 항목 상태를 `⏳ 대기` → `✅ 완료`로 바꾸고 메모 추가
> - 코부장이 새 요청 생기면 **[새 요청]** 섹션에 추가
> - 질문/확인 필요한 건 **[Q&A]** 섹션에 작성

---

## 📍 현재 상태 요약 (2026-04-12)

**프로덕션 URL**: https://interceptnews.app (Cloudflare Workers)
**리포지토리**: https://github.com/imejaim/OffSpace-Self-Growth-Agent
**Git 최신 커밋**: `808326c` (wrangler.toml TOML 섹션 순서 수정)

### 라이브 상태
| 기능 | 상태 |
|------|------|
| 메인 페이지 / 티타임 / about / pricing | ✅ 정상 |
| 캐릭터 이미지 (SVG 픽셀아트) | ✅ 정상 |
| 끼어들기 API (Workers AI Llama 3.1 8b) | ✅ 정상 |
| `/newsletter` 소식지 UI 페이지 | ✅ 배포 완료 |
| `/api/cron/reset-usage` 크론 API | ✅ 배포 완료 (CRON_SECRET 미설정) |
| Supabase DB 테이블 4개 + RPC 함수 4개 | ✅ 완료 |
| Google OAuth | ✅ 설정 완료 |
| PayPal 샌드박스 | ✅ 시크릿 설정 완료 |
| 포트원 V2 테스트 PG | ✅ 시크릿 설정 완료 |

---

## 🔧 안팀장 작업 대기 목록

### 1. ⏳ Supabase: 크론 리셋 SQL 함수 생성

**뭐 해야 하나요?**
Supabase 대시보드 → SQL Editor에서 아래 파일 내용을 복사/붙여넣기 → Run

**파일 위치**: `intercept/supabase/migrations/002_reset_usage_functions.sql`

**이거 하면 뭐가 좋아지나요?**
사용자의 `daily_used` / `monthly_used` 카운터가 매일/매월 초기화되는 SQL 함수 2개 생성. 이거 없으면 유저가 첫 달 이후 영원히 한도 초과 상태가 됨.

**완료 후 여기에 체크해주세요**: [ ] (대표님 수동 실행 대기)


---

### 2. ⏳ Cloudflare: CRON_SECRET 시크릿 생성

**뭐 해야 하나요?**
```bash
# 1. 32자 랜덤 문자열 생성 (Git Bash에서 실행)
openssl rand -base64 32
# 출력 예: 7xK9pL3mN2qR8vT5wY1bZ4dF6hJ0aCe=

# 2. Wrangler 시크릿 등록
cd intercept
npx wrangler secret put CRON_SECRET
# 프롬프트 나오면 위에서 생성한 문자열 붙여넣기 + Enter

# 3. .env.local 에도 추가 (로컬 테스트용)
# 파일: intercept/.env.local
# 아래 한 줄 추가:
CRON_SECRET="7xK9pL3mN2qR8vT5wY1bZ4dF6hJ0aCe="
```

**이거 하면 뭐가 좋아지나요?**
크론 API 라우트(`/api/cron/reset-usage`)가 헤더 검증해서 외부에서 마구 못 부르도록 막음. 이거 없으면 현재 API가 500 에러 뱉고 있음.

**완료 후 여기에 체크해주세요**: [x]

**안팀장 메모 (2026-04-12)**:
- 32자 랜덤 키 생성 완료 및 `npx wrangler secret put CRON_SECRET` 완료.
- 로컬 `.env.local` 전파 완료.
- 이제 `/api/cron/reset-usage` 호출 시 `-H "X-Cron-Secret: <시크릿코드>"` 필수.


---

### 3. ⏳ 외부 Cron 서비스 설정 (위 #2 완료 후)

**옵션 A (가장 간단, 무료)**: cron-job.org 등록
1. https://cron-job.org 가입
2. 새 Job 2개 생성:
   - **Daily Reset**
     - URL: `https://interceptnews.app/api/cron/reset-usage?type=daily`
     - Schedule: `0 15 * * *` (15:00 UTC = 00:00 KST 매일)
     - Headers: `X-Cron-Secret: {위에서 만든 시크릿}`
   - **Monthly Reset**
     - URL: `https://interceptnews.app/api/cron/reset-usage?type=monthly`
     - Schedule: `0 15 1 * *` (매월 1일 15:00 UTC)
     - Headers: `X-Cron-Secret: {위에서 만든 시크릿}`

**옵션 B**: 별도 Cloudflare Worker로 처리 (안팀장이 가능하면 이쪽이 더 깔끔)
- 코부장이 별도 worker 코드 작성해드릴 수 있음 — 필요하면 요청

**완료 후 여기에 체크해주세요**: [ ]

---

### 4. ⏳ PayPal Billing Plan ID 생성 (낮은 우선순위)

**뭐 해야 하나요?**
https://developer.paypal.com → Apps & Credentials → 기존 앱 선택 → Subscriptions → Create Plan

생성할 플랜 2개:
- **Basic**: $2.99/month, 월간 반복
- **Pro**: $8/month, 월간 반복

생성 후 발급되는 Plan ID (예: `P-XXXXXXXXXXXXX`)를 아래에 기록:
```
PAYPAL_BASIC_PLAN_ID=
PAYPAL_PRO_PLAN_ID=
```

**이거 하면 뭐가 좋아지나요?**
PayPal 구독 결제 플로우가 실제로 작동하게 됨. 현재는 Plan ID 없어서 구독 생성 불가.

**완료 후 여기에 체크해주세요**: [ ] (대표님 ID 발급 대기)


---

### 5. ⏳ 포트원 실서비스 전환 (심사 필요, 한참 후)

**뭐 해야 하나요?**
- 포트원 콘솔 → 실연동 모드 전환 신청
- PG사(토스페이먼츠/KG이니시스 등) 심사 서류 제출
- 심사 통과 후 실제 MID/시크릿 키로 교체 (Wrangler secrets 업데이트)

**완료 후 여기에 체크해주세요**: [ ]

---

## 📝 [새 요청] — 코부장이 추가

*여기에 코부장이 안팀장한테 요청할 일 추가*

_(현재 요청 없음)_

---

## ❓ [Q&A] — 서로 물어보는 곳

*여기에 안팀장이나 코부장이 확인 필요한 거 작성*

_(현재 질문 없음)_

---

## 📚 참고 문서

- 세션 핸드오프: `output/SESSION_HANDOFF.md`
- 전체 환경변수/시크릿: `.env` (프로젝트 루트)
- 프로젝트 가이드: `CLAUDE.md`, `intercept/CLAUDE.md`
- 울트라 플랜: `.omc/plans/intercept-login-payment-social.md`

---

*최종 업데이트: 코부장 (2026-04-12)*
