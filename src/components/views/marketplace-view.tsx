'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Tag, Search, Plus, X, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { SectionHeader, RarityBadge } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { EGG_TYPES, RARITY_LABEL } from '@/lib/game-data'
import { formatCoins, formatRelativeTime } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function MarketplaceView() {
  const listings = useEggForm((s) => s.listings)
  const eggs = useEggForm((s) => s.eggs)
  const animals = useEggForm((s) => s.animals)
  const gameWallet = useEggForm((s) => s.gameWallet)
  const user = useEggForm((s) => s.currentUser)
  const buyFromMarketplace = useEggForm((s) => s.buyFromMarketplace)
  const listOnMarketplace = useEggForm((s) => s.listOnMarketplace)
  const cancelListing = useEggForm((s) => s.cancelListing)
  const { toast } = useToast()

  const [search, setSearch] = React.useState('')
  const [rarityFilter, setRarityFilter] = React.useState<string>('all')
  const [listOpen, setListOpen] = React.useState(false)
  const [listingAsset, setListingAsset] = React.useState<string | null>(null)
  const [listingPrice, setListingPrice] = React.useState<number>(0)

  const activeListings = listings.filter((l) => l.status === 'active')
  const myListings = listings.filter((l) => l.sellerId === user?.id)

  const filtered = activeListings.filter((l) => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false
    if (rarityFilter !== 'all' && l.rarity !== rarityFilter) return false
    return true
  })

  function handleBuy(listingId: string, name: string, price: number) {
    if (gameWallet.coins < price) {
      toast({ title: 'Not enough coins', variant: 'destructive' })
      return
    }
    const ok = buyFromMarketplace(listingId)
    if (ok) {
      toast({ title: 'Purchased!', description: `${name} added to your inventory.` })
    } else {
      toast({ title: 'Purchase failed', variant: 'destructive' })
    }
  }

  function handleList(assetType: 'egg' | 'animal', assetId: string, price: number) {
    const ok = listOnMarketplace(assetType, assetId, price)
    if (ok) {
      toast({ title: 'Listed!', description: 'Your item is now on the marketplace.' })
      setListOpen(false)
      setListingAsset(null)
    } else {
      toast({ title: 'Failed to list', variant: 'destructive' })
    }
  }

  const myOwnedEggs = eggs.filter((e) => e.status === 'owned')

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Marketplace"
        description="Buy and sell eggs, animals, and resources with other players."
        action={
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setListOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> List Item
          </Button>
        }
      />

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse ({activeListings.length})</TabsTrigger>
          <TabsTrigger value="mine">My Listings ({myListings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-3">
          <Card>
            <CardContent className="p-3 flex flex-col md:flex-row gap-2 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="pl-9 h-9"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <Button
                  size="sm"
                  variant={rarityFilter === 'all' ? 'default' : 'outline'}
                  className="h-8 text-xs"
                  onClick={() => setRarityFilter('all')}
                >
                  All
                </Button>
                {Object.entries(RARITY_LABEL).map(([k, v]) => (
                  <Button
                    key={k}
                    size="sm"
                    variant={rarityFilter === k ? 'default' : 'outline'}
                    className="h-8 text-xs"
                    onClick={() => setRarityFilter(k)}
                  >
                    {v.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />
              No listings match your filters.
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((listing) => {
                const eggType = EGG_TYPES.find((e) => e.name === listing.name)
                const canAfford = gameWallet.coins >= listing.price
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="overflow-hidden hover:scale-105 transition">
                      <div className={cn(
                        'aspect-square bg-gradient-to-br flex items-center justify-center relative',
                        eggType?.gradient || 'from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/20',
                      )}>
                        <span className="text-6xl">{listing.emoji}</span>
                        <div className="absolute top-2 right-2">
                          {listing.rarity && <RarityBadge rarity={listing.rarity} />}
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="font-semibold text-sm truncate">{listing.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          by {listing.sellerName} · {formatRelativeTime(listing.createdAt)}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="font-bold text-amber-700 dark:text-amber-300">
                            {formatCoins(listing.price)} 🪙
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className={cn(
                            'w-full mt-2 h-7 text-xs',
                            canAfford
                              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                              : 'bg-muted text-muted-foreground cursor-not-allowed',
                          )}
                          disabled={!canAfford || listing.sellerId === user?.id}
                          onClick={() => handleBuy(listing.id, listing.name, listing.price)}
                        >
                          {listing.sellerId === user?.id ? 'Your listing' : (canAfford ? 'Buy' : 'Not enough')}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-3">
          {myListings.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
              <Tag className="h-10 w-10 mx-auto mb-2 opacity-30" />
              You have no active listings.
              <Button className="block mx-auto mt-3" size="sm" onClick={() => setListOpen(true)}>
                List your first item
              </Button>
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {myListings.map((listing) => (
                <Card key={listing.id} className={cn(
                  'overflow-hidden',
                  listing.status === 'sold' && 'opacity-60',
                  listing.status === 'cancelled' && 'opacity-40',
                )}>
                  <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/20 flex items-center justify-center">
                    <span className="text-6xl">{listing.emoji}</span>
                  </div>
                  <CardContent className="p-3">
                    <div className="font-semibold text-sm truncate">{listing.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-amber-700 dark:text-amber-300 font-bold">{formatCoins(listing.price)} 🪙</span>
                      <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="text-[9px]">
                        {listing.status}
                      </Badge>
                    </div>
                    {listing.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 h-7 text-xs"
                        onClick={() => {
                          cancelListing(listing.id)
                          toast({ title: 'Listing cancelled' })
                        }}
                      >
                        Cancel listing
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* List dialog */}
      <Dialog open={listOpen} onOpenChange={(o) => {
        setListOpen(o)
        if (!o) {
          setListingAsset(null)
          setListingPrice(0)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" /> List an item
            </DialogTitle>
            <DialogDescription>
              Choose an egg from your inventory to sell on the marketplace. A 5% fee applies.
            </DialogDescription>
          </DialogHeader>

          {myOwnedEggs.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              You have no eggs available to list.
            </div>
          ) : !listingAsset ? (
            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
              {myOwnedEggs.map((egg) => {
                const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
                if (!eggType) return null
                return (
                  <button
                    key={egg.id}
                    onClick={() => {
                      setListingAsset(egg.id)
                      setListingPrice(eggType.virtualValue)
                    }}
                    className="rounded-lg border hover:border-primary/40 hover:bg-accent/40 transition p-2"
                  >
                    <div className={cn('aspect-square rounded-md bg-gradient-to-br flex items-center justify-center', eggType.gradient)}>
                      <span className="text-4xl">🥚</span>
                    </div>
                    <div className="text-xs font-semibold mt-1 truncate">{eggType.name}</div>
                    <div className="text-[10px] text-muted-foreground">~{eggType.virtualValue}🪙</div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                const egg = eggs.find((e) => e.id === listingAsset)
                if (!egg) return null
                const eggType = EGG_TYPES.find((e) => e.id === egg.eggTypeId)
                if (!eggType) return null
                const fee = Math.floor(listingPrice * 0.05)
                const net = listingPrice - fee
                return (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <span className="text-3xl">🥚</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{eggType.name}</div>
                        {eggType.rarity && <RarityBadge rarity={eggType.rarity} />}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="price" className="text-xs">Price (in coins)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={listingPrice}
                        onChange={(e) => setListingPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        className="h-9"
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Buyer pays</span>
                        <span className="font-medium">{formatCoins(listingPrice)} 🪙</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Marketplace fee (5%)</span>
                        <span className="font-medium text-rose-600">-{formatCoins(fee)} 🪙</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span className="font-semibold">You receive</span>
                        <span className="font-bold text-emerald-600">{formatCoins(net)} 🪙</span>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setListingAsset(null)}>Back</Button>
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={listingPrice <= 0}
                        onClick={() => handleList('egg', listingAsset, listingPrice)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Confirm Listing
                      </Button>
                    </DialogFooter>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
