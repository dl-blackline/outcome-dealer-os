import { useRouter, matchRoute } from '@/app/router'
import { Heart, ArrowRight } from '@phosphor-icons/react'

// Buyer hub pages
import { ShopInventoryPage } from '@/app/pages/shop/ShopInventoryPage'
import { VehicleDetailPage } from '@/app/pages/shop/VehicleDetailPage'
import { ComparePage } from '@/app/pages/shop/ComparePage'
import { FavoritesPage } from '@/app/pages/shop/FavoritesPage'
import { FinanceHubPage } from '@/app/pages/shop/FinanceHubPage'
import { QuickAppPage } from '@/app/pages/shop/QuickAppPage'
import { TradeInPage } from '@/app/pages/shop/TradeInPage'
import { SchedulePage } from '@/app/pages/shop/SchedulePage'
import { NextStepsPage } from '@/app/pages/shop/NextStepsPage'

const BUYER_ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  '/shop': ShopInventoryPage,
  '/shop/:unitId': VehicleDetailPage,
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
  { path: '/shop', label: 'Shop' },
  { path: '/finance', label: 'Finance' },
  { path: '/trade', label: 'Trade-In' },
  { path: '/schedule', label: 'Schedule' },
]

export function BuyerHubShell() {
  const { currentPath, navigate } = useRouter()
  const PageComponent = resolveBuyerPage(currentPath)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => navigate('/shop')}
            className="text-lg font-bold tracking-tight"
          >
            Outcome Dealer
          </button>

          {/* Nav Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  currentPath === link.path || currentPath.startsWith(link.path + '/')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Utility */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/favorites')}
              className={`rounded-md p-2 transition-colors ${
                currentPath === '/favorites'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-label="Favorites"
            >
              <Heart size={20} />
            </button>
            <button
              onClick={() => navigate('/my-next-steps')}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                currentPath === '/my-next-steps'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              My Next Steps
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {PageComponent ? <PageComponent /> : <ShopInventoryPage />}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-sm font-semibold">Outcome Dealer</p>
              <p className="text-xs text-muted-foreground">
                123 Main Street, Anytown, USA · (555) 000-0000
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Outcome Dealer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
