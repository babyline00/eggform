// EggForm — Shared TypeScript Types
// Mirror of the Prisma schema, used by client-side state.

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type EggStatus = 'owned' | 'incubating' | 'hatched' | 'sold'

export interface EggType {
  id: string
  slug: 'basic' | 'silver' | 'golden' | 'diamond' | 'legendary'
  name: string
  rarity: Rarity
  formationDurationSec: number
  requiredLevel: number
  requiredIncubator: string
  virtualValue: number
  marketplaceAllowed: boolean
  emoji: string
  gradient: string // tailwind classes for visual
  animalSlug: string
}

export interface Egg {
  id: string
  eggTypeId: string
  ownerId: string
  incubatorId: string | null
  status: EggStatus
  formationStartedAt: number | null // epoch ms
  formationEndsAt: number | null
  careHealth: number
  careTemperature: number
  careMoisture: number
  createdAt: number
  hatchedAt: number | null
  hatchedAnimalId: string | null
}

export interface Incubator {
  id: string
  type: 'basic' | 'advanced' | 'premium' | 'legendary'
  capacity: number
  speedMultiplier: number
  level: number
  eggs: Egg[]
  createdAt: number
}

export interface AnimalType {
  id: string
  slug: string
  name: string
  species: string
  rarity: Rarity
  baseHealth: number
  baseEnergy: number
  baseProduction: number
  productionType: 'coins' | 'gems' | 'eggs' | 'special'
  maxLevel: number
  emoji: string
}

export interface Animal {
  id: string
  animalTypeId: string
  ownerId: string
  name: string | null
  level: number
  xp: number
  health: number
  energy: number
  happiness: number
  productionRate: number
  upgradeLevel: number
  status: 'active' | 'resting' | 'sick'
  producedFromEggId: string | null
  createdAt: number
  lastCollectedAt: number | null
}

export interface InventoryItem {
  id: string
  userId: string
  type: 'egg' | 'animal' | 'feed' | 'water' | 'energy' | 'booster' | 'building' | 'decoration' | 'resource'
  refId: string | null
  name: string
  quantity: number
  rarity: Rarity | null
  emoji: string
  createdAt: number
}

export interface GameWallet {
  coins: number
  gems: number
  tickets: number
}

export type GameTxType =
  | 'earn'
  | 'spend'
  | 'reward'
  | 'refund'
  | 'admin_adjust'

export interface GameWalletTransaction {
  id: string
  type: GameTxType
  amount: number // signed
  balanceBefore: number
  balanceAfter: number
  reference: string | null
  reason: string | null
  createdAt: number
}

export type PkrWalletState = {
  available: number // paisa
  pending: number
  locked: number
}

export type PkrTxType =
  | 'deposit'
  | 'withdrawal'
  | 'purchase'
  | 'refund'
  | 'marketplace_payment'
  | 'marketplace_settlement'
  | 'fee'
  | 'adjustment'
  | 'chargeback'
  | 'reversal'
  | 'bonus'

export type PkrTxStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded'
  | 'reversed'

export interface PkrTransaction {
  id: string
  type: PkrTxType
  amount: number // signed, paisa
  balanceBefore: number
  balanceAfter: number
  reference: string | null
  paymentProvider: string | null
  providerTransactionId: string | null
  status: PkrTxStatus
  ip: string | null
  notes: string | null
  createdAt: number
  completedAt: number | null
}

export interface Deposit {
  id: string
  amount: number
  currency: string
  paymentMethod: string
  gatewayReference: string | null
  internalReference: string
  status: PkrTxStatus
  createdAt: number
  completedAt: number | null
}

export interface Withdrawal {
  id: string
  amount: number
  fee: number
  netAmount: number
  method: string
  methodReference: string | null
  kycRequired: boolean
  riskScore: number
  status:
    | 'pending'
    | 'under_review'
    | 'approved'
    | 'processing'
    | 'completed'
    | 'rejected'
    | 'failed'
    | 'cancelled'
    | 'reversed'
  createdAt: number
  processedAt: number | null
}

export interface Mission {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'one_time' | 'event'
  target: number
  rewardCoins: number
  rewardGems: number
  rewardXp: number
  active: boolean
}

export interface UserMission {
  id: string
  missionId: string
  progress: number
  target: number
  status: 'active' | 'completed' | 'claimed' | 'expired'
  completedAt: number | null
  claimedAt: number | null
}

export interface MarketplaceListing {
  id: string
  sellerId: string
  sellerName: string
  assetType: 'egg' | 'animal' | 'resource'
  assetId: string
  name: string
  rarity: Rarity | null
  price: number
  feePercent: number
  status: 'active' | 'sold' | 'cancelled' | 'expired'
  emoji: string
  createdAt: number
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  readAt: number | null
  createdAt: number
}

export interface User {
  id: string
  email: string
  phone: string
  username: string
  fullName: string
  country: string
  status: 'active' | 'suspended' | 'banned'
  role: 'user' | 'moderator' | 'finance_admin' | 'content_admin' | 'super_admin'
  referralCode: string
  createdAt: number
  farmName: string
  level: number
  xp: number
  energy: number
  maxEnergy: number
}

export type AppView =
  | 'landing'
  | 'app'
  | 'admin'

export type AppSection =
  | 'dashboard'
  | 'farm'
  | 'eggs'
  | 'formation'
  | 'hatching'
  | 'incubators'
  | 'animals'
  | 'inventory'
  | 'marketplace'
  | 'missions'
  | 'achievements'
  | 'events'
  | 'game-wallet'
  | 'pkr-wallet'
  | 'pkr-architecture'
  | 'kyc'
  | 'reports'
  | 'support'
  | 'profile'
  | 'notifications'

export type AdminSection =
  | 'dashboard'
  | 'users'
  | 'eggs'
  | 'animals'
  | 'deposits'
  | 'withdrawals'
  | 'kyc'
  | 'marketplace'
  | 'audit'
  | 'reports'
  | 'settings'
