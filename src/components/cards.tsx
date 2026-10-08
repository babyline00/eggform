'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Heart, Droplets, Thermometer, Zap, Star, Coins, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { EGG_TYPES, ANIMAL_TYPES, RARITY_LABEL } from '@/lib/game-data'
import { formatDuration } from '@/lib/format'
import type { Egg, Animal, Rarity } from '@/lib/types'
import { EggSvg, ChickenSvg, GoldenChickenSvg, PhoenixSvg, CrystalDragonSvg } from '@/components/svg-assets'

// ============================================================
// RARITY BADGE — uses new brand palette
// ============================================================

export function RarityBadge({ rarity, className }: { rarity: Rarity; className?: string }) {
  const meta = RARITY_LABEL[rarity]
  return (
    <Badge variant="outline" className={cn('text-[10px] uppercase tracking-wide font-semibold', meta.color, meta.ring, meta.bg, className)}>
      {meta.label}
    </Badge>
  )
}

// ============================================================
// STAT CARD — premium KPI card
// ============================================================

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = 'green',
  className,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  sub?: string
  accent?: 'green' | 'golden' | 'sky' | 'purple' | 'coral' | 'slate'
  className?: string
  onClick?: () => void
}) {
  const accents: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    golden: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    coral: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    slate: 'bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300',
  }
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      className={cn(
        'text-left w-full',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <Card className={cn('overflow-hidden card-hover-lift', onClick && 'hover:border-primary/40')}>
        <CardContent className="p-4 flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-bold truncate">{value}</div>
            {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
          </div>
        </CardContent>
      </Card>
    </Comp>
  )
}

// ============================================================
// EGG CARD — premium card with rarity glow + animations
// ============================================================

export function EggCard({
  egg,
  actionLabel,
  onAction,
  showCare = false,
  showProgress = false,
  className,
}: {
  egg: Egg
  actionLabel?: string
  onAction?: () => void
  showCare?: boolean
  showProgress?: boolean
  className?: string
}) {
  const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
  if (!eggType) return null

  const isReady = egg.status === 'incubating' && egg.formationEndsAt !== null && Date.now() >= egg.formationEndsAt
  const remaining = egg.formationEndsAt ? Math.max(0, egg.formationEndsAt - Date.now()) : 0
  const total = eggType.formationDurationSec * 1000
  const progress = egg.formationEndsAt
    ? Math.min(100, Math.max(0, ((total - remaining) / total) * 100))
    : 0
  const meta = RARITY_LABEL[eggType.rarity]

  return (
    <Card className={cn('overflow-hidden transition-all card-hover-lift', meta.glow, isReady && 'animate-pulse-golden ring-2 ring-amber-400/60', className)}>
      <div className={cn('aspect-square bg-gradient-to-br flex items-center justify-center relative', eggType.gradient)}>
        <motion.div
          animate={isReady ? { rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] } : { y: [0, -4, 0] }}
          transition={{ duration: isReady ? 0.6 : 3, repeat: Infinity }}
          className="w-3/4 h-3/4"
        >
          <EggSvg rarity={eggType.rarity} ready={isReady} className="w-full h-full" />
        </motion.div>
        <div className="absolute top-2 right-2">
          <RarityBadge rarity={eggType.rarity} />
        </div>
        {isReady && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-emerald-500 text-white text-[10px] font-bold animate-pulse">
              ✓ READY
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{eggType.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {eggType.formationDurationSec >= 3600
                ? `${eggType.formationDurationSec / 3600}hr formation`
                : `${eggType.formationDurationSec / 60}min formation`}
            </div>
          </div>
          <div className="text-xs font-medium text-amber-700 dark:text-amber-300 shrink-0 flex items-center gap-0.5">
            <Coins className="h-3 w-3" />
            {eggType.virtualValue.toLocaleString()}
          </div>
        </div>

        {showProgress && egg.status === 'incubating' && (
          <div className="mt-2 space-y-1">
            <Progress value={progress} className="h-1.5" />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{Math.floor(progress)}%</span>
              <span className={cn('font-mono', isReady && 'text-emerald-600 dark:text-emerald-400')}>
                {isReady ? 'READY' : formatDuration(remaining)}
              </span>
            </div>
          </div>
        )}

        {showCare && (
          <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
            <div className="flex items-center gap-0.5"><Heart className="h-3 w-3 text-rose-500" />{egg.careHealth}</div>
            <div className="flex items-center gap-0.5"><Thermometer className="h-3 w-3 text-orange-500" />{egg.careTemperature}</div>
            <div className="flex items-center gap-0.5"><Droplets className="h-3 w-3 text-cyan-500" />{egg.careMoisture}</div>
          </div>
        )}

        {actionLabel && (
          <Button
            size="sm"
            className={cn(
              'w-full mt-2 h-7 text-xs btn-press',
              isReady
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground',
            )}
            onClick={onAction}
          >
            {isReady && <Sparkles className="h-3 w-3 mr-1" />}
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// ANIMAL CARD — production-focused
// ============================================================

export function AnimalCard({
  animal,
  onCollect,
  onUpgrade,
  className,
}: {
  animal: Animal
  onCollect?: () => void
  onUpgrade?: () => void
  className?: string
}) {
  const animalType = ANIMAL_TYPES.find((t) => t.id === animal.animalTypeId)
  if (!animalType) return null
  const meta = RARITY_LABEL[animalType.rarity]

  return (
    <Card className={cn('overflow-hidden card-hover-lift', meta.glow, className)}>
      <div className={cn(
        'aspect-square bg-gradient-to-br flex items-center justify-center relative',
        animalType.rarity === 'common' && 'from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-800/20',
        animalType.rarity === 'uncommon' && 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20',
        animalType.rarity === 'rare' && 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20',
        animalType.rarity === 'epic' && 'from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20',
        animalType.rarity === 'legendary' && 'from-fuchsia-50 to-rose-100 dark:from-fuchsia-950/30 dark:to-rose-900/20',
      )}>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-3/4 h-3/4"
        >
          {animalType.slug === 'chicken-basic' && <ChickenSvg className="w-full h-full" />}
          {animalType.slug === 'chicken-silver' && <ChickenSvg className="w-full h-full" />}
          {animalType.slug === 'chicken-golden' && <GoldenChickenSvg className="w-full h-full" />}
          {animalType.slug === 'animal-special' && <PhoenixSvg className="w-full h-full" />}
          {animalType.slug === 'animal-legendary' && <CrystalDragonSvg className="w-full h-full" />}
        </motion.div>
        <div className="absolute top-2 right-2">
          <RarityBadge rarity={animalType.rarity} />
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-background/80 backdrop-blur px-2 py-0.5 rounded-full border">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-semibold">Lv {animal.level}</span>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{animal.name || animalType.name}</div>
            <div className="text-[10px] text-muted-foreground">{animalType.species}</div>
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-300 shrink-0 flex items-center gap-0.5">
            +{animal.productionRate}/d
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
          <div className="flex items-center gap-0.5"><Heart className="h-3 w-3 text-rose-500" />{animal.health}%</div>
          <div className="flex items-center gap-0.5"><Zap className="h-3 w-3 text-amber-500" />{animal.energy}%</div>
          <div className="flex items-center gap-0.5">😊{animal.happiness}%</div>
        </div>
        <div className="flex gap-1 mt-2">
          {onCollect && (
            <Button size="sm" className="flex-1 h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground btn-press" onClick={onCollect}>
              Collect
            </Button>
          )}
          {onUpgrade && (
            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs btn-press" onClick={onUpgrade}>
              Upgrade
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// SECTION HEADER
// ============================================================

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ============================================================
// EMPTY STATE — friendly, per design §40
// ============================================================

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: React.ComponentType<{ className?: string }>
  emoji?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-3">
        {emoji ? (
          <span className="text-4xl opacity-60">{emoji}</span>
        ) : Icon ? (
          <Icon className="h-7 w-7 text-muted-foreground opacity-60" />
        ) : null}
      </div>
      <h3 className="font-semibold text-base">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground btn-press" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

// ============================================================
// ERROR STATE — with recovery action per §41
// ============================================================

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again.',
  actionLabel = 'Try Again',
  onAction,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 mb-3">
        <span className="text-4xl">😵</span>
      </div>
      <h3 className="font-semibold text-base">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>
      {onAction && (
        <Button className="mt-4" size="sm" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

// ============================================================
// SUCCESS STATE — celebratory per §42
// ============================================================

export function SuccessState({
  title = 'Success!',
  description,
  actionLabel,
  onAction,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="text-center py-12 px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 mb-3 animate-pulse-green"
      >
        <span className="text-4xl">✓</span>
      </motion.div>
      <h3 className="font-semibold text-base">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground btn-press" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
