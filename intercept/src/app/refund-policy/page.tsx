import type { Metadata } from 'next'
import LegalPageShell from '@/components/LegalPageShell'

export const metadata: Metadata = {
  title: '환불정책 | Intercept',
  description: 'Intercept 환불 및 취소 정책입니다.',
}

export default function RefundPolicyPage() {
  return (
    <LegalPageShell
      title="환불정책"
      summary="크레딧 결제와 구독형 결제에 대한 취소 및 환불 기준을 안내합니다."
    >
      <h2>1. 크레딧 상품</h2>
      <p>
        크레딧은 결제 완료 후 즉시 계정에 지급됩니다. 지급된 크레딧을 전혀 사용하지 않은 경우,
        결제일로부터 합리적인 기간 내 고객센터 문의를 통해 환불 가능 여부를 검토할 수 있습니다.
      </p>

      <h2>2. 사용된 크레딧</h2>
      <p>
        이미 일부 또는 전부 사용된 크레딧은 디지털 콘텐츠 제공이 개시된 것으로 보아 환불이
        제한될 수 있습니다.
      </p>

      <h2>3. 구독형 상품</h2>
      <p>
        구독 결제는 각 결제수단 및 결제대행사의 정책에 따라 해지 또는 환불이 처리될 수 있으며,
        이미 사용한 기간 또는 제공된 혜택이 있는 경우 일부 환불 또는 환불 불가가 적용될 수 있습니다.
      </p>

      <h2>4. 중복 결제 및 오류 결제</h2>
      <p>
        시스템 오류, 중복 결제, 승인 실패 후 중복 청구 등 비정상 결제는 확인 후 환불 또는
        취소 처리합니다.
      </p>

      <h2>5. 환불 문의</h2>
      <p>
        환불 요청 시 결제 일시, 결제 수단, 계정 이메일을 함께 보내주시면 확인이 빨라집니다.
        문의: <a href="mailto:offspace.intercept@gmail.com">offspace.intercept@gmail.com</a>
      </p>
    </LegalPageShell>
  )
}
