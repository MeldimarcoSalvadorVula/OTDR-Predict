import type { RiskLevel, RiskMethod } from '@/types/api'

export const UNAVAILABLE = '—'

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value)
  return Number.isNaN(date.getTime()) ? null : date
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

export function formatDate(value: string | null | undefined) {
  const date = parseDate(value)
  return date ? dateFormatter.format(date) : value ?? UNAVAILABLE
}

export function formatShortDate(value: number | string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : shortDateFormatter.format(date)
}

export function formatNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return UNAVAILABLE
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function formatWithUnit(value: number | null | undefined, unit: string, digits = 2) {
  const formatted = formatNumber(value, digits)
  return formatted === UNAVAILABLE ? UNAVAILABLE : `${formatted} ${unit}`
}

export function formatInteger(value: number | null | undefined) {
  return formatNumber(value, 0)
}

export interface FormattedScore {
  value: string
  kind: 'probability' | 'index' | 'observed' | 'unavailable'
  label: string
}

/**
 * Probability (ml_model, 0–1) is rendered as a percentage; a rules index is never rendered with
 * a percent sign; a confirmed failure never shows a forward-looking estimate.
 */
export function formatScore(score: number | null, method: RiskMethod | null, level: RiskLevel | null): FormattedScore {
  if (level === 'failed') return { value: 'Observed', kind: 'observed', label: 'Confirmed failure' }
  if (score === null) return { value: UNAVAILABLE, kind: 'unavailable', label: 'Score unavailable' }
  if (method === 'ml_model' && score >= 0 && score <= 1) {
    return { value: `${Math.round(score * 100)}%`, kind: 'probability', label: '7-day failure probability' }
  }
  return { value: score.toFixed(2), kind: 'index', label: 'Risk index' }
}

export function humanizeKey(key: string) {
  return key
    .replace(/_(db|m|ns|pct)$/i, '')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function unitForKey(key: string): string {
  if (/_db_per_day$/i.test(key)) return 'dB/day'
  if (/_db$/i.test(key)) return 'dB'
  if (/_ns$/i.test(key)) return 'ns'
  if (/_m$/i.test(key)) return 'm'
  if (/days?$/i.test(key)) return 'days'
  return ''
}
