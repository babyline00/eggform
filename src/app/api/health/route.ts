// GET /api/health — System health check
// Returns status of all critical dependencies.
//
// Per engineering §19 (Observability) — health checks are mandatory for production.

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'down' | 'degraded'; latencyMs?: number; error?: string }> = {}
  let overallStatus: 'ok' | 'degraded' | 'down' = 'ok'

  // 1. Database check
  try {
    const start = Date.now()
    await db.$queryRaw`SELECT 1`
    checks.database = { status: 'ok', latencyMs: Date.now() - start }
  } catch (e: any) {
    checks.database = { status: 'down', error: e.message }
    overallStatus = 'down'
  }

  // 2. Real-time service check
  try {
    const start = Date.now()
    const res = await fetch('http://localhost:3001/health', { signal: AbortSignal.timeout(2000) })
    if (res.ok) {
      const data = await res.json()
      checks.realtime = { status: 'ok', latencyMs: Date.now() - start, ...(data as any) }
    } else {
      checks.realtime = { status: 'degraded', error: `HTTP ${res.status}` }
      overallStatus = 'degraded'
    }
  } catch (e: any) {
    checks.realtime = { status: 'down', error: 'service unavailable' }
    overallStatus = 'degraded'
  }

  // 3. Worker service check
  try {
    const start = Date.now()
    const res = await fetch('http://localhost:3002/health', { signal: AbortSignal.timeout(2000) })
    if (res.ok) {
      const data = await res.json()
      checks.worker = { status: 'ok', latencyMs: Date.now() - start, ...(data as any) }
    } else {
      checks.worker = { status: 'degraded', error: `HTTP ${res.status}` }
      overallStatus = 'degraded'
    }
  } catch (e: any) {
    checks.worker = { status: 'down', error: 'service unavailable' }
    overallStatus = 'degraded'
  }

  // 4. Build info
  checks.build = {
    status: 'ok' as const,
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  }

  const statusCode = overallStatus === 'ok' ? 200 : overallStatus === 'degraded' ? 200 : 503
  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  }, { status: statusCode })
}
