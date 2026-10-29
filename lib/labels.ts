import type { Alert, AlertSeverity, AlertType, RiskLevel, RiskMethod } from '@/types/api'

export const LEVEL_LABEL: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  failed: 'Confirmed Failure',
}

export const LEVEL_SHORT: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  failed: 'Failed',
}

/** Tailwind token per risk level: text, background tint, border, solid fill. */
export const LEVEL_TONE: Record<RiskLevel, { text: string; bg: string; border: string; fill: string }> = {
  low: { text: 'text-risk-low', bg: 'bg-risk-low/10', border: 'border-risk-low/30', fill: 'bg-risk-low' },
  medium: { text: 'text-risk-medium', bg: 'bg-risk-medium/10', border: 'border-risk-medium/30', fill: 'bg-risk-medium' },
  high: { text: 'text-risk-high', bg: 'bg-risk-high/10', border: 'border-risk-high/30', fill: 'bg-risk-high' },
  failed: { text: 'text-risk-failed', bg: 'bg-risk-failed/12', border: 'border-risk-failed/40', fill: 'bg-risk-failed' },
}

export const LEVEL_PRIORITY: Record<RiskLevel, number> = { failed: 0, high: 1, medium: 2, low: 3 }

export const METHOD_LABEL: Record<RiskMethod, string> = {
  ml_model: 'AI Model',
  rules: 'Rules Engine',
}

const EVENT_LABEL: Record<string, string> = {
  normal: 'Normal',
  fiber_tapping: 'Possible Fiber Tapping',
  bad_splice: 'Defective Splice',
  bending_event: 'Abnormal Bending',
  dirty_connector: 'Dirty Connector',
  fiber_cut: 'Fiber Cut',
}

export function eventLabel(type: string | null | undefined) {
  if (!type) return null
  return EVENT_LABEL[type] ?? type.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

export const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  failure: 'Recent Failure',
  high_risk: 'High Risk',
  medium_risk: 'Medium Risk',
  tapping: 'Possible Fiber Tapping',
}

export const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
}

const SEVERITY_RANK: Record<AlertSeverity, number> = { critical: 0, high: 1, medium: 2 }
const TYPE_RANK: Record<AlertType, number> = { failure: 0, high_risk: 1, tapping: 2, medium_risk: 3 }

export function alertPriority(alert: Alert) {
  const severity = alert.severity ? SEVERITY_RANK[alert.severity] : 3
  const type = alert.type ? TYPE_RANK[alert.type] : 4
  return severity * 10 + type
}

export function alertTypeLabel(alert: Alert) {
  return alert.type ? ALERT_TYPE_LABEL[alert.type] : alert.rawType ?? 'Alert'
}
