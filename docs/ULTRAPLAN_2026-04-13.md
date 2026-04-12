# 🎯 울트라플랜 — 대규모 버그 수정 + 기능 복구 (2026-04-13)

**트리거**: 대표님 ULTRAWORK 요청 — 10+ 개 이슈 발견 + 긴급 수정 필요
**방식**: 코벤저스 4명 병렬 출동, 안팀장 작업 영역 회피

---

## 📋 이슈 목록 (대표님 스크린샷 기반)

### 🔴 CRITICAL (기능 파손)
| # | 이슈 | 우선순위 | 담당 |
|---|------|---------|------|
| 1 | 구글 로그인 후 빈 pill → 클릭 안됨 | CRITICAL | Agent 3 |
| 2 | 수다수다 502 에러 (AI service unavailable) | CRITICAL | Agent 1 |
| 3 | 보관하기/공개하기 실제 저장 X | CRITICAL | Agent 1 |
| 4 | 보관/공개 후 자동 페이지 전환 없음 | HIGH | Agent 1 |

### 🟠 i18n 오류 (영문 모드인데 한글 표시)
| # | 이슈 | 우선순위 | 담당 |
|---|------|---------|------|
| 5 | 닉네임 변경 드롭다운 한글 | HIGH | Agent 2 |
| 6 | 끼어들기 패널 한글 (끼어들기, 전송, 나) | HIGH | Agent 2 |
| 7 | '나' 표기 → 실제 닉네임으로 | HIGH | Agent 2 |
| 8 | 캐릭터 이름 불일치 (Ko Bujang 통일) | HIGH | Agent 2 |
| 9 | "Dev Assistant" 등 role 표시 제거 | HIGH | Agent 2 |
| 10 | 수다뉴스 말풍선 한글 (default-topics) | HIGH | Agent 2 |

### 🟡 UI/UX 개선
| # | 이슈 | 우선순위 | 담당 |
|---|------|---------|------|
| 11 | 토픽 하단 좌(보관)/우(공개) 버튼 배치 | MEDIUM | Agent 4 |
| 12 | "Public Post" → "Post" | LOW | Agent 4 |
| 13 | 캐릭터 숨기기 버튼 viewport 고정 → 화면 하단 | MEDIUM | Agent 4 |
| 14 | /my 빈 화면 버그 (안내도 안 나옴) | HIGH | Agent 3 |
| 15 | Pricing 네비 우상단 복원 | HIGH | Agent 3 |

---

## 🚀 코벤저스 4명 분배

### Agent 1 (Opus) — 핵심 기능 복구
- 수다수다 502 에러 복구
- 보관/공개 실제 저장 로직
- 보관/공개 후 자동 페이지 전환 (router.push)
- **파일**: teatime/page.tsx, ai-router.ts, chatter/route.ts

### Agent 2 (Opus) — i18n 전면 정리
- 드롭다운 "닉네임 변경" → "Change nickname"
- 끼어들기 패널 완전 i18n
- '나' → 실제 닉네임
- 캐릭터 이름 Ko Bujang/Oh Gwajang/Jem Daeri 통일
- Role 제거 ("Dev Assistant" 등)
- default-topics.ts EN 완성
- **파일**: en.ts, ko.ts, LoginButton, InterceptButton, default-topics.ts, teatime-data.ts

### Agent 3 (Sonnet) — 로그인/네비/빈상태
- 로그인 빈 pill 버그 수정 (AuthProvider loading state)
- Pricing 네비 우상단 복원 (AppShell)
- /my 빈 상태 안내 표시 버그
- **파일**: AuthProvider, LoginButton, AppShell, my/page.tsx

### Agent 4 (Sonnet) — UI 재배치
- "Public Post" → "Post" 라벨 변경
- 토픽 버튼 레이아웃 (좌: 보관, 우: 공개)
- 캐릭터 숨기기 버튼 화면 하단 고정
- **파일**: teatime/page.tsx (Agent 1과 순차), globals.css

---

## 🛑 안팀장 작업 영역 (건드리지 말 것)
- `src/app/feed/**` (routes, page)
- `src/app/pricing/**` (SubscribeButton, credits, page 자체)
- `src/components/CarouselNav.tsx`
- `src/components/FloatingCharacters.tsx`
- `src/components/InterceptCard.tsx`
- `src/components/PaymentSelector.tsx`
- `src/components/SwipeNavigator.tsx`
- `src/lib/i18n/types.ts` ← 충돌 위험, 필요하면 최소 추가만
- `src/app/api/teatime/publish/**` (안팀장이 만드는 중)

---

## ✅ 검증 계획
1. 각 Agent 완료 후 `npm run build` 통과 필수
2. 라이브 사이트 (https://interceptnews.app) 점검
3. 회의록 #14에 수정 내역 기록
4. 남은 이슈는 안팀장에게 전달

---

## 📚 관련 파일
- 메인 회의록: `docs/AnCo_Meeting.md`
- 안팀장 보조 회의록: `intercept/MEETING_MINUTES.md`, `intercept/MEETING_LOG.md`
- 세션 핸드오프: `output/SESSION_HANDOFF.md`
