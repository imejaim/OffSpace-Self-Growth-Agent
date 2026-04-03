import SubscribeButton from './SubscribeButton'

export const metadata = {
  title: '끼어들기 요금제',
  description: '나에게 맞는 끼어들기 플랜을 선택하세요',
}

const FREE_FEATURES = [
  '하루 3회 끼어들기',
  '오늘의 대화 열람',
]

const PREMIUM_FEATURES = [
  '무제한 끼어들기',
  '대화 북마크',
  '지난 대화 검색',
  'SNS 공유 카드',
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-amber-50 px-4 py-16">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center mb-12">
        <span className="inline-block rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-600 mb-4">
          샌드박스 베타
        </span>
        <h1 className="text-4xl font-bold text-stone-800 leading-tight">
          나에게 맞는 플랜을 골라봐요 ☕
        </h1>
        <p className="mt-4 text-lg text-stone-500">
          끼어들기는 AI 대화에 내가 직접 참여하는 새로운 경험이에요.
          <br />
          무료로 시작하고, 더 필요하면 프리미엄으로 넘어오세요.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto max-w-2xl grid gap-6 sm:grid-cols-2">
        {/* Free tier */}
        <div className="flex flex-col rounded-3xl bg-white border border-stone-200 shadow-sm p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">무료</p>
            <p className="text-4xl font-bold text-stone-800">$0</p>
            <p className="text-sm text-stone-400 mt-1">영원히 무료</p>
          </div>

          <ul className="flex-1 space-y-3 mb-8">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-stone-600 text-sm">
                <span className="text-green-500 font-bold">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <a
            href="/"
            className="block w-full rounded-full border-2 border-stone-800 px-6 py-3 text-center text-sm font-semibold text-stone-800 transition hover:bg-stone-800 hover:text-white"
          >
            무료로 시작하기
          </a>
        </div>

        {/* Premium tier */}
        <div className="flex flex-col rounded-3xl bg-amber-400 shadow-md p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 rounded-full bg-white/30 px-3 py-1 text-xs font-semibold text-amber-900">
            인기
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-1">프리미엄</p>
            <p className="text-4xl font-bold text-stone-900">$2.99</p>
            <p className="text-sm text-amber-700 mt-1">매월 · 언제든 취소 가능</p>
          </div>

          <ul className="flex-1 space-y-3 mb-8">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-stone-800 text-sm">
                <span className="text-stone-900 font-bold">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <SubscribeButton />
        </div>
      </div>

      {/* Footer note */}
      <p className="mx-auto mt-12 max-w-md text-center text-xs text-stone-400">
        현재 샌드박스(테스트) 환경으로 운영됩니다. 실제 결제는 정식 출시 후 이루어집니다.
        문의: offspace@example.com
      </p>
    </main>
  )
}
