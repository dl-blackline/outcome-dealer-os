import { type CSSProperties, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface StickyTableShellProps {
  /** Table markup (or Table component) to render inside the scroll container. */
  children: ReactNode
  /**
   * Additional Tailwind / utility classes applied to the scroll container.
   */
  className?: string
  /**
   * CSS length subtracted from 100svh to produce the container max-height.
   * Tune this per-page to account for the chrome above the table:
   * topbar + page header + toolbar + any cards/stats.
   *
   * Defaults to "17rem" (suitable for a simple list page with a toolbar).
   *
   * Examples:
   *   "14rem" – no toolbar, compact header
   *   "18rem" – toolbar + slightly taller header
   *   "22rem" – complex tabbed page with stats above the table
   */
  scrollOffset?: string
}

/**
 * StickyTableShell
 *
 * A self-contained, theme-safe scroll container for list / table pages.
 *
 * Place a `<table>` (or the shadcn `<Table>` component) directly inside.
 * The `<thead>` will automatically become sticky via the `.ods-table-scroll`
 * CSS rules defined in `vault.css`.
 *
 * Usage:
 * ```tsx
 * <StickyTableShell scrollOffset="16rem">
 *   <table className="w-full text-sm">
 *     <thead><tr>...</tr></thead>
 *     <tbody>...</tbody>
 *   </table>
 * </StickyTableShell>
 * ```
 *
 * Or with the shadcn Table component:
 * ```tsx
 * <StickyTableShell scrollOffset="18rem">
 *   <Table>
 *     <TableHeader>...</TableHeader>
 *     <TableBody>...</TableBody>
 *   </Table>
 * </StickyTableShell>
 * ```
 */
export function StickyTableShell({
  children,
  className,
  scrollOffset,
}: StickyTableShellProps) {
  const style: CSSProperties = scrollOffset
    ? ({ '--ods-scroll-offset': scrollOffset } as CSSProperties)
    : {}

  return (
    <div className={cn('ods-table-scroll', className)} style={style}>
      {children}
    </div>
  )
}
