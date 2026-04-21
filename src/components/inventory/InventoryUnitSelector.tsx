/**
 * InventoryUnitSelector
 *
 * A searchable modal picker that lets users attach an inventory unit to a deal.
 * Supports typeahead by stock number, VIN, make, model, and year.
 * Each option shows: thumbnail, year/make/model/trim, stock #, VIN last 6,
 * mileage, price, and status badge.
 */
import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusPill } from '@/components/core/StatusPill'
import { useInventoryCatalog, pickBestInventoryPhoto, type InventoryRecord } from '@/domains/inventory/inventory.runtime'
import {
  inventoryStatusVariant,
  inventoryStatusLabel,
  WARN_STATUSES,
  BLOCK_STATUSES,
} from '@/domains/inventory/inventory.status'
import { Car, MagnifyingGlass, SpinnerGap } from '@phosphor-icons/react'
import { getPremiumPlaceholderByBodyStyle } from '@/domains/inventory-photo/inventoryPhoto.placeholder'

// ── Sub-components ─────────────────────────────────────────────────────────────

function UnitThumbnail({ record }: { record: InventoryRecord }) {
  const [failed, setFailed] = useState(false)
  const photo = useMemo(() => pickBestInventoryPhoto(record), [record])
  const fallback = getPremiumPlaceholderByBodyStyle(record.bodyStyle)

  return (
    <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-muted/50 flex items-center justify-center">
      {photo && !failed ? (
        <img
          src={photo.url}
          alt={`${record.year} ${record.make} ${record.model}`}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : fallback ? (
        <img src={fallback} alt="Vehicle" className="h-full w-full object-cover opacity-60" />
      ) : (
        <Car className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export interface InventoryUnitSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (record: InventoryRecord) => void
  /** Currently attached unit id, if any */
  selectedId?: string
}

export function InventoryUnitSelector({ open, onOpenChange, onSelect, selectedId }: InventoryUnitSelectorProps) {
  const { records, loading } = useInventoryCatalog()
  const [query, setQuery] = useState('')
  const [confirmUnit, setConfirmUnit] = useState<InventoryRecord | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return records
    return records.filter((r) => {
      const vinLast6 = r.vin ? r.vin.slice(-6).toLowerCase() : ''
      return (
        r.make?.toLowerCase().includes(q) ||
        r.model?.toLowerCase().includes(q) ||
        r.trim?.toLowerCase().includes(q) ||
        String(r.year).includes(q) ||
        r.stockNumber?.toLowerCase().includes(q) ||
        r.vin?.toLowerCase().includes(q) ||
        vinLast6.includes(q)
      )
    })
  }, [records, query])

  function handleSelect(record: InventoryRecord) {
    const s = record.status.toLowerCase()
    if (BLOCK_STATUSES.has(s) || WARN_STATUSES.has(s)) {
      setConfirmUnit(record)
    } else {
      commit(record)
    }
  }

  function commit(record: InventoryRecord) {
    setConfirmUnit(null)
    onSelect(record)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { setQuery(''); onOpenChange(v) }}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <DialogHeader className="px-4 pt-4 pb-0">
            <DialogTitle>Attach Inventory Unit</DialogTitle>
            <DialogDescription>Search by year, make, model, stock #, or VIN to find and attach a vehicle.</DialogDescription>
          </DialogHeader>

          <Command shouldFilter={false} className="rounded-none border-0 shadow-none">
            <CommandInput
              placeholder="Search inventory…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-[420px]">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <SpinnerGap className="h-4 w-4 animate-spin" />
                  Loading inventory…
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <CommandEmpty>No inventory units match your search.</CommandEmpty>
              )}

              {!loading && filtered.length > 0 && (
                <CommandGroup>
                  {filtered.map((record) => {
                    const vinLast6 = record.vin ? record.vin.slice(-6) : undefined
                    const isSelected = record.id === selectedId
                    const statusStr = record.status.toLowerCase()
                    const isBlocked = BLOCK_STATUSES.has(statusStr)
                    const isWarning = WARN_STATUSES.has(statusStr)

                    return (
                      <CommandItem
                        key={record.id}
                        value={record.id}
                        onSelect={() => handleSelect(record)}
                        className="py-2 px-2 gap-3 items-start"
                        disabled={false}
                      >
                        <UnitThumbnail record={record} />

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">
                              {record.year} {record.make} {record.model} {record.trim}
                            </span>
                            {isSelected && (
                              <Badge variant="secondary" className="text-xs">Currently attached</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            {record.stockNumber && <span>Stock #{record.stockNumber}</span>}
                            {vinLast6 && <span>…{vinLast6}</span>}
                            {record.mileage != null && <span>{record.mileage.toLocaleString()} mi</span>}
                            {record.price > 0 && <span>${record.price.toLocaleString()}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <StatusPill variant={inventoryStatusVariant(record.status)} dot className="text-xs">
                              {inventoryStatusLabel(record.status)}
                            </StatusPill>
                            {isBlocked && (
                              <span className="text-xs text-destructive font-medium">Not available for new deal</span>
                            )}
                            {isWarning && (
                              <span className="text-xs text-amber-600 font-medium">Restricted status — confirm before attaching</span>
                            )}
                          </div>
                        </div>

                        {!isBlocked && (
                          <Button
                            size="sm"
                            variant={isWarning ? 'outline' : 'default'}
                            className="shrink-0 mt-1"
                            onClick={(e) => { e.stopPropagation(); handleSelect(record) }}
                            tabIndex={-1}
                          >
                            Select
                          </Button>
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>

          <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MagnifyingGlass className="h-3 w-3" />
              {filtered.length} of {records.length} units shown
            </span>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for restricted/blocked statuses */}
      <Dialog open={!!confirmUnit} onOpenChange={(v) => { if (!v) setConfirmUnit(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Attach Restricted Unit?</DialogTitle>
            <DialogDescription>
              {confirmUnit && (
                <>
                  <strong>
                    {confirmUnit.year} {confirmUnit.make} {confirmUnit.model}{confirmUnit.trim ? ` ${confirmUnit.trim}` : ''}
                  </strong>
                  {' '}has a status of{' '}
                  <StatusPill variant={inventoryStatusVariant(confirmUnit.status)} dot={false} className="inline-flex text-xs">
                    {inventoryStatusLabel(confirmUnit.status)}
                  </StatusPill>
                  {'. '}
                  {BLOCK_STATUSES.has(confirmUnit.status.toLowerCase())
                    ? 'This unit is sold, delivered, or archived. Attaching it to a deal is not recommended.'
                    : 'This unit has a restricted status. Please confirm you want to proceed.'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setConfirmUnit(null)}>Cancel</Button>
            {confirmUnit && (
              <Button
                variant={BLOCK_STATUSES.has(confirmUnit.status.toLowerCase()) ? 'destructive' : 'default'}
                onClick={() => { if (confirmUnit) commit(confirmUnit) }}
              >
                Attach Anyway
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
