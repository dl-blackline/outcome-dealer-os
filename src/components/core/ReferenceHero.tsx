import type { MockupReference } from '@/app/mockupReferences'

export function ReferenceHero({ reference }: { reference: MockupReference }) {
  const accent = reference.chip.toLowerCase().includes('buyer')
    ? 'rgba(14, 165, 233, 0.36)'
    : 'rgba(239, 68, 68, 0.34)'

  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-white/20 shadow-[0_26px_90px_rgba(2,8,23,0.44)]">
      <div
        style={{
          position: 'relative',
          minHeight: '176px',
          backgroundImage: `radial-gradient(circle at 11% 16%, ${accent}, transparent 46%), radial-gradient(circle at 86% 10%, rgba(59,130,246,0.26), transparent 42%), linear-gradient(112deg, rgba(2, 8, 23, 0.96), rgba(15, 23, 42, 0.9))`,
        }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(180deg, rgba(15,23,42,0.18) 0%, rgba(15,23,42,0.88) 100%)' }} />
        <div className="absolute left-[-5%] top-[26%] h-px w-[58%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.76) 44%, transparent 100%)' }} />
        <div className="absolute left-[-3%] top-[38%] h-px w-[62%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.62) 42%, transparent 100%)' }} />
        <div className="absolute right-[-10%] top-[10%] h-40 w-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.28), transparent 62%)' }} />
        <div className="relative z-10 px-4 py-6 sm:px-6 sm:py-7">
          <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-100">
            {reference.chip}
          </span>
          <h2 className="mt-2 text-2xl font-bold uppercase tracking-[0.06em] text-slate-50 sm:text-3xl" style={{ fontFamily: 'Barlow Condensed, Space Grotesk, sans-serif' }}>
            {reference.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-200/90 sm:text-[15px]">
            {reference.subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}
