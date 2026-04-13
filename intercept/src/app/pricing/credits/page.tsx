'use client'

import PaymentSelector from '@/components/PaymentSelector'
import { useI18n } from '@/lib/i18n/context'

export default function CreditsPage() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-white text-zinc-900 px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            {t.pricing.buyCredits}
          </h1>
          <p className="text-zinc-500">
            {t.pricing.payPerUseDesc}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/30 p-8 shadow-sm">
          <PaymentSelector />
        </div>

        <div className="mt-8 text-center">
          <a
            href="/pricing"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition underline underline-offset-4"
          >
            {t.newsletter.seePricing}
          </a>
        </div>
      </div>
    </main>
  )
}
