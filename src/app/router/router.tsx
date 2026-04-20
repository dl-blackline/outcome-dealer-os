import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { APP_ROUTES, type RouteDefinition } from './routes'

interface RouterState {
  currentPath: string
  params: Record<string, string>
  navigate: (path: string) => void
}

const RouterContext = createContext<RouterState | null>(null)

function normalizePath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) return '/'

  let normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const queryOrHashIndex = normalized.search(/[?#]/)
  if (queryOrHashIndex >= 0) {
    normalized = normalized.slice(0, queryOrHashIndex)
  }

  normalized = normalized.replace(/\/+/g, '/')
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized || '/'
}

function getHashPath(): string {
  const hash = window.location.hash
  if (!hash || hash === '#') return '/'

  // Supabase auth redirects inject tokens/errors into fragment.
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash
  if (
    fragment.includes('access_token=') ||
    fragment.includes('error_code=') ||
    fragment.includes('type=recovery')
  ) {
    return '/'
  }

  // Malformed fragments should fail safe to root.
  if (!fragment.startsWith('/')) return '/'
  return normalizePath(fragment)
}

function setHashPath(path: string): void {
  window.location.hash = normalizePath(path)
}

function safeDecodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Match a pattern like /app/records/leads/:id against a path */
export function matchRoute(
  pattern: string,
  path: string
): Record<string, string> | null {
  const patternParts = normalizePath(pattern).split('/').filter(Boolean)
  const pathParts = normalizePath(path).split('/').filter(Boolean)

  if (patternParts.length !== pathParts.length) return null

  const params: Record<string, string> = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = safeDecodePathSegment(pathParts[i])
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
    const normalized = normalizePath(path)
    if (normalized === currentPath) return
    setHashPath(normalized)
    setCurrentPath(normalized)
  }, [currentPath])

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
      setHashPath('/')
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
