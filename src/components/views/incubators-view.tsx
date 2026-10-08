'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Plus, X, Zap, Egg } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { SectionHeader } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { EGG_TYPES, INCUBATOR_TYPES } from '@/lib/game-data'
import { formatCoins, formatDuration } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function IncubatorsView() {
  const incubators = useEggForm((s) => s.incubators)
  const eggs = useEggForm((s) => s.eggs)
  const startFormation = useEggForm((s) => s.startFormation)
  const cancelFormation = useEggForm((s) => s.cancelFormation)
  const careEgg = useEggForm((s) => s.careEgg)
  const hatchEgg = useEggForm((s) => s.hatchEgg)
  const gameWallet = useEggForm((s) => s.gameWallet)
  const setSection = useEggForm((s) => s.setSection)
  const { toast } = useToast()

  const [selectEggFor, setSelectEggFor] = React.useState<string | null>(null)
  const [, setTick] = React.useState(0)
  React.useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 500)
    return () => clearInterval(i)
  }, [])

  const availableEggs = eggs.filter((e) => e.status === 'owned')

  function handleStart(eggId: string, incId: string) {
    const ok = startFormation(eggId, incId)
    if (ok) {
      toast({ title: 'Formation started!', description: 'Timer is server-controlled.' })
      setSelectEggFor(null)
    } else {
      toast({ title: 'Cannot start', description: 'Check incubator tier and capacity.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Incubators"
        description="Place eggs in incubators to start formation. Higher-tier incubators are faster and hold more eggs."
        action={
          <Button size="sm" onClick={() => setSection('eggs')}>
            <Egg className="h-4 w-4 mr-1" /> Buy eggs
          </Button>
        }
      />

      {/* Available incubator types (shop) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Incubator Shop</CardTitle>
          <CardDescription className="text-xs">Unlock more capacity and speed by buying better incubators.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {INCUBATOR_TYPES.map((inc) => {
              const owned = incubators.some((i) => i.type === inc.type)
              return (
                <Card key={inc.type} className={cn('overflow-hidden', owned && 'border-emerald-500/40')}>
                  <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/20 flex items-center justify-center">
                    <span className="text-6xl">{inc.emoji}</span>
                  </div>
                  <CardContent className="p-3">
                    <div className="font-semibold text-sm">{inc.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{inc.description}</div>
                    <div className="flex items-center gap-2 mt-2 text-[10px]">
                      <Badge variant="outline">📦 {inc.capacity}</Badge>
                      <Badge variant="outline">⚡ {inc.speedMultiplier}×</Badge>
                    </div>
                    {owned ? (
                      <Badge className="w-full mt-2 justify-center bg-emerald-500 text-white text-[10px]">Owned</Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full mt-2 h-7 text-xs"
                        disabled={gameWallet.coins < inc.price}
                        onClick={() => toast({ title: 'Coming soon', description: 'Incubator purchases are coming in the next release.' })}
                      >
                        {inc.price === 0 ? 'Free' : `${formatCoins(inc.price)} 🪙`}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Your incubators */}
      <div className="grid md:grid-cols-2 gap-4">
        {incubators.map((inc) => {
          const incType = INCUBATOR_TYPES.find((t) => t.type === inc.type)
          const eggsInInc = eggs.filter((e) => e.incubatorId === inc.id && e.status === 'incubating')
          const slotsUsed = eggsInInc.length
          const slotsFree = inc.capacity - slotsUsed
          return (
            <Card key={inc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-2xl">{incType?.emoji}</span>
                    {incType?.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {slotsUsed}/{inc.capacity} used
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Speed: {inc.speedMultiplier}× · Level {inc.level}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Slot grid */}
                <div className={cn(
                  'grid gap-2 mb-3',
                  inc.capacity <= 1 && 'grid-cols-1',
                  inc.capacity <= 3 && 'grid-cols-3',
                  inc.capacity <= 5 && 'grid-cols-5',
                  inc.capacity > 5 && 'grid-cols-5',
                )}>
                  {Array.from({ length: inc.capacity }).map((_, idx) => {
                    const eggInSlot = eggsInInc[idx]
                    if (!eggInSlot) {
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectEggFor(inc.id)}
                          disabled={availableEggs.length === 0}
                          className={cn(
                            'aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-xs transition',
                            availableEggs.length > 0
                              ? 'border-primary/30 hover:border-primary/60 hover:bg-accent/40'
                              : 'border-muted opacity-40 cursor-not-allowed',
                          )}
                        >
                          {availableEggs.length > 0 ? (
                            <Plus className="h-4 w-4 text-primary" />
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Empty</span>
                          )}
                        </button>
                      )
                    }
                    const eggType = EGG_TYPES.find((e) => e.id === eggInSlot.eggTypeId)
                    if (!eggType) return null
                    const remaining = eggInSlot.formationEndsAt ? Math.max(0, eggInSlot.formationEndsAt - Date.now()) : 0
                    const total = eggType.formationDurationSec * 1000
                    const progress = eggInSlot.formationEndsAt ? Math.min(100, ((total - remaining) / total) * 100) : 0
                    const isReady = remaining === 0
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'aspect-square rounded-lg bg-gradient-to-br border p-1.5 flex flex-col items-center justify-center relative',
                          eggType.gradient,
                          isReady && 'animate-ready-glow ring-2 ring-emerald-500/40',
                        )}
                      >
                        <motion.span
                          animate={isReady ? { rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] } : { y: [0, -2, 0] }}
                          transition={{ duration: isReady ? 0.5 : 2, repeat: Infinity }}
                          className="text-3xl"
                        >
                          🥚
                        </motion.span>
                        <div className="text-[8px] font-mono mt-0.5">
                          {isReady ? 'READY' : formatDuration(remaining)}
                        </div>
                        {isReady && (
                          <Button
                            size="sm"
                            className="absolute inset-0 m-auto h-6 w-6 p-0 text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white"
                            onClick={() => {
                              hatchEgg(eggInSlot.id)
                              toast({ title: '🐣 Hatched!' })
                            }}
                          >
                            ✓
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Detail rows for each egg in incubator */}
                {eggsInInc.length > 0 && (
                  <div className="space-y-2">
                    {eggsInInc.map((egg) => {
                      const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
                      if (!eggType) return null
                      const remaining = egg.formationEndsAt ? Math.max(0, egg.formationEndsAt - Date.now()) : 0
                      const total = eggType.formationDurationSec * 1000
                      const progress = egg.formationEndsAt ? Math.min(100, ((total - remaining) / total) * 100) : 0
                      const isReady = remaining === 0
                      return (
                        <div key={egg.id} className="p-2 rounded-lg border bg-card">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🥚</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold truncate">{eggType.name}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {isReady ? 'Ready!' : `${Math.floor(progress)}% · ${formatDuration(remaining)}`}
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-[10px]" onClick={() => careEgg(egg.id, 'feed')}>🌾</Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-[10px]" onClick={() => careEgg(egg.id, 'water')}>💧</Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-[10px]" onClick={() => careEgg(egg.id, 'warm')}>🔥</Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-[10px]" onClick={() => careEgg(egg.id, 'boost')}>🚀</Button>
                            </div>
                          </div>
                          <Progress value={progress} className="h-1" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Egg selector dialog */}
      <Dialog open={!!selectEggFor} onOpenChange={(o) => !o && setSelectEggFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" /> Select an egg
            </DialogTitle>
            <DialogDescription>
              Choose an egg from your inventory to start formation.
            </DialogDescription>
          </DialogHeader>

          {availableEggs.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No eggs available. Buy one from the shop first.
              <Button className="block mx-auto mt-3" size="sm" onClick={() => setSection('eggs')}>
                Go to Egg Shop
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {availableEggs.map((egg) => {
                const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
                if (!eggType) return null
                return (
                  <button
                    key={egg.id}
                    onClick={() => selectEggFor && handleStart(egg.id, selectEggFor)}
                    className="rounded-lg border hover:border-primary/40 hover:bg-accent/40 transition p-2"
                  >
                    <div className={cn('aspect-square rounded-md bg-gradient-to-br flex items-center justify-center', eggType.gradient)}>
                      <span className="text-4xl">🥚</span>
                    </div>
                    <div className="text-xs font-semibold mt-1 truncate">{eggType.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {eggType.formationDurationSec >= 3600 ? `${eggType.formationDurationSec / 3600}h` : `${eggType.formationDurationSec / 60}min`}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
