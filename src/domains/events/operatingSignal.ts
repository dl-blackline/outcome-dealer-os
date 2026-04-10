/**
 * OperatingSignal — Unified type for events, audit entries, and notifications.
 *
 * Every signal flowing through the system is classified into this shape so the
 * notification center, event explorer, and audit log can share a common severity
 * model and display contract.
 */
export interface OperatingSignal {
  id: string
  type: 'event' | 'audit' | 'notification'
  severity: 'info' | 'warning' | 'success' | 'critical'
  title: string
  description: string
  entityType?: string
  entityId?: string
  timestamp: string
  read?: boolean
}
