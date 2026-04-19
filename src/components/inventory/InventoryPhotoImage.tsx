import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { getPremiumPlaceholderByBodyStyle } from '@/domains/inventory-photo/inventoryPhoto.placeholder'
import type { InventoryPhotoRecord, InventoryRecord } from '@/domains/inventory/inventory.runtime'
import { pickBestInventoryPhoto } from '@/domains/inventory/inventory.runtime'

interface InventoryPhotoImageProps {
  record?: InventoryRecord
  photo?: InventoryPhotoRecord
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
  sizes?: string
}

export function InventoryPhotoImage({
  record,
  photo,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
  sizes,
}: InventoryPhotoImageProps) {
  const [failed, setFailed] = useState(false)

  const fallbackUrl = useMemo(() => getPremiumPlaceholderByBodyStyle(record?.bodyStyle), [record?.bodyStyle])

  const resolved = useMemo(() => {
    if (photo) return photo.url
    if (record) return pickBestInventoryPhoto(record)?.url
    return fallbackUrl
  }, [photo, record, fallbackUrl])

  return (
    <img
      src={failed ? fallbackUrl : resolved || fallbackUrl}
      alt={alt}
      className={cn('h-full w-full object-cover bg-muted/30', className)}
      loading={loading}
      decoding={decoding}
      sizes={sizes}
      onError={() => setFailed(true)}
    />
  )
}
