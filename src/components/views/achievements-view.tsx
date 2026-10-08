'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Lock, Star, Crown, Award, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SectionHeader, EmptyState } from '@/components/cards'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  progress: number
  target: number
  unlocked: boolean
  unlockedAt?: number
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', name: 'First Egg', description: 'Buy your first egg', icon: '🥚', tier: 'bronze', progress: 1, target: 1, unlocked: true, unlockedAt: Date.now() - 7 * 24 * 60 * 60 * 1000 },
  { id: 'a2', name: 'First Hatch', description: 'Hatch your first egg', icon: '🐣', tier: 'bronze', progress: 1, target: 1, unlocked: true, unlockedAt: Date.now() - 6 * 24 * 60 * 60 * 1000 },
  { id: 'a3', name: 'Egg Collector', description: 'Own 5 eggs at once', icon: '🥚', tier: 'silver', progress: 3, target: 5, unlocked: false },
  { id: 'a4', name: 'Master Farmer', description: 'Reach level 10', icon: '👨‍🌾', tier: 'silver', progress: 3, target: 10, unlocked: false },
  { id: 'a5', name: 'Trader', description: 'Complete 10 marketplace trades', icon: '🤝', tier: 'silver', progress: 4, target: 10, unlocked: false },
  { id: 'a6', name: 'Golden Touch', description: 'Hatch a Golden Egg', icon: '✨', tier: 'gold', progress: 1, target: 1, unlocked: true, unlockedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  { id: 'a7', name: 'Legendary', description: 'Hatch a Legendary Egg', icon: '🐲', tier: 'platinum', progress: 0, target: 1, unlocked: false },
  { id: 'a8', name: 'Wealthy', description: 'Accumulate 100,000 coins', icon: '💰', tier: 'gold', progress: 12450, target: 100000, unlocked: false },
  { id: 'a9', name: 'Mission Master', description: 'Complete 25 missions', icon: '🎯', tier: 'gold', progress: 8, target: 25, unlocked: false },
  { id: 'a10', name: 'Referral Star', description: 'Refer 50 friends', icon: '⭐', tier: 'platinum', progress: 12, target: 50, unlocked: false },
  { id: 'a11', name: 'PKR Verified', description: 'Complete KYC verification', icon: '✓', tier: 'silver', progress: 0, target: 1, unlocked: false },
  { id: 'a12', name: 'Event Champion', description: 'Win a top-3 spot in an event', icon: '🏆', tier: 'platinum', progress: 0, target: 1, unlocked: false },
]

const TIER_META = {
  bronze: { label: 'Bronze', color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-400/40', glow: '' },
  silver: { label: 'Silver', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-900/30', border: 'border-slate-400/40', glow: '' },
  gold: { label: 'Gold', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-400/40', glow: 'rarity-glow-rare' },
  platinum: { label: 'Platinum', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-400/40', glow: 'rarity-glow-epic' },
}

export function AchievementsView() {
  const [filter, setFilter] = React.useState<'all' | 'unlocked' | 'locked'>('all')

  const filtered = ACHIEVEMENTS.filter((a) => {
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'locked') return !a.unlocked
    return true
  })

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length
  const totalCount = ACHIEVEMENTS.length
  const completionPercent = (unlockedCount / totalCount) * 100

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Achievements"
        description={`${unlockedCount} of ${totalCount} unlocked · ${completionPercent.toFixed(0)}% complete`}
      />

      {/* Progress overview */}
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--secondary)" strokeWidth="6" />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - completionPercent / 100) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-amber-500" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Achievement Progress</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {unlockedCount} unlocked · {totalCount - unlockedCount} to go
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={completionPercent} className="h-2 flex-1" />
                <span className="text-xs font-mono font-bold">{completionPercent.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Tier breakdown */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {(['bronze', 'silver', 'gold', 'platinum'] as const).map((tier) => {
              const tierCount = ACHIEVEMENTS.filter((a) => a.tier === tier).length
              const tierUnlocked = ACHIEVEMENTS.filter((a) => a.tier === tier && a.unlocked).length
              const meta = TIER_META[tier]
              return (
                <div key={tier} className={cn('p-2 rounded-lg border text-center', meta.bg, meta.border)}>
                  <div className={cn('text-xs font-semibold capitalize', meta.color)}>{meta.label}</div>
                  <div className="text-lg font-bold mt-0.5">{tierUnlocked}/{tierCount}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'unlocked', 'locked'] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            className="h-8 text-xs capitalize"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `All (${totalCount})` : f === 'unlocked' ? `Unlocked (${unlockedCount})` : `Locked (${totalCount - unlockedCount})`}
          </Button>
        ))}
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((a, i) => {
          const meta = TIER_META[a.tier]
          const progressPercent = Math.min(100, (a.progress / a.target) * 100)
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className={cn(
                'overflow-hidden text-center',
                a.unlocked ? meta.glow : 'opacity-60',
                a.unlocked && 'border-emerald-400/40',
              )}>
                <CardContent className="p-4">
                  <div className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-2',
                    a.unlocked ? meta.bg : 'bg-slate-100 dark:bg-slate-900/40 grayscale',
                  )}>
                    {a.unlocked ? (
                      <motion.span
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                      >
                        {a.icon}
                      </motion.span>
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="font-semibold text-sm truncate">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{a.description}</div>
                  <Badge variant="outline" className={cn('text-[9px] capitalize mt-2', meta.color, meta.bg, meta.border)}>
                    {meta.label}
                  </Badge>
                  {a.unlocked ? (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                      ✓ Unlocked
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Progress value={progressPercent} className="h-1" />
                      <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                        {a.progress.toLocaleString()} / {a.target.toLocaleString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          emoji="🏆"
          title="No achievements here"
          description="Try a different filter."
        />
      )}
    </div>
  )
}
