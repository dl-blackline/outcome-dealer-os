import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { APP_ROUTES, type RouteDefinition } from './routes'

interface RouterState {
  currentPath: string
  params: Record<string, string>
  navigate: (path: string) => void
}

const RouterContext = createContext<RouterState | null>(null)

function getHashPath(): string {
  const hash = window.location.hash
  if (!hash || hash === '#') return '/app/dashboard'
  return hash.startsWith('#') ? hash.slice(1) : hash
}

function setHashPath(path: string): void {
  window.location.hash = path
}

/** Match a pattern like /app/records/leads/:id against a path */
export function matchRoute(
  pattern: string,
  path: string
): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)

  if (patternParts.length !== pathParts.length) return null

  const params: Record<string, string> = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i]
    } else if (patternParts[i] !== pathParts[i]) {
      return null
    }
  }
  return params
}

/** Find the best matching route definition for a given path */
export function findMatchingRoute(path: string): RouteDefinition | null {
  for (const route of APP_ROUTES) {
    if (matchRoute(route.path, path)) return route
  }
  return null
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(getHashPath)

  const navigate = useCallback((path: string) => {
    setHashPath(path)
    setCurrentPath(path)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getHashPath())
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Set initial hash if missing
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') {
      setHashPath('/app/dashboard')
    }
  }, [])

  const params = useMemo(() => {
    for (const route of APP_ROUTES) {
      const matched = matchRoute(route.path, currentPath)
      if (matched) return matched
    }
    return {}
  }, [currentPath])

  return (
    <RouterContext.Provider value={{ currentPath, params, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter(): RouterState {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used within a RouterProvider')
  return ctx
}
