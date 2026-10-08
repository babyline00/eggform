import crypto from 'crypto'
import { verifyWebhookSignature, maskAccountReference } from '@/lib/webhook'

describe('payment webhook signature verification', () => {
  const secret = 'test-webhook-secret'

  it('verifies a correct HMAC SHA-256 signature', () => {
    const payload = JSON.stringify({
      internalReference: 'DEP-TEST1',
      amount: 50000,
      currency: 'PKR',
      timestamp: new Date().toISOString(),
    })
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    expect(verifyWebhookSignature(payload, expectedSig, secret)).toBe(true)
  })

  it('rejects an incorrect signature', () => {
    const payload = '{"amount":50000}'
    const wrongSig = 'deadbeef'.repeat(8)
    expect(verifyWebhookSignature(payload, wrongSig, secret)).toBe(false)
  })

  it('rejects signature from a different secret', () => {
    const payload = '{"amount":50000}'
    const wrongSecretSig = crypto.createHmac('sha256', 'different-secret').update(payload).digest('hex')
    expect(verifyWebhookSignature(payload, wrongSecretSig, secret)).toBe(false)
  })

  it('rejects malformed signature (wrong length)', () => {
    const payload = '{"amount":50000}'
    expect(verifyWebhookSignature(payload, 'too-short', secret)).toBe(false)
  })

  it('handles empty payload', () => {
    const payload = ''
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    expect(verifyWebhookSignature(payload, sig, secret)).toBe(true)
  })

  it('is timing-safe (returns boolean, not throw)', () => {
    const payload = '{"amount":50000}'
    // Different lengths should not throw — should return false gracefully
    expect(() => verifyWebhookSignature(payload, 'a', secret)).not.toThrow()
    expect(() => verifyWebhookSignature(payload, 'a'.repeat(64), secret)).not.toThrow()
  })
})

describe('maskAccountReference', () => {
  it('masks long account references', () => {
    expect(maskAccountReference('1234567890')).toBe('****7890')
    expect(maskAccountReference('PK00EESS12345678')).toBe('****5678')
  })
  it('handles short references by returning ****', () => {
    expect(maskAccountReference('1234')).toBe('****')
    expect(maskAccountReference('123')).toBe('****')
  })
  it('handles empty string', () => {
    expect(maskAccountReference('')).toBe('****')
  })
})
