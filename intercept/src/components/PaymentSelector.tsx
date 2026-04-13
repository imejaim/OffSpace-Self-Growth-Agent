'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/context'

// PortOne V2 PaymentPayMethod values
type PayMethod = 'EASY_PAY' | 'CARD' | 'TRANSFER' | 'MOBILE'

interface PayMethodOption {
  id: PayMethod
  label: string
  emoji: string
  desc: string
}

const PAY_METHODS: PayMethodOption[] = [
  { id: 'EASY_PAY', label: '간편결제', emoji: '⚡', desc: '카카오페이 · 네이버페이 · 토스' },
  { id: 'CARD', label: '신용/체크카드', emoji: '💳', desc: '국내외 모든 카드' },
  { id: 'TRANSFER', label: '계좌이체', emoji: '🏦', desc: '실시간 계좌이체' },
  { id: 'MOBILE', label: '휴대폰 결제', emoji: '📱', desc: '통신사 소액결제' },
]

const CREDIT_PACKAGES = [
  { label: '10 크레딧', amount: 1000, credits: 10 },
  { label: '50 크레딧', amount: 4500, credits: 50, badge: '10% 할인' },
  { label: '100 크레딧', amount: 8000, credits: 100, badge: '20% 할인' },
]

export default function PaymentSelector() {
  const { t } = useI18n()
  const { user } = useAuth()
  const supabase = createClient()
  const userId = user?.id ?? null
  const [selectedMethod, setSelectedMethod] = useState<PayMethod>('EASY_PAY')
  const [selectedPackage, setSelectedPackage] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handlePay() {
    if (!userId) {
      setStatus('error')
      setMessage(t.auth.signInRequired || '로그인이 필요합니다.')
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
        setMessage('결제 설정 오류 — 관리자에게 문의하세요.')
        return
      }

      const requestParams: any = {
        storeId,
        paymentId,
        orderName: `Intercept ${pkg.label}`,
        totalAmount: pkg.amount,
        currency: 'KRW',
        channelKey,
        payMethod: selectedMethod,
        customer: {
          customerId: userId,
        },
        customData: { userId },
      }

      // PortOne V2: EASY_PAY uses the PG's unified selection UI when no
      // `easyPayProvider` is supplied. Passing an empty `easyPay: {}` object is
      // invalid and causes the SDK to reject the request — omit the field.

      const response = await (PortOne.requestPayment as any)(requestParams)

      if (!response || response.code) {
        setStatus('error')
        setMessage(response?.message ?? '결제가 취소되었습니다.')
        return
      }

      // Server-side verification + credit grant
      const confirmRes = await fetch('/api/payment/portone/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: response.paymentId }),
      })

      const confirmData = await confirmRes.json() as { success?: boolean; balance?: number; error?: string }

      if (!confirmRes.ok || !confirmData.success) {
        setStatus('error')
        setMessage(confirmData.error ?? '결제 확인 중 오류가 발생했습니다.')
        return
      }

      setStatus('success')
      setMessage(`${pkg.credits} 크레딧 충전 완료! 잔액: ${confirmData.balance ?? '?'} 크레딧`)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : '결제 중 오류가 발생했습니다.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-green-700">충전 완료!</p>
        <p className="mt-1 text-xs text-green-600">{message}</p>
        <button
          onClick={() => { setStatus('idle'); setMessage('') }}
          className="mt-3 text-xs text-green-700 underline underline-offset-2"
        >
          다시 충전하기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Credit package selection */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">충전 패키지</p>
        <div className="grid grid-cols-3 gap-2">
          {CREDIT_PACKAGES.map((pkg, i) => (
            <button
              key={i}
              onClick={() => setSelectedPackage(i)}
              className={[
                'relative flex flex-col items-center rounded-lg border px-3 py-3 text-center transition-all',
                selectedPackage === i
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700',
              ].join(' ')}
            >
              {pkg.badge && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-2 py-px text-[10px] font-semibold text-white whitespace-nowrap">
                  {pkg.badge}
                </span>
              )}
              <span className="text-sm font-semibold">{pkg.label}</span>
              <span className="text-xs text-zinc-500 mt-0.5">
                {(pkg.amount).toLocaleString('ko-KR')}원
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Payment method selection */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">결제 수단</p>
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
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">{method.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {status === 'error' && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-red-700 font-medium">{message}</p>
          {!userId && (
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })}
              className="shrink-0 rounded-md bg-red-100 border border-red-300 px-2.5 py-1 text-[10px] font-bold text-red-700 hover:bg-red-200 transition"
            >
              {t.auth.signIn}
            </button>
          )}
        </div>
      )}

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={status === 'loading'}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'loading'
          ? '결제 처리 중...'
          : `${CREDIT_PACKAGES[selectedPackage].amount.toLocaleString('ko-KR')}원 결제하기`}
      </button>

      <p className="text-center text-[10px] text-zinc-600">
        테스트 모드 — 실제 결제가 발생하지 않습니다
      </p>
    </div>
  )
}
