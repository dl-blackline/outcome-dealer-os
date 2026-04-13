# Customer Saved State Model

## Overview

The customer saved state model manages the shopping session state for anonymous and identified customers — specifically saved/favorited vehicles and the compare list. State is persisted client-side via `localStorage` and exposed through the `useShoppingState` hook.

## Current Implementation (Phase 1 — Client-Only)

### Storage

- **Key:** `outcome-dealer-shopping-state`
- **Format:** JSON object with two arrays of unit IDs
- **Persistence:** `localStorage` — survives page reloads and browser restarts within the same origin

### Data Shape

```typescript
interface ShoppingState {
  savedUnitIds: string[]   // Favorited vehicle unit IDs
  compareUnitIds: string[] // Compare list unit IDs (max 4)
}
```

### Hook API (`useShoppingState`)

| Return Value | Type | Description |
|---|---|---|
| `savedUnitIds` | `string[]` | Current saved/favorited unit IDs |
| `compareUnitIds` | `string[]` | Current compare list unit IDs |
| `toggleSaved(unitId)` | `(string) => void` | Add or remove a unit from saved list |
| `toggleCompare(unitId)` | `(string) => void` | Add or remove a unit from compare list (max 4) |
| `isSaved(unitId)` | `(string) => boolean` | Check if a unit is saved |
| `isComparing(unitId)` | `(string) => boolean` | Check if a unit is in compare list |
| `clearCompare()` | `() => void` | Clear the compare list |
| `clearSaved()` | `() => void` | Clear all saved vehicles |
| `savedCount` | `number` | Count of saved vehicles |
| `compareCount` | `number` | Count of compare vehicles |

### Constraints

- Compare list is capped at **4 vehicles** to maintain a usable side-by-side layout.
- Saved list has no upper limit.
- State is per-browser and per-origin (not synced across devices).

## Future Plans — Server-Side Persistence

When customer identity is established (via login, CRM match, or session token), the shopping state will migrate to server-backed persistence:

### Phase 2: Session-Linked State

1. On first interaction, generate a `sessionId` and persist it alongside shopping state.
2. When a customer is identified (email match, phone match, or explicit login), link the session to the `customerId` in the `CustomerShoppingSession` record.
3. Server stores `CustomerShoppingSession` objects, enabling state to follow the customer across devices.

### Phase 3: Real-Time Sync

1. Hook detects online/offline state and syncs when connectivity is restored.
2. Conflict resolution: server state wins when timestamps differ; merge when both sides have new additions.
3. WebSocket or polling mechanism pushes state updates to other open tabs/devices.

### Migration Path

The `useShoppingState` hook will gain an optional `customerId` parameter. When present:
- On mount, fetch server state and merge with local state.
- On every mutation, write-through to both local and server storage.
- On conflict, reconcile using last-write-wins per individual unit ID.

This ensures backward compatibility — anonymous users continue with localStorage-only, and identified users get cross-device persistence.
