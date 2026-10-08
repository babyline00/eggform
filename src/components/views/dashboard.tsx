'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'lucide-react'
import {
  Egg,
  Sprout,
  Coins,
  Wallet,
  Zap,
  Star,
  TrendingUp,
  ShoppingBag,
  Target,
  Bell,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatCard, EggCard, AnimalCard, SectionHeader } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { EGG_TYPES, ANIMAL_TYPES } from '@/lib/game-data'
import { formatCoins, formatPkr, formatDuration, formatRelativeTime } from '@/lib/format'

export function DashboardView() {
  const user = useEggForm((s) => s.currentUser)
  const gameWallet = useEggForm((s) => s.gameWallet)
  const pkrWallet = useEggForm((s) => s.pkrWallet)
  const eggs = useEggForm((s) => s.eggs)
  const animals = useEggForm((s) => s.animals)
  const notifications = useEggForm((s) => s.notifications)
  const userMissions = useEggForm((s) => s.userMissions)
  const missions = useEggForm((s) => s.missions)
  const setSection = useEggForm((s) => s.setSection)
  const hatchEgg = useEggForm((s) => s.hatchEgg)

  const [, setTick] = React.useState(0)
  React.useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(i)
  }, [])

  const activeIncubations = eggs.filter((e) => e.status === 'incubating')
  const readyEggs = activeIncubations.filter((e) => e.formationEndsAt && Date.now() >= e.formationEndsAt)
  const totalAnimals = animals.length
  const pendingMissions = userMissions.filter((m) => m.status === 'completed' && !m.claimedAt).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold">{user?.fullName || 'Farmer'} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user?.farmName} · Level {user?.level} · {user?.xp} XP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setSection('eggs')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Egg className="h-4 w-4 mr-1" /> Buy Egg
          </Button>
          <Button variant="outline" onClick={() => setSection('pkr-wallet')}>
            <Wallet className="h-4 w-4 mr-1" /> Deposit PKR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Coins} label="Coins" value={formatCoins(gameWallet.coins)} sub={`+${gameWallet.gems} gems`} accent="amber" />
        <StatCard icon={Wallet} label="PKR Available" value={formatPkr(pkrWallet.available)} sub={`${formatPkr(pkrWallet.pending)} pending`} accent="emerald" />
        <StatCard icon={Egg} label="Active Incubations" value={activeIncubations.length} sub={`${readyEggs.length} ready to hatch`} accent="rose" />
        <StatCard icon={Sprout} label="Animals" value={totalAnimals} sub="Producing" accent="fuchsia" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" /> Your Farm
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSection('farm')} className="text-xs">
                Open farm <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FarmPreview />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Egg className="h-5 w-5 text-amber-600" /> Active Incubations
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSection('incubators')} className="text-xs">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeIncubations.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <Egg className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No active incubations.
                <Button variant="link" className="block mx-auto text-xs p-0 h-auto mt-1" onClick={() => setSection('eggs')}>
                  Start one now →
                </Button>
              </div>
            ) : (
              activeIncubations.slice(0, 3).map((egg) => {
                const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
                if (!eggType) return null
                const remaining = egg.formationEndsAt ? Math.max(0, egg.formationEndsAt - Date.now()) : 0
                const total = eggType.formationDurationSec * 1000
                const progress = egg.formationEndsAt ? Math.min(100, ((total - remaining) / total) * 100) : 0
                const isReady = remaining === 0
                return (
                  <div key={egg.id} className="p-3 rounded-lg border bg-card hover:border-primary/40 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🥚</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{eggType.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {isReady ? 'Ready to hatch!' : formatDuration(remaining)}
                        </div>
                      </div>
                      {isReady ? (
                        <Button size="sm" className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => hatchEgg(egg.id)}>
                          Hatch
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">{Math.floor(progress)}%</Badge>
                      )}
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: ShoppingBag, label: 'Marketplace', desc: 'Buy & sell', section: 'marketplace' as const },
          { icon: Target, label: 'Missions', desc: `${pendingMissions} claimable`, section: 'missions' as const },
          { icon: Star, label: 'Achievements', desc: '12 unlocked', section: 'missions' as const },
          { icon: Bell, label: 'Activity', desc: `${notifications.filter((n) => !n.readAt).length} new`, section: 'notifications' as const },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => setSection(a.section)}
            className="flex items-center gap-3 p-3 rounded-xl border hover:border-primary/40 hover:bg-accent/40 transition text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-950/40 dark:to-orange-950/30 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <a.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{a.label}</div>
              <div className="text-[10px] text-muted-foreground">{a.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div>
        <SectionHeader
          title="Your Animals"
          description="Tap Collect to gather production."
          action={
            <Button variant="ghost" size="sm" onClick={() => setSection('animals')}>
              View all <ChevronRight className="h-3 w-3" />
            </Button>
          }
        />
        {animals.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No animals yet. Hatch an egg to get started!</CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {animals.slice(0, 5).map((a) => (
              <AnimalCard key={a.id} animal={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FarmPreview() {
  const animals = useEggForm((s) => s.animals)
  const eggs = useEggForm((s) => s.eggs)
  const setSection = useEggForm((s) => s.setSection)

  const tiles: { emoji: string; label: string; bg?: string }[] = [
    { emoji: '🌳', label: 'Tree', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { emoji: '🐔', label: animals[0]?.name || 'Chicken', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { emoji: '🥚', label: 'Egg', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
    { emoji: '🐔', label: animals[1]?.name || 'Chicken', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { emoji: '🏠', label: 'Farmhouse', bg: 'bg-orange-50 dark:bg-orange-950/30' },
    { emoji: '🌾', label: 'Crops', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { emoji: '🏭', label: 'Production', bg: 'bg-slate-50 dark:bg-slate-900/30' },
    { emoji: '🌳', label: 'Tree', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { emoji: '🐔', label: animals[2]?.name || 'Chicken', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ]

  return (
    <button
      onClick={() => setSection('farm')}
      className="block w-full text-left"
    >
      <div className="aspect-[4/3] rounded-xl bg-gradient-to-b from-sky-100/40 to-emerald-100/40 dark:from-sky-950/20 dark:to-emerald-950/20 border p-3 grid grid-cols-3 gap-2 relative overflow-hidden hover:border-primary/40 transition">
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-amber-200/40 dark:bg-amber-700/20 blur-2xl" />
        {tiles.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-lg ${t.bg || 'bg-background'} flex flex-col items-center justify-center text-3xl hover:scale-105 transition relative`}
          >
            <motion.span
              animate={t.emoji === '🐔' ? { y: [0, -2, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            >
              {t.emoji}
            </motion.span>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="text-muted-foreground">
          {animals.length} animals · {eggs.filter((e) => e.status === 'incubating').length} incubating
        </div>
        <span className="text-primary flex items-center gap-0.5">
          Open farm <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </button>
  )
}
