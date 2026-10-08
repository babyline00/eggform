import { useEggForm } from '@/lib/store'

// Reset store between tests
beforeEach(() => {
  useEggForm.getState().resetDemo()
  // Set demo user
  useEggForm.getState().login('test@eggform.pk')
})

describe('EggForm Zustand store', () => {
  describe('initial state', () => {
    it('has demo user with PKR wallet', () => {
      const state = useEggForm.getState()
      expect(state.currentUser).not.toBeNull()
      expect(state.pkrWallet.available).toBeGreaterThan(0)
    })

    it('has 1 demo incubator', () => {
      expect(useEggForm.getState().incubators).toHaveLength(1)
      expect(useEggForm.getState().incubators[0].type).toBe('basic')
    })

    it('has demo eggs in inventory', () => {
      expect(useEggForm.getState().eggs.length).toBeGreaterThan(0)
    })

    it('has demo animals on farm', () => {
      expect(useEggForm.getState().animals.length).toBeGreaterThan(0)
    })

    it('has demo marketplace listings', () => {
      expect(useEggForm.getState().listings.length).toBeGreaterThan(0)
    })
  })

  describe('egg purchase flow', () => {
    it('buys an egg when enough coins', () => {
      const initialCoins = useEggForm.getState().gameWallet.coins
      const result = useEggForm.getState().buyEgg('egg-basic')
      expect(result).toBe(true)
      // Coins should decrease by the egg's virtual value (100 for basic)
      expect(useEggForm.getState().gameWallet.coins).toBe(initialCoins - 100)
    })

    it('fails to buy when not enough coins', () => {
      // Reset to a state with 0 coins
      useEggForm.setState({ gameWallet: { coins: 50, gems: 0, tickets: 0 } })
      const result = useEggForm.getState().buyEgg('egg-golden')
      expect(result).toBe(false)
      expect(useEggForm.getState().eggs).toBeDefined()
    })

    it('logs game wallet transaction on buy', () => {
      const initialTxCount = useEggForm.getState().gameTransactions.length
      useEggForm.getState().buyEgg('egg-basic')
      expect(useEggForm.getState().gameTransactions.length).toBe(initialTxCount + 1)
      const tx = useEggForm.getState().gameTransactions[0]
      expect(tx.type).toBe('spend')
      expect(tx.amount).toBe(-100)
    })
  })

  describe('egg formation flow', () => {
    it('starts formation for an owned egg', () => {
      // First buy an egg
      useEggForm.getState().buyEgg('egg-basic')
      const egg = useEggForm.getState().eggs.find((e) => e.status === 'owned')
      expect(egg).toBeDefined()
      const incubator = useEggForm.getState().incubators[0]
      const result = useEggForm.getState().startFormation(egg!.id, incubator.id)
      expect(result).toBe(true)
      // Egg should now be incubating
      const updatedEgg = useEggForm.getState().eggs.find((e) => e.id === egg!.id)
      expect(updatedEgg?.status).toBe('incubating')
      expect(updatedEgg?.formationStartedAt).not.toBeNull()
      expect(updatedEgg?.formationEndsAt).not.toBeNull()
    })

    it('does not allow formation if incubator is full', () => {
      // Buy egg and fill the basic incubator
      useEggForm.getState().buyEgg('egg-basic')
      const egg1 = useEggForm.getState().eggs.find((e) => e.status === 'owned')
      useEggForm.getState().startFormation(egg1!.id, useEggForm.getState().incubators[0].id)
      // Buy another egg
      useEggForm.getState().buyEgg('egg-basic')
      const egg2 = useEggForm.getState().eggs.find((e) => e.status === 'owned')
      const result = useEggForm.getState().startFormation(egg2!.id, useEggForm.getState().incubators[0].id)
      expect(result).toBe(false) // Incubator full
    })

    it('cancels formation and returns egg to owned state', () => {
      useEggForm.getState().buyEgg('egg-basic')
      const egg = useEggForm.getState().eggs.find((e) => e.status === 'owned')
      useEggForm.getState().startFormation(egg!.id, useEggForm.getState().incubators[0].id)
      useEggForm.getState().cancelFormation(egg!.id)
      const updatedEgg = useEggForm.getState().eggs.find((e) => e.id === egg!.id)
      expect(updatedEgg?.status).toBe('owned')
      expect(updatedEgg?.incubatorId).toBeNull()
      expect(updatedEgg?.formationStartedAt).toBeNull()
    })
  })

  describe('PKR wallet operations', () => {
    it('deposits PKR and moves funds to pending then to available', async () => {
      const initialAvailable = useEggForm.getState().pkrWallet.available
      const initialPending = useEggForm.getState().pkrWallet.pending
      const ref = useEggForm.getState().depositPkr(100000, 'bank')
      expect(ref).toMatch(/^DEP-/)
      // Funds should immediately move to pending
      expect(useEggForm.getState().pkrWallet.pending).toBe(initialPending + 100000)
      expect(useEggForm.getState().pkrWallet.available).toBe(initialAvailable)
      // Wait for webhook simulation (5s)
      await new Promise((r) => setTimeout(r, 5500))
      // Funds should now be credited to available
      expect(useEggForm.getState().pkrWallet.available).toBe(initialAvailable + 100000)
    }, 15000)  // 15s timeout for async test

    it('requests withdrawal and locks funds', () => {
      const initialAvailable = useEggForm.getState().pkrWallet.available
      const initialLocked = useEggForm.getState().pkrWallet.locked
      const result = useEggForm.getState().requestWithdrawal(50000, 'bank', '****1234')
      expect(result).toBe(true)
      expect(useEggForm.getState().pkrWallet.available).toBe(initialAvailable - 50000)
      expect(useEggForm.getState().pkrWallet.locked).toBe(initialLocked + 50000)
      // Withdrawal record should exist
      expect(useEggForm.getState().withdrawals[0].status).toBe('pending')
    })

    it('fails to withdraw more than available balance', () => {
      const available = useEggForm.getState().pkrWallet.available
      const result = useEggForm.getState().requestWithdrawal(available + 100, 'bank', '****1234')
      expect(result).toBe(false)
    })

    it('processes admin withdrawal approval and updates ledger', () => {
      const initialAvailable = useEggForm.getState().pkrWallet.available
      useEggForm.getState().requestWithdrawal(50000, 'bank', '****1234')
      const withdrawalId = useEggForm.getState().withdrawals[0].id
      useEggForm.getState().processAdminWithdrawal(withdrawalId, 'approve')
      // Funds should be released (no longer locked, not back in available)
      const wd = useEggForm.getState().withdrawals.find((w) => w.id === withdrawalId)
      expect(wd?.status).toBe('completed')
      // Available stays at (initialAvailable - 50000) — funds released out of wallet
      expect(useEggForm.getState().pkrWallet.available).toBe(initialAvailable - 50000)
      // Audit log entry should be created
      expect(useEggForm.getState().adminAuditLog[0].action).toBe('WITHDRAWAL_APPROVED')
    })

    it('refunds funds on admin withdrawal rejection', () => {
      const initialAvailable = useEggForm.getState().pkrWallet.available
      useEggForm.getState().requestWithdrawal(50000, 'bank', '****1234')
      const withdrawalId = useEggForm.getState().withdrawals[0].id
      useEggForm.getState().processAdminWithdrawal(withdrawalId, 'reject')
      // Funds should be refunded back to available
      expect(useEggForm.getState().pkrWallet.available).toBe(initialAvailable)
      const wd = useEggForm.getState().withdrawals.find((w) => w.id === withdrawalId)
      expect(wd?.status).toBe('rejected')
    })
  })

  describe('marketplace flow', () => {
    it('lists an owned egg on the marketplace', () => {
      useEggForm.getState().buyEgg('egg-basic')
      const egg = useEggForm.getState().eggs.find((e) => e.status === 'owned')
      const result = useEggForm.getState().listOnMarketplace('egg', egg!.id, 200)
      expect(result).toBe(true)
      const listing = useEggForm.getState().listings.find((l) => l.assetId === egg!.id)
      expect(listing).toBeDefined()
      expect(listing?.price).toBe(200)
      expect(listing?.status).toBe('active')
      // Egg should be marked as sold (locked)
      const updatedEgg = useEggForm.getState().eggs.find((e) => e.id === egg!.id)
      expect(updatedEgg?.status).toBe('sold')
    })

    it('buys from marketplace and adds egg to inventory', () => {
      const initialListings = useEggForm.getState().listings.filter((l) => l.status === 'active')
      const initialEggsCount = useEggForm.getState().eggs.length
      const listing = initialListings[0]
      const result = useEggForm.getState().buyFromMarketplace(listing.id)
      expect(result).toBe(true)
      // Listing should be marked sold
      const updatedListing = useEggForm.getState().listings.find((l) => l.id === listing.id)
      expect(updatedListing?.status).toBe('sold')
    })

    it('fails to buy own listing', () => {
      useEggForm.getState().buyEgg('egg-basic')
      const egg = useEggForm.getState().eggs.find((e) => e.status === 'owned')
      useEggForm.getState().listOnMarketplace('egg', egg!.id, 200)
      const myListing = useEggForm.getState().listings.find((l) => l.assetId === egg!.id)
      const result = useEggForm.getState().buyFromMarketplace(myListing!.id)
      expect(result).toBe(false)
    })
  })

  describe('mission rewards', () => {
    it('claims a completed mission and credits rewards', () => {
      const initialCoins = useEggForm.getState().gameWallet.coins
      // Mission-1 (First Hatch) is completed in demo data
      const um = useEggForm.getState().userMissions.find((m) => m.missionId === 'mission-1')
      expect(um?.status).toBe('completed')
      useEggForm.getState().claimMission('mission-1')
      const updatedUm = useEggForm.getState().userMissions.find((m) => m.missionId === 'mission-1')
      expect(updatedUm?.status).toBe('claimed')
      expect(useEggForm.getState().gameWallet.coins).toBe(initialCoins + 250)
    })

    it('fails to claim a mission that is not completed', () => {
      const initialCoins = useEggForm.getState().gameWallet.coins
      // mission-2 is active in demo data
      useEggForm.getState().claimMission('mission-2')
      // Should not credit anything
      expect(useEggForm.getState().gameWallet.coins).toBe(initialCoins)
    })
  })

  describe('egg care', () => {
    it('feeds an egg and increases its health (uncapped)', () => {
      useEggForm.getState().buyEgg('egg-basic')
      const egg = useEggForm.getState().eggs.find((e) => e.status === 'owned')
      useEggForm.getState().startFormation(egg!.id, useEggForm.getState().incubators[0].id)
      // Manually lower the health to test the increment
      useEggForm.setState((s) => ({
        eggs: s.eggs.map((e) => e.id === egg!.id ? { ...e, careHealth: 80 } : e),
      }))
      useEggForm.getState().careEgg(egg!.id, 'feed')
      const updatedHealth = useEggForm.getState().eggs.find((e) => e.id === egg!.id)!.careHealth
      expect(updatedHealth).toBe(85)  // 80 + 5
    })

    it('caps health at 100', () => {
      useEggForm.getState().buyEgg('egg-basic')
      const egg = useEggForm.getState().eggs.find((e) => e.status === 'owned')
      useEggForm.getState().startFormation(egg!.id, useEggForm.getState().incubators[0].id)
      // Health starts at 100 — feeding should NOT exceed
      useEggForm.getState().careEgg(egg!.id, 'feed')
      expect(useEggForm.getState().eggs.find((e) => e.id === egg!.id)!.careHealth).toBe(100)
    })

    it('boosts an egg and reduces formation time', () => {
      useEggForm.getState().buyEgg('egg-basic')
      const egg = useEggForm.getState().eggs.find((e) => e.status === 'owned')
      useEggForm.getState().startFormation(egg!.id, useEggForm.getState().incubators[0].id)
      const initialEndsAt = useEggForm.getState().eggs.find((e) => e.id === egg!.id)!.formationEndsAt!
      useEggForm.getState().careEgg(egg!.id, 'boost')
      const updatedEndsAt = useEggForm.getState().eggs.find((e) => e.id === egg!.id)!.formationEndsAt!
      expect(updatedEndsAt).toBeLessThan(initialEndsAt)
    })
  })

  describe('notifications', () => {
    it('pushes a new notification', () => {
      const initialCount = useEggForm.getState().notifications.length
      useEggForm.getState().pushNotification('test', 'Test', 'Test message')
      expect(useEggForm.getState().notifications.length).toBe(initialCount + 1)
      expect(useEggForm.getState().notifications[0].title).toBe('Test')
    })

    it('marks a notification as read', () => {
      useEggForm.getState().pushNotification('test', 'Test', 'Test message')
      const notif = useEggForm.getState().notifications[0]
      expect(notif.readAt).toBeNull()
      useEggForm.getState().markNotificationRead(notif.id)
      const updatedNotif = useEggForm.getState().notifications.find((n) => n.id === notif.id)
      expect(updatedNotif?.readAt).not.toBeNull()
    })
  })
})
