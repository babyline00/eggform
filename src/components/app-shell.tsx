'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Egg,
  LayoutDashboard,
  Sprout,
  Home,
  ShoppingBag,
  Target,
  Trophy,
  Wallet,
  Coins,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  Shield,
  ChevronRight,
  Sparkles,
  CircleDot,
  BadgeCheck,
  LifeBuoy,
  BarChart3,
  Award,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { useEggForm } from '@/lib/store'
import { useRealtimeNotifications } from '@/hooks/use-realtime'
import { useSoundEffects } from '@/hooks/use-sound-effects'
import type { AppSection } from '@/lib/types'
import { formatCoins, formatPkrShort } from '@/lib/format'

const NAV: { id: AppSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'farm', label: 'My Farm', icon: Sprout },
  { id: 'eggs', label: 'Eggs', icon: Egg },
  { id: 'incubators', label: 'Incubators', icon: Sparkles },
  { id: 'animals', label: 'Animals', icon: Home },
  { id: 'inventory', label: 'Inventory', icon: CircleDot },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'missions', label: 'Missions', icon: Target },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'events', label: 'Events', icon: Trophy },
  { id: 'game-wallet', label: 'Game Wallet', icon: Coins },
  { id: 'pkr-wallet', label: 'PKR Wallet', icon: Wallet },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'kyc', label: 'KYC Verification', icon: BadgeCheck },
  { id: 'support', label: 'Support', icon: LifeBuoy },
]

const MOBILE_NAV: AppSection[] = ['dashboard', 'farm', 'marketplace', 'pkr-wallet', 'profile']

export function AppShell({ children }: { children: React.ReactNode }) {
  const section = useEggForm((s) => s.section)
  const setSection = useEggForm((s) => s.setSection)
  const user = useEggForm((s) => s.currentUser)
  const logout = useEggForm((s) => s.logout)
  const enterAdmin = useEggForm((s) => s.enterAdmin)
  const gameWallet = useEggForm((s) => s.gameWallet)
  const pkrWallet = useEggForm((s) => s.pkrWallet)
  const notifications = useEggForm((s) => s.notifications)
  const markNotificationRead = useEggForm((s) => s.markNotificationRead)
  const setSection_notif = useEggForm((s) => s.setSection)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [notifOpen, setNotifOpen] = React.useState(false)
  const unreadCount = notifications.filter((n) => !n.readAt).length

  // Connect to real-time service for live notifications
  const realtime = useRealtimeNotifications()
  // Sound effects (mute toggle in topbar)
  const sound = useSoundEffects()

  React.useEffect(() => {
    // Tick every second to refresh timers in components reading from store
    const i = setInterval(() => {
      // Just trigger re-render via a noop state set in store
      // The components subscribe to specific slices so this is fine
    }, 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar/40 backdrop-blur-sm sticky top-0 h-screen">
        <div className="p-4 border-b">
          <button
            className="flex items-center gap-2 w-full"
            onClick={() => setSection('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-amber-500/30">
              <Egg className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold leading-none">EggForm</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Virtual Egg Ecosystem</p>
            </div>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto egg-scroll p-3 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition w-full',
                section === item.id
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'hover:bg-accent text-foreground/80 hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.id === 'pkr-wallet' && (
                <span className="ml-auto text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                  {formatPkrShort(pkrWallet.available)}
                </span>
              )}
              {item.id === 'game-wallet' && (
                <span className="ml-auto text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                  {formatCoins(gameWallet.coins)}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t space-y-1">
          <button
            onClick={() => setSection('profile')}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition w-full',
              section === 'profile' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Profile & Settings</span>
          </button>
          <button
            onClick={enterAdmin}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition w-full hover:bg-accent text-foreground/80 hover:text-foreground"
          >
            <Shield className="h-4 w-4" />
            <span>Admin Panel</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition w-full hover:bg-destructive/10 text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r z-50 lg:hidden flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <Egg className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-bold">EggForm</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSection(item.id)
                      setMobileOpen(false)
                    }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition w-full',
                      section === item.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSection('profile')
                    setMobileOpen(false)
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent w-full"
                >
                  <Settings className="h-4 w-4" /> Profile
                </button>
                <button
                  onClick={() => {
                    enterAdmin()
                    setMobileOpen(false)
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent w-full"
                >
                  <Shield className="h-4 w-4" /> Admin Panel
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive w-full"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b">
          <div className="px-4 lg:px-6 h-14 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="lg:hidden flex items-center gap-2 mr-auto">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Egg className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm">EggForm</span>
            </div>

            {/* Quick balances (desktop) */}
            <div className="hidden md:flex items-center gap-2 mr-auto">
              <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 border-amber-500/30 text-amber-700 dark:text-amber-300">
                <Coins className="h-3 w-3 mr-1" /> {formatCoins(gameWallet.coins)}
              </Badge>
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                💎 {gameWallet.gems}
              </Badge>
              <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-300">
                <Wallet className="h-3 w-3 mr-1" /> {formatPkrShort(pkrWallet.available)}
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label="Notifications"
                >
                  <span className="relative">
                    <Bell className="h-5 w-5" />
                    {/* Realtime connection dot */}
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background',
                        realtime.isConnected ? 'bg-emerald-500' : 'bg-slate-400',
                      )}
                      title={realtime.isConnected ? 'Real-time connected' : 'Reconnecting...'}
                    />
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto egg-scroll bg-card border rounded-lg shadow-xl z-50">
                    <div className="p-3 border-b flex items-center justify-between">
                      <span className="font-semibold text-sm">Notifications</span>
                      <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">No notifications</div>
                    ) : (
                      notifications.slice(0, 20).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={cn(
                            'w-full text-left p-3 border-b hover:bg-accent/50 transition',
                            !n.readAt && 'bg-amber-50/40 dark:bg-amber-950/10',
                          )}
                        >
                          <div className="font-medium text-sm">{n.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => sound.toggle()}
                aria-label={sound.enabled ? 'Mute sounds' : 'Enable sounds'}
                title={sound.enabled ? 'Sounds on' : 'Sounds off'}
              >
                {sound.enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              <button
                onClick={() => setSection('profile')}
                className="flex items-center gap-2 ml-1 hover:bg-accent rounded-lg p-1 transition"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold leading-tight">{user?.fullName || 'User'}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">Lv {user?.level || 1} · {user?.farmName}</div>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Section router */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t safe-area-inset-bottom">
          <div className="grid grid-cols-5 h-16">
            {MOBILE_NAV.map((sec) => {
              const item = NAV.find((n) => n.id === sec) || (sec === 'profile' ? { icon: User, label: 'Profile' } : null)
              if (!item) return null
              return (
                <button
                  key={sec}
                  onClick={() => setSection_notif(sec)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 transition',
                    section === sec ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[9px]">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
