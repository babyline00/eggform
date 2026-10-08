'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEggForm } from '@/lib/store'

// Animated EggForm mascot — guides first-time users through key features.
// Per design spec §9 — friendly illustrations + onboarding flow.
// Shows on first visit (persisted in localStorage).

const STORAGE_KEY = 'eggform-onboarding-completed'

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to EggForm!',
    text: "Hi! I'm Eggy, your farm assistant. Let me show you around in 30 seconds.",
    cta: "Let's go!",
  },
  {
    emoji: '🥚',
    title: 'Buy Your First Egg',
    text: "Visit the Egg Shop to buy eggs. Each rarity hatches into a different animal — from chickens to legendary dragons!",
    cta: 'Got it',
  },
  {
    emoji: '🔥',
    title: 'Place in Incubator',
    text: 'Drop your egg into an incubator to start formation. Higher-tier incubators are faster and hold more eggs.',
    cta: 'Got it',
  },
  {
    emoji: '🐣',
    title: 'Hatch & Care',
    text: "When formation completes, tap 'Hatch' to reveal your new animal. Care for it (feed, water, warm) to boost its quality!",
    cta: 'Got it',
  },
  {
    emoji: '🐔',
    title: 'Collect Production',
    text: 'Your animals produce resources over real time. Tap Collect to add coins, gems, or tickets to your wallet.',
    cta: 'Got it',
  },
  {
    emoji: '💰',
    title: 'Two Wallets — Keep Them Separate',
    text: 'Game Wallet holds virtual coins, gems, and tickets (earned in-game). PKR Wallet holds real money (regulated). They are NEVER interchangeable.',
    cta: 'Got it',
  },
  {
    emoji: '🛒',
    title: 'Trade on Marketplace',
    text: 'List your eggs, animals, and resources for sale. Buy from other players. All transactions are server-verified for fair play.',
    cta: "Let's start!",
  },
]

export function OnboardingMascot() {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const setSection = useEggForm((s) => s.setSection)
  const buyEgg = useEggForm((s) => s.buyEgg)
  const gameWallet = useEggForm((s) => s.gameWallet)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      // Delay slightly so the app loads first
      const t = setTimeout(() => setOpen(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      // Complete onboarding
      localStorage.setItem(STORAGE_KEY, 'true')
      setOpen(false)
      // Navigate to eggs shop as the natural next step
      setSection('eggs')
    }
  }

  function handleSkip() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setOpen(false)
  }

  if (!open) return null

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="bg-card border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with mascot */}
            <div className="relative bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950/40 dark:to-emerald-900/30 aspect-[3/1] flex items-center justify-center">
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [-2, 2, -2],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-8xl drop-shadow-md"
              >
                {current.emoji}
              </motion.div>
              <button
                onClick={handleSkip}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition"
                aria-label="Skip onboarding"
              >
                <X className="h-4 w-4" />
              </button>
              {/* Progress dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/60' : 'w-1.5 bg-foreground/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-xl font-bold">{current.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{current.text}</p>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handleSkip}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Skip tour
                </button>
                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press"
                >
                  {current.cta}
                  {step < STEPS.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>

              <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
