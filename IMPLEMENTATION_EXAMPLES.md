# National Car Mart Inventory: Usage Examples

## Example 1: Displaying All Vehicles (Shop Page)

```tsx
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { InventoryCard } from '@/components/inventory/InventoryCard'

export function ShopPage() {
  const publicRecords = useInventoryCatalog()
  
  return (
    <div className="grid gap-4">
      {publicRecords.map(vehicle => (
        <InventoryCard
          key={vehicle.id}
          unit={vehicle}
          imageUrl={vehicle.imageUrl || '/inventory/national-car-mart/placeholder.jpg'}
        />
      ))}
    </div>
  )
}
```

## Example 2: Loading a Specific Vehicle (Detail Page)

```tsx
import { useInventoryRecord } from '@/domains/inventory/inventory.runtime'
import { useRouter } from '@/app/router'
import { setSelectedUnit } from '@/domains/buyer-hub/helpers/selectedVehicleContext'

export function VehicleDetailPage() {
  const { params } = useRouter()
  const vehicle = useInventoryRecord(params.unitId)
  
  React.useEffect(() => {
    if (params.unitId) {
      setSelectedUnit(params.unitId, 'shop')
    }
  }, [params.unitId])
  
  if (!vehicle) return <div>Vehicle not found</div>
  
  return (
    <div>
      <img 
        src={vehicle.imageUrl || '/inventory/national-car-mart/placeholder.jpg'}
        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      />
      <h1>{vehicle.year} {vehicle.make} {vehicle.model}</h1>
      <p>Stock: {vehicle.stockNumber}</p>
      <p>VIN: {vehicle.vin}</p>
      <p>${vehicle.askingPrice.toLocaleString()}</p>
    </div>
  )
}
```

## Example 3: Cross-Page Context (Inquiry Page)

```tsx
import { getSelectedUnitId } from '@/domains/buyer-hub/helpers/selectedVehicleContext'
import { useInventoryRecord } from '@/domains/inventory/inventory.runtime'
import { SelectedVehicleContext } from '@/domains/buyer-hub/components/SelectedVehicleContext'

export function InquiryPage() {
  const selectedUnitId = getSelectedUnitId()
  const selectedUnit = useInventoryRecord(selectedUnitId)
  
  return (
    <div>
      {selectedUnit && (
        <SelectedVehicleContext
          unit={selectedUnit}
          label="Selected Vehicle"
          showPrice={true}
          className="mb-6 p-4 bg-gray-50 rounded"
        />
      )}
      
      <form className="space-y-4">
        <input type="email" placeholder="Your email..." />
        <textarea placeholder="Your inquiry..." />
        <button>Submit Inquiry</button>
      </form>
    </div>
  )
}
```

## Example 4: Selected Vehicle Context (Finance/Apply Page)

```tsx
import { getSelectedUnitId } from '@/domains/buyer-hub/helpers/selectedVehicleContext'
import { useInventoryRecord } from '@/domains/inventory/inventory.runtime'
import { SelectedVehicleContext } from '@/domains/buyer-hub/components/SelectedVehicleContext'

export function QuickAppPage() {
  const selectedUnitId = getSelectedUnitId()
  const selectedUnit = useInventoryRecord(selectedUnitId)
  
  return (
    <div>
      <h1>Get Pre-Qualified</h1>
      
      {selectedUnit && (
        <SelectedVehicleContext
          unit={selectedUnit}
          label="Applying on:"
          showPrice={true}
          className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200"
        />
      )}
      
      <form className="space-y-4">
        {/* Finance form fields */}
      </form>
    </div>
  )
}
```

## Example 5: Trade-In Page with Context

```tsx
import { getSelectedUnitId } from '@/domains/buyer-hub/helpers/selectedVehicleContext'
import { useInventoryRecord } from '@/domains/inventory/inventory.runtime'
import { SelectedVehicleContext } from '@/domains/buyer-hub/components/SelectedVehicleContext'

export function TradeInPage() {
  const selectedUnitId = getSelectedUnitId()
  const selectedUnit = useInventoryRecord(selectedUnitId)
  
  return (
    <div className="space-y-8">
      {selectedUnit && (
        <div>
          <h2 className="text-lg font-bold mb-4">Trading toward:</h2>
          <SelectedVehicleContext
            unit={selectedUnit}
            showPrice={true}
            className="p-4 bg-green-50 rounded-lg"
          />
        </div>
      )}
      
      <div>
        <h2 className="text-lg font-bold mb-4">Your trade-in vehicle:</h2>
        <form className="space-y-4">
          <input type="text" placeholder="Vehicle year..." />
          <input type="text" placeholder="Vehicle make..." />
          <input type="text" placeholder="Vehicle model..." />
          {/* More fields */}
        </form>
      </div>
    </div>
  )
}
```

## Example 6: Accessing Inventory Helpers

```tsx
import {
  setSelectedUnit,
  getSelectedUnitId,
  getSelectedUnitJourney,
  formatVehicleTitle,
  formatPrice,
  formatMileage,
} from '@/domains/buyer-hub/helpers/selectedVehicleContext'

// Track when user selects a vehicle
function handleSelectVehicle(vehicleId: string) {
  setSelectedUnit(vehicleId, 'shop')  // Can pass entry point: 'shop', 'favorites', 'compare', etc.
}

// Get the selected vehicle ID
const currentVehicleId = getSelectedUnitId()

// Get journey metadata
const journey = getSelectedUnitJourney()
console.log(journey)  // { unitId: 'ncm-001', entryPoint: 'shop', timestamp: 1234567890 }

// Get formatted display strings
const title = formatVehicleTitle(vehicle)  // "2020 Chevrolet Silverado 3500HD"
const price = formatPrice(49990)           // "$49,990"
const mileage = formatMileage(106096)      // "106,096 mi"
```

## Example 7: Using Vehicle Record Hook

```tsx
import { useInventoryRecord } from '@/domains/inventory/inventory.runtime'

function VehicleGallery({ unitId }: { unitId: string }) {
  const vehicle = useInventoryRecord(unitId)
  
  if (!vehicle) {
    return <div>Loading...</div>
  }
  
  return (
    <div>
      <h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2>
      <img 
        src={vehicle.imageUrl || '/inventory/national-car-mart/placeholder.jpg'}
        alt={vehicle.id}
        className="w-full h-auto"
      />
      <div className="grid mt-4">
        <p className="text-sm text-gray-600">Stock: {vehicle.stockNumber}</p>
        <p className="text-sm text-gray-600">Mileage: {vehicle.mileage.toLocaleString()} mi</p>
        <p className="text-lg font-bold">${vehicle.askingPrice.toLocaleString()}</p>
      </div>
    </div>
  )
}
```

## File Locations Quick Reference

| Feature | File | Export |
|---------|------|--------|
| All inventory | `src/domains/buyer-hub/data/nationalCarMartInventory.generated.ts` | `BUYER_HUB_INVENTORY` |
| Seed data | `src/domains/buyer-hub/data/nationalCarMartInventory.seed.csv` | CSV (ground truth) |
| Inventory hooks | `src/domains/inventory/inventory.runtime.ts` | `useInventoryCatalog()`, `useInventoryRecord()` |
| Context helpers | `src/domains/buyer-hub/helpers/selectedVehicleContext.ts` | 9 utility functions |
| Context component | `src/domains/buyer-hub/components/SelectedVehicleContext.tsx` | React component |
| Photo storage | `public/inventory/national-car-mart/` | 104 JPGs + placeholder |

## Image Paths Reference

- **Real vehicle photos**: `/inventory/national-car-mart/{filename}.jpg` (e.g., `/inventory/national-car-mart/2020_Chevrolet_Silverado_3500HD.jpg`)
- **Placeholder fallback**: `/inventory/national-car-mart/placeholder.jpg`
- All paths are relative to the public root and work across all pages

## Notes

- All inventory data is read-only client-side
- No backend queries required for inventory display
- Photo archive status is preserved in each unit object for future filtering
- Selected vehicle context persists in localStorage across page navigation
- Use `clearSelectedUnit()` when user exits the buyer journey
