import { useState, useEffect } from 'react'
import { Bell, CheckCircle, Warning, Info, ArrowRight } from '@phosphor-icons/react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/core/StatusPill'
import { MOCK_EVENTS, type MockEvent } from '@/lib/mockData'

interface NotificationItem {
  id: string
  title: string
  description: string
  timestamp: string
  severity: 'info' | 'warning' | 'success'
  read: boolean
}

function eventToNotification(event: MockEvent): NotificationItem {
  const name = event.eventName.replace(/_/g, ' ')
  const isWarning = ['appointment_no_show', 'funding_missing_item', 'lender_declined', 'integration_sync_failed', 'unit_hit_aging_threshold'].includes(event.eventName)
  const isSuccess = ['deal_funded', 'approval_granted', 'vehicle_delivered', 'deal_signed'].includes(event.eventName)

  return {
    id: event.id,
    title: name.charAt(0).toUpperCase() + name.slice(1),
    description: `${event.actorType} action on ${event.entityType ?? 'system'}${event.entityId ? ` (${event.entityId})` : ''}`,
    timestamp: event.timestamp,
    severity: isWarning ? 'warning' : isSuccess ? 'success' : 'info',
    read: false,
  }
}

interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    MOCK_EVENTS.map(eventToNotification)
  )

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const SeverityIcon = ({ severity }: { severity: NotificationItem['severity'] }) => {
    if (severity === 'warning') return <Warning className="h-4 w-4 text-yellow-500" />
    if (severity === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />
    return <Info className="h-4 w-4 text-blue-500" />
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell />
              Notifications
              {unreadCount > 0 && (
                <StatusPill variant="danger" dot={false}>{unreadCount}</StatusPill>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
                Mark all read
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  n.read ? 'border-border bg-background' : 'border-primary/20 bg-primary/5'
                }`}
              >
                <SeverityIcon severity={n.severity} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-muted-foreground' : 'font-medium'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
