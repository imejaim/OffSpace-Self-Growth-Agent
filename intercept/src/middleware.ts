import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// MODIFIED: proxy.ts → middleware.ts 변환 (Cloudflare Edge Runtime 호환)
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the auth session — keeps cookies alive
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Refresh the Supabase session for page navigations only.
    // Exclusions — none of these need (or want) auth cookie refresh:
    //   - _next/static, _next/image, favicon, common image extensions: static assets
    //   - robots.txt, sitemap.xml, manifest.json: crawler / PWA metadata
    //   - api/cron/*: Cloudflare cron triggers, no user context
    //   - api/payment/paypal/webhook, api/payment/portone/webhook: external webhooks
    //   - api/*: App Router API routes use `createClient()` from `@/lib/supabase/server`,
    //     which refreshes the session on its own via the Next cookies() API. Running
    //     the middleware on API requests just duplicates that work and multiplies
    //     backend fanout — which was the trigger for the 2026-04-14 Cloudflare
    //     daily-limit incident. Keep the middleware on page navigations only.
    '/((?!api/|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}
