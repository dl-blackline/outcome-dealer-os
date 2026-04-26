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
    <footer style={{ background: '#080810', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Main footer content */}
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
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
            <p className="text-xs leading-relaxed" style={{ color: '#8898b8' }}>
              Cleveland's trusted pre-owned dealer since 1962. Over 60 years of serving the community with honesty and integrity.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-4">
              {['f', 'in', 'yt', 'tk'].map((s) => (
                <div
                  key={s}
                  className="flex items-center justify-center w-8 h-8 rounded text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#8898b8' }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8898b8', letterSpacing: '0.18em' }}>
              Quick Links
            </p>
            <ul className="space-y-2">
              {FOOTER_NAV.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8898b8', letterSpacing: '0.18em' }}>
              Contact Us
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href={DEALER.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: '#d41a1a' }} />
                  {DEALER.addressFull}
                </a>
              </li>
              <li>
                <a
                  href={DEALER.phoneTel}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <Phone size={14} style={{ color: '#d41a1a' }} />
                  {DEALER.phone}
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
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
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8898b8', letterSpacing: '0.18em' }}>
              Accredited Business
            </p>
            {/* BBB badge placeholder */}
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded text-xs"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#c8d4f0' }}
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
                style={{ borderRadius: '4px' }}
              >
                GET APPROVED NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#060609' }}>
        <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: '#5a6480' }}>
            © {new Date().getFullYear()} {DEALER.name}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: '#5a6480' }}>
            <span>Privacy Policy</span>
            <span>|</span>
            <span>Terms of Use</span>
            <span>|</span>
            <a
              href={DEALER.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6' }}
            >
              {DEALER.websiteLabel}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
