import { useRouter } from './router'

export function useRouteParam(paramName: string): string {
  const { params } = useRouter()
  return (params[paramName] || '').trim()
}

export function hasRouteParam(paramValue: string): boolean {
  return paramValue.trim().length > 0
}
