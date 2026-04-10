export type UUID = string

export type ActorType = 'user' | 'agent' | 'system'

export interface ServiceContext {
  actorType: ActorType
  actorId?: string
  actorRole?: string
  source?: string
  requiresAudit?: boolean
}

export interface ServiceErrorShape {
  code: string
  message: string
  details?: Record<string, unknown>
}

export type ServiceResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ServiceErrorShape }

export function ok<T>(value: T): ServiceResult<T> {
  return { ok: true, value }
}

export function fail<T>(error: ServiceErrorShape): ServiceResult<T> {
  return { ok: false, error }
}
