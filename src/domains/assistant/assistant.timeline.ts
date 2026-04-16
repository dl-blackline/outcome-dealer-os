import type { LeadTimelineEvent } from './assistant.types'
import type { MockLead, MockEvent, MockTask } from '@/lib/mockData'

/** Map event names to human-friendly labels */
const EVENT_LABEL_MAP: Record<string, string> = {
  lead_created: 'Lead Created',
  lead_validated: 'Lead Validated',
  lead_scored: 'Lead Scored',
  lead_contacted: 'Lead Contacted',
  appointment_booked: 'Appointment Booked',
  appointment_rescheduled: 'Appointment Rescheduled',
  appointment_no_show: 'Appointment No-Show',
  showroom_visit_checked_in: 'Showroom Visit',
  trade_submitted: 'Trade Submitted',
  appraisal_started: 'Appraisal Started',
  appraisal_completed: 'Appraisal Completed',
  appraisal_manager_approved: 'Appraisal Approved',
  desk_scenario_created: 'Desk Scenario Created',
  desk_scenario_presented: 'Desk Scenario Presented',
  quote_sent: 'Quote Sent',
  quote_accepted: 'Quote Accepted',
  credit_app_submitted: 'Credit App Submitted',
  lender_decision_received: 'Lender Decision',
  lender_declined: 'Lender Declined',
  fi_menu_presented: 'F&I Menu Presented',
  deal_signed: 'Deal Signed',
  deal_funded: 'Deal Funded',
  vehicle_delivered: 'Vehicle Delivered',
  approval_requested: 'Approval Requested',
  approval_granted: 'Approval Granted',
  approval_denied: 'Approval Denied',
  ai_output_persisted: 'AI Output Saved',
  campaign_touch_recorded: 'Campaign Touch',
  review_requested: 'Review Requested',
  referral_requested: 'Referral Requested',
}

function eventSeverity(eventName: string): LeadTimelineEvent['severity'] {
  if (['deal_funded', 'deal_signed', 'vehicle_delivered', 'appraisal_manager_approved', 'approval_granted', 'quote_accepted'].includes(eventName)) {
    return 'success'
  }
  if (['appointment_no_show', 'lender_declined', 'approval_denied'].includes(eventName)) {
    return 'error'
  }
  if (['appointment_rescheduled', 'ai_output_persisted', 'campaign_touch_recorded'].includes(eventName)) {
    return 'warning'
  }
  return 'info'
}

function taskSeverity(status: string, dueDate: string): LeadTimelineEvent['severity'] {
  if (status === 'completed') return 'success'
  const due = new Date(dueDate).getTime()
  const now = Date.now()
  if (due < now) return 'error'      // overdue
  if (due - now < 24 * 60 * 60 * 1000) return 'warning'  // due within 24h
  return 'info'
}

/**
 * Build a correlated, chronological timeline of events, tasks, and audit
 * signals for a given lead. Pure function – takes already-loaded data arrays.
 *
 * @param leadId  The canonical lead ID to correlate against.
 * @param lead    The lead record (used for customer name matching on tasks).
 * @param events  All events from useEvents().
 * @param tasks   All tasks from useTasks().
 */
export function buildLeadTimeline(
  leadId: string,
  lead: MockLead | undefined,
  events: MockEvent[],
  tasks: MockTask[],
): LeadTimelineEvent[] {
  const items: LeadTimelineEvent[] = []

  // --- Lead created anchor ---
  if (lead) {
    items.push({
      id: `anchor-${leadId}`,
      timestamp: lead.createdAt,
      type: 'lead_event',
      label: 'Lead Created',
      detail: `Lead for ${lead.customerName} (${lead.status}) sourced via ${lead.source}. Score: ${lead.score}.`,
      severity: 'info',
    })
  }

  // --- Event bus entries for this lead ---
  const leadEvents = events.filter(evt => evt.entityType === 'lead' && evt.entityId === leadId)
  for (const evt of leadEvents) {
    items.push({
      id: `event-${evt.id}`,
      timestamp: evt.timestamp,
      type: 'lead_event',
      label: EVENT_LABEL_MAP[evt.eventName] ?? evt.eventName,
      detail: `${evt.eventName} recorded by ${evt.actorType}.`,
      severity: eventSeverity(evt.eventName),
    })
  }

  // --- Tasks matched to this lead by name ---
  if (lead) {
    const nameLower = lead.customerName.toLowerCase()
    const leadTasks = tasks.filter(task => task.title.toLowerCase().includes(nameLower))
    for (const task of leadTasks) {
      items.push({
        id: `task-${task.id}`,
        timestamp: task.dueDate + 'T00:00:00Z',
        type: 'task',
        label: task.title,
        detail: `Task (${task.priority} priority) assigned to ${task.assignedTo}. Status: ${task.status}.`,
        severity: taskSeverity(task.status, task.dueDate),
      })
    }
  }

  // Sort ascending by timestamp
  return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

/** Return a human-readable label for a timeline severity. */
export function timelineSeverityLabel(severity: LeadTimelineEvent['severity']): string {
  return { info: 'Info', warning: 'Warning', success: 'Completed', error: 'Issue' }[severity]
}
