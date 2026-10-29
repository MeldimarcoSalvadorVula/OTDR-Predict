export const RISK_LEVELS = ['low', 'medium', 'high', 'failed'] as const
export type RiskLevel = (typeof RISK_LEVELS)[number]

export const RISK_METHODS = ['rules', 'ml_model'] as const
export type RiskMethod = (typeof RISK_METHODS)[number]

export const EVENT_TYPES = [
  'normal',
  'fiber_tapping',
  'bad_splice',
  'bending_event',
  'dirty_connector',
  'fiber_cut',
] as const
export type EventType = (typeof EVENT_TYPES)[number]

export const ALERT_TYPES = ['failure', 'high_risk', 'medium_risk', 'tapping'] as const
export type AlertType = (typeof ALERT_TYPES)[number]

export const ALERT_SEVERITIES = ['critical', 'high', 'medium'] as const
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number]

export type RawRecord = Record<string, unknown>

export type DataEnvironment = 'simulated' | 'real' | 'unverified'

export interface MetaInfo {
  environment: DataEnvironment
  dataSource: string | null
  asOf: string | null
  notice: string | null
  summary: Array<{ key: string; value: string }>
  raw: RawRecord
}

export interface Fiber {
  id: string
  level: RiskLevel | null
  rawLevel: string | null
  method: RiskMethod | null
  rawMethod: string | null
  score: number | null
  eventType: string | null
  maxEventLossDb: number | null
  deltaLossDb: number | null
  lastMeasurement: string | null
  raw: RawRecord
}

export type LevelCounts = Record<RiskLevel, number>

export interface FiberCollection {
  fibers: Fiber[]
  total: number
  counts: LevelCounts
  countsSource: 'api' | 'computed'
  asOf: string | null
}

export interface Measurement {
  date: string | null
  totalLossDb: number | null
  maxEventLossDb: number | null
  deltaLossDb: number | null
  maxReflectanceDb: number | null
  eventPositionM: number | null
  snrDb: number | null
  nEvents: number | null
  pulseNs: number | null
  eventType: string | null
  raw: RawRecord
}

export interface RiskMetric {
  key: string
  value: number | string | boolean
}

export interface RiskAssessment {
  level: RiskLevel | null
  rawLevel: string | null
  method: RiskMethod | null
  rawMethod: string | null
  score: number | null
  reasons: string[]
  failLossDb: number | null
  asOf: string | null
  metrics: RiskMetric[]
  raw: RawRecord
}

export interface Alert {
  key: string
  fiberId: string | null
  type: AlertType | null
  rawType: string | null
  severity: AlertSeverity | null
  rawSeverity: string | null
  date: string | null
  reason: string | null
  method: RiskMethod | null
  raw: RawRecord
}
