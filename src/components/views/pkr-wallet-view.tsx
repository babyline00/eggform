'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown,
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SectionHeader, StatCard } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { formatPkr, formatRelativeTime } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const PAYMENT_METHODS = [
  { value: 'bank', label: '🏦 Bank Transfer', desc: 'Standard 1-3 business days', min: 1000 },
  { value: 'easypaisa', label: '📱 Easypaisa', desc: 'Instant credit', min: 100 },
  { value: 'jazzcash', label: '📱 JazzCash', desc: 'Instant credit', min: 100 },
  { value: 'card', label: '💳 Debit/Credit Card', desc: 'Instant', min: 500 },
]

export function PkrWalletView() {
  const pkrWallet = useEggForm((s) => s.pkrWallet)
  const pkrTransactions = useEggForm((s) => s.pkrTransactions)
  const deposits = useEggForm((s) => s.deposits)
  const withdrawals = useEggForm((s) => s.withdrawals)
  const user = useEggForm((s) => s.userMissions)
  const depositPkr = useEggForm((s) => s.depositPkr)
  const requestWithdrawal = useEggForm((s) => s.requestWithdrawal)
  const { toast } = useToast()

  const [depositOpen, setDepositOpen] = React.useState(false)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)
  const [amount, setAmount] = React.useState<number>(0)
  const [method, setMethod] = React.useState<string>('bank')
  const [accountRef, setAccountRef] = React.useState<string>('')

  function handleDeposit() {
    if (amount < 100) {
      toast({ title: 'Minimum is Rs 100', variant: 'destructive' })
      return
    }
    const ref = depositPkr(amount * 100, method)
    toast({
      title: 'Deposit initiated',
      description: `Reference ${ref}. Funds will appear once the payment provider webhook confirms.`,
    })
    setDepositOpen(false)
    setAmount(0)
  }

  function handleWithdraw() {
    if (amount < 500) {
      toast({ title: 'Minimum withdrawal is Rs 500', variant: 'destructive' })
      return
    }
    if (!accountRef) {
      toast({ title: 'Enter your account reference', variant: 'destructive' })
      return
    }
    const ok = requestWithdrawal(amount * 100, method, accountRef)
    if (ok) {
      toast({
        title: 'Withdrawal requested',
        description: 'Funds are now locked. Pending admin review per risk policy.',
      })
      setWithdrawOpen(false)
      setAmount(0)
      setAccountRef('')
    } else {
      toast({ title: 'Withdrawal failed', description: 'Check your available balance.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="PKR Wallet"
        description="Regulated payment integration layer for eligible real-money transactions."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => useEggForm.getState().setSection('pkr-architecture')}
          >
            View Architecture
          </Button>
        }
      />

      {/* Balance card */}
      <Card className="overflow-hidden border-amber-500/40">
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-5">
          <div className="text-xs text-muted-foreground">Available Balance</div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mt-1"
          >
            {formatPkr(pkrWallet.available)}
          </motion.div>
          <div className="flex gap-2 mt-4">
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
              onClick={() => setDepositOpen(true)}
            >
              <ArrowDownToLine className="h-4 w-4 mr-1" /> Deposit
            </Button>
            <Button variant="outline" onClick={() => setWithdrawOpen(true)}>
              <ArrowUpFromLine className="h-4 w-4 mr-1" /> Withdraw
            </Button>
          </div>
        </div>
        <CardContent className="grid grid-cols-3 divide-x">
          <div className="p-3 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</div>
            <div className="font-bold text-amber-600">{formatPkr(pkrWallet.pending)}</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Locked</div>
            <div className="font-bold text-rose-600">{formatPkr(pkrWallet.locked)}</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</div>
            <div className="font-bold">{formatPkr(pkrWallet.available + pkrWallet.pending + pkrWallet.locked)}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="deposits">Deposits ({deposits.length})</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.length})</TabsTrigger>
        </TabsList>

        {/* Transactions ledger */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transaction Ledger</CardTitle>
              <CardDescription className="text-xs">
                Immutable record of every PKR movement. Server-controlled — client never writes here.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto egg-scroll divide-y">
                {pkrTransactions.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No transactions yet.</div>
                ) : (
                  pkrTransactions.map((tx) => {
                    const isCredit = tx.amount > 0
                    return (
                      <div key={tx.id} className="p-3 flex items-center gap-3 hover:bg-accent/40">
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                          isCredit ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
                        )}>
                          {isCredit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium capitalize">{tx.type.replace('_', ' ')}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {tx.notes || tx.reference || '—'} · {formatRelativeTime(tx.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn('font-mono text-sm font-bold', isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                            {isCredit ? '+' : ''}{formatPkr(tx.amount)}
                          </div>
                          <StatusBadge status={tx.status} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deposits */}
        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deposit History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {deposits.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No deposits yet.</div>
                ) : (
                  deposits.map((d) => (
                    <div key={d.id} className="p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                        <ArrowDownToLine className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{formatPkr(d.amount)}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {d.paymentMethod} · {d.internalReference} · {formatRelativeTime(d.createdAt)}
                        </div>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Withdrawal History</CardTitle>
              <CardDescription className="text-xs">Funds are locked until admin/provider confirms.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {withdrawals.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No withdrawals yet.</div>
                ) : (
                  withdrawals.map((w) => (
                    <div key={w.id} className="p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                        <ArrowUpFromLine className="h-4 w-4 text-rose-700 dark:text-rose-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{formatPkr(w.amount)}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {w.method} · {w.methodReference} · Risk: {w.riskScore}/100 · {formatRelativeTime(w.createdAt)}
                        </div>
                      </div>
                      <StatusBadge status={w.status} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deposit dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-amber-600" /> Deposit PKR
            </DialogTitle>
            <DialogDescription>
              Funds will appear once the payment provider webhook confirms (5 sec in demo).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="depAmount" className="text-xs">Amount (PKR)</Label>
              <Input
                id="depAmount"
                type="number"
                min={100}
                value={amount || ''}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                placeholder="5000"
                className="h-9"
              />
              <div className="flex gap-1.5 mt-1">
                {[500, 1000, 5000, 10000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v)}
                    className="text-[10px] px-2 py-0.5 rounded border hover:bg-accent"
                  >
                    +{v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Payment Method</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMethod(m.value)}
                    className={cn(
                      'p-2 rounded-lg border text-left transition',
                      method === m.value
                        ? 'border-primary bg-accent/40'
                        : 'hover:border-primary/40 hover:bg-accent/40',
                    )}
                  >
                    <div className="text-xs font-medium">{m.label}</div>
                    <div className="text-[9px] text-muted-foreground">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary/50 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">Rs {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="font-semibold">You receive</span>
                <span className="font-bold text-emerald-600">Rs {amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)}>Cancel</Button>
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
              disabled={amount < 100}
              onClick={handleDeposit}
            >
              <ShieldCheck className="h-4 w-4 mr-1" /> Initiate Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-4 w-4 text-rose-600" /> Withdraw PKR
            </DialogTitle>
            <DialogDescription>
              Available: <span className="font-bold text-foreground">{formatPkr(pkrWallet.available)}</span>
              <br />
              Withdrawals are locked and reviewed per risk policy. KYC required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="wdAmount" className="text-xs">Amount (PKR)</Label>
              <Input
                id="wdAmount"
                type="number"
                min={500}
                max={pkrWallet.available / 100}
                value={amount || ''}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                placeholder="5000"
                className="h-9"
              />
              <div className="text-[10px] text-muted-foreground mt-1">
                Min: Rs 500 · Max: {formatPkr(pkrWallet.available)}
              </div>
            </div>

            <div>
              <Label className="text-xs">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="wdRef" className="text-xs">Account reference</Label>
              <Input
                id="wdRef"
                value={accountRef}
                onChange={(e) => setAccountRef(e.target.value)}
                placeholder="****1234 or mobile number"
                className="h-9"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                This will be masked in your history for security.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-secondary/50 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">Rs {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing fee</span>
                <span className="font-medium text-rose-600">-Rs 5</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="font-semibold">You receive</span>
                <span className="font-bold text-emerald-600">Rs {Math.max(0, amount - 5).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
              ⚠️ Withdrawals are subject to KYC verification, risk-based review, and may be held for up to 24 hours.
              This is not a guarantee of investment returns.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
            <Button
              className="bg-rose-500 hover:bg-rose-600 text-white"
              disabled={amount < 500 || amount > pkrWallet.available / 100}
              onClick={handleWithdraw}
            >
              <ShieldCheck className="h-4 w-4 mr-1" /> Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
    pending: { icon: Clock, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/30' },
    processing: { icon: Clock, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-500/30' },
    completed: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/30' },
    failed: { icon: XCircle, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/30' },
    cancelled: { icon: XCircle, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-slate-500/30' },
    rejected: { icon: XCircle, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/30' },
    under_review: { icon: AlertCircle, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/30' },
    approved: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/30' },
    refunded: { icon: ArrowDownToLine, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-500/30' },
    reversed: { icon: ArrowDownToLine, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-slate-500/30' },
  }
  const meta = map[status] || map.pending
  const Icon = meta.icon
  return (
    <Badge variant="outline" className={cn('text-[9px] uppercase tracking-wide font-semibold', meta.color)}>
      <Icon className="h-2.5 w-2.5 mr-0.5" />
      {status.replace('_', ' ')}
    </Badge>
  )
}
