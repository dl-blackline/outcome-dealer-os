import { useRouter } from '@/app/router'
import { DEALER } from '@/lib/dealer.constants'
import { MapPin, Phone, Clock } from '@phosphor-icons/react'

const FOOTER_NAV = [
  { label: 'Shop Inventory', path: '/shop' },
  { label: 'Get Approved', path: '/finance/apply' },
  { label: 'Value Your Trade', path: '/trade' },
  { label: 'Schedule Service', path: '/schedule' },
  { label: 'Finance Hub', path: '/finance' },
]

export function NcmFooter() {
  const { navigate } = useRouter()

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #07090f 0%, #06070c 100%)',
        borderTop: '1px solid var(--border-subtle)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <div style={{ height: '2px', background: 'linear-gradient(90deg, rgba(227,27,55,0.85) 0%, rgba(30,58,138,0.9) 56%, transparent 100%)' }} />

      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div
          style={{
            marginBottom: '1.4rem',
            background: 'linear-gradient(160deg, rgba(18,23,35,0.95), rgba(11,15,24,0.96))',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.9rem',
            padding: '1rem 1.1rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.8rem',
            boxShadow: 'var(--panel-glow)',
          }}
        >
          <p style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.88rem', color: '#e9efff', margin: 0 }}>
            Ready To Drive Something Powerful?
          </p>
          <button
            onClick={() => navigate('/finance/apply')}
            className="ncm-btn-red"
            style={{ borderRadius: '0.55rem', padding: '0.62rem 1.1rem', fontSize: '0.72rem' }}
          >
            Start Approval
          </button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <button
              onClick={() => navigate('/')}
              className="flex flex-col leading-none mb-4"
              aria-label="National Car Mart home"
            >
              <div className="flex items-center gap-0.5 mb-0.5">
                <span style={{ color: '#c0c8e8', fontSize: '0.45rem' }}>★</span>
                <span style={{ color: '#d41a1a', fontSize: '0.45rem' }}>★</span>
                <span style={{ color: '#3b82f6', fontSize: '0.45rem' }}>★</span>
              </div>
              <div
                className="font-black uppercase"
                style={{
                  fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                  fontSize: '1.3rem',
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
                style={{
                  fontFamily: 'Barlow, Manrope, sans-serif',
                  fontSize: '0.45rem',
                  letterSpacing: '0.22em',
                  color: '#8898b8',
                }}
              >
                CAR MART
              </div>
            </button>
            <p className="text-xs leading-relaxed" style={{ color: '#98a8c8' }}>
              Cleveland's trusted pre-owned dealer since 1962. Over 60 years of serving the community with honesty and integrity.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[
                { label: 'Facebook', href: 'https://www.facebook.com/nationalcarmart', icon: 'f' },
                { label: 'Instagram', href: 'https://www.instagram.com/nationalcarmart', icon: 'in' },
                { label: 'YouTube', href: 'https://www.youtube.com/@nationalcarmart', icon: 'yt' },
                { label: 'TikTok', href: 'https://www.tiktok.com/@nationalcarmart', icon: 'tk' },
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow National Car Mart on ${label}`}
                  className="flex items-center justify-center w-8 h-8 rounded text-xs font-bold transition-colors"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.16)', color: '#9cb0d4', textDecoration: 'none' }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#96a7c6', letterSpacing: '0.18em' }}>
              Quick Links
            </p>
            <ul className="space-y-2">
              {FOOTER_NAV.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="ncm-footer-link"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#96a7c6', letterSpacing: '0.18em' }}>
              Contact Us
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href={DEALER.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.76)' }}
                >
                  <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: '#d41a1a' }} />
                  {DEALER.addressFull}
                </a>
              </li>
              <li>
                <a
                  href={DEALER.phoneTel}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.76)' }}
                >
                  <Phone size={14} style={{ color: '#d41a1a' }} />
                  {DEALER.phone}
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.76)' }}>
                  <Clock size={14} className="mt-0.5 shrink-0" style={{ color: '#d41a1a' }} />
                  <div>
                    <div>Mon – Sat: 9AM – 8PM</div>
                    <div>Sunday: 11AM – 5PM</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* BBB / Trust */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#96a7c6', letterSpacing: '0.18em' }}>
              Accredited Business
            </p>
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded text-xs"
              style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.16)', color: '#c8d4f0' }}
            >
              <span className="font-bold text-base" style={{ color: '#e8c84a' }}>BBB</span>
              <div>
                <div className="font-bold text-xs">Accredited Business</div>
                <div style={{ color: '#8898b8', fontSize: '0.65rem' }}>A+ Rating</div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => navigate('/finance/apply')}
                className="ncm-btn-red w-full text-center py-2.5 text-xs"
                style={{ borderRadius: '0.55rem' }}
              >
                GET APPROVED NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: '#05060a' }}>
        <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: '#7787a8' }}>
            © {new Date().getFullYear()} {DEALER.name}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: '#7787a8' }}>
            <span>Privacy Policy</span>
            <span>|</span>
            <span>Terms of Use</span>
            <span>|</span>
            <a
              href={DEALER.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#6ea5ff' }}
            >
              {DEALER.websiteLabel}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
