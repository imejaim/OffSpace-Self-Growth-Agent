'use client'

import { useEffect, useState } from 'react'
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js'

type PayPalConfig = {
  clientId: string | null
  mode: 'sandbox' | 'production' | string
}

function PayPalCreditsInner({ mode }: { mode: string }) {
  const [{ isPending }] = usePayPalScriptReducer()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  return (
    <div className="w-full">
      {status === 'success' ? (
        <div className="mb-3 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-green-700">Credits added</p>
          <p className="mt-1 text-xs text-green-600">{message}</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-red-700">PayPal checkout failed</p>
          <p className="mt-1 text-xs text-red-600">{message}</p>
        </div>
      ) : null}

      {isPending ? (
        <div className="flex justify-center py-3">
          <span className="text-xs text-zinc-500">Loading PayPal...</span>
        </div>
      ) : null}

      <PayPalButtons
        style={{
          shape: 'pill',
          color: 'gold',
          layout: 'vertical',
          label: 'paypal',
        }}
        createOrder={async () => {
          const res = await fetch('/api/payment/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: '1.00' }),
          })
          const data = (await res.json()) as { orderId?: string; error?: string }
          if (!res.ok || !data.orderId) {
            throw new Error(data.error ?? 'Failed to create PayPal order')
          }
          return data.orderId
        }}
        onApprove={async (data) => {
          const orderId = data.orderID
          if (!orderId) {
            setStatus('error')
            setMessage('Missing PayPal order ID.')
            return
          }

          const res = await fetch('/api/payment/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          })
          const payload = (await res.json()) as {
            success?: boolean
            credits?: number
            balance?: number
            error?: string
          }

          if (!res.ok || !payload.success) {
            setStatus('error')
            setMessage(payload.error ?? 'Failed to capture PayPal order.')
            return
          }

          setStatus('success')
          setMessage(
            `${payload.credits ?? 10} credits added. Current balance ${payload.balance ?? '?'} credits.`
          )
        }}
        onCancel={() => {
          setStatus('idle')
          setMessage('')
        }}
        onError={(err: unknown) => {
          setStatus('error')
          setMessage(err instanceof Error ? err.message : 'Unexpected PayPal error.')
        }}
      />

      <p className="mt-2 text-center text-xs text-zinc-500">
        Global credit checkout for users outside Korea.
      </p>
      <p className="mt-2 text-center text-xs text-zinc-400">
        {mode === 'production' ? 'Live mode' : 'Sandbox mode - no real charges'}
      </p>
    </div>
  )
}

export default function PayPalCreditsButton() {
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
      <div className="min-h-[120px] flex items-center justify-center">
        <span className="text-xs text-zinc-500">Loading payment...</span>
      </div>
    )
  }

  if (error || !config?.clientId) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-red-700">PayPal is not configured</p>
        <p className="mt-1 text-xs text-red-600">
          {error ?? 'Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID.'}
        </p>
      </div>
    )
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: config.clientId,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <PayPalCreditsInner mode={config.mode} />
    </PayPalScriptProvider>
  )
}
