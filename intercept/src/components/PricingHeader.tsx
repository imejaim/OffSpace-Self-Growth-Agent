'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'

type PricingHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  backHref?: string
  backLabel?: string
}

export default function PricingHeader({
  eyebrow,
  title,
  description,
  backHref = '/pricing',
  backLabel,
}: PricingHeaderProps) {
  const router = useRouter()
  const { t } = useI18n()

  const resolvedBackLabel = backLabel ?? t.newsletter.seePricing

  return (
    <section className="mb-10 rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back()
                return
              }
              router.push(backHref)
            }}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
          >
            <span aria-hidden="true">←</span>
            <span>{resolvedBackLabel}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/teatime"
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
            >
              {t.nav.teatime}
            </Link>
            <Link
              href="/feed"
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
            >
              {t.nav.feed}
            </Link>
            <Link
              href="/my"
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
            >
              {t.nav.my}
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-baseline gap-2 text-decoration-none"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-xl font-black tracking-[-0.04em] text-[var(--color-coral)]">
              INTERCEPT
            </span>
            <span className="text-xs font-medium text-zinc-500">
              {t.header.subtitle}
            </span>
          </Link>

          <div>
            {eyebrow ? (
              <span className="mb-3 inline-block rounded-sm border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-mono uppercase tracking-widest text-zinc-500">
                {eyebrow}
              </span>
            ) : null}
            <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">{description}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
