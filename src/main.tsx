import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { AuthProvider } from './domains/auth'
import { ThemeProvider } from './domains/theme'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Clear stale placeholder localStorage keys that were used for demo/mock tables.
// Inventory-related keys (outcome.inventory.*) are intentionally preserved.
;(function clearPlaceholderStorage() {
  if (typeof window === 'undefined') return
  const keysToRemove = [
    'outcome.db:mock_deals',
    'outcome.db:mock_leads',
  ]
  keysToRemove.forEach((key) => {
    try { window.localStorage.removeItem(key) } catch { /* ignore */ }
  })
})()

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ThemeProvider>
      <AuthProvider defaultRole="gm">
        <App />
      </AuthProvider>
    </ThemeProvider>
   </ErrorBoundary>
)
