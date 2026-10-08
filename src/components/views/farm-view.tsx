'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Sprout, ChevronRight, Home, Factory, TreeDeciduous, Egg } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SectionHeader } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { EGG_TYPES, ANIMAL_TYPES, INCUBATOR_TYPES } from '@/lib/game-data'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'

const BUILDINGS = [
  { emoji: '🏠', name: 'Farmhouse', level: 3, desc: 'Your base of operations' },
  { emoji: '🏭', name: 'Production Facility', level: 2, desc: 'Processes raw resources' },
  { emoji: '🐔', name: 'Chicken Coop', level: 4, desc: 'Houses up to 20 chickens' },
  { emoji: '🌾', name: 'Feed Factory', level: 2, desc: 'Generates feed for animals' },
  { emoji: '🌳', name: 'Decoration: Old Oak', level: 1, desc: '+5% happiness to nearby animals' },
  { emoji: '⚙️', name: 'Upgrade Center', level: 1, desc: 'Boost buildings & animals' },
]

export function FarmView() {
  const animals = useEggForm((s) => s.animals)
  const eggs = useEggForm((s) => s.eggs)
  const incubators = useEggForm((s) => s.incubators)
  const user = useEggForm((s) => s.currentUser)
  const setSection = useEggForm((s) => s.setSection)
  const hatchEgg = useEggForm((s) => s.hatchEgg)
  const collectProduction = useEggForm((s) => s.collectProduction)

  const [, setTick] = React.useState(0)
  React.useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(i)
  }, [])

  const activeIncubations = eggs.filter((e) => e.status === 'incubating')

  return (
    <div className="space-y-5">
      <SectionHeader
        title={user?.farmName || 'My Farm'}
        description={`Level ${user?.level} · ${user?.xp} XP · ${animals.length} animals · ${activeIncubations.length} eggs incubating`}
        action={
          <Button variant="outline" size="sm" onClick={() => setSection('eggs')}>
            <Egg className="h-4 w-4 mr-1" /> Buy egg
          </Button>
        }
      />

      {/* Farm grid visualization */}
      <Card>
        <CardContent className="p-4">
          <div className="aspect-[16/10] rounded-xl bg-gradient-to-b from-sky-100/40 via-emerald-50 to-amber-50/40 dark:from-sky-950/20 dark:via-emerald-950/20 dark:to-amber-950/20 border p-4 grid grid-cols-4 md:grid-cols-6 gap-3 relative overflow-hidden">
            <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-amber-200/50 dark:bg-amber-700/20 blur-3xl" />
            <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-emerald-200/40 dark:bg-emerald-800/20 blur-2xl" />

            {/* Buildings tiles */}
            {BUILDINGS.slice(0, 6).map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-lg bg-card border hover:border-primary/40 hover:scale-105 transition p-2 flex flex-col items-center justify-center gap-1 cursor-pointer relative"
              >
                <span className="text-3xl md:text-4xl">{b.emoji}</span>
                <div className="text-[10px] font-medium text-center truncate w-full">{b.name}</div>
                <Badge variant="outline" className="text-[8px] absolute top-1 right-1 px-1 py-0">Lv {b.level}</Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active incubations strip */}
      {activeIncubations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Egg className="h-4 w-4 text-amber-600" /> Active Incubations ({activeIncubations.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeIncubations.map((egg) => {
              const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
              if (!eggType) return null
              const remaining = egg.formationEndsAt ? Math.max(0, egg.formationEndsAt - Date.now()) : 0
              const total = eggType.formationDurationSec * 1000
              const progress = egg.formationEndsAt ? Math.min(100, ((total - remaining) / total) * 100) : 0
              const isReady = remaining === 0
              return (
                <Card key={egg.id} className={cn('overflow-hidden', isReady && 'animate-ready-glow ring-2 ring-emerald-500/40')}>
                  <div className={cn('aspect-[3/1] flex items-center gap-3 p-3 bg-gradient-to-br', eggType.gradient)}>
                    <motion.span
                      animate={isReady ? { rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] } : { y: [0, -3, 0] }}
                      transition={{ duration: isReady ? 0.5 : 3, repeat: Infinity }}
                      className="text-5xl"
                    >
                      🥚
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{eggType.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {isReady ? '✓ Ready to hatch!' : `${Math.floor(progress)}% · ${formatDuration(remaining)}`}
                      </div>
                      <Progress value={progress} className="h-1 mt-1" />
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <Button
                      size="sm"
                      className={cn(
                        'w-full h-7 text-xs',
                        isReady
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-muted text-muted-foreground cursor-not-allowed',
                      )}
                      onClick={() => isReady && hatchEgg(egg.id)}
                      disabled={!isReady}
                    >
                      {isReady ? 'Hatch now' : 'Forming...'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Animals on farm */}
      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Sprout className="h-4 w-4 text-emerald-600" /> Animals on this farm ({animals.length})
        </h3>
        {animals.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No animals yet.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {animals.map((a) => {
              const animalType = ANIMAL_TYPES.find((t) => t.id === a.animalTypeId)
              if (!animalType) return null
              return (
                <Card key={a.id} className="text-center hover:scale-105 transition">
                  <CardContent className="p-3">
                    <div className="text-5xl mb-1">{animalType.emoji}</div>
                    <div className="text-xs font-semibold truncate">{a.name || animalType.name}</div>
                    <div className="text-[10px] text-muted-foreground">Lv {a.level}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-7 text-[10px] mt-2"
                      onClick={() => collectProduction(a.id)}
                    >
                      Collect
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Buildings list */}
      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Home className="h-4 w-4" /> Buildings & Upgrades
        </h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {BUILDINGS.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-accent/40">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                    {b.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{b.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{b.desc}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Lv {b.level}</Badge>
                  <Button size="sm" variant="ghost" className="text-xs h-7">Upgrade</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
