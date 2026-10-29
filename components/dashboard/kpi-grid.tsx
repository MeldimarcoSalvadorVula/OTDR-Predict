import Link from 'next/link'
import { AlertOctagon, BellRing, Cable, Circle, OctagonAlert, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/shared/states'
import type { FiberCollection } from '@/types/api'

interface Kpi {
  label: string
  value: number | null
  hint: string
  icon: typeof Cable
  tone: string
  accent?: boolean
  href?: string
}

export function KpiGrid({ fibers, alertCount, fibersLoading, alertsLoading }: {
  fibers: FiberCollection | undefined
  alertCount: number | null
  fibersLoading: boolean
  alertsLoading: boolean
}) {
  const counts = fibers?.counts
  const items: Kpi[] = [
    { label: 'Total Fibers', value: fibers ? fibers.total : null, hint: 'Known fibers in dataset', icon: Cable, tone: 'text-primary', href: '/fibers' },
    { label: 'Low Risk', value: counts?.low ?? null, hint: 'Operating normally', icon: Circle, tone: 'text-risk-low', href: '/fibers?level=low' },
    { label: 'Medium Risk', value: counts?.medium ?? null, hint: 'Monitor closely', icon: TriangleAlert, tone: 'text-risk-medium', href: '/fibers?level=medium' },
    { label: 'High Risk', value: counts?.high ?? null, hint: 'Investigate soon', icon: OctagonAlert, tone: 'text-risk-high', href: '/fibers?level=high', accent: true },
    { label: 'Confirmed Failures', value: counts?.failed ?? null, hint: 'Classified as failed', icon: AlertOctagon, tone: 'text-risk-failed', href: '/fibers?level=failed', accent: true },
    { label: 'Active Alerts', value: alertCount, hint: 'Recent measurement window', icon: BellRing, tone: 'text-signal', href: '/alerts' },
  ]

  return (
    <section aria-label="Network indicators" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => {
        const loading = item.label === 'Active Alerts' ? alertsLoading : fibersLoading
        const Icon = item.icon
        const emphasise = item.accent && (item.value ?? 0) > 0
        const body = (
          <>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</span>
              <Icon className={cn('size-3.5', item.tone)} aria-hidden />
            </div>
            {loading && item.value === null ? (
              <Skeleton className="mt-4 h-8 w-16" />
            ) : (
              <p className={cn('mt-3 text-3xl font-semibold tracking-tight tabular', emphasise ? item.tone : 'text-foreground')}>
                {item.value === null ? '—' : item.value.toLocaleString('en-US')}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
            <span
              aria-hidden
              className={cn('absolute inset-x-4 bottom-0 h-px opacity-0 transition-opacity group-hover:opacity-100', item.tone.replace('text-', 'bg-'))}
            />
          </>
        )
        return (
          <Link
            key={item.label}
            href={item.href ?? '#'}
            className={cn(
              'surface-card group relative overflow-hidden rounded-xl p-4 transition-colors hover:border-primary/30',
              emphasise && item.label === 'Confirmed Failures' && 'border-risk-failed/30',
            )}
          >
            {body}
          </Link>
        )
      })}
    </section>
  )
}
