# PortOne TossPayments Easy Pay Findings (2026-04-14)

## Source Type

- Official PortOne developer documentation
- Direct local code inspection of `intercept/src/components/PaymentSelector.tsx`
- Direct user-reported runtime error from the pricing credits page

## Verified Facts

### Official docs

From the PortOne TossPayments V2 integration page:

- For TossPayments, `payMethod: EASY_PAY` requires `easyPay.easyPayProvider`.
- Supported providers include:
  - `KAKAOPAY`
  - `NAVERPAY`
  - `TOSSPAY`
- For mobile requests, `redirectUrl` is required because TossPayments uses redirection on mobile.
- For easy pay, some methods may not work on test MID or without prior contract with TossPayments.

Official sources used:

- https://developers.portone.io/opi/ko/integration/pg/v2/tosspayments?v=v2
- https://developers.portone.io/release-notes/api-sdk/2024-01-30

### Local runtime symptom

User saw:

- `결제 창 호출에 실패하였습니다. 토스페이먼츠의 경우 간편 결제 수단은 필수 입력입니다.`

### Local root cause

Before the fix, `PaymentSelector.tsx` sent:

- `payMethod: 'EASY_PAY'`
- no `easyPay.easyPayProvider`

The file also assumed the provider could be omitted to trigger a unified picker. That assumption was stale after the PortOne January 31, 2024 behavior change.

## Local Fix Applied

`intercept/src/components/PaymentSelector.tsx` was updated to:

- add explicit easy-pay provider selection UI
- send `easyPay: { easyPayProvider }` when `payMethod === 'EASY_PAY'`
- include `redirectUrl` for mobile compatibility
- surface contract/test-MID failures with clearer operator-facing messages

## Durable Rule

- Never send `payMethod: EASY_PAY` to a TossPayments PortOne channel without `easyPay.easyPayProvider`.
- Never rely on an implicit unified easy-pay picker for TossPayments.
- Treat easy-pay enablement as both a code concern and an operations-contract concern.
