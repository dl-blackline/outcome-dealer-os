/**
 * LinkedInventoryUnitCard
 *
 * Displays the attached inventory unit summary on a deal record page.
 * Shows: thumbnail, year/make/model, stock #, VIN last 6, mileage, status,
 * with actions: Change Unit, Remove Unit, View Inventory Record.
 */
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/core/StatusPill'
import { Badge } from '@/components/ui/badge'
import { useInventoryRecord, pickBestInventoryPhoto, type InventoryRecord } from '@/domains/inventory/inventory.runtime'
import {
  inventoryStatusVariant,
  inventoryStatusLabel,
} from '@/domains/inventory/inventory.status'
import type { DealInventorySnapshot } from '@/lib/mockData'
import { Car, ArrowSquareOut, PencilSimple, X } from '@phosphor-icons/react'
import { getPremiumPlaceholderByBodyStyle } from '@/domains/inventory-photo/inventoryPhoto.placeholder'
import { useRouter } from '@/app/router'

// ── Thumbnail ────────────────────────────────────────────────────────────────

function UnitThumbnail({ record, snapshot }: { record: InventoryRecord | null; snapshot?: DealInventorySnapshot }) {
  const [failed, setFailed] = useState(false)

  const { src, fallback } = useMemo(() => {
    const bodyStyle = record?.bodyStyle
    if (record) {
      const photo = pickBestInventoryPhoto(record)
      return { src: photo.url, fallback: getPremiumPlaceholderByBodyStyle(bodyStyle) }
    }
    if (snapshot?.primaryImageUrl) {
      return { src: snapshot.primaryImageUrl, fallback: getPremiumPlaceholderByBodyStyle() }
    }
    return { src: undefined, fallback: getPremiumPlaceholderByBodyStyle() }
  }, [record, snapshot])

  return (
    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted/50 flex items-center justify-center">
      {src && !failed ? (
        <img
          src={src}
          alt="Linked vehicle"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : fallback ? (
        <img src={fallback} alt="Vehicle" className="h-full w-full object-cover opacity-60" />
      ) : (
        <Car className="h-8 w-8 text-muted-foreground" />
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export interface LinkedInventoryUnitCardProps {
  inventoryUnitId: string
  snapshot?: DealInventorySnapshot
  onChangeUnit: () => void
  onRemoveUnit: () => void
}

export function LinkedInventoryUnitCard({
  inventoryUnitId,
  snapshot,
  onChangeUnit,
  onRemoveUnit,
}: LinkedInventoryUnitCardProps) {
  const { navigate } = useRouter()
  const { record, loading } = useInventoryRecord(inventoryUnitId)

  // Use live record when available, fall back to snapshot for display
  const displayYear = record?.year ?? snapshot?.year
  const displayMake = record?.make ?? snapshot?.make
  const displayModel = record?.model ?? snapshot?.model
  const displayTrim = record?.trim ?? snapshot?.trim
  const displayStock = record?.stockNumber ?? snapshot?.stockNumber
  const displayVin = record?.vin ?? snapshot?.vin
  const displayVinLast6 = displayVin ? displayVin.slice(-6) : snapshot?.vinLast6
  const displayMileage = record?.mileage ?? snapshot?.mileage
  const displayPrice = record?.price ?? snapshot?.askingPrice
  const displayStatus = record?.status ?? snapshot?.unitStatus

  const title = [displayYear, displayMake, displayModel, displayTrim].filter(Boolean).join(' ')

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">Linked Inventory Unit</span>
          {!loading && !record && (
            <Badge variant="outline" className="text-xs font-normal text-amber-600 border-amber-300">
              Record unavailable
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3">
          <UnitThumbnail record={record} snapshot={snapshot} />

          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-medium leading-snug">
              {title || 'Unknown Vehicle'}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {displayStock && <span>Stock #{displayStock}</span>}
              {displayVinLast6 && <span>VIN …{displayVinLast6}</span>}
              {displayMileage != null && <span>{displayMileage.toLocaleString()} mi</span>}
              {displayPrice != null && displayPrice > 0 && <span>${displayPrice.toLocaleString()}</span>}
            </div>
            {displayStatus && (
              <StatusPill variant={inventoryStatusVariant(displayStatus)} className="text-xs mt-0.5">
                {inventoryStatusLabel(displayStatus)}
              </StatusPill>
            )}
          </div>
        </div>

        {snapshot && (
          <p className="text-xs text-muted-foreground">
            Vehicle info snapshotted at time of attachment. Live inventory may have changed.
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => navigate(`/app/records/inventory/${inventoryUnitId}`)}
          >
            <ArrowSquareOut className="h-3.5 w-3.5" />
            View Inventory Record
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onChangeUnit}>
            <PencilSimple className="h-3.5 w-3.5" />
            Change Unit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs text-destructive hover:text-destructive"
            onClick={onRemoveUnit}
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
