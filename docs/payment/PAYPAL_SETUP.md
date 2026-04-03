# PayPal 결제 연동 가이드 — Offspace Self Growth Agent

**작성일**: 2026-04-03
**작성자**: 안팀장
**대상 독자**: 코부장 (이어서 작업할 담당자)
**원본 프로젝트**: `14_beyond-un-myeong` (Un-Myeong 운명)

---

## 1. 현재 상태 요약

| 항목 | 상태 | 비고 |
|------|:----:|------|
| PayPal 비즈니스 계정 | ✅ 보유 | 실 계정 (프로덕션용) |
| 샌드박스 Client ID | ✅ 발급완료 | `.env` 참조 |
| 샌드박스 Client Secret | ✅ 발급완료 | `.dev.vars` 또는 서버 환경변수로 관리 |
| Live(프로덕션) 키 | ✅ 발급완료 | 동일 키 사용 가능 (이전 프로젝트에서 PAYPAL_MODE=production 설정됨) |
| 서버사이드 코드 (paypal.ts) | ✅ 작성완료 | `reference/paypal.ts` 참조 |
| 프론트엔드 컴포넌트 (PayPalCheckout.tsx) | ✅ 작성완료 | `reference/PayPalCheckout.tsx` 참조 |
| **실제 결제 테스트** | ❌ 미완료 | 이전 프로젝트에서도 미완 |
| **이 프로젝트 적용** | ❌ 미적용 | 이 문서를 보고 연동 진행 |

---

## 2. PayPal REST API 연동 구조

```
[사용자 브라우저]
      │
      ▼
┌─────────────────────┐
│  PayPalCheckout.tsx  │  ← @paypal/react-paypal-js 사용
│  (프론트엔드)        │     VITE_PAYPAL_CLIENT_ID 필요
└──────┬──────────────┘
       │ 1) createOrder → fetch("/api/orders/create")
       │ 2) onApprove  → fetch("/api/orders/capture")
       ▼
┌─────────────────────┐
│  서버사이드 Worker   │  ← Cloudflare Worker / Node.js / etc.
│  (paypal.ts 헬퍼)    │     PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET 필요
└──────┬──────────────┘
       │ REST API 호출
       ▼
┌─────────────────────┐
│  PayPal REST API     │
│  api-m.paypal.com    │  (프로덕션)
│  api-m.sandbox.      │  (테스트)
│    paypal.com        │
└─────────────────────┘
```

### API 엔드포인트 요약

| 용도 | 메서드 | URL |
|------|--------|-----|
| Access Token 발급 | POST | `{BASE}/v1/oauth2/token` |
| 주문 생성 (Create Order) | POST | `{BASE}/v2/checkout/orders` |
| 주문 캡처 (Capture) | POST | `{BASE}/v2/checkout/orders/{id}/capture` |

- **Sandbox BASE**: `https://api-m.sandbox.paypal.com`
- **Production BASE**: `https://api-m.paypal.com`

---

## 3. 환경변수

### 클라이언트 사이드 (`.env`)

```bash
# PayPal 클라이언트 ID (프론트엔드에서 PayPal SDK 로드 시 사용)
VITE_PAYPAL_CLIENT_ID="AZxjYNov4WYHJArJuqyuWcMD7IwEeBdYI1J2_57iDknpRC4pVTR0nHlle4GqoScVB_8XcSs5cagCx72h"
```

### 서버 사이드 (`.dev.vars` 또는 서버 환경변수)

```bash
# ⚠️ 절대 클라이언트에 노출하지 말 것
PAYPAL_CLIENT_ID="AZxjYNov4WYHJArJuqyuWcMD7IwEeBdYI1J2_57iDknpRC4pVTR0nHlle4GqoScVB_8XcSs5cagCx72h"
PAYPAL_CLIENT_SECRET="EDbvMmbK7sEJ6_bbAcyeFbQ38m-gjC5e6ovYmqqkxwQoNyh0veqDeXG3-goZ2IH2EeMP9xubbOLTI6Vh"
PAYPAL_MODE="sandbox"  # "production" 으로 변경하면 실 결제
```

> **주의**: `PAYPAL_MODE`를 `production`으로 설정하면 실제 돈이 이동합니다.
> 반드시 sandbox에서 테스트를 완료한 후 전환하세요.

---

## 4. 코드 파일 설명

### 4-1. `reference/paypal.ts` — 서버사이드 헬퍼

| 함수 | 역할 |
|------|------|
| `getPayPalApiBase(env)` | `PAYPAL_MODE`에 따라 sandbox/production URL 반환 |
| `generateAccessToken(clientId, clientSecret, apiBase)` | OAuth 2.0 Client Credentials로 Access Token 발급 |

**사용법** (Cloudflare Worker 예시):

```typescript
import { getPayPalApiBase, generateAccessToken } from './_shared/paypal';

// 주문 생성 API
export async function onRequestPost(context) {
  const { env } = context;
  const apiBase = getPayPalApiBase(env);
  const accessToken = await generateAccessToken(
    env.PAYPAL_CLIENT_ID,
    env.PAYPAL_CLIENT_SECRET,
    apiBase
  );

  const response = await fetch(`${apiBase}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: "USD", value: "10.00" }
      }]
    }),
  });

  return new Response(JSON.stringify(await response.json()), {
    headers: { "Content-Type": "application/json" }
  });
}
```

### 4-2. `reference/PayPalCheckout.tsx` — 프론트엔드 컴포넌트

- `@paypal/react-paypal-js` 패키지 사용
- `PayPalScriptProvider` + `PayPalButtons` 조합
- `createOrder` → 서버 API(`/api/orders/create`) 호출
- `onApprove` → 서버 API(`/api/orders/capture`) 호출
- 에러 핸들링 및 결제 상태 메시지 표시 포함

**필요 패키지**:

```bash
npm install @paypal/react-paypal-js
```

---

## 5. 이 프로젝트에 적용하기 — 코부장 TODO

### Phase 1: 기본 셋업 (30분)

- [ ] 1. 이 프로젝트의 프레임워크 결정 (Vite+React? Next.js? 기타?)
- [ ] 2. `npm install @paypal/react-paypal-js` 실행
- [ ] 3. `.env` 파일 루트에 생성 (이 폴더에 이미 템플릿 있음)
- [ ] 4. `.gitignore`에 `.env`, `.dev.vars` 확인

### Phase 2: 서버사이드 구현 (1시간)

- [ ] 5. 백엔드 구조 결정 (Cloudflare Workers? Firebase Functions? Node Express?)
- [ ] 6. `reference/paypal.ts` 기반으로 서버사이드 API 구현
    - `POST /api/orders/create` — 주문 생성
    - `POST /api/orders/capture` — 결제 캡처
- [ ] 7. 서버 환경변수에 `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` 설정

### Phase 3: 프론트엔드 연동 (1시간)

- [ ] 8. `reference/PayPalCheckout.tsx` 참조하여 결제 컴포넌트 생성
- [ ] 9. 결제 금액·통화·상품명을 Offspace에 맞게 수정
- [ ] 10. 결제 완료 후 사용자 플로우 연결 (감사 페이지, 서비스 해제 등)

### Phase 4: 테스트 및 프로덕션 전환

- [ ] 11. **Sandbox 테스트** — PayPal Developer에서 테스트 계정 생성 후 결제 플로우 검증
    - https://developer.paypal.com/dashboard/accounts
    - 테스트 구매자 이메일/비밀번호로 로그인하여 결제
- [ ] 12. 결제 성공/실패/취소 모든 케이스 확인
- [ ] 13. `PAYPAL_MODE`를 `production`으로 변경
- [ ] 14. 실제 소액($1) 결제 테스트 후 환불 처리

---

## 6. PayPal Developer 대시보드 접속 정보

| 항목 | URL |
|------|-----|
| **Developer Dashboard** | https://developer.paypal.com/dashboard |
| **Sandbox Accounts** | https://developer.paypal.com/dashboard/accounts |
| **REST API Apps** | https://developer.paypal.com/dashboard/applications |
| **공식 문서** | https://developer.paypal.com/docs/checkout |

---

## 7. 이전 프로젝트(`14_beyond-un-myeong`) 참조 경로

| 파일 | 경로 | 설명 |
|------|------|------|
| PayPal 서버 헬퍼 | `c:\Project\14_beyond-un-myeong\functions\_shared\paypal.ts` | Access Token 발급 |
| PayPal 프론트 컴포넌트 | `c:\Project\14_beyond-un-myeong\src\components\PayPalCheckout.tsx` | React 결제 버튼 |
| API 연동 가이드 | `c:\Project\14_beyond-un-myeong\docs\api-integration-guide.md` | 전체 API 가이드 |
| 작업 현황 | `c:\Project\14_beyond-un-myeong\docs\work-items.md` | PayPal Track 2-1 DONE |
| .env (클라이언트) | `c:\Project\14_beyond-un-myeong\.env` | VITE_PAYPAL_CLIENT_ID |
| .dev.vars (서버) | `c:\Project\14_beyond-un-myeong\.dev.vars` | PAYPAL_CLIENT_SECRET |

---

## 8. 알려진 이슈 및 주의사항

1. **실제 결제 미테스트**: 이전 프로젝트에서 sandbox까지만 완료. 프로덕션 결제는 한 번도 실행하지 않음
2. **PAYPAL_MODE**: `.dev.vars`에 `production`으로 설정되어 있으나, 실제 프로덕션 테스트는 미수행
3. **금액 하드코딩**: `PayPalCheckout.tsx`에서 $10.00이 하드코딩됨 → Offspace 상품에 맞게 변경 필요
4. **한국 원화(KRW)**: PayPal은 KRW 결제를 지원하지만, 정산은 USD로 됨. 한국 사용자용은 포트원/토스 권장
5. **Webhook**: 주문 상태 업데이트를 서버에서 수신하려면 PayPal Webhook 설정 필요 (현재 미구현)

---

*이 문서는 코부장이 읽고 바로 작업을 이어갈 수 있도록 작성되었습니다.*
*질문이 있으면 안팀장에게 문의하세요.*
