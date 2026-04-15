import { v4 as uuidv4 } from 'uuid'
import type { AssistantActionId, AssistantReport, AssistantWorklogEntry } from './assistant.types'

const STORAGE_KEY = 'outcome-dealer-os.assistant.worklogs'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getAssistantWorklogs(): AssistantWorklogEntry[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AssistantWorklogEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveAssistantWorklog(
  actionId: AssistantActionId,
  issueSummary: string,
  report: AssistantReport
): AssistantWorklogEntry[] {
  const next: AssistantWorklogEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    actionId,
    issueSummary,
    symptoms: report.diagnosis,
    likelyCause: report.rootCause,
    filesInspected: report.impactedFiles,
    changesProposed: report.fixOrImprovementPath,
    validationSteps: report.validationSteps,
    openQuestions: report.risksAndFollowUps,
  }

  const entries = [next, ...getAssistantWorklogs()].slice(0, 25)
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }
  return entries
}
