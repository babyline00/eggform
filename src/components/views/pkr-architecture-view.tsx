'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  User, Smartphone, Server, Database, CreditCard, Layers,
  Wallet, ArrowRight, ShieldCheck, Lock, FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/cards'
import { cn } from '@/lib/utils'

const FLOW_STEPS = [
  { id: 1, title: 'User', icon: User, color: 'bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300' },
  { id: 2, title: 'Web / Mobile App', icon: Smartphone, color: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300' },
  { id: 3, title: 'API Layer', icon: Server, color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300' },
  { id: 4, title: 'PKR Wallet Service', icon: Wallet, color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' },
  { id: 5, title: 'Transaction Engine', icon: Layers, color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' },
  { id: 6, title: 'Ledger / Database', icon: Database, color: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300' },
  { id: 7, title: 'Payment Gateway', icon: CreditCard, color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300' },
]

export function PkrArchitectureView() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="PKR Wallet Architecture"
        description="A regulated payment integration layer — strictly separated from game balances."
      />

      {/* Critical separation warning */}
      <Card className="border-amber-400/40">
        <CardContent className="p-4 flex items-start gap-3 bg-amber-50/40 dark:bg-amber-950/20">
          <ShieldCheck className="h-5 w-5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Critical Architecture Principle</p>
            <p className="text-xs text-muted-foreground mt-1">
              The Game Wallet (coins, gems, tickets) and PKR Wallet (real money) are <strong>completely separate</strong>.
              Game balances can <strong>never</strong> be converted to PKR. The PKR wallet is a regulated payment
              integration layer, not a promise of investment returns.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Vertical flow diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Flow Architecture</CardTitle>
          <CardDescription className="text-xs">
            From user action to payment provider and back. Every step is server-controlled.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:border-primary/40 transition"
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', step.color)}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{step.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Layer {step.id} · {getLayerDesc(step.id)}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px]">L{step.id}</Badge>
                </motion.div>
                {i < FLOW_STEPS.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.05 }}
                    >
                      <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                    </motion.div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dual wallet visual separation */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-emerald-400/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              </div>
              Game Wallet
            </CardTitle>
            <CardDescription className="text-xs">Virtual in-game currency. Cannot be converted to PKR.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: 'Coins', desc: 'Earned from production, missions, sales', icon: '🪙' },
              { name: 'Gems', desc: 'Premium currency from rare animals', icon: '💎' },
              { name: 'Tickets', desc: 'Special-event currency', icon: '🎫' },
            ].map((b) => (
              <div key={b.name} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/40">
                <span className="text-xl">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-[10px] text-muted-foreground">{b.desc}</div>
                </div>
              </div>
            ))}
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400/30 mt-2">
              <p className="text-[10px] text-emerald-800 dark:text-emerald-200">
                ✓ Server-controlled · ✓ Transaction log · ✓ Cannot exit as real money
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-400/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              </div>
              PKR Wallet
            </CardTitle>
            <CardDescription className="text-xs">Regulated payment integration layer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: 'Available', desc: 'Free to use', icon: '✓' },
              { name: 'Pending', desc: 'Awaiting payment confirmation', icon: '⏳' },
              { name: 'Locked', desc: 'Held for marketplace / withdrawal', icon: '🔒' },
            ].map((b) => (
              <div key={b.name} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/40">
                <span className="text-xl">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-[10px] text-muted-foreground">{b.desc}</div>
                </div>
              </div>
            ))}
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-400/30 mt-2">
              <p className="text-[10px] text-amber-800 dark:text-amber-200">
                ✓ Webhook-verified · ✓ KYC required · ✓ Audit logged · ✓ Risk-scored
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Webhook Verification</CardTitle>
          <CardDescription className="text-xs">
            The frontend NEVER decides payment success. Only the payment provider webhook (with signature verification)
            determines the final status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-7 gap-2 text-xs">
            {[
              { label: 'Payment Initiated', icon: '🟡' },
              { label: 'Provider', icon: '🏦' },
              { label: 'Webhook', icon: '📨' },
              { label: 'Signature', icon: '🔐' },
              { label: 'Idempotency', icon: '🛡️' },
              { label: 'Ledger', icon: '📒' },
              { label: 'Wallet Credited', icon: '✅' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center gap-1"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl">
                  {s.icon}
                </div>
                <div className="text-[10px] font-medium leading-tight">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security guarantees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Security Guarantees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            {[
              'HMAC SHA-256 webhook signature verification',
              'Idempotency keys prevent duplicate processing',
              'Timestamp validation rejects stale webhooks',
              'Amount + currency validation against provider payload',
              'Atomic ledger updates via Prisma transactions',
              'Audit log for every sensitive admin action',
              'Risk-based withdrawal approval workflow',
              'KYC required for withdrawals over Rs 500',
            ].map((g, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded bg-secondary/30">
                <ShieldCheck className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" />
                <span>{g}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance disclaimer */}
      <Card className="border-rose-400/40">
        <CardContent className="p-4 bg-rose-50/30 dark:bg-rose-950/20">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-rose-700 dark:text-rose-300 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-rose-800 dark:text-rose-200">Compliance Notice</p>
              <p className="text-rose-700/80 dark:text-rose-300/80 mt-1">
                Real-money features are activated only where legally and operationally supported under
                Pakistani and applicable regulations (SBP, SECP, FBR, PECA 2016). The PKR wallet is a
                regulated payment integration layer, not a promise of investment returns. Always consult
                qualified legal counsel before enabling real-money features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getLayerDesc(id: number): string {
  const descs: Record<number, string> = {
    1: 'Initiates payment / withdrawal request',
    2: 'Captures input, displays status',
    3: 'Auth + validation + rate limiting',
    4: 'Manages available / pending / locked buckets',
    5: 'Atomic ledger update with idempotency',
    6: 'Immutable transaction log',
    7: 'JazzCash / Easypaisa / Bank / Card',
  }
  return descs[id] || ''
}
