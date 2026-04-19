const PREMIUM_PLACEHOLDERS = {
  default: '/inventory/premium-placeholders/vehicle-default.svg',
  sedan: '/inventory/premium-placeholders/vehicle-sedan.svg',
  suv: '/inventory/premium-placeholders/vehicle-suv.svg',
  truck: '/inventory/premium-placeholders/vehicle-truck.svg',
} as const

export function getPremiumPlaceholderByBodyStyle(bodyStyle?: string): string {
  const value = (bodyStyle || '').toLowerCase()
  if (/pickup|truck/.test(value)) return PREMIUM_PLACEHOLDERS.truck
  if (/suv|crossover|utility/.test(value)) return PREMIUM_PLACEHOLDERS.suv
  if (/sedan|coupe|hatchback/.test(value)) return PREMIUM_PLACEHOLDERS.sedan
  return PREMIUM_PLACEHOLDERS.default
}

export function isPlaceholderUrl(url?: string): boolean {
  if (!url) return true
  return url.includes('/placeholder.jpg') || url.includes('/premium-placeholders/')
}
