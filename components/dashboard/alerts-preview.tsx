import Link from 'next/link'
import { AlertOctagon, ArrowRight, ChevronRight, OctagonAlert, ShieldAlert, TriangleAlert } from 'lucide-react'
import { Panel } from '@/components/shared/panel'
import { MethodBadge, SeverityBadge } from '@/components/shared/badges'
import { EmptyState, ErrorState, Skeleton } from '@/components/shared/states'
import { alertPriority, alertTypeLabel } from '@/lib/labels'
import { formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { Alert, AlertType } from '@/types/api'

export const ALERT_ICON: Record<AlertType, { icon: typeof AlertOctagon; tone: string }> = {
  failure: { icon: AlertOctagon, tone: 'text-risk-failed bg-risk-failed/10 border-risk-failed/30' },
  high_risk: { icon: OctagonAlert, tone: 'text-risk-high bg-risk-high/10 border-risk-high/30' },
  medium_risk: { icon: TriangleAlert, tone: 'text-risk-medium bg-risk-medium/10 border-risk-medium/30' },
  tapping: { icon: ShieldAlert, tone: 'text-violet bg-violet/10 border-violet/30' },
}

export function AlertIcon({ type }: { type: AlertType | null }) {
  const config = type ? ALERT_ICON[type] : { icon: TriangleAlert, tone: 'text-muted-foreground bg-elevated border-border' }
  const Icon = config.icon
  return (
    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md border', config.tone)}>
      <Icon className="size-4" aria-hidden />
    </span>
  )
}

export function AlertsPreview({ alerts, error, loading, onRetry }: { alerts: Alert[] | undefined; error: unknown; loading: boolean; onRetry: () => void }) {
  const top = alerts ? [...alerts].sort((a, b) => alertPriority(a) - alertPriority(b)).slice(0, 6) : []

  return (
    <Panel
      title="Operational alerts"
      description={alerts ? `${alerts.length} active · highest priority first` : 'Active events from the recent measurement window'}
      action={
        <Link href="/alerts" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Alert center <ArrowRight className="size-3" aria-hidden />
        </Link>
      }
    >
      {error && !alerts ? (
        <ErrorState error={error} onRetry={onRetry} compact />
      ) : loading && !alerts ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : top.length === 0 ? (
        <EmptyState title="No active alerts" description="An empty alert list covers only the recent window; it does not mean no fiber has ever failed." />
      ) : (
        <ul className="divide-y divide-border/70">
          {top.map((alert) => {
            const content = (
              <>
                <AlertIcon type={alert.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-mono text-sm font-medium">{alert.fiberId ?? 'Unknown fiber'}</span>
                    <span className="text-sm text-muted-foreground">{alertTypeLabel(alert)}</span>
                    {alert.severity && <SeverityBadge severity={alert.severity} />}
                    {alert.method && <MethodBadge method={alert.method} />}
                  </div>
                  {alert.reason && <p className="mt-1 line-clamp-2 text-pretty text-xs leading-relaxed text-muted-foreground">{alert.reason}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground tabular">
                  {alert.date && <span className="hidden sm:inline">{formatDate(alert.date)}</span>}
                  {alert.fiberId && <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />}
                </div>
              </>
            )
            return (
              <li key={alert.key}>
                {alert.fiberId ? (
                  <Link href={`/fibers/${encodeURIComponent(alert.fiberId)}`} className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-elevated/40">
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 px-5 py-3.5">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
