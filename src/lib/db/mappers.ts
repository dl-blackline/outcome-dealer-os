export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function mapKeys<T extends Record<string, unknown>>(
  obj: T,
  mapFn: (key: string) => string
): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[mapFn(key)] = value
    return acc
  }, {} as Record<string, unknown>)
}

export function rowToDomain<T extends Record<string, unknown>>(row: Record<string, unknown>): T {
  return mapKeys(row, toCamelCase) as T
}

export function domainToRow<T extends Record<string, unknown>>(domain: T): Record<string, unknown> {
  return mapKeys(domain as Record<string, unknown>, toSnakeCase)
}
