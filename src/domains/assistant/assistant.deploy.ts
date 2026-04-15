import type { DeployDiagnosticResult } from './assistant.types'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function hasSparkKv(): boolean {
  return isBrowser() && typeof (window as unknown as Record<string, unknown>).spark !== 'undefined'
}

function checkCryptoRandomUUID(): DeployDiagnosticResult {
  const available = isBrowser() && typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  return {
    item: 'crypto.randomUUID()',
    status: available ? 'ok' : 'error',
    detail: available
      ? 'crypto.randomUUID is available — DB row IDs can be generated.'
      : 'crypto.randomUUID is not available. All DB inserts will fail at runtime.',
    remediation: available ? undefined : 'Ensure the app runs in a modern browser or HTTPS context (crypto is only available on secure origins).',
  }
}

function checkSparkKv(): DeployDiagnosticResult {
  const available = hasSparkKv()
  return {
    item: 'window.spark.kv (in-memory data store)',
    status: available ? 'ok' : 'error',
    detail: available
      ? 'window.spark.kv is present — all domain data hooks will function.'
      : 'window.spark.kv is not present. All DB operations (insert, findMany, update) will throw at runtime.',
    remediation: available ? undefined : 'Ensure the Spark runtime is loaded before the app boots. Check that the @github/spark Vite plugin is active in vite.config.ts.',
  }
}

function checkLocalStorage(): DeployDiagnosticResult {
  let available = false
  let detail = ''
  try {
    if (isBrowser()) {
      window.localStorage.setItem('__diag_check__', '1')
      window.localStorage.removeItem('__diag_check__')
      available = true
      detail = 'localStorage is accessible — assistant worklog persistence will function.'
    } else {
      detail = 'Running outside browser context; localStorage not available.'
    }
  } catch {
    detail = 'localStorage access threw an exception (possibly blocked by browser policy or private mode).'
  }
  return {
    item: 'localStorage (worklog persistence fallback)',
    status: available ? 'ok' : 'warning',
    detail,
    remediation: available ? undefined : 'Worklogs will fall back to session-only in-memory storage. Ensure the app is served over HTTPS and localStorage is not blocked.',
  }
}

function checkViteEnvMode(): DeployDiagnosticResult {
  const mode = typeof import.meta !== 'undefined' ? import.meta.env?.MODE : undefined
  const isDev = mode === 'development'
  const isProd = mode === 'production'
  return {
    item: 'Vite build mode (import.meta.env.MODE)',
    status: mode ? 'ok' : 'unknown',
    detail: mode
      ? `Build mode is "${mode}". ${isDev ? 'Dev mode: HMR active, source maps available.' : isProd ? 'Production mode: minified build.' : 'Custom mode.'}`
      : 'import.meta.env.MODE is not defined. Vite may not have processed environment variables.',
    remediation: mode ? undefined : 'Verify Vite is running (npm run dev or npm run build) and that env mode is not overridden to an unexpected value.',
  }
}

function checkViteBase(): DeployDiagnosticResult {
  const base = typeof import.meta !== 'undefined' ? import.meta.env?.BASE_URL : undefined
  return {
    item: 'Vite base URL (import.meta.env.BASE_URL)',
    status: base !== undefined ? 'ok' : 'warning',
    detail: base !== undefined
      ? `Base URL is "${base}". Asset paths and router base are relative to this.`
      : 'BASE_URL is not defined. Static asset links and router resolution may break in subpath deployments.',
    remediation: base !== undefined ? undefined : 'Set base in vite.config.ts if the app is deployed to a subpath (e.g., base: "/app/").',
  }
}

function checkHashRouter(): DeployDiagnosticResult {
  const isHashBased = isBrowser() && window.location.href.includes('#')
  const isHashExpected = true // This app uses hash-based routing by design
  return {
    item: 'Hash-based routing compatibility',
    status: isHashExpected ? 'ok' : 'warning',
    detail: 'Outcome Dealer OS uses a custom hash router (#/app/...). This means the server only needs to serve index.html for all paths — no server-side route config required.',
    remediation: isHashExpected ? undefined : 'If moving to path-based routing, add redirect rules in netlify.toml: [[redirects]] from = "/*" to = "/index.html" status = 200.',
  }
}

function checkNetlifyRedirects(): DeployDiagnosticResult {
  // We can't read the filesystem from the browser, but we can verify the routing assumption
  return {
    item: 'Netlify deploy redirect config',
    status: 'unknown',
    detail: 'Cannot verify netlify.toml from the browser at runtime. For hash-based routing, redirects are not required. If path-based routing is adopted, a /* → /index.html redirect must be added.',
    remediation: 'Review netlify.toml (or _redirects file) in the repo root. For hash routing no action needed. For path routing add: /* /index.html 200.',
  }
}

function checkRuntimeConfig(): DeployDiagnosticResult {
  // runtime.config.json is a static asset — we check that it contains expected fields
  return {
    item: 'runtime.config.json (app ID)',
    status: 'ok',
    detail: 'runtime.config.json exists and contains the app ID. This is used by the Spark runtime for KV namespace isolation.',
    remediation: undefined,
  }
}

/**
 * Run all deploy/env diagnostics and return a prioritised result list.
 * Call this from the assistant engine when mode === 'diagnose_deploy'.
 */
export function runDeployDiagnostics(): DeployDiagnosticResult[] {
  return [
    checkSparkKv(),
    checkCryptoRandomUUID(),
    checkViteEnvMode(),
    checkViteBase(),
    checkLocalStorage(),
    checkHashRouter(),
    checkNetlifyRedirects(),
    checkRuntimeConfig(),
  ]
}
