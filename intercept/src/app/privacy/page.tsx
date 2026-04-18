import type { Metadata } from 'next'
import LegalPageShell from '@/components/LegalPageShell'

export const metadata: Metadata = {
  title: '개인정보처리방침 | Intercept',
  description: 'Intercept 개인정보처리방침입니다.',
}

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="개인정보처리방침"
      summary="Intercept는 서비스 운영과 결제 처리에 필요한 최소 범위의 개인정보만 처리합니다."
    >
      <h2>1. 수집하는 개인정보 항목</h2>
      <p>회사는 다음과 같은 정보를 수집할 수 있습니다.</p>
      <ul>
        <li>회원 식별 정보: 이메일, 로그인 식별자, 닉네임</li>
        <li>서비스 이용 정보: 이용 기록, 접속 로그, 결제 관련 상태 정보</li>
        <li>고객 문의 처리 정보: 문의 내용, 회신을 위한 연락처</li>
      </ul>

      <h2>2. 개인정보 이용 목적</h2>
      <ul>
        <li>회원 인증 및 계정 관리</li>
        <li>유료 서비스 제공 및 결제 확인</li>
        <li>서비스 품질 개선, 보안 대응, 고객 지원</li>
      </ul>

      <h2>3. 보관 및 파기</h2>
      <p>
        개인정보는 수집 및 이용 목적이 달성되면 지체 없이 파기합니다. 다만 관련 법령에 따라
        보존이 필요한 경우 해당 기간 동안 별도로 보관할 수 있습니다.
      </p>

      <h2>4. 제3자 제공 및 처리 위탁</h2>
      <p>
        회사는 서비스 운영을 위해 인증, 데이터 저장, 결제 처리, 배포 인프라 제공 사업자를
        이용할 수 있습니다. 결제 정보는 결제대행사 및 간편결제 사업자를 통해 처리되며, 회사는
        카드번호 등 민감한 결제수단 원문 정보를 직접 저장하지 않습니다.
      </p>

      <h2>5. 이용자의 권리</h2>
      <p>
        이용자는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요청할 수 있으며,
        관련 문의는 아래 이메일로 접수할 수 있습니다.
      </p>

      <h2>6. 문의처</h2>
      <p>
        개인정보 보호 관련 문의: <a href="mailto:offspace.intercept@gmail.com">offspace.intercept@gmail.com</a>
      </p>
    </LegalPageShell>
  )
}
