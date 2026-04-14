import { useRouter } from '@/app/router'
import { useCustomerProgress } from '@/domains/buyer-hub/useCustomerProgress'
import type { CustomerProgressItem, CustomerVisibleStatus } from '@/domains/buyer-hub/buyerHub.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  ChatCircle,
  CalendarPlus,
  CurrencyDollar,
  Car,
  Scales,
  Trash,
} from '@phosphor-icons/react'

const STATUS_LABELS: Record<CustomerVisibleStatus, { label: string; color: string }> = {
  inquiry_received: { label: 'Received', color: 'bg-blue-100 text-blue-800' },
  awaiting_contact: { label: 'Awaiting Contact', color: 'bg-amber-100 text-amber-800' },
  appointment_scheduled: { label: 'Pending Confirmation', color: 'bg-amber-100 text-amber-800' },
  appointment_confirmed: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-800' },
  application_started: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  application_submitted: { label: 'Under Review', color: 'bg-violet-100 text-violet-800' },
  application_under_review: { label: 'Under Review', color: 'bg-violet-100 text-violet-800' },
  trade_info_received: { label: 'Info Received', color: 'bg-blue-100 text-blue-800' },
  next_step_available: { label: 'Action Required', color: 'bg-emerald-100 text-emerald-800' },
}

const TYPE_ICONS: Record<CustomerProgressItem['type'], typeof ChatCircle> = {
  inquiry: ChatCircle,
  appointment: CalendarPlus,
  application: CurrencyDollar,
  trade_in: Scales,
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function ProgressCard({
  item,
  onRemove,
}: {
  item: CustomerProgressItem
  onRemove: () => void
}) {
  const Icon = TYPE_ICONS[item.type]
  const statusInfo = STATUS_LABELS[item.status]

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Icon size={20} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
                <span className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            {item.nextAction && (
              <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs">
                <Clock size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{item.nextAction}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash size={12} />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const QUICK_ACTIONS = [
  { label: 'Browse Inventory', path: '/shop', icon: Car },
  { label: 'Schedule Visit', path: '/schedule', icon: CalendarPlus },
  { label: 'Apply for Financing', path: '/finance/apply', icon: CurrencyDollar },
  { label: 'Value My Trade', path: '/trade', icon: Scales },
]

export function NextStepsPage() {
  const { navigate } = useRouter()
  const { items, removeItem, clearAll } = useCustomerProgress()

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Next Steps</h1>
          <p className="mt-1 text-muted-foreground">
            Track your inquiries, applications, and appointments in one place.
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="gap-1.5 text-muted-foreground"
          >
            <Trash size={14} />
            Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <CheckCircle size={48} weight="thin" className="mb-4 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold">Nothing here yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              When you submit an inquiry, application, trade-in, or appointment request,
              it will appear here so you can track its status.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Get Started
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                    <ArrowRight size={16} className="ml-auto text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ProgressCard
              key={item.id}
              item={item}
              onRemove={() => removeItem(item.id)}
            />
          ))}

          <Separator />

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Call us at (555) 000-0000 or{' '}
              <button
                className="underline underline-offset-4 hover:text-foreground"
                onClick={() => navigate('/schedule')}
              >
                schedule a visit
              </button>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
