# 🚨 울트라플랜 V2 — 긴급 기능 복구 + 검증 (2026-04-13)

**트리거**: E2E Playwright 검증 결과 결제/보관공개/캐릭터 등 CRITICAL 버그 다발 + 대표님 긴급 지시

---

## 📋 긴급 수정 대상 (8개)

### CRITICAL (기능 완전 파손)
| # | 증상 | 원인 추정 | 담당 |
|---|------|---------|------|
| 1 | `/api/teatime/publish` **404** | API 라우트 미구현 or 빌드 누락 | Agent 1 (Opus) |
| 2 | **결제 실패** — Payment failed 에러 | 엔드포인트 or 클라이언트 측 문제 | Agent 2 (Opus) |

### HIGH
| # | 증상 | 원인 추정 | 담당 |
|---|------|---------|------|
| 3 | FloatingCharacters 스크롤 이탈 | position: absolute 페이지 좌표 | Agent 3 (Sonnet) |
| 4 | NicknameModal "끼어들기 전에" 한글 | i18n 미적용 | Agent 3 (Sonnet) |
| 5 | /pricing 다크 모드 | 하드코딩 bg-zinc-950 | Agent 3 (Sonnet) |
| 6 | React #418 hydration error | SSR/CSR text mismatch | Agent 4 (Sonnet) |

### MEDIUM
| # | 증상 |
|---|------|
| 7 | 토픽 제목 일부 미번역 ("AI 핫뉴스", "하네스 에이전트") |
| 8 | /feed 비정상 리다이렉트 |

---

## 🎬 코벤저스 출동 배치

### Agent 1 (Opus) — 보관/공개 API 복구
**작업**:
- `/api/teatime/publish` 라우트 존재 확인 + 구현 (없으면 신규)
- 인증 옵션화 (익명도 public 가능), DB 저장
- `curl POST /api/teatime/publish` 검증

**파일**: `src/app/api/teatime/publish/route.ts`

### Agent 2 (Opus) — 결제 시스템 전면 점검
**작업**:
- PayPal 에러 "Payment failed" 원인 추적
- `SubscribeButton.tsx` + `PaymentSelector.tsx` + API 라우트 검토
- 실제 라이브 API 테스트 (curl)
- 발견된 버그 수정 or 상세 보고

**파일**: `src/app/pricing/*`, `src/components/PaymentSelector.tsx`, `src/app/api/payment/**`

### Agent 3 (Sonnet) — UI 3개 동시 수정
**작업**:
- FloatingCharacters 스크롤 → `position: fixed` 확실히
- NicknameModal i18n 적용 (`beforeIntercept`, `nicknameDesc`, `cancel`, `start`)
- /pricing + /pricing/credits 다크 → 라이트 전환

**파일**: `FloatingCharacters.tsx`, `globals.css`, `NicknameModal.tsx`, `pricing/*.tsx`, i18n

### Agent 4 (Sonnet) — React #418 + 리다이렉트 + 토픽 제목
**작업**:
- React hydration error #418 원인 추적 (/teatime 콘솔)
- /teatime → /feed 비정상 리다이렉트 조사
- 토픽 제목 미번역 위치 찾아서 i18n 적용

**파일**: `teatime/page.tsx`, `teatime-data.ts`, `default-topics.ts`

---

## 📝 기능 체크리스트 (검증용)

### 인증
- [ ] Google OAuth 로그인 성공 → pill에 이름+아바타
- [ ] 로그아웃 → "Start with Google" 버튼 복원
- [ ] 익명 세션 (localStorage.nickname) 저장
- [ ] 닉네임 변경 → Supabase profiles.display_name 업데이트
- [ ] 새로고침 후 닉네임 유지

### 티타임 + 토픽
- [ ] /teatime 로드 → 3개 토픽 (핫/랜덤/소곤) 표시
- [ ] 토픽 제목 클릭 편집 → localStorage 저장
- [ ] 수다수다 버튼 → 새 AI 메시지 교체 (KO/EN)
- [ ] 다시 발행 / 원래대로 동작
- [ ] 끼어들기 버튼 → 패널 → 메시지 전송 → AI 응답

### 보관/공개
- [ ] 보관하기 클릭 → fly-out → /my 이동 → 카드 표시
- [ ] 공개하기 클릭 → fly-out → /feed 이동 → 카드 표시
- [ ] localStorage intercept-my-keep/public-feed 저장
- [ ] API /api/teatime/publish DB 기록 (로그인 시)

### 결제
- [ ] /pricing 페이지 라이트 모드 표시
- [ ] Basic $2.99/mo 클릭 → PayPal 팝업
- [ ] PayPal 샌드박스 결제 성공 → tier='basic' 업데이트
- [ ] Pro $8/mo 동일 확인
- [ ] /pricing/credits → PortOne EASY_PAY → 테스트 카드 성공
- [ ] credit_transactions 기록

### i18n
- [ ] EN/KO 토글 → 전역 적용
- [ ] 끼어들기 패널 영어 표시
- [ ] 닉네임 모달 영어 표시
- [ ] 드롭다운 영어 표시
- [ ] 토픽 제목/카테고리 영어 표시
- [ ] 캐릭터 이름 Ko Bujang/Oh Gwajang/Jem Daeri

### UI 디자인
- [ ] 라이트 모드 모든 페이지 (홈/티타임/my/feed/pricing/about/newsletter)
- [ ] FloatingCharacters 스크롤 중 뷰포트 유지
- [ ] 캐러셀 3탭 작동 (My Keep / Teatime / Feed)
- [ ] 모바일 반응형 (375px)
- [ ] 콘솔 에러 0건

---

## 🔬 검증 코드 (자동 테스트 스크립트)

**라이브 API 테스트** (`scripts/verify-api.sh`):
```bash
#!/bin/bash
BASE=https://interceptnews.app

# 1. 헬스 체크
for path in / /teatime /my /feed /pricing /newsletter /about; do
  code=$(curl -s -o /dev/null -w "%{http_code}" $BASE$path)
  echo "$path → $code"
done

# 2. API 엔드포인트
curl -s -o /dev/null -w "chatter KO: %{http_code}\n" -X POST $BASE/api/teatime/chatter \
  -H "Content-Type: application/json" -d '{"topic":"Test","language":"ko"}'

curl -s -o /dev/null -w "chatter EN: %{http_code}\n" -X POST $BASE/api/teatime/chatter \
  -H "Content-Type: application/json" -d '{"topic":"Test","language":"en"}'

curl -s -o /dev/null -w "publish: %{http_code}\n" -X POST $BASE/api/teatime/publish \
  -H "Content-Type: application/json" -d '{"title":"t","messages":[],"visibility":"public","teatimeId":"x","topicId":"y"}'

curl -s -o /dev/null -w "feed: %{http_code}\n" $BASE/api/feed
curl -s -o /dev/null -w "credits (auth): %{http_code}\n" $BASE/api/credits
```

**Playwright 시나리오** (`scripts/verify-e2e.spec.ts`):
- TC1: 로그인 pill 상태 전환
- TC2: 보관 → /my 이동 → 카드 표시
- TC3: 공개 → /feed 이동 → 카드 표시
- TC4: 수다수다 (KO/EN)
- TC5: 끼어들기 (메시지 전송 + AI 응답)
- TC6: 결제 플로우 (PayPal 팝업 열림 확인)
- TC7: i18n 토글 전역 확인
- TC8: 다크 OS → 사이트 라이트 모드
- TC9: 모바일 캐러셀 스와이프

---

## 📊 진행 상황 추적

| 단계 | 상태 |
|------|------|
| 1. 울트라플랜 V2 작성 | ✅ 완료 |
| 2. 코벤저스 4명 출동 | 🔄 진행 중 |
| 3. 각 Agent 수정 + 커밋 | ⏳ |
| 4. 라이브 재검증 (Playwright) | ⏳ |
| 5. 체크리스트 통과 | ⏳ |
| 6. 회의록 #15 기록 | ⏳ |

---

## 🛑 안팀장 작업 영역 주의

안팀장이 현재 작업 중인 파일들은 최대한 피할 것:
- pricing/* (단, 다크→라이트는 불가피)
- PaymentSelector.tsx (결제 버그 수정에 필요)
- FloatingCharacters.tsx (캐릭터 수정에 필요)
- feed/page.tsx (공개 기능 수정에 필요)

→ 필요 시 수정하되, JSX 구조는 최소 변경, state/effect/CSS 위주로.

---

*작성: 코부장 (2026-04-13)*
