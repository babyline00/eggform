'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Egg,
  Sparkles,
  Wallet,
  ShoppingBag,
  Trophy,
  Shield,
  ChevronRight,
  Star,
  Menu,
  Twitter,
  Facebook,
  Instagram,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ThemeToggle } from '@/components/theme-toggle'
import { useEggForm } from '@/lib/store'

const FEATURES = [
  {
    icon: Egg,
    title: 'Hatch & Collect',
    desc: 'Buy eggs, place them in incubators, and watch them form into rare animals — from common chickens to legendary dragons.',
  },
  {
    icon: ShoppingBag,
    title: 'Player Marketplace',
    desc: 'List your eggs, animals, and resources for sale. Buy from others. All transactions are server-verified for fair play.',
  },
  {
    icon: Wallet,
    title: 'Dual Wallet System',
    desc: 'A virtual game wallet (coins, gems, tickets) stays separate from the regulated PKR wallet for eligible real-money transactions.',
  },
  {
    icon: Trophy,
    title: 'Missions & Events',
    desc: 'Daily, weekly, and one-time missions. Compete on leaderboards during special events for unique rewards.',
  },
  {
    icon: Shield,
    title: 'Anti-Cheat Architecture',
    desc: 'Timers, balances, and ownership are server-controlled. The client never trusts itself — and neither should you.',
  },
  {
    icon: Sparkles,
    title: 'Production Economy',
    desc: 'Your animals produce resources over real time. Collect, upgrade, and reinvest to grow your farm.',
  },
]

const STATS = [
  { label: 'Active Farmers', value: '24,582' },
  { label: 'Eggs Hatched', value: '128,940' },
  { label: 'Marketplace Trades', value: '8,492' },
  { label: 'PKR Volume (Monthly)', value: 'Rs 3.8M' },
]

const FAQS = [
  {
    q: 'What is EggForm?',
    a: 'EggForm is a virtual egg ecosystem. You build a farm, hatch eggs into animals, collect resources, trade on the marketplace, complete missions, and participate in events.',
  },
  {
    q: 'How does the PKR wallet work?',
    a: 'The PKR wallet is a separate, regulated payment integration layer. It is architecturally isolated from game balances. Deposits, withdrawals, and refunds go through verified payment providers and webhooks — never trusting the client.',
  },
  {
    q: 'Are egg-hatch returns guaranteed?',
    a: 'No. EggForm is a game, not an investment scheme. The PKR wallet is a regulated payment layer for eligible platform transactions, not a promise of returns. Always review the Wallet Policy and Terms.',
  },
  {
    q: 'How are cheating and fraud prevented?',
    a: 'Formation timers are server-controlled. Wallet balances are derived from a transaction ledger, not a single mutable column. Sensitive admin actions are audit-logged. Suspicious activity is flagged for review.',
  },
  {
    q: 'Is the platform mobile-friendly?',
    a: 'Yes. The web platform is fully responsive with bottom navigation on mobile. A native Flutter / React Native app is on the roadmap for biometric login, push notifications, and offline-first wallet access.',
  },
  {
    q: 'Who can use real-money features?',
    a: 'Real-money features are only activated where legally and operationally supported. KYC verification, withdrawal limits, and risk-based reviews apply per the platform compliance policy.',
  },
]

const EGG_TYPES = [
  { name: 'Basic Egg', rarity: 'Common', time: '5 min', emoji: '🥚', color: 'bg-amber-100 dark:bg-amber-900/30' },
  { name: 'Silver Egg', rarity: 'Uncommon', time: '30 min', emoji: '🥚', color: 'bg-slate-100 dark:bg-slate-800/40' },
  { name: 'Golden Egg', rarity: 'Rare', time: '2 hr', emoji: '🥚', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { name: 'Diamond Egg', rarity: 'Epic', time: '8 hr', emoji: '🥚', color: 'bg-cyan-100 dark:bg-cyan-900/30' },
  { name: 'Legendary Egg', rarity: 'Legendary', time: '24 hr', emoji: '🥚', color: 'bg-fuchsia-100 dark:bg-fuchsia-900/30' },
]

export function LandingPage() {
  const setAuthOpen = useEggForm((s) => s.setAuthOpen)
  const setView = useEggForm((s) => s.setView)
  const login = useEggForm((s) => s.login)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-amber-50/40 dark:to-amber-950/10">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-amber-500/30">
              <Egg className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg leading-none">EggForm</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Virtual Egg Ecosystem</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3 py-2 text-sm hover:text-primary transition">Features</a>
            <a href="#how" className="px-3 py-2 text-sm hover:text-primary transition">How it works</a>
            <a href="#eggs" className="px-3 py-2 text-sm hover:text-primary transition">Eggs</a>
            <a href="#faq" className="px-3 py-2 text-sm hover:text-primary transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => setAuthOpen(true)}>
              Login
            </Button>
            <Button size="sm" onClick={() => setAuthOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30">
              <Sparkles className="h-3 w-3 mr-1" /> Virtual Farming + PKR Wallet
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Build Your <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">Egg Empire</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Hatch rare eggs, raise legendary animals, trade on a player-driven marketplace,
              and manage a regulated PKR wallet — all in one platform engineered for production from day one.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-amber-500/30"
                onClick={() => setAuthOpen(true)}
              >
                Start Farming <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => login('farmer@eggform.pk')}>
                <Star className="mr-1 h-4 w-4" /> Try Demo
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Decorative eggs orbit */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-300/20 dark:from-amber-900/30 dark:to-orange-900/20 blur-3xl" />
              <div className="absolute inset-8 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-950/60 dark:to-orange-950/40 border border-amber-300/40 dark:border-amber-700/40 shadow-2xl shadow-amber-500/20 flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[12rem] leading-none"
                >
                  🥚
                </motion.div>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2"
              >
                {['🥚', '🐔', '🐣', '🥚', '🐔', '🐣'].map((e, i) => (
                  <div
                    key={i}
                    className="absolute w-12 h-12 rounded-xl bg-card border shadow-md flex items-center justify-center text-xl"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 60}deg) translateY(-220px) rotate(-${i * 60}deg)`,
                    }}
                  >
                    {e}
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 bg-secondary/40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to run a virtual farm</h2>
            <p className="mt-4 text-muted-foreground">
              Built on production-ready engineering standards: dual-wallet architecture, server-controlled timers,
              audit-logged admin actions, and a real ledger for every PKR transaction.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all">
                  <CardHeader>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/30 flex items-center justify-center mb-2">
                      <f.icon className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                    </div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3">How it works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">From egg to animal in five steps</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: 1, title: 'Buy an egg', desc: 'From the shop or marketplace.', emoji: '🥚' },
              { step: 2, title: 'Place in incubator', desc: 'Choose capacity & speed tier.', emoji: '🔥' },
              { step: 3, title: 'Care for it', desc: 'Feed, water, warm, boost.', emoji: '❤️' },
              { step: 4, title: 'Wait for formation', desc: 'Server-controlled timer.', emoji: '⏰' },
              { step: 5, title: 'Hatch & collect', desc: 'New animal joins your farm.', emoji: '🐣' },
            ].map((s) => (
              <Card key={s.step} className="relative text-center p-5">
                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {s.step}
                </div>
                <div className="text-4xl mb-3">{s.emoji}</div>
                <CardTitle className="text-sm">{s.title}</CardTitle>
                <CardDescription className="text-xs mt-1">{s.desc}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Eggs */}
      <section id="eggs" className="py-16 md:py-24 bg-secondary/40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3">Egg tiers</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Five rarities. Endless possibilities.</h2>
            <p className="mt-4 text-muted-foreground">
              Each egg has a formation duration, required incubator tier, and a hatched animal rarity.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {EGG_TYPES.map((e) => (
              <Card key={e.name} className="overflow-hidden hover:scale-105 transition-transform">
                <div className={`${e.color} aspect-square flex items-center justify-center text-6xl`}>
                  {e.emoji}
                </div>
                <CardContent className="p-4 text-center">
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{e.rarity} · {e.time}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Questions, answered</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-amber-500/40">
            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 p-8 md:p-14 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start your farm?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Create an account, claim your starter resources, place your first egg in an incubator,
                and watch your virtual farm come to life.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setAuthOpen(true)}
              >
                Create Free Account <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-background">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Egg className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">EggForm</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Virtual egg farming, gaming, marketplace, and PKR wallet — built to production engineering standards.
            </p>
            <div className="flex items-center gap-2 mt-4">
              {[Twitter, Facebook, Instagram, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-accent transition" aria-label="social link">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary">Features</a></li>
              <li><a href="#eggs" className="hover:text-primary">Egg Types</a></li>
              <li><a href="#how" className="hover:text-primary">How it works</a></li>
              <li><button onClick={() => setView('admin')} className="hover:text-primary">Admin Panel</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary">Wallet Policy</a></li>
              <li><a href="#" className="hover:text-primary">Refund Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Disclaimer</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Real-money features are activated only where legally and operationally supported.
              The PKR wallet is a regulated payment integration layer, not a promise of investment returns.
              Always review applicable Pakistani and other regulations.
            </p>
          </div>
        </div>
        <div className="border-t py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EggForm. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
