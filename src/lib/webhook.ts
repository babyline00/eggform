// Webhook signature verification utility
// Extracted from /api/pkr/deposit/route.ts so it can be unit-tested in isolation
// without importing next/server (which requires Node.js web globals).

import crypto from 'crypto'

/**
 * Verify an HMAC SHA-256 webhook signature using timing-safe comparison.
 * Per engineering §26: must be timing-safe to prevent timing attacks.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  try {
    // timingSafeEqual requires equal-length buffers
    if (expected.length !== signature.length) return false
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

/**
 * Mask an account reference for display (e.g., "1234567890" → "****7890")
 * Used by withdrawal + deposit records to avoid leaking full account numbers in UI.
 */
export function maskAccountReference(ref: string): string {
  if (!ref || ref.length <= 4) return '****'
  return `****${ref.slice(-4)}`
}
