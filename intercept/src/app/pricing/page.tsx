import SubscribeButton from './SubscribeButton'

export const metadata = {
  title: 'Pricing — Intercept',
  description: 'Choose the plan that fits your curiosity',
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    intercepts: '2/day (~60/mo)',
    topics: '1 topic',
    newsletter: false,
    noAds: false,
    save: false,
    badge: null,
    features: [
      '2 intercepts per day',
      '1 topic feed',
      'Daily teatime summary',
      'Ad-supported',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$2.99',
    period: '/mo',
    intercepts: '150/mo',
    topics: '3 topics',
    newsletter: '5/mo',
    noAds: false,
    save: true,
    badge: 'Recommended',
    features: [
      '150 intercepts per month',
      '3 topic feeds',
      '5 newsletters/month',
      'Saved conversations',
      'Ad-supported',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$8',
    period: '/mo',
    intercepts: '500/mo',
    topics: '10 topics',
    newsletter: 'Unlimited',
    noAds: true,
    save: true,
    badge: 'Best Value',
    features: [
      '500 intercepts per month',
      '10 topic feeds',
      'Unlimited newsletters',
      'Saved + Export',
      'No ads',
    ],
  },
]

const COMPARISON_ROWS = [
  { label: 'Intercepts', free: '2/day', basic: '150/mo', pro: '500/mo' },
  { label: 'Topic feeds', free: '1', basic: '3', pro: '10' },
  { label: 'Newsletter', free: '—', basic: '5/mo', pro: 'Unlimited' },
  { label: 'Save conversations', free: '—', basic: '✓', pro: '✓' },
  { label: 'Export', free: '—', basic: '—', pro: '✓' },
  { label: 'Ads', free: 'Yes', basic: 'Yes', pro: 'No' },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-16">
      {/* Header */}
      <div className="mx-auto max-w-4xl text-center mb-14">
        <span className="inline-block rounded-sm bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-mono uppercase tracking-widest text-zinc-400 mb-5">
          sandbox beta
        </span>
        <h1 className="text-4xl font-bold text-white leading-tight">
          Pick your plan
        </h1>
        <p className="mt-3 text-base text-zinc-400 max-w-xl mx-auto">
          Jump into AI news conversations and make your voice heard.
          Start free, upgrade when you need more.
        </p>
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
                  ? 'border-amber-500/60 bg-zinc-900 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]'
                  : isPro
                  ? 'border-zinc-600 bg-zinc-900'
                  : 'border-zinc-800 bg-zinc-900',
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
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-zinc-500 pb-0.5">{plan.period}</span>
                </div>
              </div>

              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="mt-0.5 text-zinc-500 shrink-0">—</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.id === 'free' && (
                <a
                  href="/"
                  className="block w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition"
                >
                  Start free
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
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">
              Pay-per-use
            </p>
            <p className="text-lg font-semibold text-white">$1 for 10 intercepts</p>
            <p className="text-sm text-zinc-400 mt-1">
              No subscription. Credits never expire. Discount applies when logged in.
            </p>
          </div>
          <a
            href="/pricing/credits"
            className="shrink-0 rounded-lg bg-zinc-800 border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition"
          >
            Buy credits →
          </a>
        </div>
      </div>

      {/* Feature comparison */}
      <div className="mx-auto max-w-4xl mb-14">
        <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
          Compare plans
        </h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-500 font-normal w-1/4">Feature</th>
                <th className="px-4 py-3 text-zinc-400 font-medium text-center">Free</th>
                <th className="px-4 py-3 text-amber-400 font-medium text-center">Basic</th>
                <th className="px-4 py-3 text-zinc-300 font-medium text-center">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? 'bg-zinc-900/50' : 'bg-zinc-950/30'}
                >
                  <td className="px-4 py-2.5 text-zinc-400">{row.label}</td>
                  <td className="px-4 py-2.5 text-zinc-500 text-center">{row.free}</td>
                  <td className="px-4 py-2.5 text-zinc-300 text-center">{row.basic}</td>
                  <td className="px-4 py-2.5 text-zinc-200 text-center">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <p className="mx-auto max-w-md text-center text-xs text-zinc-600">
        Currently running in sandbox (test) mode. No real charges during beta.
        Questions: offspace@example.com
      </p>
    </main>
  )
}
