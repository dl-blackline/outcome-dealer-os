import { getManufacturerBranding } from '@/domains/inventory/inventory.branding'
import { cn } from '@/lib/utils'

interface ManufacturerMarkProps {
  make: string | undefined
  size?: 'sm' | 'md'
  className?: string
  showLabel?: boolean
}

export function ManufacturerMark({ make, size = 'md', className, showLabel = false }: ManufacturerMarkProps) {
  const branding = getManufacturerBranding(make)
  const markSize = size === 'sm' ? 'h-7 w-7 text-[0.62rem]' : 'h-9 w-9 text-[0.7rem]'

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full border border-white/20 bg-linear-to-br font-semibold uppercase tracking-[0.08em] text-white shadow-sm',
          markSize,
          branding.accentClass,
        )}
        aria-hidden="true"
      >
        {branding.mark}
      </span>
      {showLabel ? <span className="text-xs font-medium text-slate-200">{branding.shortLabel}</span> : null}
    </span>
  )
}