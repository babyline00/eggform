// Next.js middleware — security headers + rate limiting
// Implements engineering §10 (Security headers) and §10 (rate limits on abuse-prone endpoints).

import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limiter (production: use Redis)
// Key: IP+path -> { count, windowStart }
const rateLimit = new Map<string, { count: number; windowStart: number }>()

const RATE_LIMITS: Record<string, { windowMs: number; max: number }> = {
  '/api/auth': { windowMs: 60_000, max: 5 },         // 5 auth attempts per minute
  '/api/pkr/deposit': { windowMs: 60_000, max: 10 },
  '/api/pkr/withdraw': { windowMs: 60_000, max: 3 }, // 3 withdrawal requests per minute
  '/api/kyc/upload': { windowMs: 3_600_000, max: 3 }, // 3 KYC uploads per hour
  '/api/eggs': { windowMs: 60_000, max: 30 },
  '/api/marketplace': { windowMs: 60_000, max: 30 },
}

function checkRateLimit(req: NextRequest, pathname: string): { allowed: boolean; remaining: number; resetAt: number } {
  // Find matching rule
  let matchedKey: string | null = null
  for (const key of Object.keys(RATE_LIMITS)) {
    if (pathname.startsWith(key)) {
      matchedKey = key
      break
    }
  }
  if (!matchedKey) return { allowed: true, remaining: -1, resetAt: 0 }

  const rule = RATE_LIMITS[matchedKey]
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const limitKey = `${ip}:${matchedKey}`
  const now = Date.now()

  let entry = rateLimit.get(limitKey)
  if (!entry || now - entry.windowStart > rule.windowMs) {
    entry = { count: 0, windowStart: now }
    rateLimit.set(limitKey, entry)
  }
  entry.count += 1
  const remaining = Math.max(0, rule.max - entry.count)
  const resetAt = entry.windowStart + rule.windowMs

  // Clean up old entries periodically
  if (rateLimit.size > 1000) {
    for (const [k, v] of rateLimit) {
      if (now - v.windowStart > rule.windowMs) rateLimit.delete(k)
    }
  }

  return { allowed: entry.count <= rule.max, remaining, resetAt }
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // --- Security Headers (engineering §10) ---
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)')
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  // Content-Security-Policy — adjust to your app's needs; strict-ish default
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js requires these in dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss: http://localhost:3001 http://localhost:3002",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
  )

  // --- Rate limiting (only on API routes) ---
  const pathname = req.nextUrl.pathname
  if (pathname.startsWith('/api/')) {
    const result = checkRateLimit(req, pathname)
    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMITS[Object.keys(RATE_LIMITS).find((k) => pathname.startsWith(k))!]?.max || 0),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetAt),
          },
        },
      )
    }
    res.headers.set('X-RateLimit-Remaining', String(result.remaining))
    res.headers.set('X-RateLimit-Reset', String(result.resetAt))
  }

  return res
}

export const config = {
  // Run middleware on all routes except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg).*)'],
}
