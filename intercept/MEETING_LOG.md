# 📁 INTERCEPT 기술 검토 회의록 (MEETING_LOG.md)

**일시:** 2026-04-12
**참석자:** 코부장 (Tech Lead), Antigravity (AI Assistant)
**주제:** 배포 환경 기능 복구 및 게스트 모드(끼어들기) 통합 검토

---

## 1. 🛑 현안 분석 (코부장의 날카로운 지적)

- **문제점 1: 유령 게스트 현상**  
  현재 `NicknameModal`은 로컬 스토리지에만 닉네임을 저장함. 배포 환경(SSR/Edge)에서는 서버가 이 정보를 읽을 수 없어 API 호출 시 권한 오류나 세션 누락이 발생함.
- **문제점 2: 랜딩 페이지 접근성**  
  비로그인 사용자가 서비스를 체험할 '입구'가 없음. '끼어들기' 버튼이 실종되어 신규 유저 이탈율이 높음.
- **문제점 3: API 안정성**  
  배포 환경의 CORS나 인프라 차이로 인해 `chatter` API가 간헐적으로 거부될 수 있는 구조임.

## 2. 💡 해결 방안 (코부장 권고안)

- **[Architecture]** 닉네임 설정 시 브라우저 쿠키(`intercept_session`, `intercept_nickname`)를 강제 생성하여 서버 API(`getSessionInfo`)가 즉시 인지하게 할 것.
- **[UI]** `page.tsx` Hero 섹션에 '끼어들기' 버튼을 명시적으로 배치하고, `LoginButton`의 모달 로직을 공유할 것.
- **[Cleanup]** `auth-helpers.ts`에서 쿠키/세션 추출 로직을 더 견고하게 다듬을 것.

## 3. ✅ 액션 아이템

- [ ] `NicknameModal.tsx`: 쿠키 생성 로직 추가.
- [ ] `page.tsx`: '끼어들기만 할래요' 버튼 추가 및 모달 연동.
- [ ] `auth-helpers.ts`: 쿠키 기반 게스트 세션 추출 로직 강화.
- [ ] `translations.json`: 누락된 버튼 라벨 추가.

---
*코부장 한마디: "눈에 보이는 버튼만 달지 말고, 데이터가 흐르는 배관부터 제대로 연결해!"*
