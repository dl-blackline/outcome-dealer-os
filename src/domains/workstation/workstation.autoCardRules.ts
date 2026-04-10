/**
 * Workstation Auto-Card Rules — Centralized card generation from events.
 *
 * Each rule maps a canonical event to a workstation card template.
 * When an event fires, the matching rule produces a card that is
 * placed in the Inbox column with the correct linkedObject, queue, and priority.
 *
 * This is the ONLY place where auto-card logic lives.
 * Pages and components never contain card-generation rules.
 */
import type { EventName } from '@/domains/events/event.constants'
import type {
  WorkstationCard,
  LinkedObjectType,
  QueueType,
  CardPriority,
} from '@/domains/workstation/workstation.types'

export interface AutoCardRule {
  /** Which event triggers this card */
  eventName: EventName
  /** Human-readable title template (use {{entityId}} for interpolation) */
  titleTemplate: string
  /** Optional description template */
  descriptionTemplate?: string
  /** What type of object this card links to */
  linkedObjectType: LinkedObjectType
  /** Which department queue receives this card */
  queueType: QueueType
  /** Default priority for the generated card */
  defaultPriority: CardPriority
  /** Whether the card requires manager approval before completion */
  requiresApproval: boolean
  /** Tags automatically applied to the card */
  tags: string[]
}

/**
 * Canonical auto-card rules for Outcome Dealer OS.
 * Ordered by business process flow.
 */
export const AUTO_CARD_RULES: AutoCardRule[] = [
  // ─── Lead & CRM ───
  {
    eventName: 'lead_created',
    titleTemplate: 'New lead — triage and assign',
    descriptionTemplate: 'A new lead has been created and needs initial qualification.',
    linkedObjectType: 'lead',
    queueType: 'bdc',
    defaultPriority: 'high',
    requiresApproval: false,
    tags: ['new-lead', 'triage'],
  },
  {
    eventName: 'appointment_booked',
    titleTemplate: 'Appointment booked — prepare for visit',
    descriptionTemplate: 'Customer has a scheduled appointment. Ensure showroom readiness.',
    linkedObjectType: 'lead',
    queueType: 'sales',
    defaultPriority: 'medium',
    requiresApproval: false,
    tags: ['appointment'],
  },
  {
    eventName: 'appointment_no_show',
    titleTemplate: 'Appointment no-show — follow up',
    descriptionTemplate: 'Customer missed their appointment. Requires immediate outreach.',
    linkedObjectType: 'lead',
    queueType: 'bdc',
    defaultPriority: 'high',
    requiresApproval: false,
    tags: ['no-show', 'follow-up'],
  },

  // ─── Deal & Finance ───
  {
    eventName: 'quote_sent',
    titleTemplate: 'Quote sent — follow up for acceptance',
    descriptionTemplate: 'A quote has been sent to the customer. Follow up within 24 hours.',
    linkedObjectType: 'deal',
    queueType: 'sales',
    defaultPriority: 'high',
    requiresApproval: false,
    tags: ['quote', 'follow-up'],
  },
  {
    eventName: 'approval_requested',
    titleTemplate: 'Approval requested — manager review needed',
    descriptionTemplate: 'A trust-sensitive action requires manager approval.',
    linkedObjectType: 'approval',
    queueType: 'management',
    defaultPriority: 'high',
    requiresApproval: true,
    tags: ['approval', 'review'],
  },
  {
    eventName: 'funding_missing_item',
    titleTemplate: 'Funding exception — missing item',
    descriptionTemplate: 'A funded deal has a missing stip or documentation issue.',
    linkedObjectType: 'funding_exception',
    queueType: 'finance',
    defaultPriority: 'urgent',
    requiresApproval: false,
    tags: ['funding', 'exception'],
  },

  // ─── Service & Recon ───
  {
    eventName: 'service_customer_declined_work',
    titleTemplate: 'Declined service work — retention opportunity',
    descriptionTemplate: 'Customer declined recommended service work. May indicate satisfaction risk.',
    linkedObjectType: 'service_event',
    queueType: 'service',
    defaultPriority: 'medium',
    requiresApproval: false,
    tags: ['declined-work', 'retention'],
  },
  {
    eventName: 'recon_estimate_changed',
    titleTemplate: 'Recon estimate changed — review cost impact',
    descriptionTemplate: 'Reconditioning cost estimate has changed. Review for budget impact.',
    linkedObjectType: 'recon_job',
    queueType: 'recon',
    defaultPriority: 'medium',
    requiresApproval: false,
    tags: ['recon', 'cost-change'],
  },
  {
    eventName: 'unit_hit_aging_threshold',
    titleTemplate: 'Inventory aging — action required',
    descriptionTemplate: 'A unit has exceeded the aging threshold. Evaluate pricing or wholesale.',
    linkedObjectType: 'inventory_unit',
    queueType: 'management',
    defaultPriority: 'medium',
    requiresApproval: false,
    tags: ['aging', 'inventory'],
  },
]

/**
 * Find the matching auto-card rule for a given event name.
 */
export function findAutoCardRule(eventName: EventName): AutoCardRule | null {
  return AUTO_CARD_RULES.find(r => r.eventName === eventName) ?? null
}

/**
 * Generate a workstation card from an event using the auto-card rules.
 * Returns null if no rule matches the event.
 */
export function generateCardFromEvent(
  eventName: EventName,
  entityId: string,
  overrides?: Partial<Pick<WorkstationCard, 'assigneeName' | 'dueAt' | 'description'>>,
): Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'> | null {
  const rule = findAutoCardRule(eventName)
  if (!rule) return null

  return {
    title: rule.titleTemplate,
    description: overrides?.description ?? rule.descriptionTemplate,
    columnId: 'inbox',
    linkedObjectType: rule.linkedObjectType,
    linkedObjectId: entityId,
    priority: rule.defaultPriority,
    queueType: rule.queueType,
    requiresApproval: rule.requiresApproval,
    sourceEventName: rule.eventName,
    tags: [...rule.tags],
    assigneeName: overrides?.assigneeName,
    dueAt: overrides?.dueAt,
  }
}
