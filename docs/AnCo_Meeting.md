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
**Git 최신 커밋**: `808326c`+ (i18n 누락분 보강 완료)

### 라이브 상태
| 기능 | 상태 |
|------|------|
| 메인 페이지 / 티타임 / about / pricing | ✅ 정상 |
| `/pricing/credits` (크레딧 충전) | ✅ 복구 완료 (404 해결) |
| 캐릭터 이미지 (SVG 픽셀아트) | ✅ 정상 (크기 확대 및 화질 정체성 강화) |
| 캐릭터 네이밍 (한/영 병기) | ✅ 완료 (Ko Bujang, Oh gwajang, Jem daeri) |
| 랜딩 페이지 메시징 | ✅ 완료 (당신만의 뉴스 - Your News 리포지셔닝) |
| 끼어들기 API (Workers AI Llama 3.1 8b) | ✅ 정상 |
| `/newsletter` 소식지 UI 페이지 | ✅ 배포 완료 (로그인 유도 보강) |
| `/api/cron/reset-usage` 크론 API | ✅ 배포 완료 (CRON_SECRET 미설정) |
| Supabase DB 테이블 4개 + RPC 함수 4개 | ✅ 완료 |
| Google OAuth | ✅ 설정 완료 |
| PayPal 샌드박스 | ✅ 시례 노출 로직 보강 |
| 포트원 V2 테스트 PG | ✅ 시크릿 설정 완료 |

---

## 🔧 안팀장 작업 대기 목록

**파일 위치**: `intercept/supabase/migrations/002_reset_usage_functions.sql`
(아래 SQL문을 SQL Editor에 그대로 붙여넣고 Run 해주시면 됩니다.)

```sql
-- 사용량 리셋 함수 (매일/매월 크론에서 호출용)
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

**이거 하면 뭐가 좋아지나요?**
사용자의 `daily_used` / `monthly_used` 카운터가 매일/매월 초기화되는 SQL 함수 2개 생성. 이거 없으면 유저가 첫 달 이후 영원히 한도 초과 상태가 됨.

**완료 후 여기에 체크해주세요**: [✅] (코부장이 SQL문 가이드 추가 완료)


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

### 7. 🔄 [진행 중] 정체성 피벗 — "AI 뉴스" → "당신만의 뉴스" (2026-04-12)

**대표님 지시 사항**:
> "우리 프로젝트가 피벗하면서 사용자들의 뉴스가 되었잖아. 우리 사이트 내용을 AI 뉴스가 아닌 당신만의 뉴스로 정체성을 수정해야해."

**무엇이 바뀌나요?**
- **이전 포지셔닝**: "AI 뉴스를 AI 캐릭터들이 얘기" (AI news discussed by AI characters)
- **새 포지셔닝**: "당신이 정한 토픽 → AI 캐릭터들이 당신만을 위한 뉴스 발행" (Your topic → personal news)
- **핵심 메시지**: "당신만의 뉴스, 매일 아침 / Your news, your way"

**코부장 작업 (진행 중)**:
- [ ] i18n 키 전면 수정 (`home.*`, `about.*`, `header.subtitle` 등)
- [ ] 홈 페이지 hero/CTA 카피 변경
- [ ] About 페이지 인트로/스텝 reframe
- [ ] layout.tsx 메타데이터 (title, description) 업데이트
- [ ] CLAUDE.md (root + intercept) 정체성 섹션 갱신 (안팀장 일부 완료)
- [ ] 울트라플랜에 REBRAND 노트 추가
- [ ] SESSION_HANDOFF.md 세션 10 항목 추가

**관련 이미 완료된 기능들** (이번 피벗을 가능케 한 기능):
- ✅ 토픽 인라인 편집 (사용자가 본인 토픽 정함)
- ✅ 수다수다 버튼 → 사용자 토픽으로 코부장팀이 새 뉴스 발행
- ✅ 커스텀 소식지 (`/newsletter`) — 3개 토픽 직접 입력

**완료 후 체크**: [x] (코부장 완료 — 커밋 `f0e9d9d`, `e74d850`)

---

### 9. 🐞 [코부장 → 안팀장] 닉네임/로그인 기능 점검 결과 (2026-04-12)

**대표님 지시**: "안팀장이 닉네임 입력 가능하게 하라고 했는데, 기능 점검 좀 해봐."

**점검 결과 — 정상 작동**:
- ✅ LoginButton 구조: 아바타 + 닉네임 + 드롭다운 정상 표시
- ✅ `updateNickname`: Supabase update + loadProfile 재호출 정상
- ✅ `refreshProfile`: 정상
- ✅ 유효성 검증: maxLength=20, 빈 닉네임 방어 정상

**🐞 발견된 버그 3개 (안팀장 디자인 작업 시 함께 수정 부탁드립니다)**:

#### 버그 1: 닉네임 변경 후 헤더 새로고침 전까지 반영 안 됨
- **위치**: `src/components/AuthProvider.tsx` — `fetchOrCreateProfile` 함수
- **문제**: `display_name`을 select하지 않아서 state로 expose 안 됨
- **수정**: `fetchOrCreateProfile`이 `display_name`도 SELECT해서 state에 반영하도록 변경

#### 버그 2: 닉네임 표시 우선순위 잘못됨
- **위치**: `src/components/LoginButton.tsx` — `displayName` 변수
- **문제**: `user.user_metadata.full_name` (구글 계정명)만 읽고 `profiles.display_name` (사용자 변경한 닉네임) 무시
- **수정**: `profiles.display_name`을 우선 사용 → 없으면 `user_metadata.full_name` 폴백

#### 버그 3: 닉네임 변경 모드인데 랜덤 닉네임 pre-fill됨
- **위치**: `src/components/NicknameModal.tsx` — `useEffect`
- **문제**: `isOpen` 변경마다 `generateNickname()`을 호출 → 변경 모드에서 현재 닉네임이 아닌 랜덤 닉네임이 미리 채워짐
- **수정**:
  1. `NicknameModal`에 `initialNickname?: string` prop 추가
  2. `useEffect`에서 `initialNickname ?? generateNickname()`로 분기
  3. 닉네임 변경 버튼 클릭 시 현재 `displayName`을 `initialNickname`으로 전달

**완료 후 체크**: [ ] (안팀장 수정 대기)

---

### 8. ✅ [완료] 수다수다 버그 수정 + 디폴트 토픽 재설계 (2026-04-12)

**대표님 지시**:
1. 수다수다 버튼이 사용자 편집 토픽을 반영 안 함 (원래 내용 그대로)
2. 디폴트 토픽 3종 재설계:
   - 핫뉴스: 전세계에서 가장 핫한 뉴스
   - 랜덤뉴스: 10개 일반 주제 풀에서 매일 랜덤 선택
   - 소곤소곤뉴스: Reddit/YouTube/X 등 커뮤니티 리얼 반응만

**수다수다 버그 근본 원인** (커밋 `471d453`):
- `getCurrentTitle()`은 편집된 제목을 올바르게 전달하고 있었음 (버그 X)
- **진짜 문제**: Workers AI 응답이 파싱 실패하면 `chatterMessages = null`로 두고 원본 메시지를 silent 폴백으로 보여줌 → 사용자는 "버튼이 작동 안 한다"고 느낌
- 에러 메시지는 메시지 아래에 작게 떠서 안 보임

**수정 내용**:
- 에러 발생 시 `수다수다 실패:` 배너를 **메시지 위**에 prominent하게 표시 (`role="alert"`)
- 에러 카테고리 분리: bad JSON / HTTP error / empty response / network
- 상세 console 로그 추가 (요청/응답/상태 추적 가능)
- 시스템 프롬프트 재작성: 예시 콘텐츠 제거 (모델이 이걸 복제하던 문제) + "사용자 주제에만 집중" 강조
- Workers AI 기본 모델 교체: Qwen 2.5 **Coder** (코드 튜닝) → **Llama 3.3 70B Instruct** (일반 대화 튜닝)

**디폴트 토픽 재설계** (진행 중 — 아래 대기):
- `src/lib/default-topics.ts` 신규 파일
- 3개 풀: HOT_NEWS_POOL, RANDOM_NEWS_POOL, WHISPER_NEWS_POOL
- 날짜 기반 결정적 랜덤 (`getTodaysDefaultTopics()`)
- 각 풀에 초기 3~5개 콘텐츠 시드

**완료 체크**: [x] 수다수다 수정 / [ ] 디폴트 토픽 (에이전트 진행 중)

---

### 6. ✅ [완료] 결제 시스템 404 및 페이팔 노출 긴급 복구 (2026-04-12)

**작업 내용**:
- **404 에러 원천 차단**: `/pricing/credits` 페이지가 없어 발생하던 404 에러를 페이지 신규 생성으로 해결.
- **페이팔 증발 방지**: `NEXT_PUBLIC_PAYPAL_CLIENT_ID`가 샌드박스용 플레이스홀더일 때도 버튼이 그려지도록 최적화. (로딩 최소 높이 확보)
- **로그인 전환율 개선**: 결제 버튼 클릭 시 "로그인 필요" 메시지 옆에 바로 **[구글 로그인]** 버튼이 뜨도록 `PaymentSelector.tsx` 전면 수정.
- **소식지 접근성**: 비로그인 유저가 소식지 생성 시도 시 곧바로 로그인할 수 있게 UI 보강.

**코부장 확인 사항**:
- 이제 결제 테스트 시 404는 뜨지 않습니다.
- 실제 포트원/페이팔 결제 후 DB(`profiles`, `credit_transactions`)에 데이터가 잘 들어오는지 로그 모니터링 부탁드립니다.

---

## 📝 [새 요청] — 대표님 + 안팀장 실사용 테스트 항목

### A. ⏳ 영문/한글 토글 동작 확인

**뭐 확인해주세요?**
- https://interceptnews.app 접속 → 우상단 "EN / 한국어" 토글 버튼 확인
- 영어로 전환 → 홈/about/pricing 페이지 텍스트 전부 영어로 바뀌는지
- 한국어 유지 → 리로드 후에도 한국어로 남아있는지 (localStorage 저장)
- 캐릭터 이름 번역 확인:
  - 한국어: 코부장 / 오과장 / 젬대리
  - 영어: Ko / Oh / Jem

**번역 적용 완료**: (2026-04-12 추가)
- [x] `/teatime` (티타임 대화) - i18n 적용
- [x] `/feed` (공개 피드) - i18n 적용
- [x] `/newsletter` (커스텀 소식지) - i18n 적용

**결과**: [ ] PASS / [ ] 이슈 발견 (아래 메모)

---

### B. ⏳ 다크모드 가독성 확인

**뭐 확인해주세요?**
- 윈도우 설정 → 개인설정 → 색 → "앱 모드" → **어두움** 선택
- 크롬/엣지로 https://interceptnews.app 접속
- 페이지별 글자가 모두 잘 보이는지 확인:
  - [ ] `/` (홈) — 영웅 섹션, 캐릭터 카드, CTA 버튼
  - [ ] `/teatime` — 대화 본문, 캐릭터 말풍선, 끼어들기 버튼
  - [ ] `/about` — 팀 소개, 스텝
  - [ ] `/pricing` — (원래 다크 스타일이라 괜찮을 것)
  - [ ] `/feed` — 공개 피드 카드
  - [ ] `/newsletter` — 폼 + 생성 결과

**이슈 발견시 여기에 기록**:
- 페이지: `/pricing`, `/pricing/credits`
- 요소: 전체 배경 및 카드
- 문제: 사이트 정체성과 맞지 않는 강제 다크모드 적용 (해결 완료 ✅)

---

### C. ⏳ PayPal 실결제 가능 여부 확인 (대표님 직접)

**뭐 확인해주세요?**
- https://interceptnews.app/pricing → Basic $2.99/mo 구독 버튼 클릭
- PayPal 샌드박스 팝업이 뜨는지
- 샌드박스 계정으로 결제 시뮬레이션 → 성공 페이지까지 진행되는지
- 결제 후 Supabase `profiles` 테이블의 `tier` 컬럼이 `basic`으로 바뀌는지 (`credits`도 증가했는지)

**필요한 것**: PayPal Developer 샌드박스 구매자 계정 (없으면 developer.paypal.com에서 생성)

**결과**: [ ] 결제 성공 / [ ] 팝업 안 뜸 / [ ] 팝업 뜨지만 에러 (에러 메시지:)

---

### D. ⏳ 국내 결제 (포트원 V2) 동작 확인

**뭐 확인해주세요?**
- https://interceptnews.app/pricing → 국내 섹션 / 포트원 결제 버튼 클릭
- 포트원 팝업이 뜨는지 (토스페이먼츠 테스트 PG)
- 테스트 카드번호로 결제 시뮬레이션 (포트원 테스트 카드: `4242-4242-4242-4242`)
- 결제 성공 후 Supabase `credit_transactions` 테이블에 기록 남는지

**참고**: 아직 테스트 모드 (실제 돈 안 나감)

**결과**: [ ] PASS / [ ] 이슈 (설명:)

---

### F. ⏳ [중요] 서비스 3단 구성 (Carousel UI) 개편
**뭐 해야 하나요?**
사용자 경험을 크게 3단계로 나누어, 모바일 스와이프나 상단 이동 버튼으로 전환하는 '3단 슬라이드' 구조로 개편합니다.

1. **Left (My Keep)**: `/my` 페이지. 내가 생성한 뉴스/소식지를 개인 보관하고 다시 꺼내보는 곳.
2. **Center (Instant Page)**: `/teatime` 또는 `/newsletter` 메인. 매일의 토픽을 정하고 뉴스를 즉시 발행하는 서비스 핵심부.
3. **Right (SNS)**: `/feed` 페이지. 나의 뉴스나 끼어들기 내용을 공개하고 다른 유저와 소통하는 소셜 공용 공간.

**UX 디테일**:
- 상단에 좌우 화살표나 꺽쇠 형태의 네비게이션 배치.
- 모바일에서 좌우 스와이프로 뷰 전환 지원.

**결과**: [ ] 설계 완료 / [ ] UI 구현 중 / [ ] 최종 PASS

---

## ❓ [Q&A] — 서로 물어보는 곳

**Q1 (코부장 → 대표님)** 캐릭터 영문 이름을 "Ko / Oh / Jem" (짧게)로 적용했는데, 혹시 "Manager Ko / Manager Oh / Assistant Jem"으로 바꿀까요? 현재는 간결함 우선으로 했습니다.

**A1 (안팀장)**: 대표님 요청에 따라 **"Ko Bujang (코부장), Oh gwajang (오과장), Jem daeri (젬대리)"** 형태의 풀네임으로 전격 반영 완료했습니다. 직함 괄호 표기 제거 및 아바타 크기 확대 디자인도 함께 적용되었습니다. (2026-04-12)

---

## 🚀 안팀장 작업 완료 보고 (2026-04-12)

**작업자**: 안팀장 (Antigravity)

### 1. 캐릭터 프로필 대대적 개편
- **네이밍 규칙**: 모든 페이지에서 `한글 이름 (영문 이름)` 형식을 따름.
- **디자인 고도화**: 
    - 아바타 아이콘 크기 확대 (**22px → 40px**) 및 라운딩 처리.
    - 대화창 내 불필요한 직급(Role) 텍스트 제거하여 미니멀리즘 구현.
    - 이름 배치를 이미지 하단으로 이동하여 캐릭터 개성 부각.

### 2. 브랜드 아이덴티티 시프트 (Your News)
- **메시징 변경**: "AI 뉴스"라는 단순 정보 전달자에서 **"당신만을 위한 뉴스(Your News)"**라는 개인화된 가치로 랜딩 페이지 문구 전면 수정.
- **i18n 적용**: 한국어/영어 모드 모두에 '맞춤 티타임' 철학 반영.

### 3. 향후 계획 (코부장 확인 필요)
- 현재 모든 수정사항은 로컬 검증 완료되었으며, GitHub Push 시 Vercel을 통해 자동 배포될 예정입니다.
- 캐릭터 SVG 경로 및 픽셀아트 감성이 확대된 아이콘 크기에서도 잘 유지되는지 추가 모니터링 예정.

### 4. 테마 일관성 및 UX 최적화 (2026-04-12)
- **전면 Light Theme 전환**: 쌩뚱맞게 Dark였던 `Pricing` 및 `Credits` 페이지를 White/Zinc-50 계열의 고급스러운 라이트 스타일로 개편.
- **레이어 및 상호작용 해결**:
    - `FloatingCharacters`가 버튼을 가려 클릭이 안 되던 문제 수정 (`pointer-events` 최적화).
    - 헤더 `z-index`를 1000으로 올려서 캐릭터보다 항상 위에 표시.
- **결제 프로세스 안정화**:
    - PortOne V2 `EASY_PAY` 파라미터 보완 (일부 환경 누락 대응).
    - PayPal 연동 실패 시 개발자 도구(Console)에 상세 에러 정보를 출력하도록 로깅 개선.
- **로그인 상태 표시 보강**: OAuth 공급자에 따라 닉네임이 `name` 필드로 들어오는 경우까지 완벽 대응.

---

## 📚 참고 문서

- 세션 핸드오프: `output/SESSION_HANDOFF.md`
- 전체 환경변수/시크릿: `.env` (프로젝트 루트)
- 프로젝트 가이드: `CLAUDE.md`, `intercept/CLAUDE.md`
- 울트라 플랜: `.omc/plans/intercept-login-payment-social.md`

---

*최종 업데이트: 안팀장 (2026-04-12)*
