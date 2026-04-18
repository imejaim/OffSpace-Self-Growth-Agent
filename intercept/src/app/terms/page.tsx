import type { Metadata } from 'next'
import LegalPageShell from '@/components/LegalPageShell'

export const metadata: Metadata = {
  title: '이용약관 | Intercept',
  description: 'Intercept 서비스 이용약관입니다.',
}

export default function TermsPage() {
  return (
    <LegalPageShell
      title="이용약관"
      summary="Intercept 서비스 이용 시 적용되는 기본 이용 조건, 결제 및 계정 운영 원칙을 안내합니다."
    >
      <h2>1. 서비스 소개</h2>
      <p>
        Intercept는 사용자가 관심 주제를 설정하면 AI 기반으로 개인화된 뉴스 브리프와
        대화형 콘텐츠를 제공하는 웹 서비스입니다.
      </p>

      <h2>2. 계정과 이용 자격</h2>
      <p>
        사용자는 로그인 후 서비스를 이용할 수 있으며, 계정 정보는 본인이 직접 관리해야
        합니다. 타인의 계정을 무단으로 사용하거나 서비스 운영을 방해하는 행위는 금지됩니다.
      </p>

      <h2>3. 유료 서비스와 크레딧</h2>
      <p>
        서비스는 구독형 상품과 크레딧 충전형 상품을 함께 운영할 수 있습니다. 충전된
        크레딧은 결제 완료 후 즉시 지급되며, 서비스 내 지정된 기능 사용에 차감될 수 있습니다.
      </p>

      <h2>4. 결제 처리</h2>
      <p>
        결제는 외부 결제대행사 및 간편결제 사업자를 통해 처리됩니다. 사용자는 실제 결제 전
        결제수단, 금액, 상품 내용을 다시 확인해야 합니다.
      </p>

      <h2>5. 금지 행위</h2>
      <ul>
        <li>서비스를 불법적 목적으로 사용하는 행위</li>
        <li>비정상적인 접근, 자동화 남용, 시스템 공격 또는 우회 시도</li>
        <li>타인의 권리나 개인정보를 침해하는 콘텐츠를 생성하거나 유통하는 행위</li>
      </ul>

      <h2>6. 서비스 변경 및 중단</h2>
      <p>
        운영상 필요에 따라 서비스 기능, 가격, 제공 범위는 변경될 수 있습니다. 중요한
        변경이 있는 경우 서비스 화면 또는 별도 공지 수단을 통해 안내합니다.
      </p>

      <h2>7. 책임 제한</h2>
      <p>
        회사는 천재지변, 외부 결제사 장애, 통신 장애 등 불가항력 사유로 인한 서비스 중단에
        대해 관련 법령 범위 내에서 책임을 제한할 수 있습니다.
      </p>

      <h2>8. 문의</h2>
      <p>
        서비스 및 결제 문의는 <a href="mailto:offspace.intercept@gmail.com">offspace.intercept@gmail.com</a>
        으로 접수할 수 있습니다.
      </p>
    </LegalPageShell>
  )
}
