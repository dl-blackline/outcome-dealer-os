import { useState } from 'react'
import { useRouter } from '@/app/router'
import { DEALER } from '@/lib/dealer.constants'
import { List, X, CaretDown, Heart } from '@phosphor-icons/react'

const NAV = [
  { label: 'Inventory', path: '/shop', hasDropdown: true },
  { label: 'Financing', path: '/finance', hasDropdown: true },
  { label: 'Trade', path: '/trade', hasDropdown: true },
  { label: 'Service', path: '/schedule', hasDropdown: true },
  { label: 'About', path: '/#about', hasDropdown: true },
  { label: 'Contact', path: '/#contact', hasDropdown: false },
]

export function NcmHeader() {
  const { currentPath, navigate } = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleNav(path: string) {
    setMobileOpen(false)
    if (path.startsWith('/#')) {
      navigate('/')
      setTimeout(() => {
        const id = path.replace('/#', '')
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
    } else {
      navigate(path)
    }
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d15 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.6)',
      }}
    >
      {/* Thin red accent line at very top */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, #d41a1a 0%, #1d4ed8 50%, transparent 100%)' }} />

      <div className="mx-auto flex h-[64px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Logo ── */}
        <button
          onClick={() => navigate('/')}
          className="flex-shrink-0 flex items-center gap-2 group"
          aria-label="National Car Mart – Home"
        >
          <NcmLogo />
        </button>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-6 mx-4">
          {NAV.map((item) => {
            const isActive = item.path !== '/#about' && item.path !== '/#contact' &&
              (currentPath === item.path || currentPath.startsWith(item.path + '/'))
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className="ncm-nav-item"
                data-active={isActive ? 'true' : undefined}
              >
                {item.label}
                {item.hasDropdown && <CaretDown size={11} weight="bold" style={{ opacity: 0.6 }} />}
              </button>
            )
          })}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2">
          {/* Favorites (desktop) */}
          <button
            onClick={() => navigate('/favorites')}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded border text-slate-300 transition-colors hover:text-white hover:border-white/40"
            style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}
            aria-label="Saved vehicles"
          >
            <Heart size={17} />
          </button>

          {/* GET APPROVED — main CTA */}
          <button
            onClick={() => navigate('/finance/apply')}
            className="ncm-btn-red flex items-center gap-1.5 px-4 py-2.5 text-[0.78rem]"
            style={{ borderRadius: '4px' }}
          >
            GET APPROVED
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>›</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded text-slate-300 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Nav Drawer ── */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          style={{ background: '#0d0d15', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className="ncm-mobile-nav-item w-full text-left px-3 py-3 rounded text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { navigate('/finance/apply'); setMobileOpen(false) }}
              className="ncm-btn-red w-full mt-2"
              style={{ borderRadius: '4px' }}
            >
              GET APPROVED
            </button>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <div className="px-4 py-2 flex items-center gap-4 text-xs text-slate-400">
            <a href={DEALER.phoneTel} style={{ color: 'rgba(255,255,255,0.6)' }}>{DEALER.phone}</a>
          </div>
        </div>
      )}
    </header>
  )
}

/** NCM metallic text logo */
function NcmLogo() {
  return (
    <div className="flex flex-col leading-none select-none">
      {/* Stars row */}
      <div className="flex items-center gap-0.5 mb-0.5">
        <span style={{ color: '#c0c8e8', fontSize: '0.45rem' }}>★</span>
        <span style={{ color: '#d41a1a', fontSize: '0.45rem' }}>★</span>
        <span style={{ color: '#3b82f6', fontSize: '0.45rem' }}>★</span>
      </div>
      <div
        className="font-black uppercase tracking-tight"
        style={{
          fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
          fontSize: '1.45rem',
          lineHeight: 1,
          background: 'linear-gradient(180deg, #ffffff 0%, #c8d4f0 40%, #a0b0d8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.01em',
        }}
      >
        NATIONAL
      </div>
      <div
        className="font-bold uppercase tracking-widest"
        style={{
          fontFamily: 'Barlow, Manrope, sans-serif',
          fontSize: '0.5rem',
          letterSpacing: '0.22em',
          color: '#8898b8',
          lineHeight: 1.5,
        }}
      >
        CAR MART
      </div>
    </div>
  )
}
