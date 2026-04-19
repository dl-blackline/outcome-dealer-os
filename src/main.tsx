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

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ThemeProvider>
      <AuthProvider defaultRole="gm">
        <App />
      </AuthProvider>
    </ThemeProvider>
   </ErrorBoundary>
)
