import { formatPkr, formatPkrShort, formatCoins, formatRelativeTime, formatDuration, generateReference } from '@/lib/format'

describe('format helpers', () => {
  describe('formatPkr', () => {
    it('formats paisa to PKR currency string', () => {
      expect(formatPkr(0)).toBe('Rs 0.00')
      expect(formatPkr(100)).toBe('Rs 1.00')
      expect(formatPkr(50000)).toBe('Rs 500.00')
      expect(formatPkr(2545000)).toBe('Rs 25,450.00')
    })
    it('handles negative amounts (debits)', () => {
      expect(formatPkr(-50000)).toBe('-Rs 500.00')
    })
    it('handles large amounts with thousands separator', () => {
      expect(formatPkr(100000000)).toBe('Rs 1,000,000.00')
    })
  })

  describe('formatPkrShort', () => {
    it('formats small amounts without suffix', () => {
      expect(formatPkrShort(50000)).toBe('Rs 500')
    })
    it('formats thousands with K suffix', () => {
      expect(formatPkrShort(2545000)).toMatch(/^Rs 25\.[45]K$/)
    })
    it('formats millions with M suffix', () => {
      expect(formatPkrShort(100000000)).toBe('Rs 1.00M')
    })
  })

  describe('formatCoins', () => {
    it('formats integers with thousands separator', () => {
      expect(formatCoins(0)).toBe('0')
      expect(formatCoins(1000)).toBe('1,000')
      expect(formatCoins(12450)).toBe('12,450')
    })
  })

  describe('formatRelativeTime', () => {
    it('formats seconds ago', () => {
      const recent = Date.now() - 30 * 1000
      expect(formatRelativeTime(recent)).toBe('30s ago')
    })
    it('formats minutes ago', () => {
      const tenMinAgo = Date.now() - 10 * 60 * 1000
      expect(formatRelativeTime(tenMinAgo)).toBe('10m ago')
    })
    it('formats hours ago', () => {
      const fiveHrsAgo = Date.now() - 5 * 60 * 60 * 1000
      expect(formatRelativeTime(fiveHrsAgo)).toBe('5h ago')
    })
    it('formats days ago', () => {
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000
      expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago')
    })
  })

  describe('formatDuration', () => {
    it('returns 00:00 for zero or negative', () => {
      expect(formatDuration(0)).toBe('00:00')
      expect(formatDuration(-1000)).toBe('00:00')
    })
    it('formats minutes:seconds', () => {
      expect(formatDuration(90000)).toBe('01:30')
      expect(formatDuration(150000)).toBe('02:30')
    })
    it('formats hours:minutes:seconds', () => {
      expect(formatDuration(3661000)).toBe('01:01:01')
    })
  })

  describe('generateReference', () => {
    it('generates reference with given prefix', () => {
      const ref = generateReference('DEP')
      expect(ref).toMatch(/^DEP-[A-Z0-9]+$/)
    })
    it('generates unique references', () => {
      const ref1 = generateReference('WD')
      const ref2 = generateReference('WD')
      // Uniqueness is probabilistic; with timestamp + random, near-certain
      expect(ref1).not.toBe(ref2)
    })
  })
})
