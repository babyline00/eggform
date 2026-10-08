'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Target, Star, Gift, Check, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SectionHeader } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { formatCoins } from '@/lib/format'
import { cn } from '@/lib/utils'

export function MissionsView() {
  const missions = useEggForm((s) => s.missions)
  const userMissions = useEggForm((s) => s.userMissions)
  const claimMission = useEggForm((s) => s.claimMission)
  const { toast } = useToast()

  function handleClaim(missionId: string, name: string) {
    claimMission(missionId)
    toast({ title: 'Reward claimed!', description: `${name} reward added to your wallet.` })
  }

  const completed = userMissions.filter((m) => m.status === 'completed' && !m.claimedAt)
  const active = userMissions.filter((m) => m.status === 'active')
  const claimed = userMissions.filter((m) => m.status === 'claimed')

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Missions"
        description={`${completed.length} ready to claim · ${active.length} in progress`}
      />

      {completed.length > 0 && (
        <Card className="border-emerald-500/40">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-2">
              <Gift className="h-4 w-4" /> {completed.length} reward{completed.length > 1 ? 's' : ''} ready to claim!
            </div>
            <div className="space-y-2">
              {completed.map((um) => {
                const mission = missions.find((m) => m.id === um.missionId)
                if (!mission) return null
                return (
                  <div key={um.id} className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{mission.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        +{formatCoins(mission.rewardCoins)} 🪙 · +{mission.rewardGems} 💎 · +{mission.rewardXp} XP
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white h-7 text-xs"
                      onClick={() => handleClaim(mission.id, mission.name)}
                    >
                      <Check className="h-3 w-3 mr-1" /> Claim
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" /> Active Missions
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {active.map((um) => {
            const mission = missions.find((m) => m.id === um.missionId)
            if (!mission) return null
            const progress = Math.min(100, (um.progress / um.target) * 100)
            return (
              <motion.div
                key={um.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-amber-600" /> {mission.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-[9px] uppercase">{mission.type}</Badge>
                    </div>
                    <CardDescription className="text-xs">{mission.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{um.progress}/{um.target}</span>
                    </div>
                    <Progress value={progress} className="h-2 mb-3" />
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Rewards:</span>
                      <Badge variant="outline" className="text-[9px] bg-amber-50 dark:bg-amber-950/30 border-amber-500/30 text-amber-700 dark:text-amber-300">
                        {formatCoins(mission.rewardCoins)} 🪙
                      </Badge>
                      {mission.rewardGems > 0 && (
                        <Badge variant="outline" className="text-[9px] bg-fuchsia-50 dark:bg-fuchsia-950/30 border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300">
                          {mission.rewardGems} 💎
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[9px]">
                        +{mission.rewardXp} XP
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {claimed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-emerald-600" /> Claimed ({claimed.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {claimed.map((um) => {
              const mission = missions.find((m) => m.id === um.missionId)
              if (!mission) return null
              return (
                <Card key={um.id} className="opacity-60">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" /> {mission.name}
                      </CardTitle>
                      <Badge className="text-[9px] bg-emerald-500 text-white">CLAIMED</Badge>
                    </div>
                    <CardDescription className="text-xs">{mission.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Use the toaster via import to keep file clean
import { useToast } from '@/hooks/use-toast'
