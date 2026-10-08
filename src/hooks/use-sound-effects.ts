'use client'

// Sound effects hook using Web Audio API (no audio files needed).
// Per design spec §30-37 — provides audio feedback for:
//   - egg hatch success (celebratory chime)
//   - coin collect (positive ding)
//   - level up (rising arpeggio)
//   - notification bell (gentle ping)
//   - button click (subtle tick)
//   - error (descending buzz)
//
// Mute toggle is persisted in localStorage.

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'eggform-sound-enabled'

type SoundType = 'hatch' | 'coin' | 'levelup' | 'notification' | 'click' | 'error'

export function useSoundEffects() {
  // Load mute preference from localStorage (lazy init to avoid effect cascade)
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  })
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null)

  // Persist mute preference
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, String(enabled))
  }, [enabled])

  // Lazy-init AudioContext on first user interaction
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    const init = () => {
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext
        if (Ctx && !audioCtx) {
          setAudioCtx(new Ctx())
        }
      } catch (e) {
        console.warn('[sound] AudioContext not available', e)
      }
    }
    document.addEventListener('click', init, { once: true })
    document.addEventListener('touchstart', init, { once: true })
    return () => {
      document.removeEventListener('click', init)
      document.removeEventListener('touchstart', init)
    }
  }, [enabled, audioCtx])

  const playTone = useCallback((
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.1,
    delay = 0,
  ) => {
    if (!enabled || !audioCtx) return
    try {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      const now = audioCtx.currentTime + delay

      osc.type = type
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(volume, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.start(now)
      osc.stop(now + duration)
    } catch (e) {
      // Silent fail — sound is non-critical
    }
  }, [enabled, audioCtx])

  const play = useCallback((type: SoundType) => {
    if (!enabled) return

    switch (type) {
      case 'hatch':
        // Ascending celebratory chime: C5, E5, G5, C6
        playTone(523.25, 0.15, 'sine', 0.12, 0)      // C5
        playTone(659.25, 0.15, 'sine', 0.12, 0.12)   // E5
        playTone(783.99, 0.15, 'sine', 0.12, 0.24)   // G5
        playTone(1046.50, 0.4, 'sine', 0.15, 0.36)  // C6
        break
      case 'coin':
        // Quick double ding (coin collect)
        playTone(880, 0.08, 'triangle', 0.1, 0)
        playTone(1318.51, 0.12, 'triangle', 0.1, 0.06)
        break
      case 'levelup':
        // Rising arpeggio: C5, E5, G5, C6 (longer)
        playTone(523.25, 0.1, 'square', 0.08, 0)
        playTone(659.25, 0.1, 'square', 0.08, 0.08)
        playTone(783.99, 0.1, 'square', 0.08, 0.16)
        playTone(1046.50, 0.3, 'square', 0.1, 0.24)
        break
      case 'notification':
        // Gentle ping
        playTone(880, 0.15, 'sine', 0.08, 0)
        playTone(1108.73, 0.2, 'sine', 0.06, 0.08)
        break
      case 'click':
        // Subtle tick
        playTone(200, 0.02, 'square', 0.03, 0)
        break
      case 'error':
        // Descending buzz (low priority)
        playTone(220, 0.15, 'sawtooth', 0.08, 0)
        playTone(180, 0.2, 'sawtooth', 0.08, 0.12)
        break
    }
  }, [enabled, playTone])

  const toggle = useCallback(() => setEnabled((e) => !e), [])

  return { play, enabled, toggle }
}
