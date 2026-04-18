/**
 * Inventory domain runtime hooks.
 */
import { useMemo } from 'react'
import type { QueryResult } from '@/hooks/useQueryResult'
import { useInventoryCatalog, useInventoryRecord } from '@/domains/inventory/inventory.runtime'

export interface RuntimeInventoryUnit {
	id: string
	vin?: string
	year: number
	make: string
	model: string
	trim: string
	status: string
	daysInStock: number
	askingPrice: number
}

function mapRecord(record: {
	id: string
	vin?: string
	year: number
	make: string
	model: string
	trim: string
	status: string
	daysInStock: number
	price: number
}): RuntimeInventoryUnit {
	return {
		id: record.id,
		vin: record.vin,
		year: record.year,
		make: record.make,
		model: record.model,
		trim: record.trim,
		status: record.status,
		daysInStock: record.daysInStock,
		askingPrice: record.price,
	}
}

export function useInventory(): QueryResult<RuntimeInventoryUnit[]> {
	const catalog = useInventoryCatalog()
	const data = useMemo(() => catalog.records.map(mapRecord), [catalog.records])

	return {
		data,
		loading: catalog.loading,
		error: null,
	}
}

export function useInventoryUnit(id: string): QueryResult<RuntimeInventoryUnit | null> {
	const record = useInventoryRecord(id)

	return {
		data: record.record ? mapRecord(record.record) : null,
		loading: record.loading,
		error: null,
	}
}
