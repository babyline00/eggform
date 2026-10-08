'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LifeBuoy, Send, MessageSquare, Clock, CheckCircle2, Plus, ChevronRight, X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SectionHeader, EmptyState } from '@/components/cards'
import { useToast } from '@/hooks/use-toast'
import { useEggForm } from '@/lib/store'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Ticket {
  id: string
  subject: string
  category: string
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: number
  updatedAt: number
  messages: { id: string; author: 'user' | 'admin'; text: string; createdAt: number }[]
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Deposit not credited',
    category: 'wallet',
    status: 'in_progress',
    priority: 'high',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 60 * 1000,
    messages: [
      { id: 'm1', author: 'user', text: 'Hi, I made a deposit of Rs 5,000 about an hour ago but it has not been credited to my wallet yet.', createdAt: Date.now() - 2 * 60 * 60 * 1000 },
      { id: 'm2', author: 'admin', text: 'Hello! I can help you with that. Can you please share the deposit reference number (DEP-XXXX)?', createdAt: Date.now() - 90 * 60 * 1000 },
      { id: 'm3', author: 'user', text: 'Sure, the reference is DEP-102938.', createdAt: Date.now() - 80 * 60 * 1000 },
      { id: 'm4', author: 'admin', text: 'Thanks. I can see the deposit was received but the webhook verification is pending. I have escalated this to our finance team. You should see the credit within 15 minutes.', createdAt: Date.now() - 30 * 60 * 1000 },
    ],
  },
  {
    id: 'TKT-002',
    subject: 'Cannot hatch Golden Egg',
    category: 'game',
    status: 'resolved',
    priority: 'normal',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    messages: [
      { id: 'm1', author: 'user', text: 'My Golden Egg shows 100% but I cannot click hatch.', createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
      { id: 'm2', author: 'admin', text: 'Please try refreshing the page. The Hatch button should appear when formation is 100% complete.', createdAt: Date.now() - 2.9 * 24 * 60 * 60 * 1000 },
      { id: 'm3', author: 'user', text: 'That worked, thanks!', createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    ],
  },
]

const CATEGORIES = [
  { value: 'wallet', label: '💰 PKR Wallet' },
  { value: 'payment', label: '🏦 Payment Issue' },
  { value: 'game', label: '🎮 Game Bug' },
  { value: 'account', label: '👤 Account' },
  { value: 'marketplace', label: '🛒 Marketplace' },
  { value: 'kyc', label: '🪪 KYC Verification' },
  { value: 'other', label: '📦 Other' },
]

export function SupportView() {
  const [tickets, setTickets] = React.useState<Ticket[]>(INITIAL_TICKETS)
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null)
  const [newTicketOpen, setNewTicketOpen] = React.useState(false)
  const [newTicket, setNewTicket] = React.useState({
    subject: '',
    category: 'wallet',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    message: '',
  })
  const [reply, setReply] = React.useState('')
  const { toast } = useToast()
  const user = useEggForm((s) => s.currentUser)

  React.useEffect(() => {
    if (selectedTicket) {
      // Sync selected ticket with latest from list
      const updated = tickets.find((t) => t.id === selectedTicket.id)
      if (updated && updated !== selectedTicket) {
        setSelectedTicket(updated)
      }
    }
  }, [tickets, selectedTicket])

  function handleCreateTicket() {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast({ title: 'Please fill all fields', variant: 'destructive' })
      return
    }
    const ticket: Ticket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: newTicket.subject,
      category: newTicket.category,
      status: 'open',
      priority: newTicket.priority,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        { id: 'm1', author: 'user', text: newTicket.message, createdAt: Date.now() },
      ],
    }
    setTickets([ticket, ...tickets])
    setNewTicketOpen(false)
    setNewTicket({ subject: '', category: 'wallet', priority: 'normal', message: '' })
    toast({ title: 'Ticket created', description: 'Our support team will respond within 24 hours.' })
  }

  function handleSendReply() {
    if (!reply.trim() || !selectedTicket) return
    const newMessage = {
      id: `m-${Date.now()}`,
      author: 'user' as const,
      text: reply,
      createdAt: Date.now(),
    }
    const updatedTickets = tickets.map((t) =>
      t.id === selectedTicket.id
        ? { ...t, messages: [...t.messages, newMessage], updatedAt: Date.now(), status: 'pending' as const }
        : t,
    )
    setTickets(updatedTickets)
    setReply('')

    // Simulate admin reply after 2s
    setTimeout(() => {
      const adminReply = {
        id: `m-${Date.now() + 1}`,
        author: 'admin' as const,
        text: 'Thanks for your message. Our team is looking into this and will respond shortly.',
        createdAt: Date.now(),
      }
      setTickets((prev) => prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, messages: [...t.messages, adminReply], updatedAt: Date.now(), status: 'in_progress' as const }
          : t,
      ))
    }, 2000)
  }

  const statusColors: Record<string, string> = {
    open: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border-sky-400/40',
    pending: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-400/40',
    in_progress: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-400/40',
    resolved: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-400/40',
    closed: 'bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-400/40',
  }

  const priorityColors: Record<string, string> = {
    low: 'text-slate-600',
    normal: 'text-sky-600',
    high: 'text-amber-600',
    urgent: 'text-rose-600',
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Support"
        description="Get help with your account, payments, or game issues."
        action={
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press" onClick={() => setNewTicketOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Ticket
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Tickets list */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold">Your Tickets ({tickets.length})</h3>
          {tickets.length === 0 ? (
            <Card><CardContent className="p-6">
              <EmptyState
                emoji="🎫"
                title="No tickets yet"
                description="Need help? Create a ticket and our team will assist you."
                actionLabel="Create Ticket"
                onAction={() => setNewTicketOpen(true)}
              />
            </CardContent></Card>
          ) : (
            tickets.map((ticket) => (
              <motion.button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  'w-full text-left rounded-xl border bg-card p-3 transition',
                  selectedTicket?.id === ticket.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40',
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground">{ticket.id}</span>
                  <Badge variant="outline" className={cn('text-[9px] capitalize', statusColors[ticket.status])}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="font-medium text-sm truncate">{ticket.subject}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">{CATEGORIES.find((c) => c.value === ticket.category)?.label}</span>
                  <span className={cn('text-[10px] font-medium capitalize', priorityColors[ticket.priority])}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Updated {formatRelativeTime(ticket.updatedAt)}
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Ticket detail / conversation */}
        <div className="lg:col-span-2">
          {!selectedTicket ? (
            <Card>
              <CardContent className="p-12">
                <EmptyState
                  icon={MessageSquare}
                  emoji="💬"
                  title="Select a ticket"
                  description="Choose a ticket from the left to view the conversation, or create a new one."
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="flex flex-col h-[600px]">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{selectedTicket.subject}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {selectedTicket.id} · {CATEGORIES.find((c) => c.value === selectedTicket.category)?.label} · Created {formatRelativeTime(selectedTicket.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={cn('text-[9px] capitalize shrink-0', statusColors[selectedTicket.status])}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {selectedTicket.messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex gap-2',
                        msg.author === 'user' ? 'flex-row-reverse' : '',
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={cn(
                          'text-xs',
                          msg.author === 'user'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white',
                        )}>
                          {msg.author === 'user' ? (user?.fullName?.charAt(0) || 'U') : 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        'rounded-2xl px-3 py-2 max-w-[75%]',
                        msg.author === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary',
                      )}>
                        <p className="text-sm">{msg.text}</p>
                        <div className={cn(
                          'text-[9px] mt-1',
                          msg.author === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground',
                        )}>
                          {msg.author === 'user' ? 'You' : 'Support Agent'} · {formatRelativeTime(msg.createdAt)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {selectedTicket.status !== 'closed' && (
                <div className="p-3 border-t flex gap-2">
                  <Input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    className="flex-1 h-9"
                  />
                  <Button
                    size="icon"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press h-9 w-9"
                    onClick={handleSendReply}
                    disabled={!reply.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* New ticket dialog */}
      <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" /> Create Support Ticket
            </DialogTitle>
            <DialogDescription>
              Tell us what's happening. Our team responds within 24 hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="subject" className="text-xs">Subject *</Label>
              <Input
                id="subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Brief summary of your issue"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) => setNewTicket({ ...newTicket, priority: v as 'low' | 'normal' | 'high' | 'urgent' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-xs">Message *</Label>
              <Textarea
                id="message"
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                placeholder="Describe your issue in detail. Include any reference numbers (e.g., DEP-XXXX) if applicable."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-400/30 text-xs text-sky-800 dark:text-sky-200">
              💡 For urgent payment issues, also email urgent@eggform.pk for faster response.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTicketOpen(false)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press"
              onClick={handleCreateTicket}
            >
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
