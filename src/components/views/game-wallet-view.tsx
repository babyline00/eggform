'use client'

import * as React from 'react'
import { Coins, Gem, Ticket, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader, StatCard } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { formatCoins, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

export function GameWalletView() {
  const gameWallet = useEggForm((s) => s.gameWallet)
  const transactions = useEggForm((s) => s.gameTransactions)
  const user = useEggForm((s) => s.currentUser)
  const setSection = useEggForm((s) => s.setSection)

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Game Wallet"
        description="Virtual coins, gems, and tickets earned in-game. Separate from your PKR wallet."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard icon={Coins} label="Coins" value={formatCoins(gameWallet.coins)} accent="amber" />
        <StatCard icon={Gem} label="Gems" value={formatCoins(gameWallet.gems)} accent="fuchsia" />
        <StatCard icon={Ticket} label="Tickets" value={formatCoins(gameWallet.tickets)} accent="emerald" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Transaction History</CardTitle>
            <CardDescription className="text-xs">Last 50 transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto egg-scroll divide-y">
              {transactions.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No transactions yet.</div>
              ) : (
                transactions.map((tx) => {
                  const isEarn = tx.amount > 0
                  return (
                    <div key={tx.id} className="flex items-center gap-3 p-3 hover:bg-accent/40">
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center',
                        isEarn ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
                      )}>
                        {isEarn ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium capitalize">{tx.type.replace('_', ' ')}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {tx.reason || '—'} · {formatRelativeTime(tx.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn('font-mono text-sm font-bold', isEarn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                          {isEarn ? '+' : ''}{formatCoins(tx.amount)} 🪙
                        </div>
                        <div className="text-[10px] text-muted-foreground">Bal: {formatCoins(tx.balanceAfter)}</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">About this wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">Coins</strong> are earned from animal production, mission rewards,
              and marketplace sales. They are spent on eggs, incubators, and upgrades.
            </p>
            <p>
              <strong className="text-foreground">Gems</strong> are premium currency, earned from rare animals
              (e.g. Phoenix Chick) and special events. They accelerate formation and unlock rare items.
            </p>
            <p>
              <strong className="text-foreground">Tickets</strong> are special-event currency used for limited-time
              rewards and raffle entries.
            </p>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30">
              <p className="text-amber-800 dark:text-amber-200">
                ⚠️ The game wallet is completely separate from the PKR wallet. Game balances cannot be
                converted to real money.
              </p>
            </div>
            <button
              onClick={() => setSection('pkr-wallet')}
              className="block w-full text-center text-xs text-primary hover:underline"
            >
              View PKR Wallet →
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
