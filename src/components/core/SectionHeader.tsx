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
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
          Dealer OS Command
        </div>
        <h2
          className="text-2xl font-bold tracking-[0.02em] text-slate-100 sm:text-3xl"
          style={{ fontFamily: 'Barlow Condensed, Space Grotesk, sans-serif', textTransform: 'uppercase' }}
        >
          {title}
        </h2>
        <div className="h-px w-64 max-w-full bg-linear-to-r from-rose-500/70 via-sky-400/70 to-transparent" />
        {description && (
          <p className="max-w-3xl text-sm leading-6 text-slate-300/90 sm:text-[0.95rem]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 pt-0.5">{action}</div>}
    </div>
  )
}
