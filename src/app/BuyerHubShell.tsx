import { useRouter, matchRoute } from '@/app/router'
import { Heart, ArrowRight, ShieldCheck, List, Phone, Envelope, MapPin, Moon, Sun, LockKey } from '@phosphor-icons/react'
import { DEALER } from '@/lib/dealer.constants'
import { RouteNotFound } from '@/components/shell/RouteNotFound'
import { useTheme } from '@/domains/theme'
import { hasWholesaleAccess } from '@/domains/wholesale/wholesaleAccess'

// Buyer hub pages
import { HomePage } from '@/app/pages/shop/HomePage'
import { ShopInventoryPage } from '@/app/pages/shop/ShopInventoryPage'
import { VehicleDetailPage } from '@/app/pages/shop/VehicleDetailPage'
import { ComparePage } from '@/app/pages/shop/ComparePage'
import { FavoritesPage } from '@/app/pages/shop/FavoritesPage'
import { FinanceHubPage } from '@/app/pages/shop/FinanceHubPage'
import { QuickAppPage } from '@/app/pages/shop/QuickAppPage'
import { TradeInPage } from '@/app/pages/shop/TradeInPage'
import { SchedulePage } from '@/app/pages/shop/SchedulePage'
import { NextStepsPage } from '@/app/pages/shop/NextStepsPage'
import { InquiryPage } from '@/app/pages/shop/InquiryPage'
import { LoginPage } from '@/app/pages/auth/LoginPage'
import { WholesaleInventoryPage } from '@/app/pages/wholesale/WholesaleInventoryPage'
import { WholesaleVehicleDetailPage } from '@/app/pages/wholesale/WholesaleVehicleDetailPage'
import { WholesaleGatePage } from '@/app/pages/wholesale/WholesaleGatePage'

const BUYER_ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  '/': HomePage,
  '/login': LoginPage,
  '/shop': ShopInventoryPage,
  '/shop/:unitId': VehicleDetailPage,
  '/inquiry/:unitId': InquiryPage,
  '/compare': ComparePage,
  '/favorites': FavoritesPage,
  '/finance': FinanceHubPage,
  '/finance/apply': QuickAppPage,
  '/trade': TradeInPage,
  '/schedule': SchedulePage,
  '/my-next-steps': NextStepsPage,
  '/wholesale': WholesaleInventoryPage,
  '/wholesale/:unitId': WholesaleVehicleDetailPage,
}

function resolveBuyerPage(currentPath: string): React.ComponentType | null {
  for (const [pattern, Component] of Object.entries(BUYER_ROUTE_COMPONENTS)) {
    if (matchRoute(pattern, currentPath)) return Component
  }
  return null
}

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/shop', label: 'Shop' },
  { path: '/finance', label: 'Finance' },
  { path: '/trade', label: 'Trade-In' },
  { path: '/schedule', label: 'Schedule' },
]

export function BuyerHubShell() {
  const { currentPath, navigate } = useRouter()
  const { theme, toggleTheme } = useTheme()
  const PageComponent = resolveBuyerPage(currentPath)
  const isUtilityPage = currentPath === '/login'
  const isWholesaleRoute = currentPath === '/wholesale' || currentPath.startsWith('/wholesale/')
  const wholesaleAccessGranted = hasWholesaleAccess()
  const isDark = theme === 'dark'

  if (isUtilityPage) {
    return PageComponent ? <PageComponent /> : <LoginPage />
  }

  return (
    <div className={`vault-shell vault-grid flex min-h-screen flex-col ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Top Navigation */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${isDark ? 'border-white/10 bg-[#070b12]/80 supports-backdrop-filter:bg-[#070b12]/70' : 'border-slate-300/70 bg-slate-100/85 supports-backdrop-filter:bg-slate-100/70'}`}>
        <div className="mx-auto flex h-20 max-w-[88rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 text-left"
          >
            <div className="rounded-xl border border-white/20 bg-white/5 p-2 text-slate-100 shadow-lg shadow-black/30">
              <ShieldCheck size={20} weight="duotone" />
            </div>
            <div>
              <p className={`vault-title text-[0.72rem] leading-tight ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>National Car Mart</p>
              <p className={`text-xs tracking-[0.18em] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Vehicle Vault</p>
            </div>
          </button>

          {/* Nav Links */}
          <nav className="hidden items-center gap-2 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase transition-all ${
                  currentPath === link.path || currentPath.startsWith(link.path + '/')
                    ? isDark
                      ? 'border-blue-200/40 bg-blue-200/20 text-blue-100 shadow-[0_0_35px_rgba(133,171,255,0.25)]'
                      : 'border-blue-500/35 bg-blue-500/10 text-blue-700'
                    : isDark
                      ? 'border-white/12 bg-white/3 text-slate-300 hover:border-white/28 hover:bg-white/8 hover:text-white'
                      : 'border-slate-300/70 bg-slate-100/80 text-slate-700 hover:border-slate-400 hover:bg-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Utility */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`rounded-full border p-2 transition-all ${isDark ? 'border-white/15 bg-white/3 text-slate-300 hover:border-white/35 hover:bg-white/10 hover:text-white' : 'border-slate-300/80 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate('/shop')}
              className={`rounded-xl border p-2 transition-colors md:hidden ${isDark ? 'border-white/15 bg-white/4 text-slate-300 hover:bg-white/9 hover:text-white' : 'border-slate-300/80 bg-white text-slate-700 hover:bg-slate-50'}`}
              aria-label="Inventory"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => navigate('/wholesale')}
              className={`hidden rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase transition-all md:inline-flex ${isDark ? 'border-blue-200/35 bg-blue-200/12 text-blue-100 hover:border-blue-200/60 hover:bg-blue-200/20' : 'border-blue-400/40 bg-blue-50 text-blue-700 hover:border-blue-500/55 hover:bg-blue-100'}`}
            >
              <LockKey size={14} className="mr-1.5" />
              Wholesale
            </button>
            <button
              onClick={() => navigate('/login')}
              className={`hidden rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase transition-all md:inline-flex ${isDark ? 'border-white/15 bg-white/3 text-slate-300 hover:border-white/30 hover:bg-white/8 hover:text-white' : 'border-slate-300/80 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'}`}
            >
              Staff Login
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className={`rounded-full border p-2 transition-all ${
                currentPath === '/favorites'
                  ? isDark
                    ? 'border-rose-200/50 bg-rose-400/20 text-rose-100'
                    : 'border-rose-400/45 bg-rose-100 text-rose-700'
                  : isDark
                    ? 'border-white/15 bg-white/3 text-slate-300 hover:border-white/35 hover:bg-white/10 hover:text-white'
                    : 'border-slate-300/80 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
              }`}
              aria-label="Favorites"
            >
              <Heart size={20} />
            </button>
            <button
              onClick={() => navigate('/my-next-steps')}
              className={`vault-edge inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase transition-all ${
                currentPath === '/my-next-steps'
                  ? 'vault-btn text-white'
                  : 'vault-btn-muted hover:border-white/45 hover:text-white'
              }`}
            >
              My Next Steps
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ods-shell-main mx-auto w-full max-w-[88rem] flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-8 lg:px-8 lg:pb-32">
        {isWholesaleRoute && !wholesaleAccessGranted ? (
          <WholesaleGatePage onAccessGranted={() => navigate('/wholesale')} />
        ) : PageComponent ? (
          <PageComponent />
        ) : (
          <RouteNotFound
            title="Buyer Page Not Found"
            message="This customer-facing page is unavailable."
            actionLabel="Back to Inventory"
            onAction={() => navigate('/shop')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'border-white/10 bg-black/35' : 'border-slate-300/70 bg-slate-100/80'}`}>
        <div className="mx-auto max-w-[88rem] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={18} weight="duotone" className="text-blue-200" />
                <p className="vault-title text-[0.72rem] text-slate-200">{DEALER.name}</p>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{DEALER.agentLabel}</p>
              <a
                href={DEALER.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-2 inline-flex items-center gap-1 text-xs transition-colors ${isDark ? 'text-blue-300 hover:text-blue-100' : 'text-blue-700 hover:text-blue-800'}`}
              >
                {DEALER.websiteLabel} ↗
              </a>
            </div>

            {/* Contact */}
            <div>
              <p className={`mb-3 text-[0.65rem] uppercase tracking-[0.16em] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Contact</p>
              <ul className="space-y-2">
                <li>
                  <a href={DEALER.phoneTel} className={`flex items-center gap-2 text-xs transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}>
                    <Phone size={13} className={`shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    {DEALER.phone}
                  </a>
                </li>
                <li>
                  <a href={DEALER.emailHref} className={`flex items-center gap-2 text-xs transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}>
                    <Envelope size={13} className={`shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    {DEALER.email}
                  </a>
                </li>
                <li>
                  <a
                    href={DEALER.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-xs transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                  >
                    <MapPin size={13} className={`shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    {DEALER.addressFull}
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick links */}
            <div>
              <p className={`mb-3 text-[0.65rem] uppercase tracking-[0.16em] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Explore</p>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.path}>
                    <button
                      onClick={() => navigate(link.path)}
                      className={`text-xs transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
                <li>
                  <a
                    href={DEALER.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs transition-colors ${isDark ? 'text-blue-300 hover:text-blue-100' : 'text-blue-700 hover:text-blue-800'}`}
                  >
                    Main Website ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className={`mt-8 border-t pt-6 flex flex-col items-center justify-between gap-2 sm:flex-row ${isDark ? 'border-white/10' : 'border-slate-300/70'}`}>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              © {new Date().getFullYear()} {DEALER.name}. {DEALER.agentLabel}.
            </p>
            <a
              href={DEALER.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-slate-800'}`}
            >
              {DEALER.websiteLabel}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
