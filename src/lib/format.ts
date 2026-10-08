// Formatting helpers

export function formatPkr(paisa: number): string {
  const ruppees = paisa / 100
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(ruppees).replace(/\u00A0/g, ' ')  // normalize non-breaking spaces
}

export function formatPkrShort(paisa: number): string {
  const ruppees = paisa / 100
  if (ruppees >= 1_000_000) return `Rs ${(ruppees / 1_000_000).toFixed(2)}M`
  if (ruppees >= 1_000) return `Rs ${(ruppees / 1_000).toFixed(1)}K`
  return `Rs ${ruppees.toFixed(0)}`
}

export function formatCoins(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatRelativeTime(epoch: number): string {
  const diff = Date.now() - epoch
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return '00:00'
  const totalSec = Math.floor(ms / 1000)
  const hr = Math.floor(totalSec / 3600)
  const min = Math.floor((totalSec % 3600) / 60)
  const sec = totalSec % 60
  if (hr > 0) {
    return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function shortId(prefix: string, id: string): string {
  return `${prefix}-${id.slice(-6).toUpperCase()}`
}

export function generateReference(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`
}

export function generateCuid(): string {
  // Simple cuid-like generator for client-side (NOT for security — just unique IDs)
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 10)
  return `${ts}${rand}`.slice(0, 24)
}
