# PayPal 결제 및 구독 연동 완료 가이드

이 프로젝트(Intercept News Service)의 페이팔 연동 작업이 완료되었습니다. 백엔드 API, 프런트엔드 결제 버튼, 1회성 크레딧 충전 및 정기 구독 로직이 모두 데이터베이스(Supabase)와 연결되었습니다.

## 1. 연동 요약

| 항목 | 상태 | 비고 |
|------|:----:|------|
| **환경 변수 동기화** | ✅ 완료 | `.env` 파일 내 명칭 통일 및 자리표시자 확보 |
| **1회성 크레딧 결제** | ✅ 완료 | `$1 = 10 credits` 자동 충전 로직 포함 |
| **정기 구독 (Basic/Pro)** | ✅ 완료 | PayPal Billing Plan 연동 및 상태 자동 업데이트 |
| **웹훅(Webhook) 처리** | ✅ 완료 | 결제 성공, 구독 취소/정지 실시간 반영 |
| **DB 스키마 검증** | ✅ 완료 | `profiles`, `credit_transactions` 테이블 연동 확인 |

---

## 2. API 엔드포인트 정보

| 엔드포인트 | Method | 설명 |
|------------|:------:|------|
| `/api/payment/paypal/config` | GET | 클라이언트용 Client ID 및 플랜 ID 로드 |
| `/api/payment/paypal/create-order` | POST | 1회성 결제 주문 생성 |
| `/api/payment/paypal/capture-order` | POST | 1회성 결제 승인 및 크레딧 지급 |
| `/api/payment/paypal/create-subscription` | POST | 정기 구독 시작 및 승인 URL 생성 |
| `/api/payment/paypal/webhook` | POST | 페이팔 이벤트(구독 취소 등) 수신 |

---

## 3. ★ 중요: 대표님께서 직접 하셔야 할 최종 설정 (Last 5%)

코드는 모두 준비되었습니다. 이제 페이팔 대시보드에서 다음 3가지를 완료하고 생성된 ID를 `.env`에 붙여넣으시면 즉시 상용 서비스가 가능합니다.

### 3-1. 정기 구독 플랜(Billing Plans) 생성
구독형 상품을 판매하기 위해 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/subscriptions)에서 플랜을 생성해야 합니다.
1. `Basic` ($2.99/mo) 및 `Pro` ($8.00/mo) 플랜을 각각 생성합니다.
2. 생성된 **Plan ID**를 복사하여 `.env`의 `PAYPAL_BASIC_PLAN_ID`, `PAYPAL_PRO_PLAN_ID`에 넣습니다.

### 3-2. 웹훅(Webhook) 등록
구독 취소 등의 상태를 사이트에 바로 반영하기 위해 웹훅 등록이 필요합니다.
1. [REST API Apps](https://developer.paypal.com/dashboard/applications)에서 본인의 앱을 선택합니다.
2. **Add Webhook** 클릭 후 아래 정보를 입력합니다:
   - **URL**: `https://interceptnews.app/api/payment/paypal/webhook` (또는 실제 운영 도메인)
   - **Event Types**: 
     - `BILLING.SUBSCRIPTION.ACTIVATED`
     - `BILLING.SUBSCRIPTION.CANCELLED`
     - `BILLING.SUBSCRIPTION.SUSPENDED`
     - `PAYMENT.SALE.COMPLETED`
3. 생성된 **Webhook ID**를 `.env`의 `PAYPAL_WEBHOOK_ID`에 넣습니다.

---

## 4. 라이브(Live) 전환 방법

현재는 테스트 모드(`PAYPAL_MODE=sandbox`)입니다. 실제 결제를 받으시려면:
1. `.env`에서 `PAYPAL_MODE=production`으로 변경합니다.
2. `Live`용 Client ID와 Secret Key를 발급받아 환경 변수에 업데이트합니다. (현재는 Sandbox 키가 들어가 있을 수 있음)
3. **Plan ID**와 **Webhook ID**도 Live용으로 새로 발급받아 교체해야 합니다.

---

*작성: Antigravity AI (Pair Programming)*
