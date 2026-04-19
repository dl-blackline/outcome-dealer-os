import { useRouter, matchRoute } from '@/app/router'
import { Heart, ArrowRight, ShieldCheck, List, Phone, Envelope, MapPin } from '@phosphor-icons/react'
import { DEALER } from '@/lib/dealer.constants'
import { RouteNotFound } from '@/components/shell/RouteNotFound'

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
  const PageComponent = resolveBuyerPage(currentPath)
  const isUtilityPage = currentPath === '/login'

  if (isUtilityPage) {
    return PageComponent ? <PageComponent /> : <LoginPage />
  }

  return (
    <div className="vault-shell vault-grid flex min-h-screen flex-col text-slate-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070b12]/80 backdrop-blur-xl supports-backdrop-filter:bg-[#070b12]/70">
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
              <p className="vault-title text-[0.72rem] leading-tight text-slate-300">National Car Mart</p>
              <p className="text-xs tracking-[0.18em] text-slate-400">Vehicle Vault</p>
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
                    ? 'border-blue-200/40 bg-blue-200/20 text-blue-100 shadow-[0_0_35px_rgba(133,171,255,0.25)]'
                    : 'border-white/12 bg-white/3 text-slate-300 hover:border-white/28 hover:bg-white/8 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Utility */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/shop')}
              className="rounded-xl border border-white/15 bg-white/4 p-2 text-slate-300 transition-colors hover:bg-white/9 hover:text-white md:hidden"
              aria-label="Inventory"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="hidden rounded-full border border-white/15 bg-white/3 px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase text-slate-300 transition-all hover:border-white/30 hover:bg-white/8 hover:text-white md:inline-flex"
            >
              Staff Login
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className={`rounded-full border p-2 transition-all ${
                currentPath === '/favorites'
                  ? 'border-rose-200/50 bg-rose-400/20 text-rose-100'
                  : 'border-white/15 bg-white/3 text-slate-300 hover:border-white/35 hover:bg-white/10 hover:text-white'
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
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {PageComponent ? (
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
      <footer className="border-t border-white/10 bg-black/35">
        <div className="mx-auto max-w-[88rem] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={18} weight="duotone" className="text-blue-200" />
                <p className="vault-title text-[0.72rem] text-slate-200">{DEALER.name}</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{DEALER.agentLabel}</p>
              <a
                href={DEALER.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-100 transition-colors"
              >
                {DEALER.websiteLabel} ↗
              </a>
            </div>

            {/* Contact */}
            <div>
              <p className="mb-3 text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">Contact</p>
              <ul className="space-y-2">
                <li>
                  <a href={DEALER.phoneTel} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors">
                    <Phone size={13} className="shrink-0 text-slate-400" />
                    {DEALER.phone}
                  </a>
                </li>
                <li>
                  <a href={DEALER.emailHref} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors">
                    <Envelope size={13} className="shrink-0 text-slate-400" />
                    {DEALER.email}
                  </a>
                </li>
                <li>
                  <a
                    href={DEALER.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <MapPin size={13} className="shrink-0 text-slate-400" />
                    {DEALER.addressFull}
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick links */}
            <div>
              <p className="mb-3 text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">Explore</p>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.path}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-xs text-slate-300 hover:text-white transition-colors"
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
                    className="text-xs text-blue-300 hover:text-blue-100 transition-colors"
                  >
                    Main Website ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} {DEALER.name}. {DEALER.agentLabel}.
            </p>
            <a
              href={DEALER.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {DEALER.websiteLabel}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
