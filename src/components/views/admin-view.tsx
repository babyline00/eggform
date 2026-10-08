'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Users, Egg, Sprout, ArrowDownToLine, ArrowUpFromLine, Wallet, ShoppingBag,
  AlertTriangle, ChevronLeft, TrendingUp, TrendingDown, CheckCircle2, XCircle,
  BarChart3, FileText, Settings, ScrollText, BadgeCheck, Clock, Eye, Check, X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SectionHeader, StatCard } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { formatPkr, formatCoins, formatRelativeTime, formatPkrShort } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AdminSection } from '@/lib/types'

const ADMIN_NAV: { id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'deposits', label: 'Deposits', icon: ArrowDownToLine },
  { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpFromLine },
  { id: 'kyc', label: 'KYC Review', icon: BadgeCheck },
  { id: 'eggs', label: 'Eggs', icon: Egg },
  { id: 'animals', label: 'Animals', icon: Sprout },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'audit', label: 'Audit Logs', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function AdminView() {
  const section = useEggForm((s) => s.adminSection)
  const setSection = useEggForm((s) => s.setAdminSection)
  const exitAdmin = useEggForm((s) => s.exitAdmin)
  const adminUsers = useEggForm((s) => s.adminUsers)
  const deposits = useEggForm((s) => s.deposits)
  const withdrawals = useEggForm((s) => s.withdrawals)
  const pkrTransactions = useEggForm((s) => s.pkrTransactions)
  const auditLog = useEggForm((s) => s.adminAuditLog)
  const kycQueue = useEggForm((s) => s.adminKycQueue)
  const processAdminWithdrawal = useEggForm((s) => s.processAdminWithdrawal)
  const eggs = useEggForm((s) => s.eggs)
  const animals = useEggForm((s) => s.animals)
  const listings = useEggForm((s) => s.listings)

  const totalDeposits = deposits.reduce((s, d) => s + d.amount, 0)
  const completedDeposits = deposits.filter((d) => d.status === 'completed').reduce((s, d) => s + d.amount, 0)
  const pendingDeposits = deposits.filter((d) => d.status === 'pending').reduce((s, d) => s + d.amount, 0)
  const totalWithdrawals = withdrawals.reduce((s, w) => s + w.amount, 0)
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending').length

  return (
    <div className="min-h-screen flex bg-background">
      {/* Admin sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r bg-sidebar/40 sticky top-0 h-screen">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-700 to-orange-800 flex items-center justify-center shadow-md">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">EggForm Admin</p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">superadmin@eggform</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {ADMIN_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition w-full',
                section === item.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent text-foreground/80',
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              <span className="truncate">{item.label}</span>
              {item.id === 'withdrawals' && pendingWithdrawals > 0 && (
                <Badge className="ml-auto text-[9px] bg-rose-500 text-white px-1 py-0">{pendingWithdrawals}</Badge>
              )}
              {item.id === 'kyc' && kycQueue.filter((k) => k.status === 'pending').length > 0 && (
                <Badge className="ml-auto text-[9px] bg-amber-500 text-white px-1 py-0">{kycQueue.filter((k) => k.status === 'pending').length}</Badge>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={exitAdmin}>
            <ChevronLeft className="h-3 w-3 mr-1" /> Back to App
          </Button>
        </div>
      </aside>

      {/* Admin main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b">
          <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
            <h1 className="font-bold text-base md:text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-700" />
              {ADMIN_NAV.find((n) => n.id === section)?.label}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exitAdmin} className="lg:hidden">
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-amber-700 to-orange-800 text-white text-xs">A</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {/* Mobile nav */}
          <div className="lg:hidden mb-4 flex gap-1 overflow-x-auto egg-scroll pb-1">
            {ADMIN_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition',
                  section === item.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/60',
                )}
              >
                <item.icon className="h-3 w-3" /> {item.label}
              </button>
            ))}
          </div>

          {section === 'dashboard' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Users} label="Total Users" value="24,582" sub="+128 today" accent="amber" />
                <StatCard icon={Wallet} label="Total Deposits" value={formatPkrShort(totalDeposits)} sub={`${formatPkrShort(pendingDeposits)} pending`} accent="emerald" />
                <StatCard icon={ArrowUpFromLine} label="Pending Withdrawals" value={pendingWithdrawals} sub="Awaiting review" accent="rose" />
                <StatCard icon={TrendingUp} label="Revenue (30d)" value="Rs 3.8M" sub="+12% MoM" accent="fuchsia" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Egg} label="Active Eggs" value={eggs.filter((e) => e.status === 'incubating').length} sub="Incubating now" accent="amber" />
                <StatCard icon={Sprout} label="Animals" value={animals.length} sub="In production" accent="emerald" />
                <StatCard icon={ShoppingBag} label="Marketplace" value={listings.filter((l) => l.status === 'active').length} sub="Active listings" accent="fuchsia" />
                <StatCard icon={AlertTriangle} label="Security Alerts" value={auditLog.length} sub="Last 24h" accent="rose" />
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Deposits</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {deposits.slice(0, 5).map((d) => (
                        <div key={d.id} className="p-3 flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center',
                            d.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700')}>
                            <ArrowDownToLine className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{formatPkr(d.amount)}</div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {d.paymentMethod} · {d.internalReference} · {formatRelativeTime(d.createdAt)}
                            </div>
                          </div>
                          <StatusPill status={d.status} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pending Withdrawals</CardTitle>
                    <CardDescription className="text-xs">Approve or reject per risk policy.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {withdrawals.filter((w) => w.status === 'pending').slice(0, 5).map((w) => (
                        <div key={w.id} className="p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-700 flex items-center justify-center">
                            <ArrowUpFromLine className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{formatPkr(w.amount)}</div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {w.method} · Risk: {w.riskScore}/100 · {formatRelativeTime(w.createdAt)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                              onClick={() => processAdminWithdrawal(w.id, 'approve')}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-rose-600 border-rose-500/40"
                              onClick={() => processAdminWithdrawal(w.id, 'reject')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {section === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Management</CardTitle>
                <CardDescription className="text-xs">Total: {adminUsers.length} (demo)</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Farm</TableHead>
                      <TableHead className="hidden md:table-cell">Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs">
                                {u.fullName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{u.fullName}</div>
                              <div className="text-[10px] text-muted-foreground">@{u.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{u.email}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{u.farmName}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">Lv {u.level}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Active</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            <Eye className="h-3 w-3 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {section === 'deposits' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Deposits</CardTitle>
                <CardDescription className="text-xs">Total: {formatPkr(totalDeposits)} · Completed: {formatPkr(completedDeposits)} · Pending: {formatPkr(pendingDeposits)}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Method</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-xs font-mono">{d.internalReference}</TableCell>
                        <TableCell className="font-medium">{formatPkr(d.amount)}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs capitalize">{d.paymentMethod}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{formatRelativeTime(d.createdAt)}</TableCell>
                        <TableCell><StatusPill status={d.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {section === 'withdrawals' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Withdrawals</CardTitle>
                <CardDescription className="text-xs">Total: {formatPkr(totalWithdrawals)} · Pending review: {pendingWithdrawals}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Method</TableHead>
                      <TableHead className="hidden md:table-cell">Risk</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="text-xs font-mono">{w.id.slice(-8).toUpperCase()}</TableCell>
                        <TableCell className="font-medium">{formatPkr(w.amount)}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs capitalize">{w.method}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className={cn('text-[9px]',
                            w.riskScore < 20 ? 'text-emerald-700' :
                            w.riskScore < 50 ? 'text-amber-700' : 'text-rose-700')}>
                            {w.riskScore}/100
                          </Badge>
                        </TableCell>
                        <TableCell><StatusPill status={w.status} /></TableCell>
                        <TableCell className="text-right">
                          {w.status === 'pending' && (
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" className="h-7 px-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => processAdminWithdrawal(w.id, 'approve')}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-rose-600 border-rose-500/40" onClick={() => processAdminWithdrawal(w.id, 'reject')}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {section === 'kyc' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">KYC Review Queue</CardTitle>
                <CardDescription className="text-xs">Pending: {kycQueue.filter((k) => k.status === 'pending').length} · Under review: {kycQueue.filter((k) => k.status === 'under_review').length}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">CNIC</TableHead>
                      <TableHead className="hidden md:table-cell">Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycQueue.map((k) => (
                      <TableRow key={k.id}>
                        <TableCell>
                          <div className="text-sm font-medium">{k.userName}</div>
                          <div className="text-[10px] text-muted-foreground">{k.userId}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs font-mono">{k.cnic}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{formatRelativeTime(k.submittedAt)}</TableCell>
                        <TableCell><StatusPill status={k.status === 'verified' ? 'completed' : k.status === 'rejected' ? 'rejected' : k.status === 'under_review' ? 'processing' : 'pending'} /></TableCell>
                        <TableCell className="text-right">
                          {k.status === 'pending' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              <Eye className="h-3 w-3 mr-1" /> Review
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {section === 'audit' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audit Log</CardTitle>
                <CardDescription className="text-xs">Every sensitive admin action is recorded immutably.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {auditLog.map((log) => (
                    <div key={log.id} className="p-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <ScrollText className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</div>
                        <div className="text-[10px] text-muted-foreground">
                          Admin: {log.adminName} · Target: {log.targetType}/{log.targetId} · Reason: {log.reason || '—'}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {formatRelativeTime(log.createdAt)} · IP: {log.ip}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'eggs' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Egg Configuration</CardTitle>
                <CardDescription className="text-xs">Manage egg types, prices, and rarity.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Egg</TableHead>
                      <TableHead>Rarity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="hidden md:table-cell">Formation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Use static egg types since store doesn't have admin egg types separately */}
                    {[
                      { name: 'Basic Egg', rarity: 'common', price: 100, formation: '5 min' },
                      { name: 'Silver Egg', rarity: 'uncommon', price: 500, formation: '30 min' },
                      { name: 'Golden Egg', rarity: 'rare', price: 2500, formation: '2 hr' },
                      { name: 'Diamond Egg', rarity: 'epic', price: 10000, formation: '8 hr' },
                      { name: 'Legendary Egg', rarity: 'legendary', price: 50000, formation: '24 hr' },
                    ].map((e) => (
                      <TableRow key={e.name}>
                        <TableCell className="text-sm font-medium">🥚 {e.name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] capitalize">{e.rarity}</Badge></TableCell>
                        <TableCell className="font-medium">{formatCoins(e.price)} 🪙</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{e.formation}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="h-7 text-xs">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {section === 'animals' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Animal Types</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Rarity</TableHead>
                      <TableHead className="hidden md:table-cell">Production</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: 'Common Chicken', rarity: 'common', production: '8/day coins' },
                      { name: 'Silver Chicken', rarity: 'uncommon', production: '14/day coins' },
                      { name: 'Golden Chicken', rarity: 'rare', production: '24/day coins' },
                      { name: 'Phoenix Chick', rarity: 'epic', production: '40/day gems' },
                      { name: 'Crystal Dragon', rarity: 'legendary', production: '80/day special' },
                    ].map((a) => (
                      <TableRow key={a.name}>
                        <TableCell className="text-sm font-medium">{a.name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] capitalize">{a.rarity}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{a.production}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="h-7 text-xs">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {section === 'marketplace' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Marketplace Overview</CardTitle>
                <CardDescription className="text-xs">Active listings: {listings.filter((l) => l.status === 'active').length} · Sold: {listings.filter((l) => l.status === 'sold').length}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="text-sm font-medium">{l.emoji} {l.name}</TableCell>
                        <TableCell className="text-xs">{l.sellerName}</TableCell>
                        <TableCell className="font-medium">{formatCoins(l.price)} 🪙</TableCell>
                        <TableCell><StatusPill status={l.status === 'active' ? 'pending' : l.status === 'sold' ? 'completed' : 'cancelled'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {section === 'settings' && (
            <Card>
              <CardHeader><CardTitle className="text-base">System Settings</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Maintenance Mode</div>
                    <div className="text-[10px] text-muted-foreground">Temporarily disable user access</div>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">PKR Wallet Enabled</div>
                    <div className="text-[10px] text-muted-foreground">Allow real-money transactions</div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">ON</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Withdrawal Approval</div>
                    <div className="text-[10px] text-muted-foreground">Manual review required</div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">ON</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/30',
    processing: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-500/30',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/30',
    failed: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/30',
    cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-slate-500/30',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/30',
    under_review: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/30',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/30',
  }
  return (
    <Badge variant="outline" className={cn('text-[9px] uppercase tracking-wide font-semibold capitalize', map[status] || map.pending)}>
      {status.replace('_', ' ')}
    </Badge>
  )
}
