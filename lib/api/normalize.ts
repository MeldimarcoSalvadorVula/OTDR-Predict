/**
 * Single adapter between the FastAPI responses and the UI models.
 *
 * Field names explicitly specified for the project (as_of, level, method, max_event_loss_db,
 * fail_loss_db, counts, reasons, ...) are read directly. Where the response schema was not
 * available, the candidate keys below are tried in order. Once `/openapi.json` is available,
 * tighten these lists to the exact property names. Unknown values always resolve to `null`,
 * never to zero or to a fabricated default.
 */
import {
  ALERT_SEVERITIES,
  ALERT_TYPES,
  RISK_LEVELS,
  RISK_METHODS,
  type Alert,
  type AlertSeverity,
  type AlertType,
  type DataEnvironment,
  type Fiber,
  type FiberCollection,
  type LevelCounts,
  type Measurement,
  type MetaInfo,
  type RawRecord,
  type RiskAssessment,
  type RiskLevel,
  type RiskMethod,
  type RiskMetric,
} from '@/types/api'

const KEYS = {
  fiberId: ['fiber_id', 'id', 'fiber'],
  level: ['level', 'risk_level', 'status'],
  method: ['method', 'risk_method'],
  score: ['score', 'risk_score', 'risk_index', 'index', 'probability'],
  eventType: ['event_type', 'dominant_event', 'event'],
  date: ['date', 'measured_at', 'measurement_date', 'last_measurement', 'last_measured_at', 'timestamp', 'ts'],
  reasons: ['reasons', 'reason', 'motivos'],
  alertType: ['type', 'alert_type', 'kind'],
  severity: ['severity'],
  alertReason: ['reason', 'message', 'detail', 'explanation', 'description'],
  listItems: ['items', 'fibers', 'alerts', 'measurements', 'data', 'results'],
  total: ['total', 'count', 'n_total'],
  nested: ['risk', 'metrics', 'latest', 'summary', 'last_measurement_data'],
  simulatedFlag: ['simulated', 'is_simulated', 'synthetic', 'is_synthetic'],
  dataSource: ['data_source', 'source', 'origin'],
  notice: ['notice', 'warning', 'banner', 'disclaimer', 'message'],
} as const

export const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function pick(obj: RawRecord, keys: readonly string[], searchNested = true): unknown {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key]
  }
  if (searchNested) {
    for (const nestedKey of KEYS.nested) {
      const nested = obj[nestedKey]
      if (isRecord(nested)) {
        for (const key of keys) {
          if (nested[key] !== undefined && nested[key] !== null) return nested[key]
        }
      }
    }
  }
  return undefined
}

export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function toStr(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() === '' ? null : value
  if (typeof value === 'number') return String(value)
  return null
}

function toEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  const s = toStr(value)?.toLowerCase()
  return s && (allowed as readonly string[]).includes(s) ? (s as T) : null
}

function normalizeMethod(value: unknown): RiskMethod | null {
  const s = toStr(value)?.toLowerCase()
  if (!s) return null
  if (s === 'ml' || s === 'ai' || s === 'xgboost') return 'ml_model'
  if (s === 'rule' || s === 'baseline') return 'rules'
  return toEnum(s, RISK_METHODS)
}

function unwrapList(payload: unknown): RawRecord[] {
  if (Array.isArray(payload)) return payload.filter(isRecord)
  if (isRecord(payload)) {
    for (const key of KEYS.listItems) {
      const value = payload[key]
      if (Array.isArray(value)) return value.filter(isRecord)
    }
  }
  return []
}

function emptyCounts(): LevelCounts {
  return { low: 0, medium: 0, high: 0, failed: 0 }
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => (isRecord(item) ? toStr(pick(item, KEYS.alertReason, false)) : toStr(item))).filter((s): s is string => !!s)
  const single = toStr(value)
  return single ? [single] : []
}

export function readAsOf(payload: unknown): string | null {
  if (!isRecord(payload)) return null
  return toStr(pick(payload, ['as_of'])) ?? (isRecord(payload.dataset) ? toStr(payload.dataset.as_of) : null)
}

/* ---------- /meta ---------- */

export function normalizeMeta(payload: unknown): MetaInfo {
  const raw = isRecord(payload) ? payload : {}
  const flag = pick(raw, KEYS.simulatedFlag)
  const dataSource = toStr(pick(raw, KEYS.dataSource))

  let environment: DataEnvironment = 'unverified'
  if (typeof flag === 'boolean') environment = flag ? 'simulated' : 'real'
  else if (dataSource) {
    const s = dataSource.toLowerCase()
    if (s.includes('synthetic') || s.includes('simulat')) environment = 'simulated'
    else if (s === 'real') environment = 'real'
  }

  const summary: MetaInfo['summary'] = []
  const summarySource = [raw.dataset, raw.summary].find(isRecord)
  if (summarySource) {
    for (const [key, value] of Object.entries(summarySource)) {
      if (['string', 'number', 'boolean'].includes(typeof value)) summary.push({ key, value: String(value) })
    }
  }

  return {
    environment,
    dataSource,
    asOf: readAsOf(raw),
    notice: toStr(pick(raw, KEYS.notice, false)),
    summary,
    raw,
  }
}

/* ---------- /fibers ---------- */

export function normalizeFiber(item: RawRecord): Fiber {
  const rawLevel = toStr(pick(item, KEYS.level))
  const rawMethod = toStr(pick(item, KEYS.method))
  return {
    id: toStr(pick(item, KEYS.fiberId, false)) ?? 'unknown',
    level: toEnum<RiskLevel>(rawLevel, RISK_LEVELS),
    rawLevel,
    method: normalizeMethod(rawMethod),
    rawMethod,
    score: toNumber(pick(item, KEYS.score)),
    eventType: toStr(pick(item, KEYS.eventType)),
    maxEventLossDb: toNumber(pick(item, ['max_event_loss_db'])),
    deltaLossDb: toNumber(pick(item, ['delta_loss_db'])),
    lastMeasurement: toStr(pick(item, KEYS.date)),
    raw: item,
  }
}

export interface FiberPage {
  items: RawRecord[]
  total: number | null
  counts: LevelCounts | null
  asOf: string | null
}

export function normalizeFiberPage(payload: unknown): FiberPage {
  const items = unwrapList(payload)
  if (!isRecord(payload)) return { items, total: null, counts: null, asOf: null }

  let counts: LevelCounts | null = null
  if (isRecord(payload.counts)) {
    counts = emptyCounts()
    for (const level of RISK_LEVELS) counts[level] = toNumber(payload.counts[level]) ?? 0
  }

  return { items, total: toNumber(pick(payload, KEYS.total, false)), counts, asOf: readAsOf(payload) }
}

export function buildFiberCollection(pages: FiberPage[]): FiberCollection {
  const seen = new Set<string>()
  const fibers: Fiber[] = []
  for (const page of pages) {
    for (const item of page.items) {
      const fiber = normalizeFiber(item)
      const key = fiber.id === 'unknown' ? `unknown-${fibers.length}` : fiber.id
      if (seen.has(key)) continue
      seen.add(key)
      fibers.push(fiber)
    }
  }

  const first = pages[0]
  let counts = first?.counts ?? null
  const countsSource: FiberCollection['countsSource'] = counts ? 'api' : 'computed'
  if (!counts) {
    counts = emptyCounts()
    for (const fiber of fibers) if (fiber.level) counts[fiber.level] += 1
  }

  return {
    fibers,
    total: first?.total ?? fibers.length,
    counts,
    countsSource,
    asOf: first?.asOf ?? null,
  }
}

/* ---------- /fibers/{id}/measurements ---------- */

export function normalizeMeasurements(payload: unknown): Measurement[] {
  return unwrapList(payload).map((item) => ({
    date: toStr(pick(item, KEYS.date, false)),
    totalLossDb: toNumber(item.total_loss_db),
    maxEventLossDb: toNumber(item.max_event_loss_db),
    deltaLossDb: toNumber(item.delta_loss_db),
    maxReflectanceDb: toNumber(item.max_reflectance_db),
    eventPositionM: toNumber(item.event_position_m),
    snrDb: toNumber(item.snr_db),
    nEvents: toNumber(item.n_events),
    pulseNs: toNumber(item.pulse_ns),
    eventType: toStr(pick(item, KEYS.eventType, false)),
    raw: item,
  }))
}

/* ---------- /fibers/{id}/risk ---------- */

const CORE_RISK_KEYS = new Set<string>([
  ...KEYS.level,
  ...KEYS.method,
  ...KEYS.score,
  ...KEYS.reasons,
  ...KEYS.fiberId,
  'as_of',
  'fail_loss_db',
  'metrics',
])

export function normalizeRisk(payload: unknown): RiskAssessment {
  const raw = isRecord(payload) ? payload : {}
  const rawLevel = toStr(pick(raw, KEYS.level))
  const rawMethod = toStr(pick(raw, KEYS.method))

  const metrics: RiskMetric[] = []
  const collect = (source: RawRecord) => {
    for (const [key, value] of Object.entries(source)) {
      if (CORE_RISK_KEYS.has(key) || value === null || value === undefined) continue
      if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') metrics.push({ key, value })
    }
  }
  if (isRecord(raw.metrics)) collect(raw.metrics)
  collect(raw)

  return {
    level: toEnum<RiskLevel>(rawLevel, RISK_LEVELS),
    rawLevel,
    method: normalizeMethod(rawMethod),
    rawMethod,
    score: toNumber(pick(raw, KEYS.score)),
    reasons: stringList(pick(raw, KEYS.reasons)),
    failLossDb: toNumber(pick(raw, ['fail_loss_db'])),
    asOf: readAsOf(raw),
    metrics,
    raw,
  }
}

/* ---------- /alerts ---------- */

export function normalizeAlerts(payload: unknown): Alert[] {
  return unwrapList(payload).map((item, index) => {
    const rawType = toStr(pick(item, KEYS.alertType, false))
    const rawSeverity = toStr(pick(item, KEYS.severity, false))
    const fiberId = toStr(pick(item, KEYS.fiberId, false))
    return {
      key: `${fiberId ?? 'alert'}-${rawType ?? 'unknown'}-${index}`,
      fiberId,
      type: toEnum<AlertType>(rawType, ALERT_TYPES),
      rawType,
      severity: toEnum<AlertSeverity>(rawSeverity, ALERT_SEVERITIES),
      rawSeverity,
      date: toStr(pick(item, KEYS.date)),
      reason: stringList(pick(item, KEYS.alertReason, false)).join(' · ') || stringList(pick(item, KEYS.reasons)).join(' · ') || null,
      method: normalizeMethod(pick(item, KEYS.method)),
      raw: item,
    }
  })
}
