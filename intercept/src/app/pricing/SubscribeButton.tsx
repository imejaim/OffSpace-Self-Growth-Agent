'use client'

import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'

type PlanType = 'basic' | 'pro'

interface Props {
  planType: PlanType
}

function getPlanId(planType: PlanType): string {
  if (planType === 'basic') {
    return process.env.NEXT_PUBLIC_PAYPAL_BASIC_PLAN_ID || 'P-37V36463L1017411HMCK6N4I' // Sandbox default
  }
  return process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID || 'P-PRO_PLACEHOLDER'
}

function PayPalSubscribeInner({ planType }: Props) {
  const [{ isPending }] = usePayPalScriptReducer()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const planId = getPlanId(planType)

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-green-900/30 border border-green-700 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-green-400">Subscription active!</p>
        <p className="mt-1 text-xs text-green-500">{message}</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl bg-red-900/30 border border-red-700 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-red-400">Something went wrong</p>
        <p className="mt-1 text-xs text-red-500">{message}</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-2 text-xs text-red-400 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {isPending && (
        <div className="flex justify-center py-3">
          <span className="text-xs text-zinc-400">Loading payment...</span>
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
          return actions.subscription.create({ plan_id: planId })
        }}
        onApprove={async (data) => {
          setStatus('success')
          setMessage(`Subscription started! (ID: ${data.subscriptionID ?? 'confirming...'})`)
        }}
        onError={(err) => {
          console.error('[PayPal Error]', err)
          setStatus('error')
          setMessage('Payment failed. Please try again.')
        }}
        onCancel={() => {
          setStatus('idle')
        }}
      />
      <p className="mt-2 text-center text-xs text-zinc-500">
        Sandbox mode — no real charges
      </p>
    </div>
  )
}

export default function SubscribeButton({ planType }: Props) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test' // Fallback to 'test' for sandbox initialization

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'USD',
        intent: 'subscription',
        vault: true,
      }}
    >
      <div className="min-h-[150px] flex flex-col items-center">
        <PayPalSubscribeInner planType={planType} />
      </div>
    </PayPalScriptProvider>
  )
}
