import { useState } from 'react'
import type { WorkstationCard, WorkstationColumnId, QueueType, CardPriority } from '@/domains/workstation'
import { StatusPill } from '@/components/core/StatusPill'
import { EntityBadge } from '@/components/core/EntityBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useRouter } from '@/app/router'
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Clock,
  CaretRight,
} from '@phosphor-icons/react'

/* ─── Priority colors ──────────────────────── */
const PRIORITY_BORDER: Record<CardPriority, string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-blue-500',
  low: 'border-l-gray-500',
}

const PRIORITY_VARIANT: Record<CardPriority, 'danger' | 'warning' | 'info' | 'neutral'> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
}

const ENTITY_VARIANT: Record<string, 'lead' | 'deal' | 'household' | 'inventory' | 'approval' | 'service'> = {
  lead: 'lead',
  deal: 'deal',
  household: 'household',
  inventory_unit: 'inventory',
  approval: 'approval',
  trade_appraisal: 'deal',
  service_event: 'service',
  recon_job: 'service',
  funding_exception: 'deal',
  quote: 'deal',
}

const LINKED_ROUTE: Record<string, string> = {
  lead: '/app/records/leads/',
  deal: '/app/records/deals/',
  household: '/app/records/households/',
  inventory_unit: '/app/records/inventory/',
  approval: '/app/ops/approvals',
}

/* ─── Card Component ──────────────────────── */
export function WorkstationCardItem({
  card,
  onMoveLeft,
  onMoveRight,
  onSelect,
  canMoveLeft,
  canMoveRight,
}: {
  card: WorkstationCard
  onMoveLeft?: () => void
  onMoveRight?: () => void
  onSelect: () => void
  canMoveLeft: boolean
  canMoveRight: boolean
}) {
  const isOverdue = card.dueAt && new Date(card.dueAt) < new Date()

  return (
    <Card
      className={`border-l-4 ${PRIORITY_BORDER[card.priority]} cursor-pointer transition-all hover:ring-1 hover:ring-primary/30`}
      onClick={onSelect}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">{card.title}</p>
          {card.requiresApproval && <Shield className="h-4 w-4 text-yellow-500 flex-shrink-0" weight="fill" />}
        </div>

        {card.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <StatusPill variant={PRIORITY_VARIANT[card.priority]} dot={false}>
            {card.priority}
          </StatusPill>
          {card.linkedObjectType && (
            <EntityBadge variant={ENTITY_VARIANT[card.linkedObjectType] ?? 'lead'}>
              {card.linkedObjectType.replace(/_/g, ' ')}
            </EntityBadge>
          )}
          {card.dueAt && (
            <span className={`inline-flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
              <Clock className="h-3 w-3" />
              {new Date(card.dueAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {card.assigneeName && (
          <p className="text-xs text-muted-foreground">{card.assigneeName}</p>
        )}

        <div className="flex justify-between pt-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={!canMoveLeft} onClick={onMoveLeft}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={!canMoveRight} onClick={onMoveRight}>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Card Drawer ──────────────────────── */
export function WorkstationCardDrawer({
  card,
  open,
  onOpenChange,
  onMoveToColumn,
}: {
  card: WorkstationCard | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onMoveToColumn: (cardId: string, col: WorkstationColumnId) => void
}) {
  const { navigate } = useRouter()
  if (!card) return null

  const linkedRoute = card.linkedObjectType && LINKED_ROUTE[card.linkedObjectType]
  const canNavigate = linkedRoute && card.linkedObjectId

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-lg">{card.title}</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {card.description && <p className="text-sm text-muted-foreground">{card.description}</p>}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Priority</span>
              <div className="mt-1"><StatusPill variant={PRIORITY_VARIANT[card.priority]}>{card.priority}</StatusPill></div>
            </div>
            <div><span className="text-muted-foreground">Queue</span>
              <div className="mt-1"><Badge variant="outline">{card.queueType}</Badge></div>
            </div>
            <div><span className="text-muted-foreground">Column</span>
              <div className="mt-1 capitalize">{card.columnId.replace(/_/g, ' ')}</div>
            </div>
            {card.assigneeName && (
              <div><span className="text-muted-foreground">Assignee</span>
                <div className="mt-1">{card.assigneeName}</div>
              </div>
            )}
            {card.dueAt && (
              <div><span className="text-muted-foreground">Due</span>
                <div className="mt-1">{new Date(card.dueAt).toLocaleString()}</div>
              </div>
            )}
            {card.sourceEventName && (
              <div><span className="text-muted-foreground">Source Event</span>
                <div className="mt-1 font-mono text-xs">{card.sourceEventName}</div>
              </div>
            )}
          </div>

          {card.linkedObjectType && (
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Linked Record</p>
              <div className="flex items-center justify-between">
                <EntityBadge variant={ENTITY_VARIANT[card.linkedObjectType] ?? 'lead'}>
                  {card.linkedObjectType.replace(/_/g, ' ')}
                </EntityBadge>
                {canNavigate && (
                  <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => { navigate(linkedRoute + card.linkedObjectId); onOpenChange(false) }}>
                    View Record <CaretRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {card.linkedObjectId && <p className="font-mono text-xs text-muted-foreground">{card.linkedObjectId}</p>}
            </div>
          )}

          {card.requiresApproval && (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
              <Shield className="h-5 w-5 text-yellow-500" weight="fill" />
              <span className="text-sm font-medium">Requires approval before completion</span>
            </div>
          )}

          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
            </div>
          )}

          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground">Move to column</p>
            <div className="flex flex-wrap gap-2">
              {(['inbox', 'today', 'in_progress', 'waiting', 'done'] as WorkstationColumnId[]).map(col => (
                <Button
                  key={col}
                  variant={card.columnId === col ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs capitalize"
                  disabled={card.columnId === col}
                  onClick={() => { onMoveToColumn(card.id, col); onOpenChange(false) }}
                >
                  {col.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ─── Filters ──────────────────────── */
export function WorkstationFilters({
  queueFilter,
  priorityFilter,
  searchTerm,
  onQueueChange,
  onPriorityChange,
  onSearchChange,
}: {
  queueFilter: QueueType | 'all'
  priorityFilter: CardPriority | 'all'
  searchTerm: string
  onQueueChange: (v: QueueType | 'all') => void
  onPriorityChange: (v: CardPriority | 'all') => void
  onSearchChange: (v: string) => void
}) {
  const queues: (QueueType | 'all')[] = ['all', 'sales', 'finance', 'service', 'recon', 'bdc', 'management', 'general']
  const priorities: (CardPriority | 'all')[] = ['all', 'urgent', 'high', 'medium', 'low']

  return (
    <div className="flex flex-wrap items-center gap-3 pb-4">
      <input
        type="text"
        placeholder="Search cards…"
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        className="h-8 w-48 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <select
        value={queueFilter}
        onChange={e => onQueueChange(e.target.value as QueueType | 'all')}
        className="h-8 rounded-md border border-input bg-background px-2 text-sm capitalize"
      >
        {queues.map(q => <option key={q} value={q}>{q === 'all' ? 'All queues' : q}</option>)}
      </select>
      <select
        value={priorityFilter}
        onChange={e => onPriorityChange(e.target.value as CardPriority | 'all')}
        className="h-8 rounded-md border border-input bg-background px-2 text-sm capitalize"
      >
        {priorities.map(p => <option key={p} value={p}>{p === 'all' ? 'All priorities' : p}</option>)}
      </select>
      {(queueFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => { onQueueChange('all'); onPriorityChange('all'); onSearchChange('') }}>
          Clear
        </Button>
      )}
    </div>
  )
}

/* ─── Board ──────────────────────── */
export function WorkstationBoard({
  cards,
  columns,
  onMoveCard,
  onSelectCard,
}: {
  cards: WorkstationCard[]
  columns: { id: WorkstationColumnId; label: string }[]
  onMoveCard: (cardId: string, to: WorkstationColumnId) => void
  onSelectCard: (card: WorkstationCard) => void
}) {
  const colOrder = columns.map(c => c.id)

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
      {columns.map((col, colIdx) => {
        const colCards = cards.filter(c => c.columnId === col.id)
        return (
          <div key={col.id} className="flex w-72 flex-shrink-0 flex-col rounded-lg border border-border bg-card/50">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <Badge variant="secondary" className="text-xs">{colCards.length}</Badge>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {colCards.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No cards</p>
              ) : (
                colCards.map(card => (
                  <WorkstationCardItem
                    key={card.id}
                    card={card}
                    canMoveLeft={colIdx > 0}
                    canMoveRight={colIdx < colOrder.length - 1}
                    onMoveLeft={() => colIdx > 0 && onMoveCard(card.id, colOrder[colIdx - 1])}
                    onMoveRight={() => colIdx < colOrder.length - 1 && onMoveCard(card.id, colOrder[colIdx + 1])}
                    onSelect={() => onSelectCard(card)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Quick-Create Dialog ──────────────────────── */
export function WorkstationQuickCreate({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (card: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<CardPriority>('medium')
  const [queue, setQueue] = useState<QueueType>('general')

  if (!open) return null

  const handleCreate = () => {
    if (!title.trim()) return
    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      columnId: 'inbox',
      priority,
      queueType: queue,
      requiresApproval: false,
    })
    setTitle('')
    setDescription('')
    setPriority('medium')
    setQueue('general')
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Quick Create Card</h3>
        <div className="space-y-3">
          <input
            autoFocus
            placeholder="Card title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-3">
            <select value={priority} onChange={e => setPriority(e.target.value as CardPriority)} className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm capitalize">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select value={queue} onChange={e => setQueue(e.target.value as QueueType)} className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm capitalize">
              <option value="general">General</option>
              <option value="sales">Sales</option>
              <option value="finance">Finance</option>
              <option value="service">Service</option>
              <option value="recon">Recon</option>
              <option value="bdc">BDC</option>
              <option value="management">Management</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>Create</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
