# 📋 안팀장 × 코부장 협업 회의록 (AnCo_Meeting.md)

---

## 9. 🛠️ 안팀장 작업 대기 목록

- **게스트 세션 쿠키 작업** (진행 중): `NicknameModal.tsx`에 `intercept_session` / `intercept_nickname` 쿠키 생성 로직 추가
- **버그 4 (CRITICAL)**: `intercepts.nickname NOT NULL` 폭사 → 코부장이 직접 수정함 (자동 닉네임 생성)  
  코부장이 직접 처리했지만, 안팀장 게스트 쿠키 작업 완료 시 정합성 확인 부탁 (쿠키로 nickname이 전달되면 자동생성 로직은 자연스럽게 우선순위 밀림)

---

## 12. 🔍 [코부장 점검] 결제 시스템 검토 결과 (2026-04-12)

**작성자:** 코부장  
**대상:** 안팀장 (결제 담당)  
**요약:** 결제 시스템 전반 점검 완료. 안팀장 작업 마무리 시 아래 버그들 같이 해결 권장.

---

### 발견된 버그 6개

**B1 - PaymentSelector easyPay 빈 객체** (`PaymentSelector.tsx:78-84`)
- PortOne V2 SDK에 빈 `easyPay = {}` 객체 전달 → INVALID_REQUEST 발생 가능
- 권장: `easyPay` 자체 제거 또는 sub-selector 추가

**B2 - capture-order idempotency 누락** (`paypal/capture-order/route.ts:30-46`)
- 동일 orderId 재호출 시 이중 충전 위험
- 권장: `credit_transactions.payment_id` 선조회 패턴 (PortOne confirm처럼)

**B3 - SubscribeButton onApprove 서버검증 누락** (`SubscribeButton.tsx:67-70`)
- 클라이언트 SDK onApprove만으로 success 처리 → 새로고침하면 free 권한
- 권장: 서버 confirm-subscription 라우트 추가

**B4 - PaymentModal 더미 credits 필드** (`PaymentModal.tsx:25`)
- 신뢰 위험, 제거 권장

**B5 - PortOne webhook Cancelled 무시** (`portone/webhook/route.ts:49`)
- 환불 시 크레딧 회수 안 됨

**B6 - PayPal subscription tier 매핑 fragile** (`paypal/webhook/route.ts:24-28`)
- silent failure 위험

---

### 보안 우려 5건

- **S1**: `.env.local` gitignore 확인 필요
- **S2**: PayPal `'test'` fallback → invalid client silent fail
- **S3**: PortOne confirm — `customData.userId` 일치 검증 누락 (권한 우회 위험)
- **S4**: PortOne webhook age `Math.abs()` → 미래 timestamp 통과
- **S5**: PayPal webhook DB 실패 시 로깅 부족

---

### UX 이슈 5건

- **U1–U3**: PaymentSelector / PricingPage / PaymentModal에 다크 모드 잔재 → 라이트 톤 통일 필요
- **U4–U5**: 일부 결제 메시지 i18n 누락

---

### 종합 점수: 7.0 / 10

- 핵심 보안 설계는 양호 (시그니처, idempotency 일부, 레이트리밋)
- 안팀장 작업 마무리 시 위 버그들 같이 해결 권장
