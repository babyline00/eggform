'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RarityBadge } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { EGG_TYPES, ANIMAL_TYPES, RARITY_LABEL } from '@/lib/game-data'
import { cn } from '@/lib/utils'

type HatchStage = 'shaking' | 'cracking' | 'bursting' | 'revealed'

interface HatchingViewProps {
  eggId: string
  onDone: () => void
}

export function HatchingView({ eggId, onDone }: HatchingViewProps) {
  const egg = useEggForm((s) => s.eggs.find((e) => e.id === eggId))
  const hatchEgg = useEggForm((s) => s.hatchEgg)

  const [stage, setStage] = React.useState<HatchStage>('shaking')

  React.useEffect(() => {
    if (!egg) return
    const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
    if (!eggType) return

    const timers: NodeJS.Timeout[] = []

    // Stage 1: shake (1s)
    timers.push(setTimeout(() => setStage('cracking'), 1000))
    // Stage 2: crack (1.2s)
    timers.push(setTimeout(() => setStage('bursting'), 2200))
    // Stage 3: light burst (0.8s)
    timers.push(setTimeout(() => {
      // Actually hatch the egg in store
      hatchEgg(egg.id)
      setStage('revealed')
    }, 3000))

    return () => timers.forEach(clearTimeout)
  }, [eggId])

  if (!egg) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-md flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Egg not found.</p>
          <Button onClick={onDone} className="mt-3">Close</Button>
        </div>
      </div>
    )
  }

  const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
  if (!eggType) return null
  const animalType = ANIMAL_TYPES.find((a) => a.slug === eggType.animalSlug)
  if (!animalType) return null

  const meta = RARITY_LABEL[animalType.rarity]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-b from-amber-50 via-emerald-50 to-sky-50 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-sky-950/30 backdrop-blur-md flex items-center justify-center z-50 overflow-hidden"
    >
      {/* Decorative background sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-4">
        <AnimatePresence mode="wait">
          {/* STAGE 1: SHAKING */}
          {stage === 'shaking' && (
            <motion.div
              key="shaking"
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-[10rem] drop-shadow-2xl"
              >
                🥚
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Almost ready...</h2>
                <p className="text-sm text-muted-foreground mt-1">Your egg is starting to shake!</p>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: CRACKING */}
          {stage === 'cracking' && (
            <motion.div
              key="cracking"
              initial={{ opacity: 0, scale: 0.9 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="text-[10rem] drop-shadow-2xl relative"
              >
                🥚
                {/* Crack overlay */}
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center text-5xl text-rose-500"
                >
                  💥
                </motion.div>
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Cracking...</h2>
                <p className="text-sm text-muted-foreground mt-1">Something is breaking through!</p>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: BURSTING */}
          {stage === 'bursting' && (
            <motion.div
              key="bursting"
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Light burst rays */}
              <div className="relative">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-32 h-1 bg-gradient-to-r from-amber-400 to-transparent origin-left"
                    style={{ rotate: `${i * 45}deg` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 3, 2], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8 }}
                  />
                ))}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 3], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8 }}
                  className="w-32 h-32 mx-auto rounded-full bg-amber-300 blur-2xl"
                />
              </div>
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-amber-700 dark:text-amber-300"
              >
                ✨ Hatching! ✨
              </motion.h2>
            </motion.div>
          )}

          {/* STAGE 4: REVEALED */}
          {stage === 'revealed' && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="space-y-4"
            >
              {/* Confetti */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    style={{
                      top: '30%',
                      left: `${10 + Math.random() * 80}%`,
                    }}
                    initial={{ y: 0, opacity: 1, rotate: 0 }}
                    animate={{ y: 400, opacity: 0, rotate: 720 }}
                    transition={{ duration: 2, delay: Math.random() * 0.5 }}
                  >
                    {['🎉', '✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 5)]}
                  </motion.div>
                ))}
              </div>

              {/* Animal reveal */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className={cn(
                  'inline-flex items-center justify-center w-48 h-48 rounded-3xl bg-gradient-to-br shadow-2xl',
                  animalType.rarity === 'common' && 'from-slate-100 to-slate-200 dark:from-slate-800/40 dark:to-slate-700/40',
                  animalType.rarity === 'uncommon' && 'from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40',
                  animalType.rarity === 'rare' && 'from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40',
                  animalType.rarity === 'epic' && 'from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40',
                  animalType.rarity === 'legendary' && 'from-fuchsia-100 to-rose-200 dark:from-fuchsia-900/40 dark:to-rose-800/40',
                  meta.glow,
                )}
              >
                <span className="text-9xl drop-shadow-lg">{animalType.emoji}</span>
              </motion.div>

              <div>
                <Badge variant="outline" className="mb-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-400/40">
                  🎉 Hatching Complete!
                </Badge>
                <h2 className="text-3xl font-bold">{animalType.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <RarityBadge rarity={animalType.rarity} />
                  <Badge variant="outline" className="text-[10px]">
                    +50 XP earned
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">
                  A new {animalType.name} has joined your farm. Start collecting its production right away!
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground btn-press"
                  onClick={onDone}
                >
                  <Check className="h-4 w-4 mr-1" /> Add to Farm
                </Button>
                <Button variant="outline" onClick={onDone}>
                  <ChevronRight className="h-4 w-4" /> View Animal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
