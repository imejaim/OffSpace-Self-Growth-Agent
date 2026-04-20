'use client'

import Link from 'next/link'
import PayPalCreditsButton from '@/components/PayPalCreditsButton'
import PaymentSelector from '@/components/PaymentSelector'
import PricingHeader from '@/components/PricingHeader'
import { useI18n } from '@/lib/i18n/context'

export default function CreditsPage() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-white text-zinc-900 px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <PricingHeader
          title={t.pricing.buyCredits}
          description={t.pricing.payPerUseDesc}
          backHref="/pricing"
          backLabel={t.newsletter.seePricing}
        />

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Global checkout
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900">PayPal credits</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Buy 10 credits for $1 with PayPal. Best for users outside Korea.
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              This is a one-time credit purchase, not a recurring subscription.
            </p>
          </div>
          <PayPalCreditsButton />
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/30 p-8 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Korea checkout
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900">PortOne credits</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Top up credits with KakaoPay, NaverPay, TossPay, card, or bank transfer.
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              Korean checkout is currently available for credits only.
            </p>
          </div>
          <PaymentSelector />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition underline underline-offset-4"
          >
            {t.newsletter.seePricing}
          </Link>
        </div>
      </div>
    </main>
  )
}
