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
    <section className="mb-12 overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/40 p-6 backdrop-blur-xl transition-all hover:bg-white/60 sm:p-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back()
                return
              }
              router.push(backHref)
            }}
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-coral hover:bg-white hover:text-coral"
          >
            <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
            <span>{resolvedBackLabel}</span>
          </button>

          <nav className="flex items-center gap-1 overflow-hidden rounded-full border border-zinc-200/50 bg-white/50 p-1 backdrop-blur-md">
            {[
              { href: '/teatime', label: t.nav.teatime },
              { href: '/feed', label: t.nav.feed },
              { href: '/my', label: t.nav.my }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-white/80 hover:text-coral"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="relative z-10 space-y-4">
          <Link
            href="/"
            className="inline-flex items-baseline gap-2 transition-opacity hover:opacity-80"
          >
            <span className="text-2xl font-black tracking-tighter text-[var(--color-coral)]">
              INTERCEPT
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {t.header.subtitle}
            </span>
          </Link>

          <div className="max-w-2xl">
            {eyebrow ? (
              <span className="mb-4 inline-block rounded-full bg-coral/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-coral border border-coral/20">
                {eyebrow}
              </span>
            ) : null}
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-4 text-balance text-base font-medium leading-relaxed text-zinc-600 sm:text-lg">
              {description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative gradient element to bleed into the glass */}
      <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-coral/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 -z-10 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
    </section>
  )
}
