import { AlertOctagon, Brain, Cpu, ShieldAlert, Circle, TriangleAlert, OctagonAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LEVEL_LABEL, LEVEL_TONE, METHOD_LABEL, SEVERITY_LABEL, eventLabel } from '@/lib/labels'
import type { AlertSeverity, RiskLevel, RiskMethod } from '@/types/api'

const LEVEL_ICON: Record<RiskLevel, typeof Circle> = {
  low: Circle,
  medium: TriangleAlert,
  high: OctagonAlert,
  failed: AlertOctagon,
}

export function StatusBadge({ level, raw, className }: { level: RiskLevel | null; raw?: string | null; className?: string }) {
  if (!level) {
    return (
      <span className={cn('inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground', className)}>
        {raw ?? 'Unknown'}
      </span>
    )
  }
  const tone = LEVEL_TONE[level]
  const Icon = LEVEL_ICON[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium',
        tone.text,
        tone.bg,
        tone.border,
        className,
      )}
    >
      <Icon className={cn('size-3', level === 'low' && 'fill-current')} aria-hidden />
      {LEVEL_LABEL[level]}
    </span>
  )
}

export function MethodBadge({ method, raw, className }: { method: RiskMethod | null; raw?: string | null; className?: string }) {
  if (!method) return <span className={cn('text-xs text-muted-foreground', className)}>{raw ?? '—'}</span>
  const isAi = method === 'ml_model'
  const Icon = isAi ? Brain : Cpu
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide',
        isAi ? 'bg-violet/10 text-violet' : 'bg-signal/10 text-signal',
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {METHOD_LABEL[method]}
    </span>
  )
}

const SEVERITY_TONE: Record<AlertSeverity, string> = {
  critical: 'text-risk-failed bg-risk-failed/12 border-risk-failed/40',
  high: 'text-risk-high bg-risk-high/10 border-risk-high/30',
  medium: 'text-risk-medium bg-risk-medium/10 border-risk-medium/30',
}

export function SeverityBadge({ severity, raw }: { severity: AlertSeverity | null; raw?: string | null }) {
  if (!severity) {
    return <span className="text-xs text-muted-foreground">{raw ?? 'Not assigned'}</span>
  }
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', SEVERITY_TONE[severity])}>
      {SEVERITY_LABEL[severity]}
    </span>
  )
}

export function EventLabel({ type, className }: { type: string | null; className?: string }) {
  const label = eventLabel(type)
  if (!label) return <span className={cn('text-muted-foreground', className)}>—</span>
  const isTapping = type === 'fiber_tapping'
  const isCut = type === 'fiber_cut'
  return (
    <span className={cn('inline-flex items-center gap-1.5', isTapping && 'text-violet', isCut && 'text-risk-failed', className)}>
      {isTapping && <ShieldAlert className="size-3.5" aria-hidden />}
      {label}
    </span>
  )
}
