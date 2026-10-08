'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sprout, Zap, Star, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { AnimalCard, SectionHeader } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { ANIMAL_TYPES } from '@/lib/game-data'
import { formatRelativeTime } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

export function AnimalsView() {
  const animals = useEggForm((s) => s.animals)
  const collectProduction = useEggForm((s) => s.collectProduction)
  const upgradeAnimal = useEggForm((s) => s.upgradeAnimal)
  const gameWallet = useEggForm((s) => s.gameWallet)
  const { toast } = useToast()

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const selected = animals.find((a) => a.id === selectedId)

  function handleCollect(id: string) {
    collectProduction(id)
    toast({ title: 'Production collected!', description: 'Coins added to your wallet.' })
  }
  function handleUpgrade(id: string) {
    upgradeAnimal(id)
    toast({ title: 'Upgraded!', description: 'Your animal is now stronger.' })
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Animals"
        description={`${animals.length} animals on your farm. Collect production or upgrade them.`}
      />

      {animals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <Sprout className="h-10 w-10 mx-auto mb-2 opacity-30" />
            No animals yet. Hatch an egg to get one!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {animals.map((a) => (
            <AnimalCard
              key={a.id}
              animal={a}
              onCollect={() => handleCollect(a.id)}
              onUpgrade={() => handleUpgrade(a.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-md">
          {selected && (() => {
            const animalType = ANIMAL_TYPES.find((t) => t.id === selected.animalTypeId)
            if (!animalType) return null
            const nextLevelCost = (selected.level + 1) * 200
            const xpToNext = (selected.level * 200) - selected.xp
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{animalType.emoji}</span>
                    {selected.name || animalType.name}
                  </DialogTitle>
                  <DialogDescription>
                    {animalType.species} · {animalType.rarity}
                  </DialogDescription>
                </DialogHeader>

                <div className="aspect-video rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/20 flex items-center justify-center">
                  <motion.span
                    animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-8xl"
                  >
                    {animalType.emoji}
                  </motion.span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-card border text-center">
                    <div className="text-xs text-muted-foreground">Level</div>
                    <div className="text-xl font-bold">{selected.level}</div>
                    <Progress value={Math.min(100, (selected.xp / (selected.level * 200)) * 100)} className="h-1 mt-1" />
                  </div>
                  <div className="p-3 rounded-lg bg-card border text-center">
                    <div className="text-xs text-muted-foreground">Production</div>
                    <div className="text-xl font-bold">{selected.productionRate}/day</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{animalType.productionType}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-card border text-center">
                    <div className="text-xs text-muted-foreground">Health</div>
                    <div className="font-bold text-rose-600">{selected.health}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border text-center">
                    <div className="text-xs text-muted-foreground">Energy</div>
                    <div className="font-bold text-amber-600">{selected.energy}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border text-center">
                    <div className="text-xs text-muted-foreground">Happy</div>
                    <div className="font-bold text-emerald-600">{selected.happiness}%</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/50 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Last collected</span>
                    <span className="font-medium">{selected.lastCollectedAt ? formatRelativeTime(selected.lastCollectedAt) : 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Upgrade level</span>
                    <span className="font-medium">{selected.upgradeLevel}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleCollect(selected.id)}>
                    <Zap className="h-4 w-4 mr-1" /> Collect
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={selected.level >= animalType.maxLevel || gameWallet.coins < nextLevelCost}
                    onClick={() => handleUpgrade(selected.id)}
                  >
                    <ChevronUp className="h-4 w-4 mr-1" />
                    {selected.level >= animalType.maxLevel ? 'Max' : `Upgrade (${nextLevelCost}🪙)`}
                  </Button>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
