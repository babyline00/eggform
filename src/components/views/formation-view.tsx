'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Heart, Droplets, Thermometer, Zap, Sparkles, Clock, Coins } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SectionHeader, RarityBadge } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { EGG_TYPES } from '@/lib/game-data'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'

interface FormationViewProps {
  eggId: string
  onBack: () => void
  onHatch: (eggId: string) => void
}

export function FormationView({ eggId, onBack, onHatch }: FormationViewProps) {
  const egg = useEggForm((s) => s.eggs.find((e) => e.id === eggId))
  const careEgg = useEggForm((s) => s.careEgg)
  const cancelFormation = useEggForm((s) => s.cancelFormation)

  const [, setTick] = React.useState(0)
  React.useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 500)
    return () => clearInterval(i)
  }, [])

  if (!egg) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Egg not found.</p>
        <Button onClick={onBack} className="mt-3">Back to Eggs</Button>
      </div>
    )
  }

  const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
  if (!eggType) return null

  const remaining = egg.formationEndsAt ? Math.max(0, egg.formationEndsAt - Date.now()) : 0
  const total = eggType.formationDurationSec * 1000
  const progress = egg.formationEndsAt
    ? Math.min(100, Math.max(0, ((total - remaining) / total) * 100))
    : 0
  const isReady = remaining === 0
  const isIncubating = egg.status === 'incubating'

  const careActions = [
    { action: 'feed' as const, label: 'Feed', emoji: '🌾', cost: '5🪙', desc: 'Restores health', effect: '+5 Health' },
    { action: 'water' as const, label: 'Water', emoji: '💧', cost: '3🪙', desc: 'Restores moisture', effect: '+7 Moisture' },
    { action: 'warm' as const, label: 'Warm', emoji: '🔥', cost: '4🪙', desc: 'Restores temperature', effect: '+4 Temperature' },
    { action: 'boost' as const, label: 'Boost', emoji: '🚀', cost: '1💎', desc: 'Skip 1 minute', effect: 'Time -1:00' },
  ]

  const bonuses = [
    { label: 'Health Bonus', value: `${Math.floor(egg.careHealth / 5)}%`, desc: 'Better hatch quality' },
    { label: 'Care Streak', value: '7 days', desc: 'Daily care reward' },
    { label: 'Incubator Boost', value: '1.5×', desc: 'From Advanced Incubator' },
  ]

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" /> Back to Eggs
      </button>

      <SectionHeader
        title="Egg Formation"
        description="Care for your egg to maximize hatch quality and time."
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Egg visualization */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className={cn('aspect-[4/3] bg-gradient-to-br flex items-center justify-center relative', eggType.gradient)}>
            {/* Decorative sun/light */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-200/40 dark:bg-amber-700/20 blur-3xl" />

            {/* Egg with stage-appropriate animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              {isReady ? (
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="text-[12rem] drop-shadow-2xl"
                >
                  🥚
                </motion.div>
              ) : isIncubating ? (
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [-1, 1, -1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[12rem] drop-shadow-2xl"
                >
                  🥚
                </motion.div>
              ) : (
                <div className="text-[12rem] drop-shadow-2xl">🥚</div>
              )}

              {/* Sparkles for ready eggs */}
              {isReady && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-2xl"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    >
                      ✨
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>

            <div className="absolute top-4 left-4">
              <RarityBadge rarity={eggType.rarity} className="text-xs" />
            </div>

            {isReady && (
              <div className="absolute bottom-4 right-4">
                <Badge className="bg-emerald-500 text-white text-xs animate-pulse">
                  ✓ READY TO HATCH
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{eggType.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Status: <span className="font-medium capitalize text-foreground">{egg.status}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Value</div>
                <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {eggType.virtualValue.toLocaleString()}
                </div>
              </div>
            </div>

            {isIncubating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Formation Progress
                  </span>
                  <span className={cn('font-mono font-bold', isReady ? 'text-emerald-600 dark:text-emerald-400' : '')}>
                    {isReady ? 'READY' : formatDuration(remaining)}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.floor(progress)}%</span>
                  <span>Total: {eggType.formationDurationSec >= 3600 ? `${eggType.formationDurationSec / 3600}h` : `${eggType.formationDurationSec / 60}m`}</span>
                </div>
              </div>
            )}

            {isReady ? (
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-base btn-press shadow-premium"
                onClick={() => onHatch(egg.id)}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Hatch Now
              </Button>
            ) : isIncubating ? (
              <Button
                variant="outline"
                className="w-full h-10 btn-press"
                onClick={() => {
                  cancelFormation(egg.id)
                  onBack()
                }}
              >
                Cancel Formation
              </Button>
            ) : (
              <div className="p-3 rounded-lg bg-secondary/50 text-xs text-center text-muted-foreground">
                This egg is ready to be placed in an incubator. Visit the Eggs screen to start formation.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Care + Bonuses panel */}
        <div className="space-y-4">
          {/* Care stats */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-3">Egg Care Stats</h4>
              <div className="space-y-3">
                {[
                  { label: 'Health', value: egg.careHealth, icon: Heart, color: 'text-rose-500', barColor: 'bg-rose-500' },
                  { label: 'Temperature', value: egg.careTemperature, icon: Thermometer, color: 'text-orange-500', barColor: 'bg-orange-500' },
                  { label: 'Moisture', value: egg.careMoisture, icon: Droplets, color: 'text-cyan-500', barColor: 'bg-cyan-500' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5">
                        <stat.icon className={cn('h-3.5 w-3.5', stat.color)} />
                        {stat.label}
                      </span>
                      <span className="font-mono font-semibold">{stat.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className={cn('h-full rounded-full', stat.barColor)}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Care actions */}
          {isIncubating && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3">Care Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {careActions.map((c) => (
                    <button
                      key={c.action}
                      onClick={() => careEgg(egg.id, c.action)}
                      className="p-3 rounded-xl border hover:border-primary/40 hover:bg-accent/40 transition flex flex-col items-start gap-1 text-left btn-press"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xl">{c.emoji}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{c.cost}</span>
                      </div>
                      <span className="text-xs font-semibold">{c.label}</span>
                      <span className="text-[9px] text-muted-foreground">{c.effect}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bonuses */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Active Bonuses
              </h4>
              <div className="space-y-2">
                {bonuses.map((b) => (
                  <div key={b.label} className="flex items-center justify-between p-2 rounded-lg bg-secondary/40">
                    <div>
                      <div className="text-xs font-medium">{b.label}</div>
                      <div className="text-[10px] text-muted-foreground">{b.desc}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-400/40">
                      {b.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
