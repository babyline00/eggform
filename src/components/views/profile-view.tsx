'use client'

import * as React from 'react'
import { User, Shield, Bell, Smartphone, Globe, LogOut, ChevronRight, Fingerprint } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionHeader } from '@/components/cards'
import { ThemeToggle } from '@/components/theme-toggle'
import { useEggForm } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

export function ProfileView() {
  const user = useEggForm((s) => s.currentUser)
  const logout = useEggForm((s) => s.logout)
  const enterAdmin = useEggForm((s) => s.enterAdmin)
  const { toast } = useToast()

  if (!user) return null

  return (
    <div className="space-y-5">
      <SectionHeader title="Profile & Settings" description="Manage your account, security, and preferences." />

      {/* Profile card */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl">
              {user.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg">{user.fullName}</div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="text-[10px]">Lv {user.level}</Badge>
              <Badge variant="outline" className="text-[10px]">{user.xp} XP</Badge>
              <Badge variant="outline" className="text-[10px] bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-500/30">
                Referral: {user.referralCode}
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                KYC: Verified
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Edit profile', description: 'Coming soon in production.' })}>
            Edit
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Full name</Label>
                  <Input value={user.fullName} readOnly className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Username</Label>
                  <Input value={user.username} readOnly className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={user.email} readOnly className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={user.phone} readOnly className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Country</Label>
                  <Input value={user.country} readOnly className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Farm name</Label>
                  <Input value={user.farmName} readOnly className="h-9 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Theme</div>
                    <div className="text-[10px] text-muted-foreground">Toggle light/dark mode</div>
                  </div>
                </div>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Language</div>
                    <div className="text-[10px] text-muted-foreground">English (default)</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">Change</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Admin Access</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={enterAdmin}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/40 transition text-left"
              >
                <Shield className="h-4 w-4 text-amber-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Open Admin Panel</div>
                  <div className="text-[10px] text-muted-foreground">Manage users, deposits, withdrawals, KYC, and reports.</div>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-destructive/10 hover:border-destructive/40 transition text-left text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Logout</div>
                  <div className="text-[10px] text-muted-foreground">End your session</div>
                </div>
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Authentication</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="text-sm font-medium">Change Password</div>
                  <div className="text-[10px] text-muted-foreground">Last changed 30 days ago</div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="text-sm font-medium">Two-Factor Authentication</div>
                  <div className="text-[10px] text-muted-foreground">Adds an extra layer of security</div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="text-sm font-medium">Transaction PIN</div>
                  <div className="text-[10px] text-muted-foreground">Required for PKR withdrawals</div>
                </div>
                <Button variant="outline" size="sm">Set PIN</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Biometric Login</div>
                    <div className="text-[10px] text-muted-foreground">Face ID / Fingerprint</div>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Active Devices</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { device: 'Chrome on Windows', ip: '203.135.0.42', last: 'Now', current: true },
                { device: 'Safari on iPhone', ip: '203.135.0.10', last: '2h ago', current: false },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{d.device} {d.current && <Badge variant="outline" className="text-[9px] ml-1">Current</Badge>}</div>
                    <div className="text-[10px] text-muted-foreground">{d.ip} · {d.last}</div>
                  </div>
                  {!d.current && <Button variant="ghost" size="sm" className="text-xs text-destructive">Revoke</Button>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full text-xs">Logout all devices</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Notification Channels</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Push notifications', desc: 'Receive alerts on your device', on: true },
                { label: 'In-app notifications', desc: 'Show in the app bell', on: true },
                { label: 'Email', desc: 'Important events only', on: true },
                { label: 'SMS', desc: 'Critical security alerts', on: false },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{n.label}</div>
                      <div className="text-[10px] text-muted-foreground">{n.desc}</div>
                    </div>
                  </div>
                  <Switch defaultChecked={n.on} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Notification Events</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                'Egg ready to hatch',
                'Animal production ready',
                'Mission completed',
                'Deposit confirmed',
                'Withdrawal status changed',
                'Marketplace sale',
                'Security alerts',
                'Event started',
              ].map((e, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{e}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Referral Code</CardTitle>
              <CardDescription className="text-xs">Share with friends to earn rewards.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Your code</div>
                <div className="text-2xl font-bold font-mono tracking-wider">{user.referralCode}</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    navigator.clipboard?.writeText(user.referralCode)
                    toast({ title: 'Copied!', description: 'Referral code copied to clipboard.' })
                  }}
                >
                  Copy code
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-xs text-muted-foreground">Friends Joined</div>
                  <div className="text-xl font-bold">12</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-xs text-muted-foreground">Coins Earned</div>
                  <div className="text-xl font-bold">3,500</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-xs text-muted-foreground">Pending</div>
                  <div className="text-xl font-bold">2</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
