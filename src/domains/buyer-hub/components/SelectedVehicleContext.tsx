/**
 * Selected Vehicle Context Component
 * Displays a compact summary of the selected vehicle in the buyer hub
 * Can be reused across Inquiry, Schedule, Finance, and Trade pages
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { InventoryRecord } from '@/domains/inventory/inventory.runtime'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
import { formatPrice, formatMileage, formatVehicleTitle } from '../helpers/selectedVehicleContext'

interface Props {
  unit: InventoryRecord | null
  label?: string
  showPrice?: boolean
  className?: string
}

export function SelectedVehicleContext({ unit, label = 'Selected Vehicle', showPrice = true, className = '' }: Props) {
  if (!unit) return null

  return (
    <Card className={`vault-panel-soft border-white/15 overflow-hidden rounded-xl ${className}`}>
      <CardContent className="flex gap-4 p-5">
        {/* Vehicle Image */}
        <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-900">
          <InventoryPhotoImage
            record={unit}
            alt={formatVehicleTitle(unit)}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Vehicle Info */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{label}</p>
            <h3 className="mt-1 text-sm font-semibold text-white">{formatVehicleTitle(unit)}</h3>

            {/* VIN / Stock */}
            <div className="mt-2 flex flex-wrap gap-2">
              {unit.stockNumber && (
                <Badge variant="secondary" className="text-xs text-slate-300">
                  Stock {unit.stockNumber}
                </Badge>
              )}
              {unit.vin && (
                <Badge variant="secondary" className="text-xs text-slate-300">
                  VIN: {unit.vin.slice(-4)}
                </Badge>
              )}
            </div>
          </div>

          {/* Price & Mileage */}
          <div className="flex items-center gap-4 text-xs text-slate-300">
            {showPrice && <span className="font-medium text-blue-200">{formatPrice(unit.price)}</span>}
            <span>{formatMileage(unit.mileage)} mi</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
