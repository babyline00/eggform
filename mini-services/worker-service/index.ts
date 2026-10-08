// EggForm Background Worker Service (port 3002)
//
// In-memory job queue + processor (production: replace with BullMQ + Redis).
//
// Per §67 of the engineering standards, background workers handle:
//   - Egg formation completion checks
//   - Production cycle generation
//   - Mission resets (daily/weekly)
//   - Notification delivery (via realtime-service HTTP emit)
//   - Cleanup jobs (expired listings, stale sessions)
//   - Report generation
//
// Each job has:
//   - unique/job ID
//   - retry policy (max 3 attempts)
//   - timeout (30s)
//   - status (queued | processing | completed | failed)
//   - error details
//   - idempotency strategy (dedupe by job key)

import { createServer } from 'http'

const PORT = 3002
const REALTIME_URL = 'http://localhost:3001'

// ============================================================
// IN-MEMORY JOB QUEUE (production: BullMQ + Redis)
// ============================================================

type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'
type JobType =
  | 'check_egg_formation'
  | 'generate_production'
  | 'reset_daily_missions'
  | 'send_notification'
  | 'cleanup_expired_listings'
  | 'cleanup_stale_sessions'
  | 'generate_report'

interface Job {
  id: string
  type: JobType
  payload: any
  status: JobStatus
  attempts: number
  maxAttempts: number
  timeout: number
  createdAt: number
  startedAt?: number
  completedAt?: number
  error?: string
  dedupeKey?: string
}

const queue: Job[] = []
const processing = new Set<string>()
const completed: Job[] = []
const failed: Job[] = []

let workerRunning = false

function generateJobId(): string {
  return `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function enqueueJob(type: JobType, payload: any, opts: { maxAttempts?: number; timeout?: number; dedupeKey?: string } = {}): Job {
  // Idempotency check — skip if same dedupeKey already queued
  if (opts.dedupeKey) {
    const existing = queue.find((j) => j.dedupeKey === opts.dedupeKey && j.status === 'queued')
    if (existing) {
      console.log(`[worker] dedupe skip: ${opts.dedupeKey}`)
      return existing
    }
  }
  const job: Job = {
    id: generateJobId(),
    type,
    payload,
    status: 'queued',
    attempts: 0,
    maxAttempts: opts.maxAttempts || 3,
    timeout: opts.timeout || 30000,
    createdAt: Date.now(),
    dedupeKey: opts.dedupeKey,
  }
  queue.push(job)
  console.log(`[worker] enqueued ${type} (${job.id})`)
  return job
}

async function processJob(job: Job): Promise<void> {
  console.log(`[worker] processing ${job.type} (${job.id})`)
  switch (job.type) {
    case 'check_egg_formation':
      await checkEggFormation(job.payload)
      break
    case 'generate_production':
      await generateProduction(job.payload)
      break
    case 'reset_daily_missions':
      await resetDailyMissions()
      break
    case 'send_notification':
      await sendNotification(job.payload)
      break
    case 'cleanup_expired_listings':
      await cleanupExpiredListings()
      break
    case 'cleanup_stale_sessions':
      await cleanupStaleSessions()
      break
    case 'generate_report':
      await generateReport(job.payload)
      break
    default:
      throw new Error(`Unknown job type: ${job.type}`)
  }
}

// ============================================================
// JOB PROCESSORS
// ============================================================

async function checkEggFormation(payload: { eggId: string; userId: string }) {
  // In production: query DB for egg, check if formation_end <= now, if so mark ready
  // and emit notification via realtime-service
  console.log(`[worker] checking formation for egg ${payload.eggId}`)
  // Simulate the egg being ready
  await emitNotification(payload.userId, 'egg_ready', '🥚 Egg Ready!', 'Your egg is ready to hatch.')
}

async function generateProduction(payload: { animalId: string; userId: string }) {
  console.log(`[worker] generating production for animal ${payload.animalId}`)
  await emitNotification(payload.userId, 'production_ready', '🐔 Production Ready', 'Your animals have produced new resources.')
}

async function resetDailyMissions() {
  console.log('[worker] resetting daily missions for all users')
  // Production: UPDATE user_missions SET progress=0, status='active' WHERE mission.type='daily'
}

async function sendNotification(payload: { userId: string; type: string; title: string; message: string }) {
  await emitNotification(payload.userId, payload.type, payload.title, payload.message)
}

async function cleanupExpiredListings() {
  console.log('[worker] cleaning up expired marketplace listings')
  // Production: UPDATE marketplace_listings SET status='expired' WHERE expires_at < NOW() AND status='active'
}

async function cleanupStaleSessions() {
  console.log('[worker] cleaning up stale sessions')
  // Production: DELETE FROM sessions WHERE expires_at < NOW() AND revoked_at IS NULL
}

async function generateReport(payload: { reportType: string; userId?: string }) {
  console.log(`[worker] generating ${payload.reportType} report`)
  // Production: query DB, generate CSV/PDF, upload to S3, send email
}

// ============================================================
// HELPERS
// ============================================================

async function emitNotification(userId: string, type: string, title: string, message: string) {
  // Forward to realtime-service via HTTP (since they're separate processes)
  // In production: use Redis pub/sub
  try {
    const res = await fetch(`${REALTIME_URL}/?XTransformPort=3001`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'emit_to_user', payload: { userId, type, title, message } }),
    })
    if (!res.ok) console.warn(`[worker] realtime emit failed: ${res.status}`)
  } catch (e) {
    // Silent fail — worker should be resilient to realtime-service being down
    console.warn('[worker] realtime service unavailable, skipping notification')
  }
}

async function runWorker() {
  if (workerRunning) return
  workerRunning = true

  while (queue.length > 0) {
    const job = queue.shift()!
    if (processing.has(job.id)) continue
    processing.add(job.id)

    job.status = 'processing'
    job.startedAt = Date.now()
    job.attempts += 1

    try {
      // Race against timeout
      await Promise.race([
        processJob(job),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Job timeout')), job.timeout)),
      ])
      job.status = 'completed'
      job.completedAt = Date.now()
      completed.push(job)
      console.log(`[worker] ✓ ${job.type} (${job.id}) completed`)
    } catch (e: any) {
      job.error = e.message
      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff (capped)
        const backoff = Math.min(1000 * 2 ** (job.attempts - 1), 10000)
        console.log(`[worker] retrying ${job.type} (${job.id}) in ${backoff}ms (attempt ${job.attempts + 1}/${job.maxAttempts})`)
        job.status = 'queued'
        setTimeout(() => {
          queue.push(job)
          processing.delete(job.id)
        }, backoff)
      } else {
        job.status = 'failed'
        job.completedAt = Date.now()
        failed.push(job)
        console.error(`[worker] ✗ ${job.type} (${job.id}) failed permanently: ${e.message}`)
        processing.delete(job.id)
      }
      // Even if failed, remove from processing after backoff
      setTimeout(() => processing.delete(job.id), 100)
      continue
    }
    processing.delete(job.id)
  }

  workerRunning = false
}

// ============================================================
// SCHEDULED JOBS
// ============================================================

// Check egg formations every 30 seconds
setInterval(() => {
  // In production: query DB for eggs WHERE status='incubating' AND formation_ends_at <= NOW()
  // For demo: just enqueue a sample
}, 30000)

// Reset daily missions at midnight
setInterval(() => {
  const now = new Date()
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    enqueueJob('reset_daily_missions', {}, { dedupeKey: `daily-${now.toDateString()}` })
  }
}, 60000)

// Cleanup expired listings every hour
setInterval(() => {
  enqueueJob('cleanup_expired_listings', {}, { dedupeKey: `cleanup-listings-${new Date().getHours()}` })
}, 3600000)

// Cleanup stale sessions every hour
setInterval(() => {
  enqueueJob('cleanup_stale_sessions', {}, { dedupeKey: `cleanup-sessions-${new Date().getHours()}` })
}, 3600000)

// Process queue every second
setInterval(() => {
  if (queue.length > 0 && !workerRunning) {
    runWorker().catch((e) => console.error('[worker] runner error:', e))
  }
}, 1000)

// ============================================================
// HTTP API (for submitting jobs from main backend)
// ============================================================

const httpServer = createServer(async (req, res) => {
  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      service: 'eggform-worker',
      port: PORT,
      queue: { pending: queue.length, processing: processing.size, completed: completed.length, failed: failed.length },
      uptime: process.uptime(),
    }))
    return
  }

  // Enqueue job
  if (req.url === '/jobs' && req.method === 'POST') {
    try {
      const body = await new Promise<string>((resolve) => {
        let data = ''
        req.on('data', (chunk) => (data += chunk))
        req.on('end', () => resolve(data))
      })
      const { type, payload, maxAttempts, timeout, dedupeKey } = JSON.parse(body)
      if (!type) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Missing type' }))
        return
      }
      const job = enqueueJob(type, payload || {}, { maxAttempts, timeout, dedupeKey })
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ job }))
      return
    } catch (e: any) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: e.message }))
      return
    }
  }

  // Get queue stats
  if (req.url === '/stats' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      queue: queue.length,
      processing: processing.size,
      completed: completed.length,
      failed: failed.length,
      lastCompleted: completed.slice(-5),
      lastFailed: failed.slice(-5),
    }))
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

httpServer.listen(PORT, () => {
  console.log(`⚙️  EggForm Background Worker running on port ${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   Enqueue: POST http://localhost:${PORT}/jobs`)
  console.log(`   Stats: http://localhost:${PORT}/stats`)
})

process.on('SIGINT', () => {
  console.log('[worker] shutting down...')
  httpServer.close()
  process.exit(0)
})
