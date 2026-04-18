'use client'

import { useEffect, useState } from 'react'
import {
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js'

type PlanType = 'basic' | 'pro'

interface Props {
  planType: PlanType
}

interface PayPalConfig {
  clientId: string | null
  mode: 'sandbox' | 'production' | string
  plans: {
    basic: string | null
    pro: string | null
  }
}

function PayPalSubscribeInner({
  planId,
  mode,
}: {
  planId: string
  mode: string
}) {
  const [{ isPending }] = usePayPalScriptReducer()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-green-50 border border-green-300 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-green-700">Subscription active!</p>
        <p className="mt-1 text-xs text-green-600">{message}</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-red-700">Something went wrong</p>
        <p className="mt-1 text-xs text-red-600">{message}</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-2 text-xs text-red-600 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {isPending && status === 'idle' && (
        <div className="flex justify-center py-3">
          <span className="text-xs text-zinc-500">Loading payment...</span>
        </div>
      )}

      <button
        type="button"
        disabled={isPending || status === 'loading'}
        onClick={async () => {
          setStatus('loading')
          setMessage('')

          try {
            const res = await fetch('/api/payment/paypal/create-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ planId }),
            })
            const data = (await res.json()) as {
              subscriptionId?: string
              approvalUrl?: string | null
              error?: string
            }

            if (!res.ok || !data.subscriptionId) {
              throw new Error(data.error ?? 'Failed to create PayPal subscription')
            }

            if (data.approvalUrl) {
              window.location.href = data.approvalUrl
              return
            }

            setStatus('success')
            setMessage(`Subscription started! (ID: ${data.subscriptionId})`)
          } catch (err) {
            console.error('[PayPal Subscription Error]', {
              planId,
              mode,
              error: err,
            })
            setStatus('error')
            setMessage(
              err instanceof Error ? err.message : 'Payment failed. Verify the PayPal plan ID and try again.'
            )
          }
        }}
        className="w-full rounded-full bg-[#ffc439] px-4 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#f2ba36] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'loading' ? 'Opening PayPal...' : 'Subscribe with PayPal'}
      </button>

      <p className="mt-2 text-center text-xs text-zinc-500">
        Subscription checkout runs with PayPal.
      </p>
      <p className="mt-2 text-center text-xs text-zinc-400">
        {mode === 'production' ? 'Live mode' : 'Sandbox mode - no real charges'}
      </p>
    </div>
  )
}

export default function SubscribeButton({ planType }: Props) {
  const [config, setConfig] = useState<PayPalConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadConfig() {
      try {
        const res = await fetch('/api/payment/paypal/config', { cache: 'no-store' })
        const data = (await res.json()) as PayPalConfig
        if (!res.ok) {
          throw new Error('Failed to load PayPal configuration')
        }
        if (!cancelled) {
          setConfig(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PayPal configuration')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadConfig()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-[150px] flex items-center justify-center">
        <span className="text-xs text-zinc-500">Loading payment...</span>
      </div>
    )
  }

  if (error || !config?.clientId) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-red-700">PayPal is not configured</p>
        <p className="mt-1 text-xs text-red-600">
          {error ?? 'Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID.'}
        </p>
      </div>
    )
  }

  const planId = config.plans[planType]
  if (!planId) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-amber-700">Plan setup required</p>
        <p className="mt-1 text-xs text-amber-600">
          Missing PayPal plan ID for the {planType} plan.
        </p>
      </div>
    )
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: config.clientId,
        currency: 'USD',
        intent: 'subscription',
        vault: true,
      }}
    >
      <div className="min-h-[150px] flex flex-col items-center">
        <PayPalSubscribeInner planId={planId} mode={config.mode} />
      </div>
    </PayPalScriptProvider>
  )
}
