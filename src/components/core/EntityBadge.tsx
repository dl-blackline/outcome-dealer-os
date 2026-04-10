import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const entityBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        lead: 'bg-blue-100 text-blue-800',
        deal: 'bg-green-100 text-green-800',
        household: 'bg-purple-100 text-purple-800',
        inventory: 'bg-orange-100 text-orange-800',
        service: 'bg-cyan-100 text-cyan-800',
        approval: 'bg-amber-100 text-amber-800',
      },
    },
    defaultVariants: {
      variant: 'lead',
    },
  }
)

export interface EntityBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof entityBadgeVariants> {}

export function EntityBadge({
  className,
  variant,
  children,
  ...props
}: EntityBadgeProps) {
  return (
    <span className={cn(entityBadgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}
