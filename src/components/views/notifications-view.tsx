'use client'

import { motion } from 'framer-motion'
import { Bell, BellOff, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/cards'
import { useEggForm } from '@/lib/store'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

export function NotificationsView() {
  const notifications = useEggForm((s) => s.notifications)
  const markRead = useEggForm((s) => s.markNotificationRead)
  const clearAll = useEggForm((s) => s.clearAllNotifications)

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Notifications"
        description={`${notifications.filter((n) => !n.readAt).length} unread`}
        action={
          <Button variant="outline" size="sm" onClick={clearAll}>
            <Check className="h-3 w-3 mr-1" /> Mark all read
          </Button>
        }
      />

      {notifications.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
          <BellOff className="h-10 w-10 mx-auto mb-2 opacity-30" />
          No notifications yet.
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card
                className={cn(
                  'hover:border-primary/40 transition cursor-pointer',
                  !n.readAt && 'border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/10',
                )}
                onClick={() => markRead(n.id)}
              >
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-950/40 dark:to-orange-950/30 flex items-center justify-center shrink-0">
                    <Bell className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(n.createdAt)}</div>
                  </div>
                  {!n.readAt && <div className="w-2 h-2 rounded-full bg-rose-500 mt-2" />}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
