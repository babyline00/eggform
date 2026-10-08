'use client'

import { useEggForm } from '@/lib/store'
import { LandingPage } from '@/components/landing-page'
import { AuthModal } from '@/components/auth-modal'
import { AppShell } from '@/components/app-shell'
import { OnboardingMascot } from '@/components/onboarding-mascot'
import { DashboardView } from '@/components/views/dashboard'
import { FarmView } from '@/components/views/farm-view'
import { EggsView } from '@/components/views/eggs-view'
import { FormationView } from '@/components/views/formation-view'
import { HatchingView } from '@/components/views/hatching-view'
import { IncubatorsView } from '@/components/views/incubators-view'
import { AnimalsView } from '@/components/views/animals-view'
import { InventoryView } from '@/components/views/inventory-view'
import { MarketplaceView } from '@/components/views/marketplace-view'
import { GameWalletView } from '@/components/views/game-wallet-view'
import { PkrWalletView } from '@/components/views/pkr-wallet-view'
import { PkrArchitectureView } from '@/components/views/pkr-architecture-view'
import { KycView } from '@/components/views/kyc-view'
import { MissionsView } from '@/components/views/missions-view'
import { AchievementsView } from '@/components/views/achievements-view'
import { EventsView } from '@/components/views/events-view'
import { ReportsView } from '@/components/views/reports-view'
import { SupportView } from '@/components/views/support-view'
import { ProfileView } from '@/components/views/profile-view'
import { NotificationsView } from '@/components/views/notifications-view'
import { AdminView } from '@/components/views/admin-view'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

export default function Home() {
  const view = useEggForm((s) => s.view)
  const section = useEggForm((s) => s.section)
  const isAuthenticated = useEggForm((s) => s.isAuthenticated)
  const setView = useEggForm((s) => s.setView)
  const setSection = useEggForm((s) => s.setSection)

  // Track active formation/hatching egg
  const [formationEggId, setFormationEggId] = useState<string | null>(null)
  const [hatchingEggId, setHatchingEggId] = useState<string | null>(null)

  // After hydration: if authenticated but still on landing, send to app.
  const [mounted] = useState(() => {
    if (isAuthenticated && view === 'landing') {
      queueMicrotask(() => setView('app'))
    }
    return true
  })

  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <>
      {/* Full-screen Hatching overlay — takes precedence over everything */}
      {hatchingEggId && view === 'app' && (
        <HatchingView
          eggId={hatchingEggId}
          onDone={() => {
            setHatchingEggId(null)
            setSection('animals')
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage />
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AppShell>
              <AnimatePresence mode="wait">
                <motion.div
                  key={section + (formationEggId || '')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {section === 'dashboard' && <DashboardView />}
                  {section === 'farm' && <FarmView />}
                  {section === 'eggs' && (
                    <EggsView
                      onOpenFormation={(eggId) => {
                        setFormationEggId(eggId)
                        setSection('formation')
                      }}
                    />
                  )}
                  {section === 'formation' && formationEggId && (
                    <FormationView
                      eggId={formationEggId}
                      onBack={() => {
                        setFormationEggId(null)
                        setSection('eggs')
                      }}
                      onHatch={(eggId) => {
                        setHatchingEggId(eggId)
                      }}
                    />
                  )}
                  {section === 'incubators' && <IncubatorsView />}
                  {section === 'animals' && <AnimalsView />}
                  {section === 'inventory' && <InventoryView />}
                  {section === 'marketplace' && <MarketplaceView />}
                  {section === 'missions' && <MissionsView />}
                  {section === 'achievements' && <AchievementsView />}
                  {section === 'events' && <EventsView />}
                  {section === 'game-wallet' && <GameWalletView />}
                  {section === 'pkr-wallet' && <PkrWalletView />}
                  {section === 'pkr-architecture' && <PkrArchitectureView />}
                  {section === 'kyc' && <KycView />}
                  {section === 'reports' && <ReportsView />}
                  {section === 'support' && <SupportView />}
                  {section === 'notifications' && <NotificationsView />}
                  {section === 'profile' && <ProfileView />}
                </motion.div>
              </AnimatePresence>
            </AppShell>
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding mascot — shows on first visit only */}
      {view === 'app' && <OnboardingMascot />}

      <AuthModal />
    </>
  )
}
