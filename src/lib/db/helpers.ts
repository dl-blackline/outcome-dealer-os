import { db } from './supabase'
import { DbRow } from './supabase'
import { UUID } from '@/types/common'

export async function findById<T extends DbRow>(table: string, id: UUID): Promise<T | null> {
  return db.findById<T>(table, id)
}

export async function findOne<T extends DbRow>(
  table: string,
  predicate: (row: T) => boolean
): Promise<T | null> {
  return db.findOne<T>(table, predicate)
}

export async function findMany<T extends DbRow>(
  table: string,
  predicate?: (row: T) => boolean
): Promise<T[]> {
  return db.findMany<T>(table, predicate)
}

export async function insert<T extends DbRow>(
  table: string,
  row: Omit<T, 'id' | 'created_at' | 'updated_at'>
): Promise<T> {
  return db.insert<T>(table, row)
}

export async function update<T extends DbRow>(
  table: string,
  id: UUID,
  updates: Partial<Omit<T, 'id' | 'created_at'>>
): Promise<T | null> {
  return db.update<T>(table, id, updates)
}

export async function deleteById(table: string, id: UUID): Promise<boolean> {
  return db.deleteById(table, id)
}

export async function count(table: string, predicate?: (row: DbRow) => boolean): Promise<number> {
  return db.count(table, predicate)
}
