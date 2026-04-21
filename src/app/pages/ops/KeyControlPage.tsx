/**
 * Key Control Page — operational key custody board.
 *
 * Route: /app/ops/key-control
 *
 * Shows:
 * - At-a-glance board of all units with checked-out or lost keys
 * - Ability to check out, check in, transfer, or report lost/found keys
 * - Full event history per unit
 * - Alert for keys out > 60 minutes
 */

import { useState, useMemo } from 'react'
import {
  Key,
  ArrowUp,
  ArrowDown,
  ArrowsLeftRight,
  Warning,
  CheckCircle,
  Clock,
  Plus,
  CaretDown,
  CaretUp,
  Car,
  X,
} from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionHeader } from '@/components/core/SectionHeader'
import { cn } from '@/lib/utils'
import { useKeyCustodyRuntime } from '@/domains/key-custody/keyCustody.runtime'
import {
  KEY_EVENT_LABELS,
  KEY_CHECKOUT_REASON_LABELS,
  type KeyCustodyStatus,
  type KeyCheckoutReason,
} from '@/domains/key-custody/keyCustody.types'

// ── Checkout dialog state ─────────────────────────────────────────────────────

type DialogMode = 'checkout' | 'checkin' | 'transfer' | 'lost' | 'found' | null

interface DialogState {
  mode: DialogMode
  unitKey?: string
  stockNumber?: string
  vehicleTitle?: string
  inventoryUnitId?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function minutesLabel(minutes?: number): string {
  if (minutes == null) return ''
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

// ── Unit status card ──────────────────────────────────────────────────────────

function UnitKeyCard({
  status,
  onAction,
}: {
  status: KeyCustodyStatus
  onAction: (mode: DialogMode, status: KeyCustodyStatus) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isOverdue = status.isCheckedOut && (status.minutesOut ?? 0) > 60
  const label = status.vehicleTitle ?? status.stockNumber ?? 'Unknown Unit'

  return (
    <Card className={cn(
      'transition-colors',
      status.isLost && 'border-destructive/60 bg-destructive/5',
      isOverdue && !status.isLost && 'border-yellow-500/60 bg-yellow-500/5',
    )}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Car className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-semibold text-sm truncate">{label}</span>
              {status.stockNumber && status.vehicleTitle && (
                <span className="text-xs text-muted-foreground">#{status.stockNumber}</span>
              )}
            </div>

            {status.isLost ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Warning className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-medium text-destructive">Keys reported lost</span>
              </div>
            ) : status.isCheckedOut ? (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <ArrowUp className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs text-muted-foreground">
                  Out with <span className="font-medium text-foreground">{status.currentHolder}</span>
                  {status.currentReason && (
                    <> · {KEY_CHECKOUT_REASON_LABELS[status.currentReason]}</>
                  )}
                </span>
                {status.minutesOut != null && (
                  <Badge
                    variant={isOverdue ? 'destructive' : 'secondary'}
                    className="text-xs gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {minutesLabel(status.minutesOut)}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs text-muted-foreground">Keys on board</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {status.isLost ? (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction('found', status)}>
                <CheckCircle className="h-3.5 w-3.5" /> Found
              </Button>
            ) : status.isCheckedOut ? (
              <>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction('checkin', status)}>
                  <ArrowDown className="h-3.5 w-3.5" /> Return
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => onAction('transfer', status)}>
                  <ArrowsLeftRight className="h-3.5 w-3.5" /> Transfer
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction('checkout', status)}>
                  <ArrowUp className="h-3.5 w-3.5" /> Check Out
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => onAction('lost', status)}>
                  <Warning className="h-3.5 w-3.5" /> Lost
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? <CaretUp className="h-3.5 w-3.5" /> : <CaretDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Expanded event history */}
        {expanded && status.events.length > 0 && (
          <div className="mt-3 border-t border-border pt-3 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Event History</p>
            {status.events.slice(0, 10).map(e => (
              <div key={e.id} className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground shrink-0 mt-0.5">{formatTimestamp(e.timestamp)}</span>
                <span className="font-medium">{KEY_EVENT_LABELS[e.eventType]}</span>
                {(e.checkedOutTo ?? e.checkedInBy) && (
                  <span className="text-muted-foreground">
                    {e.checkedOutTo ? `→ ${e.checkedOutTo}` : `← ${e.checkedInBy}`}
                  </span>
                )}
                {e.notes && <span className="text-muted-foreground italic">{e.notes}</span>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── New unit dialog ───────────────────────────────────────────────────────────

function AddUnitDialog({ onAdd }: { onAdd: (stockNumber: string, vehicleTitle: string) => void }) {
  const [open, setOpen] = useState(false)
  const [stock, setStock] = useState('')
  const [title, setTitle] = useState('')

  function handleSubmit() {
    if (!stock.trim()) return
    onAdd(stock.trim(), title.trim())
    setStock('')
    setTitle('')
    setOpen(false)
  }

  return (
    <>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" /> Add Vehicle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Vehicle to Key Board</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Stock Number *</Label>
              <Input value={stock} onChange={e => setStock(e.target.value)} placeholder="e.g. A1234" />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 2023 Ford F-150 XLT" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!stock.trim()}>Add to Board</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Action dialog ─────────────────────────────────────────────────────────────

function ActionDialog({
  state,
  onClose,
  onSubmit,
}: {
  state: DialogState & { mode: NonNullable<DialogMode> }
  onClose: () => void
  onSubmit: (data: Record<string, string>) => void
}) {
  const [person, setPerson] = useState('')
  const [reason, setReason] = useState<KeyCheckoutReason>('other')
  const [notes, setNotes] = useState('')

  const titles: Record<NonNullable<DialogMode>, string> = {
    checkout: 'Check Out Keys',
    checkin: 'Return Keys',
    transfer: 'Transfer Keys',
    lost: 'Report Keys Lost',
    found: 'Report Keys Found',
  }

  const needsPerson =
    state.mode === 'checkout' || state.mode === 'checkin' || state.mode === 'transfer' || state.mode === 'found'
  const personLabel =
    state.mode === 'checkout' || state.mode === 'transfer' ? 'Checked Out To' :
    state.mode === 'checkin' ? 'Returned By' : 'Found By'

  function handleSubmit() {
    onSubmit({ person, reason, notes })
    setPerson('')
    setReason('other')
    setNotes('')
  }

  const vehicleLabel = state.vehicleTitle ?? (state.stockNumber ? `Stock #${state.stockNumber}` : 'Vehicle')

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {titles[state.mode]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">{vehicleLabel}</p>

          {needsPerson && (
            <div className="space-y-1.5">
              <Label>{personLabel} *</Label>
              <Input
                value={person}
                onChange={e => setPerson(e.target.value)}
                placeholder="Name"
                autoFocus
              />
            </div>
          )}

          {state.mode === 'checkout' && (
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as KeyCheckoutReason)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KEY_CHECKOUT_REASON_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes…"
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={needsPerson && !person.trim()}
            variant={state.mode === 'lost' ? 'destructive' : 'default'}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function KeyControlPage() {
  const { statuses, events, checkOut, checkIn, transfer, reportLost, reportFound } = useKeyCustodyRuntime()
  const [dialogState, setDialogState] = useState<DialogState>({ mode: null })
  const [search, setSearch] = useState('')

  // Derived counts
  const checkedOutCount = statuses.filter(s => s.isCheckedOut).length
  const lostCount = statuses.filter(s => s.isLost).length
  const overdueCount = statuses.filter(s => s.isCheckedOut && (s.minutesOut ?? 0) > 60).length
  const onBoardCount = statuses.filter(s => !s.isCheckedOut && !s.isLost).length

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return statuses
    return statuses.filter(s =>
      s.vehicleTitle?.toLowerCase().includes(q) ||
      s.stockNumber?.toLowerCase().includes(q) ||
      s.currentHolder?.toLowerCase().includes(q)
    )
  }, [statuses, search])

  function openAction(mode: DialogMode, s: KeyCustodyStatus) {
    setDialogState({
      mode,
      unitKey: s.inventoryUnitId ?? s.stockNumber,
      stockNumber: s.stockNumber,
      vehicleTitle: s.vehicleTitle,
      inventoryUnitId: s.inventoryUnitId,
    })
  }

  function handleAddVehicle(stockNumber: string, vehicleTitle: string) {
    // Seed an initial "on board" check-in event so the unit appears
    checkIn({
      stockNumber,
      vehicleTitle,
      checkedInBy: 'Initial Entry',
      notes: 'Added to key board',
    })
  }

  function handleDialogSubmit(data: Record<string, string>) {
    if (!dialogState.mode) return
    const base = {
      inventoryUnitId: dialogState.inventoryUnitId,
      stockNumber: dialogState.stockNumber,
      vehicleTitle: dialogState.vehicleTitle,
    }
    switch (dialogState.mode) {
      case 'checkout':
        checkOut({ ...base, checkedOutTo: data.person, checkoutReason: data.reason as KeyCheckoutReason, notes: data.notes || undefined })
        break
      case 'checkin':
        checkIn({ ...base, checkedInBy: data.person, notes: data.notes || undefined })
        break
      case 'transfer':
        transfer({ ...base, transferredTo: data.person, notes: data.notes || undefined })
        break
      case 'lost':
        reportLost({ ...base, notes: data.notes || undefined })
        break
      case 'found':
        reportFound({ ...base, foundBy: data.person, notes: data.notes || undefined })
        break
    }
    setDialogState({ mode: null })
  }

  return (
    <div className="ods-page ods-flow-lg">
      <SectionHeader
        title="Key Control"
        description="Track physical key custody for all inventory units"
      />

      {/* Summary tiles */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">On Board</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{onBoardCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Checked Out</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{checkedOutCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card className={overdueCount > 0 ? 'border-yellow-500/60' : ''}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Overdue (&gt;60 min)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className={cn('h-5 w-5', overdueCount > 0 ? 'text-yellow-500' : 'text-muted-foreground')} />
              <span className={cn('text-2xl font-bold', overdueCount > 0 && 'text-yellow-600')}>{overdueCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card className={lostCount > 0 ? 'border-destructive/60' : ''}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Lost</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Warning className={cn('h-5 w-5', lostCount > 0 ? 'text-destructive' : 'text-muted-foreground')} />
              <span className={cn('text-2xl font-bold', lostCount > 0 && 'text-destructive')}>{lostCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="board">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="board">Key Board</TabsTrigger>
            <TabsTrigger value="log">Event Log</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search vehicle, stock #, holder…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 w-56 text-sm"
            />
            {search && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSearch('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <AddUnitDialog onAdd={handleAddVehicle} />
          </div>
        </div>

        <TabsContent value="board" className="mt-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Key className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No vehicles on key board</p>
              <p className="text-sm mt-1">Add vehicles to start tracking key custody.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(s => (
                <UnitKeyCard
                  key={s.inventoryUnitId ?? s.stockNumber ?? s.vehicleTitle}
                  status={s}
                  onAction={openAction}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No key events recorded yet.</p>
          ) : (
            <div className="space-y-1">
              {events
                .slice()
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map(e => (
                  <div key={e.id} className="flex items-start gap-4 rounded-md border border-border p-3 text-sm">
                    <span className="shrink-0 text-muted-foreground text-xs mt-0.5 w-32">
                      {formatTimestamp(e.timestamp)}
                    </span>
                    <Badge
                      variant={
                        e.eventType === 'lost' ? 'destructive' :
                        e.eventType === 'checked_out' || e.eventType === 'transferred' ? 'secondary' :
                        'default'
                      }
                      className="shrink-0 text-xs"
                    >
                      {KEY_EVENT_LABELS[e.eventType]}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{e.vehicleTitle ?? e.stockNumber ?? '—'}</span>
                      {e.checkedOutTo && <span className="text-muted-foreground ml-2">→ {e.checkedOutTo}</span>}
                      {e.checkedInBy && <span className="text-muted-foreground ml-2">← {e.checkedInBy}</span>}
                      {e.notes && <span className="text-muted-foreground ml-2 italic">{e.notes}</span>}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action dialog */}
      {dialogState.mode && (
        <ActionDialog
          state={dialogState as DialogState & { mode: NonNullable<DialogMode> }}
          onClose={() => setDialogState({ mode: null })}
          onSubmit={handleDialogSubmit}
        />
      )}
    </div>
  )
}
