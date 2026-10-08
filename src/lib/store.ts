'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Animal,
  AnimalType,
  AppSection,
  AppView,
  AdminSection,
  Deposit,
  Egg,
  EggType,
  GameWallet,
  GameWalletTransaction,
  Incubator,
  InventoryItem,
  MarketplaceListing,
  Mission,
  Notification,
  PkrTransaction,
  PkrWalletState,
  PkrTxStatus,
  User,
  UserMission,
  Withdrawal,
} from './types'
import {
  ANIMAL_TYPES,
  DEFAULT_INCUBATORS,
  EGG_TYPES,
  MISSIONS,
  STARTER_INVENTORY,
  animalTypeForEgg,
} from './game-data'
import { generateCuid, generateReference } from './format'

// ============================================================
// STORE SHAPE
// ============================================================

interface EggFormState {
  // routing
  view: AppView
  section: AppSection
  adminSection: AdminSection
  authOpen: boolean

  // auth
  currentUser: User | null
  isAuthenticated: boolean

  // wallet (game)
  gameWallet: GameWallet
  gameTransactions: GameWalletTransaction[]

  // wallet (pkr) — all amounts in PAISA
  pkrWallet: PkrWalletState
  pkrTransactions: PkrTransaction[]
  deposits: Deposit[]
  withdrawals: Withdrawal[]

  // farm
  incubators: Incubator[]
  eggs: Egg[]
  animals: Animal[]
  inventory: InventoryItem[]
  missions: Mission[]
  userMissions: UserMission[]
  listings: MarketplaceListing[]
  notifications: Notification[]

  // admin mocks
  adminUsers: User[]
  adminAuditLog: AuditEntry[]
  adminKycQueue: KycQueueEntry[]

  // actions
  setView: (v: AppView) => void
  setSection: (s: AppSection) => void
  setAdminSection: (s: AdminSection) => void
  setAuthOpen: (open: boolean) => void

  register: (input: RegisterInput) => void
  login: (email: string) => void
  logout: () => void
  enterAdmin: () => void
  exitAdmin: () => void

  buyEgg: (eggTypeId: string) => boolean
  startFormation: (eggId: string, incubatorId: string) => boolean
  cancelFormation: (eggId: string) => void
  careEgg: (eggId: string, action: 'feed' | 'water' | 'warm' | 'boost') => void
  hatchEgg: (eggId: string) => void
  tickTimers: () => void

  collectProduction: (animalId: string) => void
  upgradeAnimal: (animalId: string) => void

  listOnMarketplace: (assetType: 'egg' | 'animal', assetId: string, price: number) => boolean
  buyFromMarketplace: (listingId: string) => boolean
  cancelListing: (listingId: string) => void

  depositPkr: (amountPaisa: number, method: string) => string
  requestWithdrawal: (amountPaisa: number, method: string, methodRef: string) => boolean
  processAdminWithdrawal: (id: string, action: 'approve' | 'reject') => void

  claimMission: (missionId: string) => void

  markNotificationRead: (id: string) => void
  clearAllNotifications: () => void
  pushNotification: (type: string, title: string, message: string) => void

  resetDemo: () => void
}

interface RegisterInput {
  fullName: string
  username: string
  email: string
  phone: string
  country: string
  farmName: string
}

interface AuditEntry {
  id: string
  adminId: string
  adminName: string
  action: string
  targetType: string
  targetId: string
  reason: string | null
  ip: string
  createdAt: number
}

interface KycQueueEntry {
  id: string
  userId: string
  userName: string
  cnic: string
  submittedAt: number
  status: 'pending' | 'under_review' | 'verified' | 'rejected'
}

// ============================================================
// HELPERS
// ============================================================

function pushGameTx(
  state: EggFormState,
  type: GameWalletTransaction['type'],
  amount: number,
  reason: string | null,
  reference: string | null = null,
): { wallet: GameWallet; tx: GameWalletTransaction } {
  const newBalance = state.gameWallet.coins + (type === 'spend' ? -amount : amount)
  const tx: GameWalletTransaction = {
    id: generateCuid(),
    type,
    amount: type === 'spend' ? -amount : amount,
    balanceBefore: state.gameWallet.coins,
    balanceAfter: newBalance,
    reference,
    reason,
    createdAt: Date.now(),
  }
  return {
    wallet: {
      ...state.gameWallet,
      coins: newBalance,
    },
    tx,
  }
}

function pushPkrTx(
  state: EggFormState,
  type: PkrTransaction['type'],
  amountPaisa: number,
  status: PkrTxStatus,
  reference: string | null,
  paymentProvider: string | null = null,
): { wallet: PkrWalletState; tx: PkrTransaction } {
  const balanceBefore = state.pkrWallet.available
  const balanceAfter = balanceBefore + amountPaisa
  const tx: PkrTransaction = {
    id: generateCuid(),
    type,
    amount: amountPaisa,
    balanceBefore,
    balanceAfter,
    reference,
    paymentProvider,
    providerTransactionId: null,
    status,
    ip: null,
    notes: null,
    createdAt: Date.now(),
    completedAt: status === 'completed' ? Date.now() : null,
  }
  return {
    wallet: {
      ...state.pkrWallet,
      available: balanceAfter,
    },
    tx,
  }
}

// ============================================================
// STORE
// ============================================================

const DEMO_USER: User = {
  id: 'user-demo',
  email: 'farmer@eggform.pk',
  phone: '+92 300 1234567',
  username: 'eggmaster',
  fullName: 'Asad Khan',
  country: 'PK',
  status: 'active',
  role: 'user',
  referralCode: 'EGG-82K9',
  createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  farmName: 'Sunrise Acres',
  level: 3,
  xp: 850,
  energy: 92,
  maxEnergy: 100,
}

const DEMO_LISTINGS: MarketplaceListing[] = [
  {
    id: 'listing-1',
    sellerId: 'user-seller-1',
    sellerName: 'NightOwl',
    assetType: 'egg',
    assetId: 'demo-egg-1',
    name: 'Golden Egg',
    rarity: 'rare',
    price: 2500,
    feePercent: 0.05,
    status: 'active',
    emoji: '🥚',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: 'listing-2',
    sellerId: 'user-seller-2',
    sellerName: 'PhoenixKeeper',
    assetType: 'egg',
    assetId: 'demo-egg-2',
    name: 'Diamond Egg',
    rarity: 'epic',
    price: 9000,
    feePercent: 0.05,
    status: 'active',
    emoji: '🥚',
    createdAt: Date.now() - 4 * 60 * 60 * 1000,
  },
  {
    id: 'listing-3',
    sellerId: 'user-seller-3',
    sellerName: 'CrystalFarmer',
    assetType: 'egg',
    assetId: 'demo-egg-3',
    name: 'Silver Egg',
    rarity: 'uncommon',
    price: 450,
    feePercent: 0.05,
    status: 'active',
    emoji: '🥚',
    createdAt: Date.now() - 6 * 60 * 60 * 1000,
  },
]

const DEMO_ADMIN_USERS: User[] = [
  {
    ...DEMO_USER,
    id: 'user-2',
    username: 'sara_ahmed',
    fullName: 'Sara Ahmed',
    email: 'sara@example.pk',
    level: 7,
    xp: 4200,
    farmName: 'Green Valley Farm',
  },
  {
    ...DEMO_USER,
    id: 'user-3',
    username: 'bilal_k',
    fullName: 'Bilal Khan',
    email: 'bilal@example.pk',
    level: 12,
    xp: 18500,
    farmName: 'Golden Nest',
  },
  {
    ...DEMO_USER,
    id: 'user-4',
    username: 'fatima_r',
    fullName: 'Fatima Riaz',
    email: 'fatima@example.pk',
    level: 1,
    xp: 0,
    farmName: 'New Beginnings',
  },
]

const DEMO_DEPOSITS: Deposit[] = [
  {
    id: 'dep-1001',
    amount: 50000,
    currency: 'PKR',
    paymentMethod: 'bank',
    gatewayReference: 'GW-9182-XYZ',
    internalReference: 'DEP-1001',
    status: 'completed',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    completedAt: Date.now() - 2 * 60 * 60 * 1000 + 30000,
  },
  {
    id: 'dep-1002',
    amount: 25000,
    currency: 'PKR',
    paymentMethod: 'easypaisa',
    gatewayReference: null,
    internalReference: 'DEP-1002',
    status: 'pending',
    createdAt: Date.now() - 10 * 60 * 1000,
    completedAt: null,
  },
  {
    id: 'dep-1003',
    amount: 100000,
    currency: 'PKR',
    paymentMethod: 'jazzcash',
    gatewayReference: 'GW-7782-ABC',
    internalReference: 'DEP-1003',
    status: 'completed',
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    completedAt: Date.now() - 24 * 60 * 60 * 1000 + 45000,
  },
]

const DEMO_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'wd-2001',
    amount: 30000,
    fee: 500,
    netAmount: 29500,
    method: 'bank',
    methodReference: '****1234',
    kycRequired: true,
    riskScore: 15,
    status: 'pending',
    createdAt: Date.now() - 30 * 60 * 1000,
    processedAt: null,
  },
  {
    id: 'wd-2002',
    amount: 15000,
    fee: 250,
    netAmount: 14750,
    method: 'easypaisa',
    methodReference: '****5678',
    kycRequired: true,
    riskScore: 5,
    status: 'completed',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    processedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000,
  },
]

const DEMO_AUDIT_LOG: AuditEntry[] = [
  {
    id: 'aud-1',
    adminId: 'admin-1',
    adminName: 'superadmin',
    action: 'WITHDRAWAL_APPROVED',
    targetType: 'withdrawal',
    targetId: 'wd-2002',
    reason: 'KYC verified',
    ip: '203.135.0.10',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000,
  },
  {
    id: 'aud-2',
    adminId: 'admin-1',
    adminName: 'superadmin',
    action: 'USER_SUSPENDED',
    targetType: 'user',
    targetId: 'user-bad-1',
    reason: 'Multiple accounts detected',
    ip: '203.135.0.10',
    createdAt: Date.now() - 6 * 60 * 60 * 1000,
  },
]

const DEMO_KYC_QUEUE: KycQueueEntry[] = [
  {
    id: 'kyc-1',
    userId: 'user-2',
    userName: 'Sara Ahmed',
    cnic: '42101-1234567-8',
    submittedAt: Date.now() - 50 * 60 * 1000,
    status: 'pending',
  },
  {
    id: 'kyc-2',
    userId: 'user-4',
    userName: 'Fatima Riaz',
    cnic: '61101-9876543-2',
    submittedAt: Date.now() - 3 * 60 * 60 * 1000,
    status: 'under_review',
  },
]

const INITIAL_STATE = {
  view: 'landing' as AppView,
  section: 'dashboard' as AppSection,
  adminSection: 'dashboard' as AdminSection,
  authOpen: false,

  currentUser: null,
  isAuthenticated: false,

  gameWallet: { coins: 12450, gems: 85, tickets: 3 } as GameWallet,
  gameTransactions: [
    {
      id: 'gtx-1',
      type: 'reward' as const,
      amount: 250,
      balanceBefore: 12200,
      balanceAfter: 12450,
      reference: 'mission-1',
      reason: 'First Hatch mission reward',
      createdAt: Date.now() - 60 * 60 * 1000,
    },
  ] as GameWalletTransaction[],

  pkrWallet: {
    available: 2545000, // Rs 25,450
    pending: 250000, // Rs 2,500
    locked: 100000, // Rs 1,000
  } as PkrWalletState,
  pkrTransactions: [
    {
      id: 'ptx-1',
      type: 'deposit' as const,
      amount: 500000,
      balanceBefore: 2045000,
      balanceAfter: 2545000,
      reference: 'DEP-1001',
      paymentProvider: 'BankTransfer',
      providerTransactionId: 'GW-9182-XYZ',
      status: 'completed' as const,
      ip: '203.135.0.42',
      notes: null,
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      completedAt: Date.now() - 2 * 60 * 60 * 1000 + 30000,
    },
    {
      id: 'ptx-2',
      type: 'withdrawal' as const,
      amount: -50000,
      balanceBefore: 2095000,
      balanceAfter: 2045000,
      reference: 'WD-2002',
      paymentProvider: 'Easypaisa',
      providerTransactionId: 'EP-7782',
      status: 'completed' as const,
      ip: '203.135.0.42',
      notes: null,
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      completedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000,
    },
    {
      id: 'ptx-3',
      type: 'purchase' as const,
      amount: -200000,
      balanceBefore: 2745000,
      balanceAfter: 2545000,
      reference: 'MKP-9982',
      paymentProvider: null,
      providerTransactionId: null,
      status: 'completed' as const,
      ip: '203.135.0.42',
      notes: 'Golden Egg purchase from marketplace',
      createdAt: Date.now() - 4 * 60 * 60 * 1000,
      completedAt: Date.now() - 4 * 60 * 60 * 1000,
    },
    {
      id: 'ptx-4',
      type: 'bonus' as const,
      amount: 50000,
      balanceBefore: 2695000,
      balanceAfter: 2745000,
      reference: 'PROMO-WELCOME500',
      paymentProvider: null,
      providerTransactionId: null,
      status: 'completed' as const,
      ip: null,
      notes: 'Welcome bonus',
      createdAt: Date.now() - 5 * 60 * 60 * 1000,
      completedAt: Date.now() - 5 * 60 * 60 * 1000,
    },
  ] as PkrTransaction[],
  deposits: DEMO_DEPOSITS,
  withdrawals: DEMO_WITHDRAWALS,

  incubators: [...DEFAULT_INCUBATORS] as Incubator[],
  eggs: [
    {
      id: 'egg-demo-1',
      eggTypeId: 'egg-golden',
      ownerId: 'user-demo',
      incubatorId: 'incubator-1',
      status: 'incubating',
      formationStartedAt: Date.now() - 30 * 60 * 1000,
      formationEndsAt: Date.now() + 90 * 60 * 1000,
      careHealth: 94,
      careTemperature: 97,
      careMoisture: 88,
      createdAt: Date.now() - 35 * 60 * 1000,
      hatchedAt: null,
      hatchedAnimalId: null,
    },
    {
      id: 'egg-demo-2',
      eggTypeId: 'egg-basic',
      ownerId: 'user-demo',
      incubatorId: null,
      status: 'owned',
      formationStartedAt: null,
      formationEndsAt: null,
      careHealth: 100,
      careTemperature: 95,
      careMoisture: 85,
      createdAt: Date.now() - 10 * 60 * 1000,
      hatchedAt: null,
      hatchedAnimalId: null,
    },
  ] as Egg[],
  animals: [
    {
      id: 'animal-1',
      animalTypeId: 'animal-chicken-golden',
      ownerId: 'user-demo',
      name: 'Goldie',
      level: 8,
      xp: 1200,
      health: 96,
      energy: 82,
      happiness: 91,
      productionRate: 22,
      upgradeLevel: 1,
      status: 'active',
      producedFromEggId: null,
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      lastCollectedAt: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      id: 'animal-2',
      animalTypeId: 'animal-chicken-silver',
      ownerId: 'user-demo',
      name: 'Silver Bell',
      level: 5,
      xp: 400,
      health: 98,
      energy: 90,
      happiness: 85,
      productionRate: 12,
      upgradeLevel: 0,
      status: 'active',
      producedFromEggId: null,
      createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      lastCollectedAt: Date.now() - 3 * 60 * 60 * 1000,
    },
    {
      id: 'animal-3',
      animalTypeId: 'animal-chicken-basic',
      ownerId: 'user-demo',
      name: 'Henrietta',
      level: 3,
      xp: 150,
      health: 92,
      energy: 88,
      happiness: 80,
      productionRate: 6,
      upgradeLevel: 0,
      status: 'active',
      producedFromEggId: null,
      createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
      lastCollectedAt: Date.now() - 4 * 60 * 60 * 1000,
    },
  ] as Animal[],
  inventory: STARTER_INVENTORY.map((item, idx) => ({
    id: `inv-${idx + 1}`,
    userId: 'user-demo',
    refId: null,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    ...item,
  })) as InventoryItem[],
  missions: MISSIONS,
  userMissions: [
    {
      id: 'um-1',
      missionId: 'mission-1',
      progress: 1,
      target: 1,
      status: 'completed',
      completedAt: Date.now() - 60 * 60 * 1000,
      claimedAt: null,
    },
    {
      id: 'um-2',
      missionId: 'mission-2',
      progress: 1,
      target: 3,
      status: 'active',
      completedAt: null,
      claimedAt: null,
    },
    {
      id: 'um-3',
      missionId: 'mission-3',
      progress: 2,
      target: 5,
      status: 'active',
      completedAt: null,
      claimedAt: null,
    },
  ] as UserMission[],
  listings: DEMO_LISTINGS,
  notifications: [
    {
      id: 'n-1',
      type: 'egg_ready',
      title: '🥚 Egg Ready',
      message: 'Your Golden Egg is ready to hatch.',
      readAt: null,
      createdAt: Date.now() - 5 * 60 * 1000,
    },
    {
      id: 'n-2',
      type: 'production_ready',
      title: '🐔 Production Ready',
      message: 'Your animals have produced new resources.',
      readAt: null,
      createdAt: Date.now() - 15 * 60 * 1000,
    },
    {
      id: 'n-3',
      type: 'payment_received',
      title: '💰 Payment Received',
      message: 'Your PKR deposit of Rs 5,000 has been confirmed.',
      readAt: Date.now() - 2 * 60 * 60 * 1000,
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
    },
  ] as Notification[],

  adminUsers: DEMO_ADMIN_USERS,
  adminAuditLog: DEMO_AUDIT_LOG,
  adminKycQueue: DEMO_KYC_QUEUE,
}

// ============================================================
// ZUSTAND STORE WITH PERSIST
// ============================================================

export const useEggForm = create<EggFormState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setView: (v) => set({ view: v }),
      setSection: (s) => set({ section: s }),
      setAdminSection: (s) => set({ adminSection: s }),
      setAuthOpen: (open) => set({ authOpen: open }),

      register: (input) => {
        const user: User = {
          id: generateCuid(),
          email: input.email,
          phone: input.phone,
          username: input.username,
          fullName: input.fullName,
          country: input.country || 'PK',
          status: 'active',
          role: 'user',
          referralCode: `EGG-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          createdAt: Date.now(),
          farmName: input.farmName,
          level: 1,
          xp: 0,
          energy: 100,
          maxEnergy: 100,
        }
        set({
          currentUser: user,
          isAuthenticated: true,
          view: 'app',
          section: 'dashboard',
          authOpen: false,
        })
      },

      login: (email) => {
        // Demo: log in to the demo user but reflect the email
        const user: User = {
          ...DEMO_USER,
          email,
          isAuthenticated: true,
        } as User
        set({
          currentUser: user,
          isAuthenticated: true,
          view: 'app',
          section: 'dashboard',
          authOpen: false,
        })
      },

      logout: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
          view: 'landing',
          section: 'dashboard',
        }),

      enterAdmin: () => {
        set({
          view: 'admin',
          adminSection: 'dashboard',
        })
      },
      exitAdmin: () => {
        set({
          view: 'app',
          section: 'dashboard',
        })
      },

      // ============================================================
      // EGGS
      // ============================================================

      buyEgg: (eggTypeId) => {
        const eggType = EGG_TYPES.find((e) => e.id === eggTypeId)
        if (!eggType) return false
        const state = get()
        if (state.gameWallet.coins < eggType.virtualValue) {
          return false
        }
        const newEgg: Egg = {
          id: generateCuid(),
          eggTypeId,
          ownerId: state.currentUser?.id || 'user-demo',
          incubatorId: null,
          status: 'owned',
          formationStartedAt: null,
          formationEndsAt: null,
          careHealth: 100,
          careTemperature: 95,
          careMoisture: 85,
          createdAt: Date.now(),
          hatchedAt: null,
          hatchedAnimalId: null,
        }
        const { wallet, tx } = pushGameTx(state, 'spend', eggType.virtualValue, `Bought ${eggType.name}`, generateReference('BUY'))
        const newInv: InventoryItem = {
          id: generateCuid(),
          userId: state.currentUser?.id || 'user-demo',
          type: 'egg',
          refId: newEgg.id,
          name: eggType.name,
          quantity: 1,
          rarity: eggType.rarity,
          emoji: '🥚',
          createdAt: Date.now(),
        }
        set({
          eggs: [...state.eggs, newEgg],
          gameWallet: wallet,
          gameTransactions: [tx, ...state.gameTransactions],
          inventory: [...state.inventory, newInv],
        })
        return true
      },

      startFormation: (eggId, incubatorId) => {
        const state = get()
        const egg = state.eggs.find((e) => e.id === eggId)
        const incubator = state.incubators.find((i) => i.id === incubatorId)
        if (!egg || !incubator) return false
        if (incubator.eggs.length >= incubator.capacity) return false
        const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
        if (!eggType) return false
        // Validate required incubator tier
        const requiredTypeMap: Record<string, number> = {
          basic: 0,
          advanced: 1,
          premium: 2,
          legendary: 3,
        }
        const incubatorTier = requiredTypeMap[incubator.type]
        const requiredTier = requiredTypeMap[eggType.requiredIncubator] || 0
        if (incubatorTier < requiredTier) return false

        const durationMs = (eggType.formationDurationSec * 1000) / incubator.speedMultiplier
        const now = Date.now()
        const updatedEggs = state.eggs.map((e) =>
          e.id === eggId
            ? {
                ...e,
                status: 'incubating' as const,
                incubatorId,
                formationStartedAt: now,
                formationEndsAt: now + durationMs,
              }
            : e,
        )
        const updatedIncubators = state.incubators.map((i) =>
          i.id === incubatorId
            ? { ...i, eggs: [...i.eggs.filter((e) => e.id !== eggId), updatedEggs.find((e) => e.id === eggId)!] }
            : i,
        )
        set({ eggs: updatedEggs, incubators: updatedIncubators })
        return true
      },

      cancelFormation: (eggId) => {
        const state = get()
        const egg = state.eggs.find((e) => e.id === eggId)
        if (!egg || egg.status !== 'incubating') return
        const updatedEggs = state.eggs.map((e) =>
          e.id === eggId
            ? {
                ...e,
                status: 'owned' as const,
                incubatorId: null,
                formationStartedAt: null,
                formationEndsAt: null,
              }
            : e,
        )
        const updatedIncubators = state.incubators.map((i) => ({
          ...i,
          eggs: i.eggs.filter((e) => e.id !== eggId),
        }))
        set({ eggs: updatedEggs, incubators: updatedIncubators })
      },

      careEgg: (eggId, action) => {
        const state = get()
        const updatedEggs = state.eggs.map((e) => {
          if (e.id !== eggId) return e
          const next = { ...e }
          switch (action) {
            case 'feed':
              next.careHealth = Math.min(100, next.careHealth + 5)
              break
            case 'water':
              next.careMoisture = Math.min(100, next.careMoisture + 7)
              break
            case 'warm':
              next.careTemperature = Math.min(100, next.careTemperature + 4)
              break
            case 'boost':
              if (next.formationEndsAt && next.formationStartedAt) {
                const remaining = next.formationEndsAt - Date.now()
                if (remaining > 60_000) {
                  next.formationEndsAt = next.formationEndsAt - 60_000
                } else {
                  next.formationEndsAt = Date.now()
                }
              }
              break
          }
          return next
        })
        set({ eggs: updatedEggs })
      },

      hatchEgg: (eggId) => {
        const state = get()
        const egg = state.eggs.find((e) => e.id === eggId)
        if (!egg || egg.status !== 'incubating') return
        if (!egg.formationEndsAt || Date.now() < egg.formationEndsAt) return

        const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
        if (!eggType) return
        const animalType = animalTypeForEgg(eggType.slug)
        if (!animalType) return

        const now = Date.now()
        const newAnimal: Animal = {
          id: generateCuid(),
          animalTypeId: animalType.id,
          ownerId: egg.ownerId,
          name: null,
          level: 1,
          xp: 0,
          health: animalType.baseHealth,
          energy: animalType.baseEnergy,
          happiness: 80,
          productionRate: animalType.baseProduction,
          upgradeLevel: 0,
          status: 'active',
          producedFromEggId: egg.id,
          createdAt: now,
          lastCollectedAt: null,
        }

        const updatedEggs = state.eggs.map((e) =>
          e.id === eggId
            ? {
                ...e,
                status: 'hatched' as const,
                hatchedAt: now,
                hatchedAnimalId: newAnimal.id,
              }
            : e,
        )
        const updatedIncubators = state.incubators.map((i) => ({
          ...i,
          eggs: i.eggs.filter((e) => e.id !== eggId),
        }))

        // Add XP for hatching
        const baseUser = state.currentUser || DEMO_USER
        const newXp = baseUser.xp + 50
        const newLevel = Math.floor(newXp / 500) + 1

        // Update mission progress (mission-1: First Hatch)
        const updatedMissions = state.userMissions.map((um) => {
          if (um.missionId === 'mission-1' && um.status === 'active') {
            return {
              ...um,
              progress: Math.min(um.target, um.progress + 1),
              status: (um.progress + 1 >= um.target ? 'completed' : 'active') as 'active' | 'completed',
              completedAt: um.progress + 1 >= um.target ? now : null,
            }
          }
          return um
        })

        set({
          eggs: updatedEggs,
          incubators: updatedIncubators,
          animals: [...state.animals, newAnimal],
          currentUser: { ...baseUser, xp: newXp, level: Math.max(baseUser.level, newLevel) },
          userMissions: updatedMissions,
          notifications: [
            {
              id: generateCuid(),
              type: 'egg_ready',
              title: '🐣 Egg Hatched!',
              message: `A new ${animalType.name} joined your farm.`,
              readAt: null,
              createdAt: now,
            },
            ...state.notifications,
          ],
        })
      },

      tickTimers: () => {
        const state = get()
        const now = Date.now()
        // Auto-hatch ready eggs for visual feedback (visual only — actual hatch triggered by user action)
        // No automatic mutations here, but we re-set the store so progress bars update
        set({ ...state })
      },

      // ============================================================
      // ANIMALS & PRODUCTION
      // ============================================================

      collectProduction: (animalId) => {
        const state = get()
        const animal = state.animals.find((a) => a.id === animalId)
        if (!animal) return
        const animalType = ANIMAL_TYPES.find((t) => t.id === animal.animalTypeId)
        if (!animalType) return
        // Calculate elapsed time since last collection (cap at 24h)
        const lastCollected = animal.lastCollectedAt || animal.createdAt
        const elapsedHr = Math.min(24, (Date.now() - lastCollected) / (1000 * 60 * 60))
        const earned = Math.floor((animal.productionRate * elapsedHr) / 24 * 10) // simple formula

        const updatedAnimals = state.animals.map((a) =>
          a.id === animalId ? { ...a, lastCollectedAt: Date.now() } : a,
        )

        if (animalType.productionType === 'coins') {
          const { wallet, tx } = pushGameTx(state, 'earn', earned, `Production from ${animalType.name}`, animal.id)
          set({
            animals: updatedAnimals,
            gameWallet: wallet,
            gameTransactions: [tx, ...state.gameTransactions],
            notifications: [
              {
                id: generateCuid(),
                type: 'production_ready',
                title: '🐔 Production Collected',
                message: `You earned ${earned} coins from ${animalType.name}.`,
                readAt: null,
                createdAt: Date.now(),
              },
              ...state.notifications,
            ].slice(0, 50),
          })
        } else if (animalType.productionType === 'gems') {
          set({
            animals: updatedAnimals,
            gameWallet: { ...state.gameWallet, gems: state.gameWallet.gems + Math.max(1, Math.floor(earned / 50)) },
            notifications: [
              {
                id: generateCuid(),
                type: 'production_ready',
                title: '✨ Gems Collected',
                message: `You earned ${Math.max(1, Math.floor(earned / 50))} gems from ${animalType.name}.`,
                readAt: null,
                createdAt: Date.now(),
              },
              ...state.notifications,
            ].slice(0, 50),
          })
        } else {
          // special
          set({
            animals: updatedAnimals,
            gameWallet: { ...state.gameWallet, tickets: state.gameWallet.tickets + 1 },
            notifications: [
              {
                id: generateCuid(),
                type: 'production_ready',
                title: '🎫 Ticket Earned',
                message: `Your ${animalType.name} produced a special ticket!`,
                readAt: null,
                createdAt: Date.now(),
              },
              ...state.notifications,
            ].slice(0, 50),
          })
        }

        // Update mission-2 (Daily Producer)
        const updatedMissions = state.userMissions.map((um) => {
          if (um.missionId === 'mission-2' && um.status === 'active') {
            const newProgress = Math.min(um.target, um.progress + 1)
            return {
              ...um,
              progress: newProgress,
              status: (newProgress >= um.target ? 'completed' : 'active') as 'active' | 'completed',
              completedAt: newProgress >= um.target ? Date.now() : null,
            }
          }
          return um
        })
        set({ userMissions: updatedMissions })
      },

      upgradeAnimal: (animalId) => {
        const state = get()
        const animal = state.animals.find((a) => a.id === animalId)
        if (!animal) return
        const animalType = ANIMAL_TYPES.find((t) => t.id === animal.animalTypeId)
        if (!animalType) return
        if (animal.level >= animalType.maxLevel) return
        const cost = (animal.level + 1) * 200
        if (state.gameWallet.coins < cost) return
        const { wallet, tx } = pushGameTx(state, 'spend', cost, `Upgraded ${animalType.name}`, animal.id)
        const updatedAnimals = state.animals.map((a) =>
          a.id === animalId
            ? {
                ...a,
                level: a.level + 1,
                productionRate: a.productionRate + 2,
                upgradeLevel: a.upgradeLevel + 1,
              }
            : a,
        )
        set({
          animals: updatedAnimals,
          gameWallet: wallet,
          gameTransactions: [tx, ...state.gameTransactions],
        })
      },

      // ============================================================
      // MARKETPLACE
      // ============================================================

      listOnMarketplace: (assetType, assetId, price) => {
        const state = get()
        if (assetType === 'egg') {
          const egg = state.eggs.find((e) => e.id === assetId)
          if (!egg || egg.status !== 'owned') return false
          const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
          if (!eggType || !eggType.marketplaceAllowed) return false
          const listing: MarketplaceListing = {
            id: generateCuid(),
            sellerId: state.currentUser?.id || 'user-demo',
            sellerName: state.currentUser?.username || 'eggmaster',
            assetType: 'egg',
            assetId,
            name: eggType.name,
            rarity: eggType.rarity,
            price,
            feePercent: 0.05,
            status: 'active',
            emoji: '🥚',
            createdAt: Date.now(),
          }
          // Mark egg as sold-status placeholder (still owned but listing locks it)
          const updatedEggs = state.eggs.map((e) => (e.id === assetId ? { ...e, status: 'sold' as const } : e))
          set({
            listings: [listing, ...state.listings],
            eggs: updatedEggs,
          })
          return true
        }
        return false
      },

      buyFromMarketplace: (listingId) => {
        const state = get()
        const listing = state.listings.find((l) => l.id === listingId)
        if (!listing || listing.status !== 'active') return false
        // Cannot buy your own listing
        if (listing.sellerId === state.currentUser?.id) return false
        if (state.gameWallet.coins < listing.price) return false

        const fee = Math.floor(listing.price * listing.feePercent)
        const netToSeller = listing.price - fee

        const { wallet: buyerWallet, tx: buyerTx } = pushGameTx(
          state, 'spend', listing.price, `Bought ${listing.name} from marketplace`, listing.id,
        )

        // For demo: the seller is the current user if they listed it; otherwise add the egg to buyer's inventory
        const eggType = EGG_TYPES.find((e) => e.name === listing.name)
        let updatedEggs = state.eggs
        if (eggType && listing.sellerId !== state.currentUser?.id) {
          const newEgg: Egg = {
            id: generateCuid(),
            eggTypeId: eggType.id,
            ownerId: state.currentUser?.id || 'user-demo',
            incubatorId: null,
            status: 'owned',
            formationStartedAt: null,
            formationEndsAt: null,
            careHealth: 100,
            careTemperature: 95,
            careMoisture: 85,
            createdAt: Date.now(),
            hatchedAt: null,
            hatchedAnimalId: null,
          }
          updatedEggs = [...state.eggs, newEgg]
        }

        const updatedListings = state.listings.map((l) =>
          l.id === listingId ? { ...l, status: 'sold' as const } : l,
        )

        set({
          listings: updatedListings,
          eggs: updatedEggs,
          gameWallet: buyerWallet,
          gameTransactions: [buyerTx, ...state.gameTransactions],
        })
        return true
      },

      cancelListing: (listingId) => {
        const state = get()
        const listing = state.listings.find((l) => l.id === listingId)
        if (!listing) return
        const updatedListings = state.listings.map((l) =>
          l.id === listingId ? { ...l, status: 'cancelled' as const } : l,
        )
        // Unlock the egg if it was the current user's
        const updatedEggs = state.eggs.map((e) =>
          listing.assetId === e.id ? { ...e, status: 'owned' as const } : e,
        )
        set({ listings: updatedListings, eggs: updatedEggs })
      },

      // ============================================================
      // PKR WALLET (DEMO)
      // ============================================================

      depositPkr: (amountPaisa, method) => {
        const state = get()
        const internalRef = generateReference('DEP')
        const deposit: Deposit = {
          id: generateCuid(),
          amount: amountPaisa,
          currency: 'PKR',
          paymentMethod: method,
          gatewayReference: null,
          internalReference: internalRef,
          status: 'pending',
          createdAt: Date.now(),
          completedAt: null,
        }
        // Move into pending state
        set({
          deposits: [deposit, ...state.deposits],
          pkrWallet: {
            ...state.pkrWallet,
            pending: state.pkrWallet.pending + amountPaisa,
          },
        })
        // Simulate webhook after delay (5 sec)
        setTimeout(() => {
          const cur = get()
          const updatedDeposits = cur.deposits.map((d) =>
            d.id === deposit.id
              ? {
                  ...d,
                  status: 'completed' as const,
                  gatewayReference: generateReference('GW'),
                  completedAt: Date.now(),
                }
              : d,
          )
          // Credit wallet
          const { wallet, tx } = pushPkrTx(
            cur, 'deposit', amountPaisa, 'completed', internalRef, method,
          )
          set({
            deposits: updatedDeposits,
            pkrWallet: {
              available: wallet.available + 0,
              pending: Math.max(0, cur.pkrWallet.pending - amountPaisa),
              locked: cur.pkrWallet.locked,
            },
            pkrTransactions: [tx, ...cur.pkrTransactions],
            notifications: [
              {
                id: generateCuid(),
                type: 'payment_received',
                title: '💰 Payment Received',
                message: `Your deposit of Rs ${(amountPaisa / 100).toLocaleString()} has been confirmed.`,
                readAt: null,
                createdAt: Date.now(),
              },
              ...cur.notifications,
            ].slice(0, 50),
          })
        }, 5000)
        return internalRef
      },

      requestWithdrawal: (amountPaisa, method, methodRef) => {
        const state = get()
        if (amountPaisa > state.pkrWallet.available) return false
        const fee = 500 // Rs 5 flat fee for demo
        const net = amountPaisa - fee
        const wd: Withdrawal = {
          id: generateCuid(),
          amount: amountPaisa,
          fee,
          netAmount: net,
          method,
          methodReference: methodRef,
          kycRequired: true,
          riskScore: Math.floor(Math.random() * 30),
          status: 'pending',
          createdAt: Date.now(),
          processedAt: null,
        }
        // Lock funds
        const newAvailable = state.pkrWallet.available - amountPaisa
        const newLocked = state.pkrWallet.locked + amountPaisa
        set({
          withdrawals: [wd, ...state.withdrawals],
          pkrWallet: {
            ...state.pkrWallet,
            available: newAvailable,
            locked: newLocked,
          },
        })
        return true
      },

      processAdminWithdrawal: (id, action) => {
        const state = get()
        const wd = state.withdrawals.find((w) => w.id === id)
        if (!wd) return
        const updatedWithdrawals = state.withdrawals.map((w) =>
          w.id === id
            ? {
                ...w,
                status: action === 'approve' ? 'completed' : 'rejected',
                processedAt: Date.now(),
              }
            : w,
        )
        if (action === 'approve') {
          // Funds were already moved from `available` → `locked` during requestWithdrawal.
          // Approval releases them OUT of the wallet (locked → 0).
          // Available balance must NOT change here (it was already reduced at request time).
          const newWallet = {
            available: state.pkrWallet.available,
            pending: state.pkrWallet.pending,
            locked: Math.max(0, state.pkrWallet.locked - wd.amount),
          }
          // Create ledger transaction. balanceBefore = available BEFORE withdrawal was deducted
          // (i.e., available + wd.amount, since funds were already locked).
          // balanceAfter = current available.
          const balanceBefore = state.pkrWallet.available + wd.amount
          const balanceAfter = state.pkrWallet.available
          const tx: PkrTransaction = {
            id: generateCuid(),
            type: 'withdrawal',
            amount: -wd.amount,
            balanceBefore,
            balanceAfter,
            reference: wd.id,
            paymentProvider: wd.method,
            providerTransactionId: null,
            status: 'completed',
            ip: null,
            notes: `Withdrawal approved by admin`,
            createdAt: Date.now(),
            completedAt: Date.now(),
          }
          set({
            withdrawals: updatedWithdrawals,
            pkrWallet: newWallet,
            pkrTransactions: [tx, ...state.pkrTransactions],
          })
        } else {
          // Reject: refund locked → available
          const newWallet = {
            available: state.pkrWallet.available + wd.amount,
            pending: state.pkrWallet.pending,
            locked: Math.max(0, state.pkrWallet.locked - wd.amount),
          }
          set({
            withdrawals: updatedWithdrawals,
            pkrWallet: newWallet,
          })
        }
        // Add audit log entry — use fresh state to avoid clobbering prior logs
        const cur = get()
        const audit: AuditEntry = {
          id: generateCuid(),
          adminId: 'admin-1',
          adminName: 'superadmin',
          action: action === 'approve' ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
          targetType: 'withdrawal',
          targetId: id,
          reason: action === 'approve' ? 'KYC verified' : 'Risk review failed',
          ip: '203.135.0.10',
          createdAt: Date.now(),
        }
        set({ adminAuditLog: [audit, ...cur.adminAuditLog] })
      },

      // ============================================================
      // MISSIONS
      // ============================================================

      claimMission: (missionId) => {
        const state = get()
        const um = state.userMissions.find((m) => m.missionId === missionId)
        if (!um || um.status !== 'completed' || um.claimedAt) return
        const mission = state.missions.find((m) => m.id === missionId)
        if (!mission) return

        const updatedMissions = state.userMissions.map((m) =>
          m.missionId === missionId ? { ...m, status: 'claimed' as const, claimedAt: Date.now() } : m,
        )

        // Award rewards
        const { wallet, tx } = pushGameTx(state, 'reward', mission.rewardCoins, `Mission reward: ${mission.name}`, missionId)
        const baseUser = state.currentUser || DEMO_USER
        const newXp = baseUser.xp + mission.rewardXp
        const newLevel = Math.floor(newXp / 500) + 1

        set({
          userMissions: updatedMissions,
          gameWallet: { ...wallet, gems: wallet.gems + mission.rewardGems },
          gameTransactions: [tx, ...state.gameTransactions],
          currentUser: { ...baseUser, xp: newXp, level: Math.max(baseUser.level, newLevel) },
        })
      },

      // ============================================================
      // NOTIFICATIONS
      // ============================================================

      markNotificationRead: (id) => {
        const state = get()
        set({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, readAt: Date.now() } : n,
          ),
        })
      },
      clearAllNotifications: () => {
        const state = get()
        set({
          notifications: state.notifications.map((n) => ({ ...n, readAt: Date.now() })),
        })
      },
      pushNotification: (type, title, message) => {
        const state = get()
        set({
          notifications: [
            {
              id: generateCuid(),
              type,
              title,
              message,
              readAt: null,
              createdAt: Date.now(),
            },
            ...state.notifications,
          ].slice(0, 50),
        })
      },

      resetDemo: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: 'eggform-store',
      // Persist only game-state — routing resets on reload
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        gameWallet: state.gameWallet,
        gameTransactions: state.gameTransactions.slice(0, 50),
        pkrWallet: state.pkrWallet,
        pkrTransactions: state.pkrTransactions.slice(0, 50),
        deposits: state.deposits,
        withdrawals: state.withdrawals,
        incubators: state.incubators,
        eggs: state.eggs,
        animals: state.animals,
        inventory: state.inventory,
        userMissions: state.userMissions,
        listings: state.listings,
        notifications: state.notifications,
      }),
    },
  ),
)
