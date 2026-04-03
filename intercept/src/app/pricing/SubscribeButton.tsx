'use client'

import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'

// MVP placeholder — replace with a real PayPal plan ID after creating a
// Billing Plan in the PayPal Developer Dashboard.
const PLAN_ID = 'P-PLACEHOLDER_PLAN_ID'

function PayPalSubscribeInner() {
  const [{ isPending }] = usePayPalScriptReducer()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  if (status === 'success') {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 px-6 py-4 text-center">
        <p className="text-lg font-semibold text-green-700">구독 완료!</p>
        <p className="mt-1 text-sm text-green-600">{message}</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-center">
        <p className="text-lg font-semibold text-red-700">오류가 발생했어요</p>
        <p className="mt-1 text-sm text-red-600">{message}</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-3 text-sm text-red-700 underline"
        >
          다시 시도하기
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {isPending && (
        <div className="flex justify-center py-4">
          <span className="text-sm text-amber-600">결제 준비 중...</span>
        </div>
      )}
      <PayPalButtons
        style={{
          shape: 'pill',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe',
        }}
        createSubscription={(_data, actions) => {
          return actions.subscription.create({
            plan_id: PLAN_ID,
          })
        }}
        onApprove={async (data) => {
          setStatus('success')
          setMessage(
            `구독이 시작됐어요! (구독 ID: ${data.subscriptionID ?? '확인 중'})`
          )
        }}
        onError={(err) => {
          console.error('[PayPal Error]', err)
          setStatus('error')
          setMessage('결제 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.')
        }}
        onCancel={() => {
          setStatus('idle')
        }}
      />
      <p className="mt-3 text-center text-xs text-amber-500">
        샌드박스(테스트) 환경입니다 — 실제 결제가 이루어지지 않아요
      </p>
    </div>
  )
}

export default function SubscribeButton() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ''

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'USD',
        intent: 'subscription',
        vault: true,
      }}
    >
      <PayPalSubscribeInner />
    </PayPalScriptProvider>
  )
}
