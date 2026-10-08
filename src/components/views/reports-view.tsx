'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Users, DollarSign, Egg, ShoppingBag,
  Download, Calendar, ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionHeader, StatCard } from '@/components/cards'
import { cn } from '@/lib/utils'

// ============================================================
// MOCK DATA — In production these come from /api/reports
// ============================================================

const REVENUE_DATA = [
  { day: 'Sep 21', deposits: 38000, withdrawals: 22000, revenue: 1900 },
  { day: 'Sep 22', deposits: 42000, withdrawals: 18000, revenue: 2400 },
  { day: 'Sep 23', deposits: 51000, withdrawals: 31000, revenue: 2000 },
  { day: 'Sep 24', deposits: 39000, withdrawals: 24000, revenue: 1500 },
  { day: 'Sep 25', deposits: 67000, withdrawals: 38000, revenue: 2900 },
  { day: 'Sep 26', deposits: 78000, withdrawals: 42000, revenue: 3600 },
  { day: 'Sep 27', deposits: 85000, withdrawals: 45000, revenue: 4000 },
]

const USER_GROWTH = [
  { day: 'Week 1', users: 18500, active: 7800 },
  { day: 'Week 2', users: 19800, active: 8100 },
  { day: 'Week 3', users: 21400, active: 8500 },
  { day: 'Week 4', users: 22800, active: 8900 },
  { day: 'Week 5', users: 23900, active: 9100 },
  { day: 'Week 6', users: 24582, active: 8920 },
]

const EGGS_HATCHED = [
  { name: 'Basic', value: 8200, color: '#6B7280' },
  { name: 'Silver', value: 3400, color: '#18A957' },
  { name: 'Golden', value: 1200, color: '#F7B928' },
  { name: 'Diamond', value: 320, color: '#4A90E2' },
  { name: 'Legendary', value: 80, color: '#7957D5' },
]

const MARKETPLACE_VOL = [
  { day: 'Mon', volume: 12000, trades: 42 },
  { day: 'Tue', volume: 18000, trades: 58 },
  { day: 'Wed', volume: 15000, trades: 51 },
  { day: 'Thu', volume: 22000, trades: 67 },
  { day: 'Fri', volume: 28000, trades: 78 },
  { day: 'Sat', volume: 35000, trades: 92 },
  { day: 'Sun', volume: 31000, trades: 85 },
]

const PRODUCTION_DATA = [
  { hour: '00', production: 120 },
  { hour: '04', production: 80 },
  { hour: '08', production: 240 },
  { hour: '12', production: 380 },
  { hour: '16', production: 420 },
  { hour: '20', production: 280 },
  { hour: '24', production: 180 },
]

const CHART_COLORS = ['#18A957', '#4A90E2', '#F7B928', '#7957D5', '#F59E42', '#E55353']

export function ReportsView() {
  const [range, setRange] = React.useState<'7d' | '30d' | '90d'>('7d')

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Reports & Analytics"
        description="Track revenue, user growth, marketplace activity, and game economy metrics."
        action={
          <div className="flex items-center gap-2">
            <div className="flex bg-secondary/60 rounded-lg p-0.5">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md transition',
                    range === r ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-3 w-3 mr-1" /> Export
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto egg-scroll">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="game">Game</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={DollarSign} label="Revenue (7d)" value="Rs 18,300" sub="+24% vs last week" accent="green" />
            <StatCard icon={Users} label="Active Users" value="8,920" sub="+312 new" accent="sky" />
            <StatCard icon={Egg} label="Eggs Hatched" value="1,420" sub="12% rare+" accent="golden" />
            <StatCard icon={ShoppingBag} label="Marketplace Vol" value="Rs 161K" sub="473 trades" accent="purple" />
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Revenue Trend</CardTitle>
                  <CardDescription className="text-xs">Daily deposits, withdrawals, and net revenue (PKR)</CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-400/40">
                  <TrendingUp className="h-3 w-3 mr-1" /> +24%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18A957" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#18A957" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E55353" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E55353" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v / 1000}K`} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="deposits" stroke="#18A957" strokeWidth={2} fill="url(#colorDeposits)" name="Deposits" />
                  <Area type="monotone" dataKey="withdrawals" stroke="#E55353" strokeWidth={2} fill="url(#colorWithdrawals)" name="Withdrawals" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Two-column charts */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Eggs hatched by rarity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Eggs Hatched by Rarity</CardTitle>
                <CardDescription className="text-xs">Distribution across rarities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={EGGS_HATCHED}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {EGGS_HATCHED.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Production by hour */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Production by Hour</CardTitle>
                <CardDescription className="text-xs">When users collect resources</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={PRODUCTION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="production" fill="#F7B928" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FINANCIAL */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={DollarSign} label="Total Deposits" value="Rs 400K" sub="+18% MoM" accent="green" />
            <StatCard icon={TrendingDown} label="Total Withdrawals" value="Rs 220K" sub="+12% MoM" accent="coral" />
            <StatCard icon={DollarSign} label="Net Revenue" value="Rs 18.3K" sub="Fees + withdrawals" accent="green" />
            <StatCard icon={DollarSign} label="Pending Payouts" value="Rs 32K" sub="12 requests" accent="golden" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deposits vs Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v / 1000}K`} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="deposits" fill="#18A957" radius={[4, 4, 0, 0]} name="Deposits" />
                  <Bar dataKey="withdrawals" fill="#E55353" radius={[4, 4, 0, 0]} name="Withdrawals" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Net Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#7957D5" strokeWidth={3} dot={{ fill: '#7957D5', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USERS */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Total Users" value="24,582" sub="+1,682 (7d)" accent="green" />
            <StatCard icon={Users} label="Active (7d)" value="8,920" sub="36% engagement" accent="sky" />
            <StatCard icon={Users} label="New Today" value="128" sub="+12 vs yesterday" accent="purple" />
            <StatCard icon={Users} label="Retention (7d)" value="42%" sub="+3% MoM" accent="golden" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Growth</CardTitle>
              <CardDescription className="text-xs">Total registered vs active users over 6 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={USER_GROWTH}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18A957" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#18A957" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="users" stroke="#4A90E2" strokeWidth={2} fill="url(#colorUsers)" name="Total Users" />
                  <Area type="monotone" dataKey="active" stroke="#18A957" strokeWidth={2} fill="url(#colorActive)" name="Active Users" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GAME */}
        <TabsContent value="game" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Egg} label="Eggs Formed" value="3,241" sub="last 7 days" accent="golden" />
            <StatCard icon={Egg} label="Eggs Hatched" value="1,420" sub="44% completion" accent="green" />
            <StatCard icon={Egg} label="Animals Owned" value="4,892" sub="avg 2.1/user" accent="sky" />
            <StatCard icon={Egg} label="Production Collected" value="89.2K" sub="coin equivalent" accent="purple" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Egg Rarity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={EGGS_HATCHED} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={(e) => e.name}>
                      {EGGS_HATCHED.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hourly Production</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={PRODUCTION_DATA}>
                    <defs>
                      <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F7B928" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F7B928" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="production" stroke="#F7B928" strokeWidth={2} fill="url(#colorProd)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MARKETPLACE */}
        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={ShoppingBag} label="Volume (7d)" value="Rs 161K" sub="473 trades" accent="green" />
            <StatCard icon={ShoppingBag} label="Avg Order" value="Rs 340" sub="-3% vs prev" accent="golden" />
            <StatCard icon={ShoppingBag} label="Active Listings" value="284" sub="62% eggs" accent="sky" />
            <StatCard icon={ShoppingBag} label="Platform Fees" value="Rs 8.05K" sub="5% avg" accent="purple" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Marketplace Activity</CardTitle>
              <CardDescription className="text-xs">Daily trade volume and number of trades</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MARKETPLACE_VOL}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v / 1000}K`} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar yAxisId="left" dataKey="volume" fill="#7957D5" radius={[4, 4, 0, 0]} name="Volume (PKR)" />
                  <Line yAxisId="right" type="monotone" dataKey="trades" stroke="#F59E42" strokeWidth={2} dot={{ fill: '#F59E42', r: 3 }} name="Trades" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
