'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Egg, ShoppingCart, ChevronRight, X, Sparkles, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useEggForm } from '@/lib/store'
import { EGG_TYPES, INCUBATOR_TYPES } from '@/lib/game-data'
import { formatDuration } from '@/lib/format'
import { RarityBadge, EggCard, SectionHeader } from '@/components/cards'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function EggsView({ onOpenFormation }: { onOpenFormation?: (eggId: string) => void }) {
  const eggs = useEggForm((s) => s.eggs)
  const incubators = useEggForm((s) => s.incubators)
  const buyEgg = useEggForm((s) => s.buyEgg)
  const startFormation = useEggForm((s) => s.startFormation)
  const cancelFormation = useEggForm((s) => s.cancelFormation)
  const careEgg = useEggForm((s) => s.careEgg)
  const hatchEgg = useEggForm((s) => s.hatchEgg)
  const gameWallet = useEggForm((s) => s.gameWallet)
  const { toast } = useToast()

  const [selectedEggId, setSelectedEggId] = React.useState<string | null>(null)
  const [confirmBuy, setConfirmBuy] = React.useState<string | null>(null)

  const myEggs = eggs.filter((e) => e.status === 'owned' || e.status === 'incubating')
  const selectedEgg = eggs.find((e) => e.id === selectedEggId)
  const [, setTick] = React.useState(0)
  React.useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 500)
    return () => clearInterval(i)
  }, [])

  function handleBuy(eggTypeId: string) {
    const eggType = EGG_TYPES.find((e) => e.id === eggTypeId)
    if (!eggType) return
    if (gameWallet.coins < eggType.virtualValue) {
      toast({ title: 'Not enough coins', description: `You need ${eggType.virtualValue - gameWallet.coins} more coins.`, variant: 'destructive' })
      return
    }
    setConfirmBuy(eggTypeId)
  }

  function confirmBuyAction() {
    if (!confirmBuy) return
    const ok = buyEgg(confirmBuy)
    if (ok) {
      toast({ title: 'Egg purchased!', description: 'Check your inventory to start incubation.' })
    } else {
      toast({ title: 'Purchase failed', variant: 'destructive' })
    }
    setConfirmBuy(null)
  }

  function handleStartFormation(eggId: string, incubatorId: string) {
    const ok = startFormation(eggId, incubatorId)
    if (ok) {
      toast({ title: 'Formation started!', description: 'Timer is server-controlled. Check back when ready.' })
      setSelectedEggId(null)
    } else {
      toast({ title: 'Cannot start formation', description: 'Check incubator capacity and tier.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Eggs"
        description="Buy eggs from the shop or view your current collection."
      />

      <Tabs defaultValue="shop">
        <TabsList>
          <TabsTrigger value="shop">🛒 Egg Shop</TabsTrigger>
          <TabsTrigger value="mine">🥚 My Eggs ({myEggs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-3">
          <Card>
            <CardContent className="p-3 flex items-center gap-2 text-xs">
              <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                Coins: {gameWallet.coins.toLocaleString()}
              </Badge>
              <span className="text-muted-foreground">Each egg has a rarity, formation time, and required incubator tier.</span>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {EGG_TYPES.map((eggType) => {
              const canAfford = gameWallet.coins >= eggType.virtualValue
              return (
                <Card key={eggType.id} className="overflow-hidden hover:scale-105 transition">
                  <div className={cn('aspect-square bg-gradient-to-br flex items-center justify-center', eggType.gradient)}>
                    <motion.span
                      animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-7xl"
                    >
                      🥚
                    </motion.span>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{eggType.name}</div>
                        <RarityBadge rarity={eggType.rarity} className="mt-1" />
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-2 space-y-0.5">
                      <div>⏱ {eggType.formationDurationSec >= 3600 ? `${eggType.formationDurationSec / 3600}h` : `${eggType.formationDurationSec / 60}min`} formation</div>
                      <div>📦 Requires {eggType.requiredIncubator} incubator</div>
                      <div>📊 Lv {eggType.requiredLevel} required</div>
                    </div>
                    <Button
                      size="sm"
                      className={cn(
                        'w-full mt-2 h-7 text-xs',
                        canAfford
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                          : 'bg-muted text-muted-foreground cursor-not-allowed',
                      )}
                      disabled={!canAfford}
                      onClick={() => handleBuy(eggType.id)}
                    >
                      {eggType.virtualValue.toLocaleString()} 🪙
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="mine" className="space-y-3">
          {myEggs.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
              <Egg className="h-10 w-10 mx-auto mb-2 opacity-30" />
              You have no eggs yet. Visit the shop to buy your first one.
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {myEggs.map((egg) => {
                const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
                if (!eggType) return null
                const isReady = egg.status === 'incubating' && egg.formationEndsAt && Date.now() >= egg.formationEndsAt
                return (
                  <EggCard
                    key={egg.id}
                    egg={egg}
                    showProgress={egg.status === 'incubating'}
                    showCare={egg.status === 'incubating'}
                    actionLabel={
                      egg.status === 'incubating'
                        ? (isReady ? 'Hatch' : 'View')
                        : 'Incubate'
                    }
                    onAction={() => {
                      if (isReady) {
                        // Trigger hatching overlay
                        if (onOpenFormation) onOpenFormation(egg.id)
                        else {
                          hatchEgg(egg.id)
                          toast({ title: '🐣 Hatched!', description: `A new ${eggType.name.replace('Egg', '')} joined your farm.` })
                        }
                      } else if (egg.status === 'incubating' && onOpenFormation) {
                        // Open the dedicated Formation screen
                        onOpenFormation(egg.id)
                      } else {
                        setSelectedEggId(egg.id)
                      }
                    }}
                  />
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Egg detail dialog */}
      <Dialog open={!!selectedEgg} onOpenChange={(o) => !o && setSelectedEggId(null)}>
        <DialogContent className="max-w-md">
          {selectedEgg && (() => {
            const eggType = EGG_TYPES.find((e) => e.id === selectedEgg.eggTypeId)
            if (!eggType) return null
            const isIncubating = selectedEgg.status === 'incubating'
            const remaining = selectedEgg.formationEndsAt ? Math.max(0, selectedEgg.formationEndsAt - Date.now()) : 0
            const isReady = isIncubating && remaining === 0
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Egg className="h-4 w-4 text-amber-600" /> {eggType.name}
                  </DialogTitle>
                  <DialogDescription>
                    Status: {selectedEgg.status}
                  </DialogDescription>
                </DialogHeader>

                <div className={cn('aspect-video rounded-lg bg-gradient-to-br flex items-center justify-center mb-3', eggType.gradient)}>
                  <motion.span
                    animate={isReady ? { rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] } : { y: [0, -4, 0] }}
                    transition={{ duration: isReady ? 0.6 : 3, repeat: Infinity }}
                    className="text-8xl"
                  >
                    🥚
                  </motion.span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="p-2 rounded-lg bg-card border">
                    <div className="text-xs text-muted-foreground">Health</div>
                    <div className="font-bold text-rose-600">{selectedEgg.careHealth}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border">
                    <div className="text-xs text-muted-foreground">Temp</div>
                    <div className="font-bold text-orange-600">{selectedEgg.careTemperature}°</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border">
                    <div className="text-xs text-muted-foreground">Moisture</div>
                    <div className="font-bold text-cyan-600">{selectedEgg.careMoisture}%</div>
                  </div>
                </div>

                {isIncubating && (
                  <div className="mb-3 p-3 rounded-lg bg-secondary/50 text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {isReady ? 'Ready to hatch!' : 'Time remaining'}
                    </div>
                    <div className="font-mono text-lg font-bold">
                      {isReady ? '✓ READY' : formatDuration(remaining)}
                    </div>
                  </div>
                )}

                {isIncubating && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { action: 'feed' as const, label: 'Feed', emoji: '🌾', cost: '5🪙' },
                      { action: 'water' as const, label: 'Water', emoji: '💧', cost: '3🪙' },
                      { action: 'warm' as const, label: 'Warm', emoji: '🔥', cost: '4🪙' },
                      { action: 'boost' as const, label: 'Boost', emoji: '🚀', cost: '1💎' },
                    ].map((c) => (
                      <button
                        key={c.action}
                        onClick={() => careEgg(selectedEgg.id, c.action)}
                        className="p-2 rounded-lg border hover:border-primary/40 hover:bg-accent/40 transition flex flex-col items-center gap-1"
                      >
                        <span className="text-xl">{c.emoji}</span>
                        <span className="text-[10px] font-medium">{c.label}</span>
                        <span className="text-[9px] text-muted-foreground">{c.cost}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  {!isIncubating && (
                    <>
                      <p className="text-xs text-muted-foreground text-center mb-2">
                        Choose an incubator to start formation:
                      </p>
                      {incubators.map((inc) => {
                        const incType = INCUBATOR_TYPES.find((t) => t.type === inc.type)
                        const eggsInInc = eggs.filter((e) => e.incubatorId === inc.id && e.status === 'incubating').length
                        const canFit = eggsInInc < inc.capacity
                        return (
                          <button
                            key={inc.id}
                            onClick={() => handleStartFormation(selectedEgg.id, inc.id)}
                            disabled={!canFit}
                            className={cn(
                              'w-full p-3 rounded-lg border flex items-center gap-3 transition',
                              canFit
                                ? 'hover:border-primary/40 hover:bg-accent/40'
                                : 'opacity-50 cursor-not-allowed',
                            )}
                          >
                            <span className="text-2xl">{incType?.emoji || '📦'}</span>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium">{incType?.name}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {eggsInInc}/{inc.capacity} slots used · {inc.speedMultiplier}× speed
                              </div>
                            </div>
                            {canFit && <ChevronRight className="h-4 w-4" />}
                          </button>
                        )
                      })}
                    </>
                  )}

                  {isReady && (
                    <Button
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => {
                        hatchEgg(selectedEgg.id)
                        toast({ title: '🐣 Hatched!', description: 'A new animal joined your farm.' })
                        setSelectedEggId(null)
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> Hatch Now
                    </Button>
                  )}

                  {isIncubating && !isReady && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        cancelFormation(selectedEgg.id)
                        toast({ title: 'Formation cancelled', description: 'Egg returned to inventory.' })
                        setSelectedEggId(null)
                      }}
                    >
                      Cancel formation
                    </Button>
                  )}
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Buy confirmation */}
      <Dialog open={!!confirmBuy} onOpenChange={(o) => !o && setConfirmBuy(null)}>
        <DialogContent className="max-w-sm">
          {confirmBuy && (() => {
            const eggType = EGG_TYPES.find((e) => e.id === confirmBuy)
            if (!eggType) return null
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Confirm purchase</DialogTitle>
                  <DialogDescription>You are about to buy one {eggType.name}.</DialogDescription>
                </DialogHeader>
                <div className={cn('aspect-video rounded-lg bg-gradient-to-br flex items-center justify-center', eggType.gradient)}>
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-6xl"
                  >
                    🥚
                  </motion.span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="text-sm">Cost</div>
                  <div className="font-bold">{eggType.virtualValue.toLocaleString()} 🪙</div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="text-sm">Balance after</div>
                  <div className="font-bold">{(gameWallet.coins - eggType.virtualValue).toLocaleString()} 🪙</div>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={confirmBuyAction}
                >
                  <Check className="h-4 w-4 mr-1" /> Confirm Purchase
                </Button>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
