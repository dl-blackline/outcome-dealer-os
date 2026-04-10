import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusPillVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        neutral: 'bg-gray-50 text-gray-700 ring-gray-600/20',
        purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusPillVariants> {
  dot?: boolean
}

export function StatusPill({
  className,
  variant,
  dot = true,
  children,
  ...props
}: StatusPillProps) {
  return (
    <span className={cn(statusPillVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
