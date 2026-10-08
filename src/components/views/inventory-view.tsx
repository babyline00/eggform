'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Package, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SectionHeader, RarityBadge } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { EGG_TYPES } from '@/lib/game-data'
import { formatRelativeTime } from '@/lib/format'

const TYPE_LABELS: Record<string, string> = {
  egg: 'Eggs',
  animal: 'Animals',
  feed: 'Feed',
  water: 'Water',
  energy: 'Energy',
  booster: 'Boosters',
  building: 'Buildings',
  decoration: 'Decorations',
  resource: 'Resources',
}

export function InventoryView() {
  const inventory = useEggForm((s) => s.inventory)
  const eggs = useEggForm((s) => s.eggs)
  const [filter, setFilter] = React.useState<string>('all')
  const [sort, setSort] = React.useState<string>('newest')

  // Combine inventory items + owned eggs (eggs are special inventory)
  const allItems = [
    ...inventory.map((i) => ({
      id: i.id,
      type: i.type,
      name: i.name,
      rarity: i.rarity,
      quantity: i.quantity,
      emoji: i.emoji,
      createdAt: i.createdAt,
    })),
    ...eggs.filter((e) => e.status === 'owned').map((e) => {
      const eggType = EGG_TYPES.find((t) => t.id === e.eggTypeId)
      return {
        id: e.id,
        type: 'egg' as const,
        name: eggType?.name || 'Egg',
        rarity: eggType?.rarity || null,
        quantity: 1,
        emoji: '🥚',
        createdAt: e.createdAt,
      }
    }),
  ]

  const filtered = filter === 'all' ? allItems : allItems.filter((i) => i.type === filter)
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'newest') return b.createdAt - a.createdAt
    if (sort === 'oldest') return a.createdAt - b.createdAt
    if (sort === 'quantity') return b.quantity - a.quantity
    return 0
  })

  const types = Array.from(new Set(allItems.map((i) => i.type)))

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Inventory"
        description={`${allItems.length} items in your inventory`}
        action={
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-8 text-xs w-32">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>{TYPE_LABELS[t] || t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="quantity">Quantity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          className="h-7 text-xs"
          onClick={() => setFilter('all')}
        >
          All ({allItems.length})
        </Button>
        {types.map((t) => {
          const count = allItems.filter((i) => i.type === t).length
          return (
            <Button
              key={t}
              size="sm"
              variant={filter === t ? 'default' : 'outline'}
              className="h-7 text-xs"
              onClick={() => setFilter(t)}
            >
              {TYPE_LABELS[t] || t} ({count})
            </Button>
          )
        })}
      </div>

      {sorted.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
          No items here.
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sorted.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden hover:scale-105 transition">
                <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/20 flex items-center justify-center relative">
                  <span className="text-5xl">{item.emoji}</span>
                  {item.quantity > 1 && (
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      ×{item.quantity}
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <div className="text-xs font-semibold truncate">{item.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">{TYPE_LABELS[item.type] || item.type}</span>
                    {item.rarity && <RarityBadge rarity={item.rarity} className="text-[8px] px-1 py-0" />}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
