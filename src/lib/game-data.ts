// EggForm — Static game data (mirrors admin-managed content)
// In production these live in DB; for the MVP we ship sensible defaults.

import type {
  EggType,
  AnimalType,
  Mission,
  Incubator,
} from './types'

export const EGG_TYPES: EggType[] = [
  {
    id: 'egg-basic',
    slug: 'basic',
    name: 'Basic Egg',
    rarity: 'common',
    formationDurationSec: 5 * 60, // 5 min
    requiredLevel: 1,
    requiredIncubator: 'basic',
    virtualValue: 100,
    marketplaceAllowed: true,
    emoji: '🥚',
    gradient: 'from-slate-100 to-slate-200 dark:from-slate-800/40 dark:to-slate-700/40',
    animalSlug: 'chicken-basic',
  },
  {
    id: 'egg-silver',
    slug: 'silver',
    name: 'Silver Egg',
    rarity: 'uncommon',
    formationDurationSec: 30 * 60, // 30 min
    requiredLevel: 2,
    requiredIncubator: 'advanced',
    virtualValue: 500,
    marketplaceAllowed: true,
    emoji: '🥚',
    gradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30',
    animalSlug: 'chicken-silver',
  },
  {
    id: 'egg-golden',
    slug: 'golden',
    name: 'Golden Egg',
    rarity: 'rare',
    formationDurationSec: 2 * 60 * 60, // 2 hr
    requiredLevel: 3,
    requiredIncubator: 'advanced',
    virtualValue: 2500,
    marketplaceAllowed: true,
    emoji: '🥚',
    gradient: 'from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30',
    animalSlug: 'chicken-golden',
  },
  {
    id: 'egg-diamond',
    slug: 'diamond',
    name: 'Diamond Egg',
    rarity: 'epic',
    formationDurationSec: 8 * 60 * 60, // 8 hr
    requiredLevel: 5,
    requiredIncubator: 'premium',
    virtualValue: 10000,
    marketplaceAllowed: true,
    emoji: '🥚',
    gradient: 'from-sky-50 to-sky-100 dark:from-sky-950/40 dark:to-sky-900/30',
    animalSlug: 'animal-special',
  },
  {
    id: 'egg-legendary',
    slug: 'legendary',
    name: 'Legendary Egg',
    rarity: 'legendary',
    formationDurationSec: 24 * 60 * 60, // 24 hr
    requiredLevel: 7,
    requiredIncubator: 'legendary',
    virtualValue: 50000,
    marketplaceAllowed: true,
    emoji: '🥚',
    gradient: 'from-fuchsia-50 to-purple-100 dark:from-fuchsia-950/40 dark:to-purple-900/30',
    animalSlug: 'animal-legendary',
  },
]

export const ANIMAL_TYPES: AnimalType[] = [
  {
    id: 'animal-chicken-basic',
    slug: 'chicken-basic',
    name: 'Common Chicken',
    species: 'Chicken',
    rarity: 'common',
    baseHealth: 100,
    baseEnergy: 100,
    baseProduction: 8,
    productionType: 'coins',
    maxLevel: 10,
    emoji: '🐔',
  },
  {
    id: 'animal-chicken-silver',
    slug: 'chicken-silver',
    name: 'Silver Chicken',
    species: 'Chicken',
    rarity: 'uncommon',
    baseHealth: 110,
    baseEnergy: 110,
    baseProduction: 14,
    productionType: 'coins',
    maxLevel: 12,
    emoji: '🐔',
  },
  {
    id: 'animal-chicken-golden',
    slug: 'chicken-golden',
    name: 'Golden Chicken',
    species: 'Chicken',
    rarity: 'rare',
    baseHealth: 130,
    baseEnergy: 130,
    baseProduction: 24,
    productionType: 'coins',
    maxLevel: 15,
    emoji: '🐔',
  },
  {
    id: 'animal-special',
    slug: 'animal-special',
    name: 'Phoenix Chick',
    species: 'Phoenix',
    rarity: 'epic',
    baseHealth: 160,
    baseEnergy: 160,
    baseProduction: 40,
    productionType: 'gems',
    maxLevel: 20,
    emoji: '🐣',
  },
  {
    id: 'animal-legendary',
    slug: 'animal-legendary',
    name: 'Crystal Dragon',
    species: 'Dragon',
    rarity: 'legendary',
    baseHealth: 220,
    baseEnergy: 220,
    baseProduction: 80,
    productionType: 'special',
    maxLevel: 25,
    emoji: '🐲',
  },
]

export const INCUBATOR_TYPES = [
  {
    type: 'basic' as const,
    name: 'Basic Incubator',
    capacity: 1,
    speedMultiplier: 1.0,
    price: 0,
    emoji: '📦',
    description: 'A simple starter incubator. Holds one egg at a time.',
  },
  {
    type: 'advanced' as const,
    name: 'Advanced Incubator',
    capacity: 3,
    speedMultiplier: 1.5,
    price: 2500,
    emoji: '🔥',
    description: 'Heated and balanced for silver & golden eggs. 1.5× speed.',
  },
  {
    type: 'premium' as const,
    name: 'Premium Incubator',
    capacity: 5,
    speedMultiplier: 2.0,
    price: 15000,
    emoji: '⚙️',
    description: 'Precision climate control. 2× speed. Holds 5 eggs.',
  },
  {
    type: 'legendary' as const,
    name: 'Legendary Incubator',
    capacity: 10,
    speedMultiplier: 3.0,
    price: 100000,
    emoji: '💎',
    description: 'Master-crafted. 3× speed. Required for Legendary Eggs.',
  },
]

export const DEFAULT_INCUBATORS: Incubator[] = [
  {
    id: 'incubator-1',
    type: 'basic',
    capacity: 1,
    speedMultiplier: 1.0,
    level: 1,
    eggs: [],
    createdAt: Date.now(),
  },
]

export const MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    name: 'First Hatch',
    description: 'Hatch your first egg.',
    type: 'one_time',
    target: 1,
    rewardCoins: 250,
    rewardGems: 5,
    rewardXp: 50,
    active: true,
  },
  {
    id: 'mission-2',
    name: 'Daily Producer',
    description: 'Collect production from 3 animals.',
    type: 'daily',
    target: 3,
    rewardCoins: 100,
    rewardGems: 1,
    rewardXp: 20,
    active: true,
  },
  {
    id: 'mission-3',
    name: 'Egg Collector',
    description: 'Own 5 eggs at once.',
    type: 'one_time',
    target: 5,
    rewardCoins: 500,
    rewardGems: 10,
    rewardXp: 100,
    active: true,
  },
  {
    id: 'mission-4',
    name: 'Marketplace Trader',
    description: 'Buy or sell 1 item on the marketplace.',
    type: 'one_time',
    target: 1,
    rewardCoins: 300,
    rewardGems: 5,
    rewardXp: 60,
    active: true,
  },
  {
    id: 'mission-5',
    name: 'Weekly Producer',
    description: 'Collect production 10 times.',
    type: 'weekly',
    target: 10,
    rewardCoins: 1000,
    rewardGems: 25,
    rewardXp: 200,
    active: true,
  },
]

export const STARTER_INVENTORY = [
  { type: 'feed' as const, name: 'Starter Feed', quantity: 10, emoji: '🌾', rarity: 'common' as const },
  { type: 'water' as const, name: 'Water Bottle', quantity: 10, emoji: '💧', rarity: 'common' as const },
  { type: 'energy' as const, name: 'Energy Drink', quantity: 3, emoji: '⚡', rarity: 'uncommon' as const },
  { type: 'booster' as const, name: 'Speed Boost', quantity: 1, emoji: '🚀', rarity: 'rare' as const },
]

// Rarity metadata — uses new brand palette per design spec §2
export const RARITY_LABEL: Record<string, { label: string; color: string; bg: string; ring: string; glow: string }> = {
  common: {
    label: 'Common',
    color: 'text-slate-600 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-900/30',
    ring: 'border-slate-300 dark:border-slate-700',
    glow: 'rarity-glow-common',
  },
  uncommon: {
    label: 'Uncommon',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    ring: 'border-emerald-400 dark:border-emerald-700',
    glow: 'rarity-glow-uncommon',
  },
  rare: {
    label: 'Rare',
    color: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    ring: 'border-sky-400 dark:border-sky-700',
    glow: 'rarity-glow-rare',
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    ring: 'border-purple-400 dark:border-purple-700',
    glow: 'rarity-glow-epic',
  },
  legendary: {
    label: 'Legendary',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    ring: 'border-amber-400 dark:border-amber-700',
    glow: 'rarity-glow-legendary',
  },
}

export function eggTypeBySlug(slug: string): EggType | undefined {
  return EGG_TYPES.find((e) => e.slug === slug)
}

export function animalTypeBySlug(slug: string): AnimalType | undefined {
  return ANIMAL_TYPES.find((a) => a.slug === slug)
}

export function animalTypeForEgg(eggSlug: string): AnimalType | undefined {
  const egg = EGG_TYPES.find((e) => e.slug === eggSlug)
  if (!egg) return undefined
  return animalTypeBySlug(egg.animalSlug)
}
