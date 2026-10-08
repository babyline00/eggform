// Redis Client Adapter for EggForm
// Uses in-memory fallback for development when Redis is not available.
// In production, set REDIS_URL and the adapter uses ioredis.
//
// Per engineering §8 (Caching Strategy):
//   - Browser Cache → CDN → Application Cache (Redis) → Database
//   - Used for: session cache, rate limiting, socket.io adapter, BullMQ queue

import type { RedisOptions } from 'ioredis'

// Cache entry with TTL
interface CacheEntry<T> {
  value: T
  expiresAt: number | null  // epoch ms, null = no expiry
}

// In-memory cache fallback (single-instance only)
const memoryCache = new Map<string, CacheEntry<any>>()

// Lazy-loaded ioredis client
let redisClient: any = null
let initAttempted = false

async function getRedisClient() {
  if (initAttempted) return redisClient
  initAttempted = true

  if (typeof window !== 'undefined') return null  // never on client
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) return null

  try {
    const IORedis = (await import('ioredis')).default
    const options: RedisOptions = {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => Math.min(times * 100, 2000),
    }
    redisClient = new IORedis(redisUrl, options)
    redisClient.on('error', (e: Error) => {
      console.warn('[redis] connection error:', e.message)
    })
    redisClient.on('connect', () => {
      console.log('[redis] connected')
    })
    return redisClient
  } catch (e: any) {
    console.warn('[redis] not available, using in-memory cache:', e.message)
    return null
  }
}

/**
 * Get a cached value by key.
 * Returns null if not found or expired.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  // Try Redis first
  const client = await getRedisClient()
  if (client) {
    try {
      const value = await client.get(key)
      return value ? JSON.parse(value) as T : null
    } catch (e: any) {
      console.warn('[redis] get error:', e.message)
    }
  }

  // Fallback to in-memory
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry.value as T
}

/**
 * Set a cached value with optional TTL (seconds).
 * TTL of 0 or undefined means no expiry.
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  // Try Redis first
  const client = await getRedisClient()
  if (client) {
    try {
      const serialized = JSON.stringify(value)
      if (ttlSeconds && ttlSeconds > 0) {
        await client.setex(key, ttlSeconds, serialized)
      } else {
        await client.set(key, serialized)
      }
      return
    } catch (e: any) {
      console.warn('[redis] set error:', e.message)
    }
  }

  // Fallback to in-memory
  memoryCache.set(key, {
    value,
    expiresAt: ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
  })
}

/**
 * Delete a cached value by key.
 */
export async function cacheDel(key: string): Promise<void> {
  const client = await getRedisClient()
  if (client) {
    try {
      await client.del(key)
    } catch (e: any) {
      console.warn('[redis] del error:', e.message)
    }
  }
  memoryCache.delete(key)
}

/**
 * Increment a counter (atomic in Redis).
 * Used for rate limiting (per-IP counters).
 */
export async function cacheIncr(key: string, ttlSeconds?: number): Promise<number> {
  const client = await getRedisClient()
  if (client) {
    try {
      const count = await client.incr(key)
      if (count === 1 && ttlSeconds) {
        await client.expire(key, ttlSeconds)
      }
      return count
    } catch (e: any) {
      console.warn('[redis] incr error:', e.message)
    }
  }

  // Fallback to in-memory
  const entry = memoryCache.get(key)
  const count = (entry?.value as number || 0) + 1
  memoryCache.set(key, {
    value: count,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  })
  return count
}

/**
 * Rate limit check using Redis (or in-memory fallback).
 * Returns { allowed, count, limit, resetAt }.
 *
 * Per engineering §10: rate limits on auth, deposit, withdrawal, KYC endpoints.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; count: number; limit: number; resetAt: number }> {
  const count = await cacheIncr(key, windowSeconds)
  const allowed = count <= limit
  const resetAt = Date.now() + windowSeconds * 1000
  return { allowed, count, limit, resetAt }
}

/**
 * Cache key helpers — namespaced + consistent.
 */
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userWallet: (userId: string) => `user:${userId}:wallet`,
  eggTypes: 'catalog:egg-types',
  animalTypes: 'catalog:animal-types',
  missions: 'catalog:missions',
  marketplaceListings: (page: number) => `marketplace:listings:p${page}`,
  leaderboard: (eventId: string) => `event:${eventId}:leaderboard`,
  rateLimit: (ip: string, endpoint: string) => `rate-limit:${ip}:${endpoint}`,
}
