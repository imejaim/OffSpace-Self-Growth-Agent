'use client'

import SubscribeButton from './SubscribeButton'
import PaymentSelector from '@/components/PaymentSelector'
import PricingHeader from '@/components/PricingHeader'
import { useI18n } from '@/lib/i18n/context'

export default function PricingPage() {
  const { t } = useI18n()

  const PLANS = [
    {
      id: 'free' as const,
      name: t.pricing.plans.free.name,
      price: '$0',
      period: t.pricing.plans.free.period,
      badge: null as string | null,
      features: t.pricing.plans.free.features,
    },
    {
      id: 'basic' as const,
      name: t.pricing.plans.basic.name,
      price: '$2.99',
      period: t.pricing.plans.basic.period,
      badge: t.pricing.plans.basic.badge,
      features: t.pricing.plans.basic.features,
    },
    {
      id: 'pro' as const,
      name: t.pricing.plans.pro.name,
      price: '$8',
      period: t.pricing.plans.pro.period,
      badge: t.pricing.plans.pro.badge,
      features: t.pricing.plans.pro.features,
    },
  ]

  return (
    <main className="min-h-screen bg-white text-zinc-900 px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <PricingHeader
          eyebrow={t.pricing.sandboxBeta}
          title={t.pricing.pickPlan}
          description={t.pricing.pickPlanSubtitle}
          backHref="/teatime"
          backLabel={t.nav.teatime}
        />
      </div>

      {/* Plan cards */}
      <div className="mx-auto max-w-4xl grid gap-4 sm:grid-cols-3 mb-6">
        {PLANS.map((plan) => {
          const isBasic = plan.id === 'basic'
          const isPro = plan.id === 'pro'

          return (
            <div
              key={plan.id}
              className={[
                'relative flex flex-col rounded-xl border p-6 transition-all',
                isBasic
                  ? 'border-amber-400 bg-white shadow-xl shadow-amber-900/5'
                  : isPro
                  ? 'border-zinc-200 bg-white'
                  : 'border-zinc-200 bg-white',
              ].join(' ')}
            >
              {plan.badge && (
                <span
                  className={[
                    'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold',
                    isBasic
                      ? 'bg-amber-500 text-zinc-900'
                      : 'bg-zinc-600 text-zinc-100',
                  ].join(' ')}
                >
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-zinc-900">{plan.price}</span>
                  <span className="text-sm text-zinc-400 pb-0.5">{plan.period}</span>
                </div>
              </div>

              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-0.5 text-zinc-400 shrink-0">—</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.id === 'free' && (
                <a
                  href="/"
                  className="block w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition"
                >
                  {t.pricing.startFree}
                </a>
              )}
              {plan.id === 'basic' && <SubscribeButton planType="basic" />}
              {plan.id === 'pro' && <SubscribeButton planType="pro" />}
            </div>
          )
        })}
      </div>

      {/* Pay-per-use card */}
      <div className="mx-auto max-w-4xl mb-14">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1">
              {t.pricing.payPerUseLabel}
            </p>
            <p className="text-lg font-semibold text-zinc-900">{t.pricing.payPerUsePrice}</p>
            <p className="text-sm text-zinc-500 mt-1">
              {t.pricing.payPerUseDesc}
            </p>
          </div>
          <a
            href="/pricing/credits"
            className="shrink-0 rounded-lg bg-zinc-100 border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-white hover:text-zinc-900 transition shadow-sm"
          >
            {t.pricing.buyCredits}
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-4xl mb-8 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
        <p className="text-xs font-mono uppercase tracking-widest text-blue-600">
          Checkout guide
        </p>
        <div className="mt-2 grid gap-2 text-sm text-zinc-700 sm:grid-cols-3">
          <p>Subscriptions: PayPal only for now.</p>
          <p>Global credits: PayPal checkout.</p>
          <p>Korea credits: PortOne with easy pay, card, or bank transfer.</p>
        </div>
      </div>

      {/* Korean payment section */}
      <div className="mx-auto max-w-4xl mb-14">
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-6">
          <div className="mb-5">
            <span className="inline-block rounded-sm bg-zinc-200 border border-zinc-300 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">
              Korea credits
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">
              Korea credit top-up
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Domestic checkout is currently for credit top-ups, not subscriptions.
            </p>
          </div>
          <PaymentSelector />
        </div>
      </div>

      {/* Feature comparison */}
      <div className="mx-auto max-w-4xl mb-14">
        <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
          {t.pricing.compareTitle}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left px-2 sm:px-4 py-3 text-zinc-500 font-normal w-1/4">{t.pricing.feature}</th>
                <th className="px-2 sm:px-4 py-3 text-zinc-600 font-medium text-center">{t.pricing.free}</th>
                <th className="px-2 sm:px-4 py-3 text-amber-600 font-medium text-center">{t.pricing.basic}</th>
                <th className="px-2 sm:px-4 py-3 text-zinc-900 font-medium text-center">{t.pricing.pro}</th>
              </tr>
            </thead>
            <tbody>
              {t.pricing.comparisonRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? 'bg-zinc-50' : 'bg-white'}
                >
                  <td className="px-2 sm:px-4 py-2.5 text-zinc-600">{row.label}</td>
                  <td className="px-2 sm:px-4 py-2.5 text-zinc-500 text-center">{row.free}</td>
                  <td className="px-2 sm:px-4 py-2.5 text-zinc-800 text-center">{row.basic}</td>
                  <td className="px-2 sm:px-4 py-2.5 text-zinc-900 text-center">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <p className="mx-auto max-w-md text-center text-xs text-zinc-500">
        {t.pricing.sandboxNote}
      </p>
    </main>
  )
}
