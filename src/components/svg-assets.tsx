'use client'

// EggForm SVG Farm Asset Library
// Hand-crafted SVG illustrations for eggs, animals, buildings, and decorations.
// Replaces emoji usage with scalable, themeable vector art.
//
// Each component supports className for sizing and accepts animation props.

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Rarity } from '@/lib/types'

// ============================================================
// EGG — base shape with rarity-specific coloration
// ============================================================

const RARITY_PALETTES: Record<Rarity, { base: string; shadow: string; spots: string; aura: string; glow: string }> = {
  common:    { base: '#F5E6D3', shadow: '#D4B896', spots: '#C9A878', aura: 'transparent', glow: '' },
  uncommon:  { base: '#D1FAE5', shadow: '#6EE7B7', spots: '#10B981', aura: 'rgba(16,185,129,0.3)', glow: 'rarity-glow-uncommon' },
  rare:      { base: '#FEF3C7', shadow: '#FCD34D', spots: '#F59E0B', aura: 'rgba(245,158,11,0.4)', glow: 'rarity-glow-rare' },
  epic:      { base: '#E0E7FF', shadow: '#A5B4FC', spots: '#6366F1', aura: 'rgba(99,102,241,0.5)', glow: 'rarity-glow-epic' },
  legendary: { base: '#FCE7F3', shadow: '#F9A8D4', spots: '#EC4899', aura: 'rgba(236,72,153,0.6)', glow: 'rarity-glow-legendary' },
}

export function EggSvg({
  rarity = 'common',
  className,
  animate = true,
  ready = false,
}: {
  rarity?: Rarity
  className?: string
  animate?: boolean
  ready?: boolean
}) {
  const p = RARITY_PALETTES[rarity]
  return (
    <svg viewBox="0 0 100 120" className={cn(className, p.glow)} role="img" aria-label={`${rarity} egg`}>
      <defs>
        <radialGradient id={`egg-${rarity}-body`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={p.base} />
          <stop offset="60%" stopColor={p.base} />
          <stop offset="100%" stopColor={p.shadow} />
        </radialGradient>
        <radialGradient id={`egg-${rarity}-highlight`} cx="35%" cy="25%" r="25%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      {ready && p.aura !== 'transparent' && (
        <motion.circle
          cx="50" cy="60" r="50" fill={p.aura}
          animate={{ r: [45, 55, 45], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {/* Egg body */}
      <ellipse cx="50" cy="65" rx="38" ry="48" fill={`url(#egg-${rarity}-body)`} />
      {/* Spots/speckles per rarity */}
      {rarity === 'common' && (
        <>
          <circle cx="35" cy="55" r="3" fill={p.spots} opacity="0.4" />
          <circle cx="62" cy="72" r="2.5" fill={p.spots} opacity="0.4" />
          <circle cx="48" cy="85" r="2" fill={p.spots} opacity="0.4" />
        </>
      )}
      {rarity === 'uncommon' && (
        <>
          <circle cx="32" cy="60" r="4" fill={p.spots} opacity="0.5" />
          <circle cx="65" cy="55" r="3" fill={p.spots} opacity="0.5" />
          <circle cx="55" cy="80" r="5" fill={p.spots} opacity="0.5" />
        </>
      )}
      {rarity === 'rare' && (
        <>
          <path d="M30 60 Q40 50 50 60 T70 60" stroke={p.spots} strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M35 80 Q45 70 55 80 T65 80" stroke={p.spots} strokeWidth="1.5" fill="none" opacity="0.5" />
        </>
      )}
      {rarity === 'epic' && (
        <>
          <polygon points="50,45 55,55 50,65 45,55" fill={p.spots} opacity="0.7" />
          <polygon points="35,75 40,82 35,89 30,82" fill={p.spots} opacity="0.7" />
          <polygon points="68,70 72,76 68,82 64,76" fill={p.spots} opacity="0.7" />
        </>
      )}
      {rarity === 'legendary' && (
        <>
          <path d="M50 40 L55 55 L70 55 L58 65 L63 80 L50 70 L37 80 L42 65 L30 55 L45 55 Z" fill={p.spots} opacity="0.8" />
          <circle cx="50" cy="90" r="3" fill="white" opacity="0.9" />
          <circle cx="50" cy="90" r="1.5" fill={p.spots} />
        </>
      )}
      {/* Highlight */}
      <ellipse cx="38" cy="40" rx="12" ry="18" fill={`url(#egg-${rarity}-highlight)`} />
      {ready && (
        <motion.g
          animate={animate ? { opacity: [0, 1, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <text x="50" y="30" fontSize="14" textAnchor="middle">✨</text>
        </motion.g>
      )}
    </svg>
  )
}

// ============================================================
// ANIMALS — each species gets a custom SVG
// ============================================================

interface AnimalSvgProps {
  className?: string
  variant?: 'idle' | 'happy' | 'sleep'
  animate?: boolean
}

// Chicken — common farm chicken
export function ChickenSvg({ className, variant = 'idle', animate = true }: AnimalSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="chicken">
      <motion.g
        animate={animate && variant === 'idle' ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Body */}
        <ellipse cx="50" cy="60" rx="25" ry="20" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2" />
        {/* Head */}
        <circle cx="50" cy="35" r="14" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2" />
        {/* Comb (red crest) */}
        <path d="M45 22 Q42 18 45 15 Q48 18 50 14 Q52 18 55 15 Q58 18 55 22 Z" fill="#DC2626" stroke="#1F2937" strokeWidth="1" />
        {/* Beak */}
        <polygon points="62,35 70,33 70,38" fill="#F59E0B" stroke="#1F2937" strokeWidth="1" />
        {/* Wattle */}
        <path d="M55 42 Q57 47 55 50" stroke="#DC2626" strokeWidth="3" fill="none" />
        {/* Eye */}
        <circle cx="55" cy="32" r="2" fill="#1F2937" />
        <circle cx="55.5" cy="31.5" r="0.5" fill="white" />
        {/* Wings */}
        <ellipse cx="38" cy="58" rx="6" ry="10" fill="#F3F4F6" stroke="#1F2937" strokeWidth="1.5" transform="rotate(-15 38 58)" />
        <ellipse cx="62" cy="58" rx="6" ry="10" fill="#F3F4F6" stroke="#1F2937" strokeWidth="1.5" transform="rotate(15 62 58)" />
        {/* Legs */}
        <line x1="42" y1="78" x2="42" y2="88" stroke="#F59E0B" strokeWidth="2" />
        <line x1="58" y1="78" x2="58" y2="88" stroke="#F59E0B" strokeWidth="2" />
        <line x1="38" y1="88" x2="46" y2="88" stroke="#F59E0B" strokeWidth="2" />
        <line x1="54" y1="88" x2="62" y2="88" stroke="#F59E0B" strokeWidth="2" />
        {/* Tail feathers */}
        <path d="M75 60 Q85 55 85 65 Q80 65 75 70 Z" fill="#FFFFFF" stroke="#1F2937" strokeWidth="1.5" />
        {variant === 'happy' && (
          <text x="30" y="25" fontSize="14">❤️</text>
        )}
        {variant === 'sleep' && (
          <text x="48" y="22" fontSize="10" textAnchor="middle">z z</text>
        )}
      </motion.g>
    </svg>
  )
}

// Golden Chicken — rare version with golden plumage
export function GoldenChickenSvg({ className, animate = true }: AnimalSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="golden chicken">
      <motion.g
        animate={animate ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <defs>
          <radialGradient id="golden-body" cx="40%" cy="30%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="60%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
        </defs>
        {/* Body with golden gradient */}
        <ellipse cx="50" cy="60" rx="25" ry="20" fill="url(#golden-body)" stroke="#92400E" strokeWidth="2" />
        <circle cx="50" cy="35" r="14" fill="url(#golden-body)" stroke="#92400E" strokeWidth="2" />
        {/* Comb */}
        <path d="M45 22 Q42 18 45 15 Q48 18 50 14 Q52 18 55 15 Q58 18 55 22 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1" />
        {/* Beak */}
        <polygon points="62,35 70,33 70,38" fill="#F59E0B" stroke="#92400E" strokeWidth="1" />
        {/* Wattle */}
        <path d="M55 42 Q57 47 55 50" stroke="#DC2626" strokeWidth="3" fill="none" />
        {/* Eye with golden glint */}
        <circle cx="55" cy="32" r="2.5" fill="#1F2937" />
        <circle cx="55.5" cy="31.5" r="1" fill="#FCD34D" />
        {/* Sparkle */}
        <text x="32" y="22" fontSize="10">✨</text>
        <text x="68" y="48" fontSize="8">✨</text>
        {/* Wings */}
        <ellipse cx="38" cy="58" rx="6" ry="10" fill="#FBBF24" stroke="#92400E" strokeWidth="1.5" transform="rotate(-15 38 58)" />
        <ellipse cx="62" cy="58" rx="6" ry="10" fill="#FBBF24" stroke="#92400E" strokeWidth="1.5" transform="rotate(15 62 58)" />
        {/* Legs */}
        <line x1="42" y1="78" x2="42" y2="88" stroke="#92400E" strokeWidth="2" />
        <line x1="58" y1="78" x2="58" y2="88" stroke="#92400E" strokeWidth="2" />
        {/* Tail */}
        <path d="M75 60 Q85 55 85 65 Q80 65 75 70 Z" fill="url(#golden-body)" stroke="#92400E" strokeWidth="1.5" />
      </motion.g>
    </svg>
  )
}

// Phoenix — epic fire bird
export function PhoenixSvg({ className, animate = true }: AnimalSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="phoenix">
      <motion.g
        animate={animate ? { rotate: [-2, 2, -2] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ transformOrigin: '50px 50px' }}
      >
        <defs>
          <radialGradient id="phoenix-body" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#DC2626" />
          </radialGradient>
        </defs>
        {/* Body */}
        <ellipse cx="50" cy="55" rx="22" ry="25" fill="url(#phoenix-body)" stroke="#7F1D1D" strokeWidth="2" />
        {/* Head */}
        <circle cx="50" cy="30" r="12" fill="url(#phoenix-body)" stroke="#7F1D1D" strokeWidth="2" />
        {/* Beak */}
        <polygon points="50,25 45,15 55,15" fill="#FBBF24" stroke="#7F1D1D" strokeWidth="1" />
        {/* Eye — fire */}
        <circle cx="50" cy="28" r="3" fill="#1F2937" />
        <circle cx="50" cy="28" r="1.5" fill="#FBBF24" />
        {/* Wings spread wide with flame details */}
        <path d="M30 50 Q15 40 8 55 Q15 60 25 65 Z" fill="url(#phoenix-body)" stroke="#7F1D1D" strokeWidth="1.5" />
        <path d="M70 50 Q85 40 92 55 Q85 60 75 65 Z" fill="url(#phoenix-body)" stroke="#7F1D1D" strokeWidth="1.5" />
        {/* Flame plumes on wings */}
        <path d="M12 50 Q14 45 16 50" stroke="#FBBF24" strokeWidth="2" fill="none" />
        <path d="M84 50 Q86 45 88 50" stroke="#FBBF24" strokeWidth="2" fill="none" />
        {/* Tail flames */}
        <path d="M50 75 Q45 85 50 95 Q55 85 50 75" fill="#F97316" stroke="#7F1D1D" strokeWidth="1.5" />
        <path d="M42 78 Q38 88 42 95 Q48 88 44 78" fill="#FBBF24" stroke="#7F1D1D" strokeWidth="1" opacity="0.7" />
        <path d="M58 78 Q62 88 58 95 Q52 88 56 78" fill="#FBBF24" stroke="#7F1D1D" strokeWidth="1" opacity="0.7" />
        {/* Crest */}
        <path d="M50 18 Q48 12 50 8 Q52 12 50 18" fill="#FBBF24" stroke="#7F1D1D" strokeWidth="1" />
      </motion.g>
    </svg>
  )
}

// Crystal Dragon — legendary
export function CrystalDragonSvg({ className, animate = true }: AnimalSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="crystal dragon">
      <motion.g
        animate={animate ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <defs>
          <linearGradient id="dragon-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
        </defs>
        {/* Body */}
        <ellipse cx="50" cy="60" rx="28" ry="22" fill="url(#dragon-body)" stroke="#312E81" strokeWidth="2" />
        {/* Head */}
        <path d="M30 40 Q40 25 55 30 Q60 35 55 45 Q45 50 30 40 Z" fill="url(#dragon-body)" stroke="#312E81" strokeWidth="2" />
        {/* Horns */}
        <path d="M35 28 Q33 18 38 15" stroke="#FBBF24" strokeWidth="2" fill="none" />
        <path d="M48 28 Q50 18 45 15" stroke="#FBBF24" strokeWidth="2" fill="none" />
        {/* Eye — glowing */}
        <circle cx="45" cy="35" r="3" fill="#1F2937" />
        <circle cx="45" cy="35" r="1.5" fill="#A78BFA" />
        <circle cx="45.5" cy="34.5" r="0.5" fill="white" />
        {/* Wings */}
        <path d="M25 50 Q5 35 5 55 Q15 55 25 60 Z" fill="url(#dragon-body)" stroke="#312E81" strokeWidth="1.5" />
        <path d="M75 50 Q95 35 95 55 Q85 55 75 60 Z" fill="url(#dragon-body)" stroke="#312E81" strokeWidth="1.5" />
        {/* Crystal on back */}
        <polygon points="50,45 55,35 50,30 45,35" fill="#A78BFA" stroke="#312E81" strokeWidth="1.5" />
        <polygon points="50,38 55,33 50,30 45,33" fill="#FBBF24" opacity="0.6" />
        {/* Tail */}
        <path d="M70 70 Q85 75 90 65" stroke="url(#dragon-body)" strokeWidth="6" fill="none" strokeLinecap="round" />
        <polygon points="88,65 95,60 95,70" fill="#7C3AED" stroke="#312E81" strokeWidth="1" />
        {/* Crystal sparkles */}
        <text x="20" y="30" fontSize="8">✨</text>
        <text x="75" y="40" fontSize="6">✨</text>
      </motion.g>
    </svg>
  )
}

// ============================================================
// BUILDINGS
// ============================================================

export function BarnSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="barn">
      {/* Roof */}
      <polygon points="10,45 50,15 90,45" fill="#7F1D1D" stroke="#1F2937" strokeWidth="2" />
      <polygon points="10,45 50,15 50,30" fill="#991B1B" />
      {/* Body */}
      <rect x="15" y="45" width="70" height="45" fill="#DC2626" stroke="#1F2937" strokeWidth="2" />
      {/* Door */}
      <path d="M40 90 L40 65 Q50 60 60 65 L60 90 Z" fill="#7F1D1D" stroke="#1F2937" strokeWidth="1.5" />
      <line x1="50" y1="65" x2="50" y2="90" stroke="#1F2937" strokeWidth="1" />
      {/* Window */}
      <rect x="20" y="55" width="12" height="12" fill="#FEF3C7" stroke="#1F2937" strokeWidth="1.5" />
      <line x1="26" y1="55" x2="26" y2="67" stroke="#1F2937" strokeWidth="1" />
      <line x1="20" y1="61" x2="32" y2="61" stroke="#1F2937" strokeWidth="1" />
      <rect x="68" y="55" width="12" height="12" fill="#FEF3C7" stroke="#1F2937" strokeWidth="1.5" />
      <line x1="74" y1="55" x2="74" y2="67" stroke="#1F2937" strokeWidth="1" />
      <line x1="68" y1="61" x2="80" y2="61" stroke="#1F2937" strokeWidth="1" />
      {/* Hay loft cross */}
      <line x1="50" y1="15" x2="50" y2="45" stroke="#1F2937" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

export function IncubatorSvg({ className, tier = 'basic' }: { className?: string; tier?: 'basic' | 'advanced' | 'premium' | 'legendary' }) {
  const colors = {
    basic: { body: '#92400E', top: '#FBBF24', glow: '#FCD34D' },
    advanced: { body: '#7C3AED', top: '#A78BFA', glow: '#C4B5FD' },
    premium: { body: '#0891B2', top: '#06B6D4', glow: '#67E8F9' },
    legendary: { body: '#9333EA', top: '#C026D3', glow: '#F0ABFC' },
  }[tier]
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`${tier} incubator`}>
      {/* Glass dome */}
      <ellipse cx="50" cy="40" rx="32" ry="25" fill={colors.glow} opacity="0.4" />
      <ellipse cx="50" cy="40" rx="32" ry="25" fill="none" stroke={colors.top} strokeWidth="2" />
      {/* Body */}
      <rect x="18" y="40" width="64" height="40" rx="4" fill={colors.body} stroke="#1F2937" strokeWidth="2" />
      {/* Display */}
      <rect x="30" y="50" width="40" height="12" rx="2" fill="#1F2937" />
      <text x="50" y="59" fontSize="8" textAnchor="middle" fill={colors.glow}>37°C</text>
      {/* Controls */}
      <circle cx="28" cy="70" r="3" fill="#FBBF24" stroke="#1F2937" strokeWidth="1" />
      <circle cx="38" cy="70" r="3" fill="#10B981" stroke="#1F2937" strokeWidth="1" />
      <circle cx="62" cy="70" r="3" fill="#DC2626" stroke="#1F2937" strokeWidth="1" />
      <circle cx="72" cy="70" r="3" fill="#3B82F6" stroke="#1F2937" strokeWidth="1" />
      {/* Legs */}
      <rect x="22" y="80" width="4" height="10" fill={colors.body} stroke="#1F2937" strokeWidth="1" />
      <rect x="74" y="80" width="4" height="10" fill={colors.body} stroke="#1F2937" strokeWidth="1" />
      {/* Glow inside */}
      <circle cx="50" cy="35" r="6" fill={colors.glow} opacity="0.6" />
    </svg>
  )
}

export function WindmillSvg({ className, animate = true }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="windmill">
      {/* Tower */}
      <polygon points="40,90 60,90 55,30 45,30" fill="#FBBF24" stroke="#92400E" strokeWidth="2" />
      <polygon points="40,90 50,90 47,30 45,30" fill="#FCD34D" />
      {/* Door */}
      <rect x="46" y="75" width="8" height="15" fill="#7F1D1D" stroke="#1F2937" strokeWidth="1" />
      {/* Window */}
      <circle cx="50" cy="55" r="3" fill="#FEF3C7" stroke="#1F2937" strokeWidth="1" />
      {/* Blades hub */}
      <circle cx="50" cy="25" r="4" fill="#92400E" stroke="#1F2937" strokeWidth="1" />
      {/* Blades */}
      <motion.g
        animate={animate ? { rotate: 360 } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 25px' }}
      >
        <polygon points="50,25 40,5 45,25" fill="#FFFFFF" stroke="#1F2937" strokeWidth="1.5" />
        <polygon points="50,25 70,15 55,25" fill="#FFFFFF" stroke="#1F2937" strokeWidth="1.5" />
        <polygon points="50,25 60,45 55,25" fill="#FFFFFF" stroke="#1F2937" strokeWidth="1.5" />
        <polygon points="50,25 30,35 45,25" fill="#FFFFFF" stroke="#1F2937" strokeWidth="1.5" />
      </motion.g>
    </svg>
  )
}

export function TreeSvg({ className, animate = true }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="tree">
      <motion.g
        animate={animate ? { rotate: [-1, 1, -1] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 60px' }}
      >
        {/* Trunk */}
        <rect x="46" y="55" width="8" height="35" fill="#92400E" stroke="#451A03" strokeWidth="1.5" />
        {/* Branches */}
        <line x1="50" y1="65" x2="40" y2="55" stroke="#92400E" strokeWidth="2" />
        <line x1="50" y1="65" x2="60" y2="55" stroke="#92400E" strokeWidth="2" />
        {/* Foliage layers */}
        <circle cx="50" cy="35" r="22" fill="#10B981" stroke="#065F46" strokeWidth="2" />
        <circle cx="35" cy="45" r="14" fill="#34D399" stroke="#065F46" strokeWidth="1.5" />
        <circle cx="65" cy="45" r="14" fill="#34D399" stroke="#065F46" strokeWidth="1.5" />
        <circle cx="50" cy="25" r="12" fill="#6EE7B7" />
        {/* Apples */}
        <circle cx="40" cy="35" r="3" fill="#DC2626" />
        <circle cx="58" cy="40" r="3" fill="#DC2626" />
        <circle cx="48" cy="48" r="3" fill="#DC2626" />
      </motion.g>
    </svg>
  )
}

export function CropFieldSvg({ className, animate = true }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="crop field">
      {/* Soil */}
      <ellipse cx="50" cy="75" rx="40" ry="12" fill="#451A03" />
      {/* Wheat stalks */}
      {[15, 30, 45, 60, 75, 90].map((x, i) => (
        <motion.g
          key={x}
          animate={animate ? { rotate: [-2, 2, -2] } : {}}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          style={{ transformOrigin: `${x}px 80px` }}
        >
          <line x1={x} y1="80" x2={x} y2="50" stroke="#92400E" strokeWidth="1.5" />
          <ellipse cx={x} cy="48" rx="2" ry="6" fill="#FBBF24" />
          <ellipse cx={x - 2} cy="46" rx="1.5" ry="4" fill="#FCD34D" />
          <ellipse cx={x + 2} cy="46" rx="1.5" ry="4" fill="#FCD34D" />
        </motion.g>
      ))}
    </svg>
  )
}

export function PondSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="pond">
      <ellipse cx="50" cy="60" rx="40" ry="20" fill="#3B82F6" opacity="0.7" />
      <ellipse cx="50" cy="58" rx="36" ry="16" fill="#60A5FA" />
      {/* Ripples */}
      <ellipse cx="35" cy="55" rx="8" ry="3" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
      <ellipse cx="65" cy="62" rx="6" ry="2" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
      {/* Lily pads */}
      <ellipse cx="30" cy="55" rx="5" ry="3" fill="#10B981" />
      <ellipse cx="70" cy="60" rx="4" ry="2" fill="#10B981" />
      {/* Reflections */}
      <line x1="25" y1="50" x2="35" y2="50" stroke="white" strokeWidth="0.5" opacity="0.4" />
      <line x1="60" y1="65" x2="75" y2="65" stroke="white" strokeWidth="0.5" opacity="0.4" />
    </svg>
  )
}

// ============================================================
// RESOURCE ICONS — coin, gem, ticket
// ============================================================

export function CoinSvg({ className, animate = true }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="coin">
      <motion.g
        animate={animate ? { rotate: [0, 10, 0, -10, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ transformOrigin: '20px 20px' }}
      >
        <defs>
          <radialGradient id="coin-grad" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="60%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="16" fill="url(#coin-grad)" stroke="#451A03" strokeWidth="2" />
        <circle cx="20" cy="20" r="12" fill="none" stroke="#92400E" strokeWidth="1" opacity="0.5" />
        <text x="20" y="26" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#92400E">₵</text>
      </motion.g>
    </svg>
  )
}

export function GemSvg({ className, animate = true }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="gem">
      <motion.g
        animate={animate ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <defs>
          <linearGradient id="gem-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
        </defs>
        <polygon points="20,4 32,14 28,32 12,32 8,14" fill="url(#gem-grad)" stroke="#312E81" strokeWidth="1.5" />
        <polygon points="20,4 32,14 20,18 8,14" fill="#A78BFA" />
        <line x1="8" y1="14" x2="20" y2="18" stroke="#312E81" strokeWidth="1" opacity="0.5" />
        <line x1="32" y1="14" x2="20" y2="18" stroke="#312E81" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="18" x2="20" y2="32" stroke="#312E81" strokeWidth="1" opacity="0.5" />
        {/* Highlight */}
        <polygon points="14,8 18,6 20,12 16,14" fill="white" opacity="0.6" />
      </motion.g>
    </svg>
  )
}

export function TicketSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="ticket">
      <defs>
        <linearGradient id="ticket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0ABFC" />
          <stop offset="100%" stopColor="#C026D3" />
        </linearGradient>
      </defs>
      <path d="M4 12 Q4 8 8 8 L32 8 Q36 8 36 12 L36 18 Q32 18 32 22 Q32 26 36 26 L36 32 Q36 36 32 36 L8 36 Q4 36 4 32 L4 26 Q8 26 8 22 Q8 18 4 18 Z"
        fill="url(#ticket-grad)" stroke="#701A75" strokeWidth="1.5" />
      <line x1="22" y1="10" x2="22" y2="34" stroke="#701A75" strokeWidth="1" strokeDasharray="2,2" />
      <text x="13" y="25" fontSize="10" textAnchor="middle" fill="white" fontWeight="bold">★</text>
    </svg>
  )
}

// ============================================================
// DECORATIVE FARM SCENE — composed scene for landing/hero
// ============================================================

export function FarmSceneSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label="eggform farm scene">
      {/* Sky */}
      <rect width="400" height="180" fill="#DBEAFE" />
      {/* Sun */}
      <circle cx="340" cy="50" r="25" fill="#FBBF24" />
      <circle cx="340" cy="50" r="35" fill="#FBBF24" opacity="0.3" />
      {/* Clouds */}
      <g fill="white" opacity="0.8">
        <ellipse cx="80" cy="50" rx="30" ry="12" />
        <ellipse cx="100" cy="55" rx="25" ry="10" />
        <ellipse cx="180" cy="40" rx="20" ry="8" />
      </g>
      {/* Hills */}
      <ellipse cx="100" cy="200" rx="120" ry="40" fill="#86EFAC" />
      <ellipse cx="300" cy="200" rx="100" ry="35" fill="#4ADE80" />
      {/* Ground */}
      <rect y="180" width="400" height="120" fill="#10B981" />
      {/* Barn */}
      <g transform="translate(50, 110) scale(0.8)">
        <BarnSvg />
      </g>
      {/* Windmill */}
      <g transform="translate(280, 100) scale(0.7)">
        <WindmillSvg animate={true} />
      </g>
      {/* Trees */}
      <g transform="translate(20, 130) scale(0.5)">
        <TreeSvg animate={true} />
      </g>
      <g transform="translate(180, 140) scale(0.4)">
        <TreeSvg animate={true} />
      </g>
      {/* Crop field */}
      <g transform="translate(150, 200) scale(0.7)">
        <CropFieldSvg animate={true} />
      </g>
      {/* Pond */}
      <g transform="translate(240, 220) scale(0.6)">
        <PondSvg />
      </g>
      {/* Chickens roaming */}
      <g transform="translate(90, 195) scale(0.4)">
        <ChickenSvg animate={true} />
      </g>
      <g transform="translate(230, 200) scale(0.4)">
        <ChickenSvg animate={true} />
      </g>
    </svg>
  )
}
