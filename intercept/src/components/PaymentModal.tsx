'use client'

import { useState } from 'react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

type BuyState = 'idle' | 'loading' | 'success' | 'error'

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [buyState, setBuyState] = useState<BuyState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleBuyCredits = async () => {
    setBuyState('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/payment/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: 10, amount: '1.00' }),
      })
      const data = (await res.json()) as { orderId?: string; error?: string }
      if (!res.ok || !data.orderId) {
        throw new Error(data.error ?? 'Failed to create order')
      }
      const isSandbox = process.env.NEXT_PUBLIC_PAYPAL_MODE !== 'production'
      const checkoutBase = isSandbox
        ? 'https://www.sandbox.paypal.com/checkoutnow'
        : 'https://www.paypal.com/checkoutnow'
      window.open(`${checkoutBase}?token=${data.orderId}`, '_blank')
      setBuyState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setBuyState('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="mx-4 w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        {/* Character message */}
        <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-xs text-zinc-500 mb-1">코부장 says</p>
          <p className="text-sm text-zinc-200 leading-relaxed">
            더 많은 대화를 나누고 싶으시군요! 🐱
            <br />
            <span className="text-zinc-400">플랜을 업그레이드하거나 크레딧을 추가해보세요.</span>
          </p>
        </div>

        <h2 className="mb-4 text-base font-semibold text-white">
          Continue the conversation
        </h2>

        <div className="space-y-2.5">
          {/* Basic */}
          <a
            href="/pricing"
            className="flex items-center justify-between rounded-xl border border-amber-700/40 bg-amber-900/20 px-4 py-3 transition hover:bg-amber-900/35 hover:border-amber-600/60"
          >
            <div>
              <p className="font-semibold text-amber-300 text-sm">Upgrade to Basic</p>
              <p className="text-xs text-zinc-400 mt-0.5">150 intercepts/mo · 3 topics · save history</p>
            </div>
            <span className="text-amber-400 font-mono text-sm shrink-0 ml-3">$2.99/mo</span>
          </a>

          {/* Pro */}
          <a
            href="/pricing"
            className="flex items-center justify-between rounded-xl border border-indigo-700/40 bg-indigo-900/20 px-4 py-3 transition hover:bg-indigo-900/35 hover:border-indigo-600/60"
          >
            <div>
              <p className="font-semibold text-indigo-300 text-sm">Upgrade to Pro</p>
              <p className="text-xs text-zinc-400 mt-0.5">500 intercepts/mo · 10 topics · no ads</p>
            </div>
            <span className="text-indigo-400 font-mono text-sm shrink-0 ml-3">$8/mo</span>
          </a>

          {/* Pay-per-use */}
          <button
            onClick={handleBuyCredits}
            disabled={buyState === 'loading' || buyState === 'success'}
            className="w-full flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-left transition hover:bg-zinc-700 disabled:opacity-50"
          >
            <div>
              <p className="font-semibold text-zinc-200 text-sm">
                {buyState === 'loading'
                  ? 'Opening PayPal...'
                  : buyState === 'success'
                  ? 'PayPal opened!'
                  : 'Buy 10 intercepts'}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">No subscription · credits never expire</p>
            </div>
            <span className="text-zinc-300 font-mono text-sm shrink-0 ml-3">$1</span>
          </button>

          {buyState === 'error' && (
            <p className="text-xs text-red-400 text-center">{errorMsg}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
