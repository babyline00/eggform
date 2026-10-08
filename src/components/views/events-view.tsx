'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, Clock, Sparkles, ChevronRight, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SectionHeader, EmptyState } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

interface EventData {
  id: string
  name: string
  description: string
  banner: string
  startDate: number
  endDate: number
  participants: number
  rewards: { label: string; icon: string; tier: 'common' | 'rare' | 'legendary' }[]
  status: 'active' | 'upcoming' | 'ended'
  myRank?: number
  myScore?: number
}

const EVENTS: EventData[] = [
  {
    id: 'event-1',
    name: 'Night Egg Festival',
    description: 'Hatch rare eggs during night hours for bonus rewards and exclusive Legendary Egg drops.',
    banner: '🌙',
    startDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
    participants: 1240,
    rewards: [
      { label: 'Top 3: Crystal Dragon Egg', icon: '🐲', tier: 'legendary' },
      { label: 'Top 100: 500 Gems', icon: '💎', tier: 'rare' },
      { label: 'All participants: 100 Coins', icon: '🪙', tier: 'common' },
    ],
    status: 'active',
    myRank: 47,
    myScore: 1240,
  },
  {
    id: 'event-2',
    name: 'Golden Harvest Week',
    description: 'Collect production from golden chickens to earn double coins and exclusive farm decorations.',
    banner: '🌾',
    startDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 9 * 24 * 60 * 60 * 1000,
    participants: 0,
    rewards: [
      { label: 'Top 10: Golden Windmill', icon: '🌬️', tier: 'legendary' },
      { label: 'Top 500: 200 Gems', icon: '💎', tier: 'rare' },
    ],
    status: 'upcoming',
  },
  {
    id: 'event-3',
    name: 'Spring Hatching Sprint',
    description: 'Hatch as many eggs as possible in 24 hours. Top hatchers win exclusive Phoenix Eggs.',
    banner: '🐣',
    startDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    endDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    participants: 3240,
    rewards: [
      { label: 'Top 1: Phoenix Egg', icon: '🔥', tier: 'legendary' },
      { label: 'Top 50: 1000 Gems', icon: '💎', tier: 'rare' },
    ],
    status: 'ended',
    myRank: 12,
    myScore: 4250,
  },
]

const LEADERBOARD = [
  { rank: 1, name: 'DragonMaster', score: 8420, avatar: 'D', tier: 'legendary' },
  { rank: 2, name: 'EggEmpire', score: 7890, avatar: 'E', tier: 'legendary' },
  { rank: 3, name: 'PhoenixRider', score: 7240, avatar: 'P', tier: 'legendary' },
  { rank: 4, name: 'GoldenFarmer', score: 6820, avatar: 'G', tier: 'rare' },
  { rank: 5, name: 'CrystalKeeper', score: 6450, avatar: 'C', tier: 'rare' },
  { rank: 6, name: 'SilverWing', score: 5980, avatar: 'S', tier: 'rare' },
  { rank: 7, name: 'MoonHatcher', score: 5640, avatar: 'M', tier: 'rare' },
  { rank: 8, name: 'StarCollector', score: 5210, avatar: 'S', tier: 'rare' },
  { rank: 9, name: 'WindWalker', score: 4870, avatar: 'W', tier: 'common' },
  { rank: 10, name: 'FarmQueen', score: 4520, avatar: 'F', tier: 'common' },
]

export function EventsView() {
  const [selectedEvent, setSelectedEvent] = React.useState<EventData | null>(EVENTS[0])

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Events"
        description="Compete in special events for exclusive rewards and rankings."
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Events list */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold">Active & Upcoming</h3>
          {EVENTS.map((event) => (
            <motion.button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              whileHover={{ scale: 1.01 }}
              className={cn(
                'w-full text-left rounded-xl border bg-card p-3 transition',
                selectedEvent?.id === event.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40',
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0',
                  event.status === 'active' && 'bg-emerald-50 dark:bg-emerald-950/30',
                  event.status === 'upcoming' && 'bg-sky-50 dark:bg-sky-950/30',
                  event.status === 'ended' && 'bg-slate-50 dark:bg-slate-900/30 opacity-60',
                )}>
                  {event.banner}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{event.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {event.participants.toLocaleString()} participants
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[9px] mt-1',
                      event.status === 'active' && 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-400/40',
                      event.status === 'upcoming' && 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border-sky-400/40',
                      event.status === 'ended' && 'bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-400/40',
                    )}
                  >
                    {event.status === 'active' ? '🟢 Live' : event.status === 'upcoming' ? '⏳ Upcoming' : '✓ Ended'}
                  </Badge>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Event detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedEvent && (
            <>
              <Card className="overflow-hidden">
                <div className={cn(
                  'aspect-[3/1] flex items-center justify-center text-8xl',
                  selectedEvent.status === 'active' && 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950/40 dark:to-emerald-900/30',
                  selectedEvent.status === 'upcoming' && 'bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-950/40 dark:to-sky-900/30',
                  selectedEvent.status === 'ended' && 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900/40 dark:to-slate-800/30',
                )}>
                  <motion.span
                    animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {selectedEvent.banner}
                  </motion.span>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedEvent.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{selectedEvent.status}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2 rounded-lg bg-secondary/40">
                      <Calendar className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <div className="text-[10px] text-muted-foreground">Started</div>
                      <div className="text-xs font-medium">{formatRelativeTime(selectedEvent.startDate)}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/40">
                      <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <div className="text-[10px] text-muted-foreground">Ends in</div>
                      <div className="text-xs font-medium">
                        {selectedEvent.status === 'ended'
                          ? 'Ended'
                          : `${Math.ceil((selectedEvent.endDate - Date.now()) / (24 * 60 * 60 * 1000))} days`}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/40">
                      <Trophy className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <div className="text-[10px] text-muted-foreground">Participants</div>
                      <div className="text-xs font-medium">{selectedEvent.participants.toLocaleString()}</div>
                    </div>
                  </div>

                  {selectedEvent.status === 'active' && selectedEvent.myRank && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">Your Ranking</span>
                        <Badge className="bg-emerald-500 text-white text-[10px]">#{selectedEvent.myRank}</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Score: <span className="font-mono font-bold text-foreground">{selectedEvent.myScore}</span></span>
                        <span>Top {(selectedEvent.myRank / selectedEvent.participants * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={100 - (selectedEvent.myRank / selectedEvent.participants * 100)} className="h-1 mt-2" />
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" /> Rewards
                    </h4>
                    <div className="space-y-2">
                      {selectedEvent.rewards.map((reward, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                          <span className="text-2xl">{reward.icon}</span>
                          <div className="flex-1 text-sm">{reward.label}</div>
                          <Badge variant="outline" className={cn(
                            'text-[9px] capitalize',
                            reward.tier === 'legendary' && 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-400/40',
                            reward.tier === 'rare' && 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border-sky-400/40',
                            reward.tier === 'common' && 'bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-400/40',
                          )}>
                            {reward.tier}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedEvent.status === 'active' && (
                    <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground btn-press">
                      <Sparkles className="h-4 w-4 mr-1" /> Join Event
                    </Button>
                  )}
                  {selectedEvent.status === 'upcoming' && (
                    <Button className="w-full mt-4" variant="outline" disabled>
                      <Clock className="h-4 w-4 mr-1" /> Starts in 2 days
                    </Button>
                  )}
                  {selectedEvent.status === 'ended' && (
                    <Button className="w-full mt-4" variant="outline" disabled>
                      Event Ended
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Leaderboard */}
              {selectedEvent.status !== 'upcoming' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" /> Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {LEADERBOARD.map((entry, i) => (
                        <motion.div
                          key={entry.rank}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={cn(
                            'flex items-center gap-3 p-3 hover:bg-accent/40',
                            entry.rank <= 3 && 'bg-amber-50/40 dark:bg-amber-950/10',
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                            entry.rank === 1 && 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
                            entry.rank === 2 && 'bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300',
                            entry.rank === 3 && 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300',
                            entry.rank > 3 && 'bg-secondary text-muted-foreground',
                          )}>
                            {entry.rank === 1 ? <Crown className="h-4 w-4" /> :
                             entry.rank === 2 ? <Medal className="h-4 w-4" /> :
                             entry.rank === 3 ? <Medal className="h-4 w-4" /> :
                             entry.rank}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                            {entry.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{entry.name}</div>
                            <div className="text-[10px] text-muted-foreground">Score: {entry.score.toLocaleString()}</div>
                          </div>
                          {entry.rank <= 3 && (
                            <Badge variant="outline" className="text-[9px] bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-400/40">
                              Top 3
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
