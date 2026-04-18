import Link from 'next/link'

type LegalPageShellProps = {
  title: string
  summary: string
  children: React.ReactNode
}

export default function LegalPageShell({
  title,
  summary,
  children,
}: LegalPageShellProps) {
  return (
    <main className="min-h-screen bg-white px-4 py-16 text-zinc-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm sm:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              Legal
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              Intercept
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">
            {summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link className="footer-link" href="/terms">
              이용약관
            </Link>
            <Link className="footer-link" href="/privacy">
              개인정보처리방침
            </Link>
            <Link className="footer-link" href="/refund-policy">
              환불정책
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-p:text-zinc-700 prose-li:text-zinc-700">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
