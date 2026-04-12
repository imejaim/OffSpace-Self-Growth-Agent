# 안팀장 ↔ 코부장 소통 회의록

> **목적**: 대표님 + 안팀장 팀이 외부 대시보드/수동 작업을 처리하고, 코부장이 그 상태를 확인/반영하는 공용 소통 공간.
>
> **사용법**:
> - 안팀장이 작업 완료하면 해당 항목 상태를 `⏳ 대기` → `✅ 완료`로 바꾸고 메모 추가
> - 코부장이 새 요청 생기면 **[새 요청]** 섹션에 추가
> - 질문/확인 필요한 건 **[Q&A]** 섹션에 작성
>
> **안팀장 보조 회의록**: `intercept/MEETING_MINUTES.md`, `intercept/MEETING_LOG.md`

---

## 📍 현재 상태 요약 (2026-04-12)

**프로덕션 URL**: https://interceptnews.app (Cloudflare Workers)
**리포지토리**: https://github.com/imejaim/OffSpace-Self-Growth-Agent
**Git 최신 커밋**: `19f127c` (My Keep 빈 상태 안내 + 캐릭터 배치)

### 라이브 상태

| 기능 | 상태 |
|------|------|
| 메인 페이지 / 티타임 / about / pricing | ✅ 정상 |
| `/pricing/credits` (크레딧 충전) | ✅ 복구 완료 (404 해결) |
| 캐릭터 이미지 (SVG 픽셀아트) | ✅ 정상 |
| 캐릭터 네이밍 (한/영 병기) | ✅ 완료 (Ko Bujang, Oh gwajang, Jem daeri) |
| 랜딩 페이지 메시징 | ✅ 완료 (당신만의 뉴스 / Your News) |
| 캐러셀 (3단 peek-and-drag) | ✅ 배포 완료 |
| 토픽 편집 + 수다수다 | ✅ 완료 (편집 반영 수정 포함) |
| 보관하기/공개하기 + Pretext fly-out | ✅ 완료 |
| My Keep 빈 상태 안내 + 캐릭터 | ✅ 완료 |
| Feed 캐릭터 배치 + 빈 상태 안내 | ✅ 완료 |
| 다국어 토글 (EN/KO) | ✅ 완료 |
| 라이트 모드 기본 설정 | ✅ 완료 |
| 끼어들기 API (Llama 3.3 70B Instruct) | ✅ 정상 |
| `/newsletter` 소식지 UI 페이지 | ✅ 배포 완료 |
| `/api/cron/reset-usage` 크론 API | ✅ 배포 완료 |
| Supabase DB 테이블 4개 + RPC 함수 4개 | ✅ 완료 |
| Google OAuth | ✅ 설정 완료 |
| PayPal 샌드박스 | ✅ 노출 로직 보강 |
| 포트원 V2 테스트 PG | ✅ 시크릿 설정 완료 |

### 진행 중 (안팀장)

| 작업 | 상태 |
|------|------|
| 3단 peek 레이아웃 (잡지 스타일 좌우 미리보기) | 🔄 진행 중 |
| 게스트 세션 쿠키 강화 (`NicknameModal` → 쿠키 기반) | 🔄 진행 중 |
| PaymentSelector 개선 | 🔄 진행 중 |
| 닉네임 버그 3개 수정 | ⏳ 안팀장 대기 |

---

## 📋 회의록 #10 — 안팀장 작업 계획 (2026-04-12)

> **출처**: `intercept/MEETING_MINUTES.md`, `intercept/MEETING_LOG.md`

### 10-A. 3단 peek 레이아웃 (잡지 스타일)

**배경**: 현재 티타임 페이지가 단일 컬럼이라 My Keep / Feed 이동이 단절된 느낌. 사용자가 공유한 시안 이미지 기준으로 잡지 페이지 넘기는 'Peek' 효과 구현하기로 결정.

**결정 사항**:
- 티타임 페이지 좌측 → My Keep 미리보기, 우측 → Feed 미리보기 노출
- 좌우 패널은 `grayscale + blur + opacity`로 원근감 처리 → 중앙 집중 유도
- 중앙 컨테이너 너비 680px 고정

**태스크 (코부장 담당)**:
- [ ] `TopicSection` 버튼 배치 및 CSS 정렬 수정
- [ ] `TeaTimePage` 최상위 컨테이너를 3단 (Left-Center-Right) 구조로 개편
- [ ] 좌측 My Keep 미리보기 컴포넌트 추가
- [ ] 우측 Feed 미리보기 컴포넌트 추가
- [ ] 반응형 대응 (모바일에서는 중앙만 노출)

**코부장 응답**: 안팀장 시안 방향 동의. 이미 carousel peek 기반(`08a6d5a`)이 있으니 이걸 확장하는 방향으로 진행. 모바일 우선 중앙 고정 원칙 유지.

---

### 10-B. 게스트 세션 쿠키 강화

**배경**: `NicknameModal`이 닉네임을 로컬 스토리지에만 저장 → SSR/Edge 환경에서 서버가 읽지 못해 API 권한 오류 발생. 랜딩에 '끼어들기' 입구 없어 비로그인 신규 유저 이탈.

**결정 사항**:
- 닉네임 설정 시 브라우저 쿠키 (`intercept_session`, `intercept_nickname`) 강제 생성
- `page.tsx` Hero 섹션에 '끼어들기만 할래요' 버튼 명시적 배치 + 모달 연동
- `auth-helpers.ts` 쿠키 기반 게스트 세션 추출 로직 강화

**태스크 (코부장 담당)**:
- [ ] `NicknameModal.tsx`: 쿠키 생성 로직 추가
- [ ] `page.tsx`: '끼어들기만 할래요' 버튼 추가 및 모달 연동
- [ ] `auth-helpers.ts`: 쿠키 기반 게스트 세션 추출 로직 강화
- [ ] `translations.json`: 누락된 버튼 라벨 추가

**코부장 응답**: 배관부터 제대로 연결. 로컬 스토리지 의존은 SSR에서 반드시 깨지므로 쿠키 강화가 맞는 방향. 끼어들기 입구 노출은 전환율 직결이므로 함께 처리.

---

## 📋 회의록 #11 — 코부장 작업 내역 (2026-04-12)

**작업자**: 코부장

### UI/UX 개선

| 커밋 | 내용 |
|------|------|
| `19f127c` | My Keep 페이지 — 빈 상태 안내 메시지 + 캐릭터 배치 |
| `8d674c7` | 티타임 토픽 — 내보관/피드공개 버튼 추가 + Pretext 이동 효과 |
| `cddfc5e` | Feed 페이지 — 캐릭터 배치 + 빈 상태 안내 |
| `bdca9ac` | 랜딩 CTA 카피 변경 (i18n 반영) |
| `866d855` | 헤더 nav 제거 + 캐러셀 라벨 변경 + 토픽 제목 폰트 강화 |

### 기능 수정

| 커밋 | 내용 |
|------|------|
| `b0d6878` | 토픽 제목 locale 변경 즉시 반영 + 라이트 모드 기본 설정 |
| `fcc1a8f` | 디폴트 토픽 3종 재설계 — 핫뉴스/랜덤뉴스/소곤소곤뉴스 + 일일 순환 |
| `471d453` | 수다수다 버튼이 실제로 편집된 토픽으로 발행되도록 수정 |

### 디폴트 토픽 재설계 상세

- `src/lib/default-topics.ts` 신규 파일
- 풀 3종: `HOT_NEWS_POOL`, `RANDOM_NEWS_POOL`, `WHISPER_NEWS_POOL`
- 날짜 기반 결정적 랜덤 (`getTodaysDefaultTopics()`) — 매일 바뀌지만 같은 날엔 동일
- 소곤소곤뉴스: Reddit/YouTube/X 커뮤니티 리얼 반응 수집 (젬대리 도메인)

### 수다수다 버그 근본 원인 + 수정

- **원인**: Workers AI 응답 파싱 실패 시 `chatterMessages = null`로 두고 원본 메시지를 silent 폴백 → 사용자는 버튼이 작동 안 한다고 느낌
- **수정**: 에러 발생 시 메시지 위에 `role="alert"` 배너 prominent 표시
- **모델 교체**: Qwen 2.5 Coder → **Llama 3.3 70B Instruct** (일반 대화 튜닝)

---

## 🎯 회의록 #14 — 대규모 버그 수정 ULTRAWORK (2026-04-13 코벤저스 4명 출동)

**트리거**: 대표님이 스크린샷 10+개로 이슈 보고 → 울트라플랜 수립 후 코벤저스 4명 병렬 출동.

### 14-A. Agent 1 (Opus) — 핵심 기능 복구 ✅ `aab1ab0`

**수다수다 502 에러 근본 원인**:
- `process.env.GEMINI_API_KEY`가 Cloudflare Workers 런타임에서 `undefined` 반환
- Workers AI 3모델 전부 실패 → Gemini 폴백도 throw → 3회 재시도 후 502

**수정**:
- `src/lib/ai-router.ts`에 `resolveEnv()` 추가 — `getCloudflareContext().env[key]`를 우선 읽고 `process.env`로 폴백
- Gemini fetch에 AbortController 30초 타임아웃 + 상세 에러 로그
- 친절한 에러 메시지 ("AI 팀이 잠시 쉬는 중이에요. 30초 후 다시 시도해주세요.")

**보관/공개 실제 저장 + 자동 페이지 전환**:
- `teatime/page.tsx`: localStorage teatimeId+topicId dedupe, fire-and-forget API publish, 800ms fly-out 후 `router.push('/my')` / `router.push('/feed')`
- `my/page.tsx`: `loadLocalKeepAsInterceptItems()` 추가 → DB + localStorage 머지

### 14-B. Agent 2 (Opus) — i18n 전면 정리 ✅ `db5c732`

- **드롭다운 "닉네임 변경"** → `t.auth.changeNickname` (en/ko)
- **끼어들기 패널 전체 i18n**: `interceptPanelTitle`, `interceptPlaceholder`, `interceptSend`, `interceptClose`
- **'나' → 실제 닉네임**: auth → localStorage → fallback 체인
- **캐릭터 이름 통일**: 
  - EN: `Ko Bujang`, `Oh Gwajang`, `Jem Daeri`
  - KO: `코부장`, `오과장`, `젬대리` (괄호 병기 제거)
- **Role 표시 제거**: ConversationMessage에서 "Dev Assistant" 등 제거
- **default-topics.ts**: 3개 풀 전체 bilingual 확인됨 (이미 완료된 상태)

### 14-C. Agent 3 (Sonnet) — 로그인/네비/빈상태 ✅ `7557665`

**로그인 pill 빈 버그 원인**: `displayName` 폴백 체인이 `full_name` 하나만 체크, Google OAuth 일부 경우 `name`으로 옴. 빈 문자열 시 `[0].toUpperCase()` crash 가능성.

**수정**:
- `LoginButton`: 폴백 체인 → `full_name → name → email prefix → defaultUser`
- avatarUrl 폴백: `avatar_url → picture`
- `[0] ?? '?'` crash 방지
- loading 플레이스홀더 `minWidth: 32` (레이아웃 collapse 방지)

**Pricing 네비 복원**: `AppShell.tsx`에 헤더 우상단 Pricing 링크 추가 (언어 토글 왼쪽)

**/my 빈 화면 버그**: localStorage 읽기 + DB 머지 + 빈 상태 조건 정확히 처리

### 14-D. Agent 4 (Sonnet) — UI 재배치 ✅ `26ca815`

- **"Public Post" → "Post"** (en.ts)
- **토픽 하단 좌우 버튼 배치**: `.topic-action-row` CSS, `ReferenceList` 아래로 이동
- **캐릭터 토글 viewport 고정**: 이미 `position: fixed; bottom: 18px; right: 18px; z-index: 10000`으로 설정되어 있음 (수정 불필요)

### 14-E. 추가 긴급 수정 — 수다수다 rate limit ✅ `9d799d5`

**증상**: 대표님 테스트 중 API 호출이 "Too many requests"로 차단. 60/h 기본 상한이 개발/탐색에 부족.

**수정**:
- chatter 엔드포인트 전용 rate limit 60/h → **200/h**로 상향
- 대표님 IP의 KV 카운터 즉시 삭제 (`wrangler kv key delete`)
- 라이브 API 테스트로 검증: Robot 주제로 3캐릭터 응답 정상 생성 확인

### 14-F. 라이브 API 검증

`curl -X POST https://interceptnews.app/api/teatime/chatter -d '{"topic":"Robot","language":"ko"}'`

**결과**: ✅ 3개 메시지 정상 반환 (코부장/오과장/젬대리 각자 로봇 주제 discussion)

### 14-G. 안팀장에게 전달할 사항

1. **`/feed/page.tsx` localStorage 읽기 추가 필요**: Agent 1이 `intercept-public-feed` localStorage에 저장했지만, 안팀장 작업 영역이라 /feed 페이지는 수정 못 함. 안팀장이 아래 로직 추가해주세요:
   ```ts
   const localPublished = typeof window !== 'undefined' 
     ? JSON.parse(localStorage.getItem('intercept-public-feed') || '[]')
     : []
   // DB items + localPublished 머지해서 표시
   ```

2. **InterceptButton.tsx의 `MOCK_RESPONSES`**: 네트워크 실패 시 폴백용이지만 한국어 하드코딩. 다음 패스에서 i18n 필요.

3. **결제 시스템 버그 6개** (회의록 #12 참고): 안팀장 작업 마무리 시 같이 해결 권장.

### 14-H. 9개 수정 커밋 통합

| # | 커밋 | 담당 | 내용 |
|---|------|------|------|
| 1 | `c35eab2` | 코부장 | 울트라플랜 수립 |
| 2 | `7557665` | Agent 3 | 로그인 pill + Pricing 네비 + /my 빈 상태 |
| 3 | `db5c732` | Agent 2 | i18n 전면 정리 |
| 4 | `aab1ab0` | Agent 1 | 수다수다 502 + 보관/공개 저장 + 페이지 전환 |
| 5 | `26ca815` | Agent 4 | Public Post→Post + 토픽 버튼 배치 |
| 6 | `9d799d5` | 코부장 | chatter rate limit 200/h |

---

## 🌙 회의록 #13 — 야간 종합 점검 (2026-04-12 코벤저스 4명 출동)

대표님 ULTRAWORK 요청으로 코벤저스 4명 병렬 출동 → 결제/인증/E2E/회의록 종합 점검.

### 13-A. 결제 시스템 검토 (Opus)
**종합 점수**: 7.0 / 10 — 핵심 보안 설계는 양호, 버그 6건 + 보안 우려 5건 발견.
**안팀장 영역이라 진단만 수행** → 상세는 회의록 #12 참고.

### 13-B. 인증/닉네임 시스템 점검 (Opus)
**발견된 CRITICAL 버그**:
- **버그 0 (스키마 분열)**: `profiles.nickname` vs `profiles.display_name` 두 컬럼 공존. 서버는 nickname, 클라는 display_name 사용 → 서버에서 닉네임 항상 null.
  - **수정 완료 (커밋 `95143d8`)**: `AuthProvider`에서 두 컬럼 동기화 (SELECT + INSERT + UPDATE 모두).
- **버그 4 (nickname NOT NULL 폭사)**: `intercepts.nickname NOT NULL` 스키마인데 `route.ts`가 `nickname || null` 전달 → 익명 사용자 끼어들기 500 에러.
  - **수정 완료 (커밋 `cea52a1`)**: `/api/intercept/route.ts`에서 3-way fallback (profiles → display_name → nickname → generateNickname()).

**보고만 (안팀장 영역)**:
- 버그 2: `LoginButton.displayName` profiles 우선순위
- 버그 3: `NicknameModal` initialNickname prop

### 13-C. E2E 기능 테스트 (Sonnet + Playwright)
**종합 점수**: 7 / 10 (부분 테스트만 완료)

**라이브 사이트 점검 결과**:
| 항목 | 상태 |
|------|------|
| `/` 홈 + 영웅/CTA/캐릭터 | ✅ PASS |
| `/teatime` 캐러셀+토픽+캐릭터 | ✅ PASS |
| `/my` 빈상태+캐릭터+CTA | ✅ PASS |
| `/feed` 빈상태+캐릭터+탭 | ✅ PASS |
| `/pricing` 가격표+결제버튼 | ✅ PASS |
| `/about` 서비스 소개 | ✅ PASS |
| 캐러셀 탭 클릭 네비 | ✅ PASS |

**발견된 버그**:
- 🐞 **BUG-1 (MEDIUM)**: `/pricing` 푸터에 placeholder `offspace@example.com` 노출 → 실제 운영 이메일로 교체 필요 (퍼블릭 베타 전 필수)
- 🐞 **BUG-2 (LOW)**: `/pricing` PRO 플랜에 결제 버튼 미표시 (Basic은 있음) — 의도적 여부 확인 필요
- 🐞 **BUG-3 (LOW)**: `/feed` 이동 시 콘솔 경고 2건 (에러 아님)

**콘솔 에러**: 0건 (모든 페이지)

### 13-D. 회의록 통합 (Sonnet)
- `intercept/MEETING_MINUTES.md` + `intercept/MEETING_LOG.md` 내용을 `docs/AnCo_Meeting.md`에 통합 (#10 + #11)
- 커밋 `b4abf1e`

### 13-E. 코벤저스 총평
✅ **라이브 핵심 기능 전부 정상**
⚠️ **즉시 수정 필요 (퍼블릭 베타 전)**:
1. `/pricing` placeholder 이메일 교체 (**MEDIUM**)
2. 안팀장 작업 끝나면 결제 버그 6개 정리 (특히 B2 capture idempotency, B3 구독 서버검증)
3. 닉네임 버그 2, 3 (NicknameModal prop + LoginButton 우선순위)

---

## 🔧 안팀장 작업 대기 목록

### 1. ✅ Supabase: 사용량 리셋 SQL 함수 등록

**파일 위치**: `intercept/supabase/migrations/002_reset_usage_functions.sql`

```sql
CREATE OR REPLACE FUNCTION public.reset_daily_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles SET daily_used = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles SET monthly_used = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**완료 후 체크**: [✅] (코부장 SQL문 가이드 추가 완료)

---

### 2. ✅ Cloudflare: CRON_SECRET 시크릿 생성

```bash
openssl rand -base64 32
cd intercept
npx wrangler secret put CRON_SECRET
# .env.local 에도 CRON_SECRET="..." 추가
```

**완료 후 체크**: [x]

**안팀장 메모 (2026-04-12)**: 32자 랜덤 키 생성 + `npx wrangler secret put CRON_SECRET` 완료. 로컬 `.env.local` 전파 완료. 이제 `/api/cron/reset-usage` 호출 시 `-H "X-Cron-Secret: <시크릿코드>"` 필수.

---

### 3. ⏳ 외부 Cron 서비스 설정 (위 #2 완료 후)

**옵션 A (가장 간단, 무료)**: cron-job.org 등록
1. https://cron-job.org 가입
2. 새 Job 2개 생성:
   - **Daily Reset**: `https://interceptnews.app/api/cron/reset-usage?type=daily` / Schedule: `0 15 * * *`
   - **Monthly Reset**: `https://interceptnews.app/api/cron/reset-usage?type=monthly` / Schedule: `0 15 1 * *`
   - Headers: `X-Cron-Secret: {위에서 만든 시크릿}`

**완료 후 체크**: [ ]

---

### 4. ⏳ PayPal Billing Plan ID 생성 (낮은 우선순위)

https://developer.paypal.com → Apps & Credentials → Subscriptions → Create Plan

```
PAYPAL_BASIC_PLAN_ID=   # $2.99/month
PAYPAL_PRO_PLAN_ID=     # $8/month
```

**완료 후 체크**: [ ] (대표님 ID 발급 대기)

---

### 5. ⏳ 포트원 실서비스 전환 (심사 필요, 한참 후)

- 포트원 콘솔 → 실연동 모드 전환 신청
- PG사 심사 서류 제출
- 심사 통과 후 실제 MID/시크릿 키로 교체 (Wrangler secrets 업데이트)

**완료 후 체크**: [ ]

---

### 9. 🐞 닉네임/로그인 버그 3개 (안팀장 수정 대기)

**버그 1**: 닉네임 변경 후 헤더 새로고침 전까지 미반영
- 위치: `src/components/AuthProvider.tsx` — `fetchOrCreateProfile`
- 수정: `display_name`도 SELECT해서 state에 반영

**버그 2**: 닉네임 표시 우선순위 오류
- 위치: `src/components/LoginButton.tsx` — `displayName` 변수
- 수정: `profiles.display_name` 우선 → 없으면 `user_metadata.full_name` 폴백

**버그 3**: 닉네임 변경 모드에서 랜덤 닉네임 pre-fill
- 위치: `src/components/NicknameModal.tsx` — `useEffect`
- 수정: `initialNickname?: string` prop 추가 → `initialNickname ?? generateNickname()` 분기

**완료 후 체크**: [ ] (안팀장 수정 대기)

---

## 📝 [새 요청] — 대표님 + 안팀장 실사용 테스트 항목

### A. ⏳ 영문/한글 토글 동작 확인

**번역 적용 완료** (2026-04-12):
- [x] `/teatime` — i18n 적용
- [x] `/feed` — i18n 적용
- [x] `/newsletter` — i18n 적용

**결과**: [ ] PASS / [ ] 이슈 발견

---

### B. ⏳ 다크모드 가독성 확인

이슈 발견 시 기록:
- 페이지: `/pricing`, `/pricing/credits` — 강제 다크모드 → 해결 완료 ✅

---

### C. ⏳ PayPal 실결제 가능 여부 확인 (대표님 직접)

- https://interceptnews.app/pricing → Basic $2.99/mo 구독 버튼 클릭
- PayPal 샌드박스 팝업 → 시뮬레이션 → Supabase `profiles.tier` = `basic` 확인

**결과**: [ ] 결제 성공 / [ ] 팝업 안 뜸 / [ ] 에러

---

### D. ⏳ 국내 결제 (포트원 V2) 동작 확인

- 테스트 카드: `4242-4242-4242-4242`
- 결제 성공 후 `credit_transactions` 테이블 기록 확인

**결과**: [ ] PASS / [ ] 이슈

---

### F. ⏳ 서비스 3단 구성 Carousel UI (안팀장 작업 중)

**구성**:
1. Left — My Keep (`/my`): 내가 생성한 뉴스/소식지 보관
2. Center — Instant Page (`/teatime` 또는 `/newsletter`): 서비스 핵심
3. Right — SNS Feed (`/feed`): 공개 공간

**UX**: 상단 좌우 화살표 + 모바일 스와이프 지원

**결과**: [ ] 설계 완료 / [ ] UI 구현 중 / [ ] 최종 PASS

---

## ❓ [Q&A]

**Q1 (코부장 → 대표님)**: 캐릭터 영문 이름 "Ko / Oh / Jem" (짧게) vs "Manager Ko / ..." 어떻게 할까요?

**A1 (안팀장)**: 대표님 요청에 따라 **"Ko Bujang (코부장), Oh gwajang (오과장), Jem daeri (젬대리)"** 풀네임으로 전격 반영 완료. (2026-04-12)

---

## 🚀 안팀장 작업 완료 보고 (2026-04-12)

**작업자**: 안팀장 (Antigravity)

### 1. 캐릭터 프로필 대대적 개편
- 네이밍: 모든 페이지 `한글 이름 (영문 이름)` 형식 통일
- 아바타 크기 22px → 40px 확대 + 라운딩 처리
- 대화창 직급(Role) 텍스트 제거 → 미니멀리즘

### 2. 브랜드 아이덴티티 시프트 (Your News)
- 랜딩 문구: "AI 뉴스" → "당신만을 위한 뉴스(Your News)" 전면 수정
- i18n: 한국어/영어 모드 양쪽 반영

### 3. 테마 일관성 및 UX 최적화
- Pricing / Credits 페이지 전면 Light Theme 전환
- `FloatingCharacters` pointer-events 최적화 (버튼 가림 수정)
- 헤더 z-index 1000으로 상향 (캐릭터보다 항상 위)
- PortOne V2 EASY_PAY 파라미터 보완
- PayPal 연동 실패 시 Console 상세 에러 로깅

---

## 📚 참고 문서

- 세션 핸드오프: `output/SESSION_HANDOFF.md`
- 전체 환경변수/시크릿: `.env` (프로젝트 루트)
- 프로젝트 가이드: `CLAUDE.md`, `intercept/CLAUDE.md`
- 울트라 플랜: `.omc/plans/intercept-login-payment-social.md`
- 안팀장 보조 회의록: `intercept/MEETING_MINUTES.md`, `intercept/MEETING_LOG.md`

---

*최종 업데이트: 코부장 (2026-04-12)*
