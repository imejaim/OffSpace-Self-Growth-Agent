'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/context'

type PayMethod = 'EASY_PAY' | 'CARD' | 'TRANSFER' | 'MOBILE'
type EasyPayProvider = 'KAKAOPAY' | 'NAVERPAY' | 'TOSSPAY'

interface PayMethodOption {
  id: PayMethod
  label: string
  emoji: string
  desc: string
}

interface EasyPayOption {
  id: EasyPayProvider
  label: string
  hint: string
}

const PAY_METHODS: PayMethodOption[] = [
  { id: 'EASY_PAY', label: '간편결제', emoji: '⚡', desc: '카카오페이 · 네이버페이 · 토스페이' },
  { id: 'CARD', label: '신용/체크카드', emoji: '💳', desc: '국내외 모든 카드' },
  { id: 'TRANSFER', label: '계좌이체', emoji: '🏦', desc: '실시간 계좌이체' },
  { id: 'MOBILE', label: '휴대폰 결제', emoji: '📱', desc: '통신사 소액결제' },
]

const EASY_PAY_OPTIONS: EasyPayOption[] = [
  { id: 'KAKAOPAY', label: '카카오페이', hint: 'KAKAOPAY' },
  { id: 'NAVERPAY', label: '네이버페이', hint: 'NAVERPAY' },
  { id: 'TOSSPAY', label: '토스페이', hint: 'TOSSPAY' },
]

const CREDIT_PACKAGES = [
  { label: '10 크레딧', amount: 1000, credits: 10 },
  { label: '50 크레딧', amount: 4500, credits: 50, badge: '10% 할인' },
  { label: '100 크레딧', amount: 8000, credits: 100, badge: '20% 할인' },
]

function getFriendlyPortOneError(rawMessage: string): string {
  if (
    rawMessage.includes('easyPayProvider') ||
    rawMessage.includes('간편 결제 수단은 필수 입력')
  ) {
    return '간편결제는 결제사 선택이 필요합니다. 카카오페이, 네이버페이, 토스페이 중 하나를 선택해 주세요.'
  }

  if (
    rawMessage.includes('PAY_PROCESS_ABORTED') ||
    rawMessage.includes('계약된 결제수단') ||
    rawMessage.includes('계약')
  ) {
    return '현재 채널에서 해당 간편결제가 아직 활성화되지 않았습니다. 테스트 MID 또는 실상점 계약 상태를 확인해 주세요.'
  }

  if (rawMessage.includes('redirectUrl')) {
    return '모바일 결제를 위해 redirectUrl 설정이 필요합니다.'
  }

  return rawMessage
}

export default function PaymentSelector() {
  const { t } = useI18n()
  const { user } = useAuth()
  const supabase = createClient()
  const userId = user?.id ?? null

  const [selectedMethod, setSelectedMethod] = useState<PayMethod>('EASY_PAY')
  const [selectedEasyPay, setSelectedEasyPay] = useState<EasyPayProvider>('KAKAOPAY')
  const [selectedPackage, setSelectedPackage] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handlePay() {
    if (!userId) {
      setStatus('error')
      setMessage(t.auth.signInRequired || '로그인이 필요합니다.')
      return
    }

    if (selectedMethod === 'EASY_PAY' && !selectedEasyPay) {
      setStatus('error')
      setMessage('간편결제사는 필수입니다. 카카오페이, 네이버페이, 토스페이 중 하나를 선택해 주세요.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const PortOne = (await import('@portone/browser-sdk/v2')).default
      const pkg = CREDIT_PACKAGES[selectedPackage]
      const paymentId = `portone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? ''
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? ''

      if (!storeId || !channelKey) {
        setStatus('error')
        setMessage('결제 설정이 누락되었습니다. 관리자에게 문의해 주세요.')
        return
      }

      const requestParams: Record<string, unknown> = {
        storeId,
        paymentId,
        orderName: `Intercept ${pkg.label}`,
        totalAmount: pkg.amount,
        currency: 'KRW',
        channelKey,
        payMethod: selectedMethod,
        locale: 'KO_KR',
        redirectUrl: `${window.location.origin}/pricing/credits`,
        customer: {
          customerId: userId,
        },
        customData: {
          userId,
          credits: pkg.credits,
          amount: pkg.amount,
          payMethod: selectedMethod,
          easyPayProvider: selectedMethod === 'EASY_PAY' ? selectedEasyPay : null,
        },
      }

      if (selectedMethod === 'EASY_PAY') {
        requestParams.easyPay = {
          easyPayProvider: selectedEasyPay,
        }
      }

      const response = await (PortOne.requestPayment as (params: Record<string, unknown>) => Promise<any>)(requestParams)

      if (!response || response.code) {
        setStatus('error')
        setMessage(
          getFriendlyPortOneError(response?.message ?? '결제가 취소되었거나 결제창 호출에 실패했습니다.')
        )
        return
      }

      const confirmRes = await fetch('/api/payment/portone/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: response.paymentId }),
      })

      const confirmData = (await confirmRes.json()) as {
        success?: boolean
        balance?: number
        error?: string
      }

      if (!confirmRes.ok || !confirmData.success) {
        setStatus('error')
        setMessage(confirmData.error ?? '결제 확인 중 오류가 발생했습니다.')
        return
      }

      setStatus('success')
      setMessage(`${pkg.credits} 크레딧 충전 완료. 현재 잔액 ${confirmData.balance ?? '?'} 크레딧`)
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : '결제 중 오류가 발생했습니다.'
      setStatus('error')
      setMessage(getFriendlyPortOneError(rawMessage))
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-green-700">충전 완료</p>
        <p className="mt-1 text-xs text-green-600">{message}</p>
        <button
          onClick={() => {
            setStatus('idle')
            setMessage('')
          }}
          className="mt-3 text-xs text-green-700 underline underline-offset-2"
        >
          다시 충전하기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-mono uppercase tracking-widest text-zinc-400">충전 패키지</p>
        <div className="grid grid-cols-3 gap-2">
          {CREDIT_PACKAGES.map((pkg, index) => (
            <button
              key={pkg.label}
              onClick={() => setSelectedPackage(index)}
              className={[
                'relative flex flex-col items-center rounded-lg border px-3 py-3 text-center transition-all',
                selectedPackage === index
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700',
              ].join(' ')}
            >
              {pkg.badge ? (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-2 py-px text-[10px] font-semibold text-white whitespace-nowrap">
                  {pkg.badge}
                </span>
              ) : null}
              <span className="text-sm font-semibold">{pkg.label}</span>
              <span className="mt-0.5 text-xs text-zinc-500">{pkg.amount.toLocaleString('ko-KR')}원</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-mono uppercase tracking-widest text-zinc-400">결제 수단</p>
        <div className="grid grid-cols-2 gap-2">
          {PAY_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={[
                'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all',
                selectedMethod === method.id
                  ? 'border-zinc-400 bg-zinc-50 text-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700',
              ].join(' ')}
            >
              <span className="text-base leading-none">{method.emoji}</span>
              <div>
                <p className="text-xs font-medium leading-none">{method.label}</p>
                <p className="mt-0.5 text-[10px] leading-none text-zinc-500">{method.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedMethod === 'EASY_PAY' ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">간편결제사 선택</p>
              <p className="mt-1 text-xs text-zinc-500">
                토스페이먼츠 채널은 간편결제 호출 시 결제사를 함께 보내야 합니다.
              </p>
            </div>
            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-zinc-500">
              EASY_PAY
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {EASY_PAY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedEasyPay(option.id)}
                className={[
                  'rounded-xl border px-3 py-3 text-left transition-all',
                  selectedEasyPay === option.id
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900',
                ].join(' ')}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-1 text-[11px] text-zinc-500">{option.hint}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-red-700">{message}</p>
            {selectedMethod === 'EASY_PAY' ? (
              <p className="text-[11px] text-red-600">
                테스트 모드에서도 provider 누락은 실패합니다. 또 일부 간편결제는 실상점 계약이 없으면 호출 또는 승인에 실패할 수 있습니다.
              </p>
            ) : null}
          </div>
          {!userId ? (
            <button
              onClick={() =>
                supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                })
              }
              className="shrink-0 rounded-md border border-red-300 bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700 transition hover:bg-red-200"
            >
              {t.auth.signIn}
            </button>
          ) : null}
        </div>
      ) : null}

      <button
        onClick={handlePay}
        disabled={status === 'loading'}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'loading'
          ? '결제 처리 중...'
          : `${CREDIT_PACKAGES[selectedPackage].amount.toLocaleString('ko-KR')}원 결제하기`}
      </button>

      <div className="space-y-1 text-center text-[10px] text-zinc-600">
        <p>테스트 모드에서는 실제 결제가 발생하지 않습니다.</p>
        {selectedMethod === 'EASY_PAY' ? (
          <p>간편결제는 테스트 MID와 실상점 계약 상태에 따라 일부 수단이 제한될 수 있습니다.</p>
        ) : null}
      </div>
    </div>
  )
}
