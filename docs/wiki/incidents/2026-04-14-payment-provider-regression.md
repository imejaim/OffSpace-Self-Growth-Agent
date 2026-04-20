# 2026-04-14 Payment Provider Regression

## Summary

The Korean credits purchase flow failed on the public pricing surface because the TossPayments PortOne V2 channel was called with `payMethod: EASY_PAY` but without the required `easyPay.easyPayProvider`.

In parallel, the PayPal subscription surface still had a separate configuration hazard: missing plan IDs could fall through to placeholders instead of failing closed.

## Symptom

- Credits page error:
  - `결제 창 호출에 실패하였습니다. 토스페이먼츠의 경우 간편 결제 수단은 필수 입력입니다.`
- PayPal subscription button could appear available even when production plan setup was incomplete.

## Impact

- Korean credit purchases could fail before the checkout window opened.
- Users were forced to debug provider behavior the UI should have expressed directly.
- Operators could misread PayPal as healthy even when subscription plan wiring was incomplete.

## Root Causes

1. The PortOne integration encoded outdated platform behavior.
   - The client assumed TossPayments would open a unified easy-pay picker when `easyPayProvider` was omitted.
   - PortOne changed this behavior in the 2024-01-31 update: omission now returns an error.

2. The payment UI hid provider-level truth from the user.
   - The UI offered a generic "간편결제" button.
   - The actual PG channel needed a specific provider such as `KAKAOPAY`, `NAVERPAY`, or `TOSSPAY`.

3. PayPal subscription setup did not fail closed.
   - Missing plan IDs were able to fall back to placeholders.
   - This created a false sense that PayPal was fully configured.

## Fixes Applied

- Added an explicit easy-pay provider selector in `intercept/src/components/PaymentSelector.tsx`.
- Sent `easyPay: { easyPayProvider }` for TossPayments easy-pay requests.
- Added `redirectUrl` to support TossPayments mobile redirection requirements.
- Improved runtime messages to distinguish:
  - missing provider parameters
  - contract/test-MID restrictions
- Added `/api/payment/paypal/config` and updated the subscription button to fail closed when PayPal client or plan configuration is incomplete.

## Prevention Rules

- Payment UI must not abstract away provider-specific requirements if the gateway requires them.
- Payment pages must fail closed on missing configuration, never with placeholder production values.
- Official payment provider behavior changes must be promoted into `docs/raw/` and `docs/wiki/` when they affect checkout semantics.
- Pricing UX must keep a clear escape path back to core product surfaces so the user never gets trapped inside a failed checkout.

## Related Pages

- [Payment And Operations Model](../architecture/payment-and-operations-model.md)
- [Local-First Development Workflow](../architecture/local-first-development.md)
