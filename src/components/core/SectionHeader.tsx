import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="ods-page-header flex flex-wrap items-start justify-between gap-4 pb-6 sm:gap-5 sm:pb-7">
      <div className="max-w-4xl space-y-2.5">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {description && (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 pt-0.5">{action}</div>}
    </div>
  )
}
