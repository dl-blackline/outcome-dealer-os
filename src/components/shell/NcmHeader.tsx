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
      className="sticky top-0 z-50 ncm-metal-line"
      style={{
        background: 'linear-gradient(180deg, rgba(8,10,16,0.97) 0%, rgba(10,13,21,0.97) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: '0 12px 38px rgba(0,0,0,0.55)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ height: '2px', background: 'linear-gradient(90deg, rgba(223,36,36,0.85) 0%, rgba(44,105,255,0.9) 52%, rgba(255,255,255,0.12) 100%)' }} />

      <div className="mx-auto flex h-[60px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex-shrink-0 flex items-center gap-2.5 group"
          aria-label="National Car Mart – Home"
        >
          <NcmLogo />
        </button>

        <nav className="hidden lg:flex items-center gap-7 mx-4">
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
                {item.hasDropdown && <CaretDown size={10} weight="bold" style={{ opacity: 0.66 }} />}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/favorites')}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md border text-slate-300 transition-colors hover:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.17)', background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}
            aria-label="Saved vehicles"
          >
            <Heart size={17} />
          </button>

          <button
            onClick={() => navigate('/finance/apply')}
            className="ncm-btn-red flex items-center gap-1.5 px-4 py-2.5 text-[0.74rem]"
            style={{ borderRadius: '0.55rem', boxShadow: '0 10px 30px rgba(223,36,36,0.6), inset 0 1px 0 rgba(255,255,255,0.3)' }}
          >
            GET APPROVED
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>›</span>
          </button>

          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md text-slate-300 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(10,13,20,0.98), rgba(10,14,22,0.98))',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(223,36,36,0.8), rgba(44,105,255,0.8), transparent)' }} />
          <div className="px-4 py-3 flex flex-col gap-2">
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className="ncm-mobile-nav-item w-full text-left text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { navigate('/finance/apply'); setMobileOpen(false) }}
              className="ncm-btn-red w-full mt-2"
              style={{ borderRadius: '0.55rem' }}
            >
              GET APPROVED
            </button>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <div className="px-4 py-2.5 flex items-center gap-4 text-xs text-slate-400">
            <a href={DEALER.phoneTel} style={{ color: 'rgba(255,255,255,0.72)', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>{DEALER.phone}</a>
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
      <div className="flex items-center gap-0.5 mb-0.5">
        <span style={{ color: '#c0c8e8', fontSize: '0.45rem' }}>★</span>
        <span style={{ color: '#d41a1a', fontSize: '0.45rem' }}>★</span>
        <span style={{ color: '#3b82f6', fontSize: '0.45rem' }}>★</span>
      </div>
      <div
        className="font-black uppercase tracking-tight"
        style={{
          fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
          fontSize: '1.35rem',
          lineHeight: 1,
          background: 'linear-gradient(180deg, #ffffff 0%, #d4ddf2 38%, #99abcf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.01em',
          textShadow: '0 0 22px rgba(147, 169, 214, 0.22)',
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
          color: '#98a8c8',
          lineHeight: 1.5,
        }}
      >
        CAR MART
      </div>
    </div>
  )
}
