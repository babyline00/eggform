// POST /api/jobs — Enqueue a background job to the worker service.
// Forwards to mini-services/worker-service on port 3002.
//
// Example body:
//   { "type": "send_notification", "payload": { userId, type, title, message } }

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { type, payload, dedupeKey, maxAttempts, timeout } = body

    if (!type) {
      return NextResponse.json({ error: 'Missing job type' }, { status: 400 })
    }

    // Forward to worker service (port 3002) — uses XTransformPort query param per fullstack-dev skill
    const res = await fetch('http://localhost:3002/jobs?XTransformPort=3002', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload, dedupeKey, maxAttempts, timeout }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Worker service error', detail: err }, { status: res.status })
    }

    const job = await res.json()
    return NextResponse.json(job, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/jobs] error:', e)
    return NextResponse.json({ error: 'Internal error', detail: e.message }, { status: 500 })
  }
}

export async function GET() {
  // Forward to worker service stats
  try {
    const res = await fetch('http://localhost:3002/stats?XTransformPort=3002', {
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Worker unavailable' }, { status: 503 })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Worker service down' }, { status: 503 })
  }
}
