'use client'

import { useAlerts, useFibers, useMeta } from '@/lib/api/hooks'
import { formatDate } from '@/lib/formatters'
import { PageHeader, MetaChip } from '@/components/shared/panel'
import { ErrorState, FIRST_LOAD_HINT, SignalLoader } from '@/components/shared/states'
import { KpiGrid } from './kpi-grid'
import { RiskDistribution } from './risk-distribution'
import { AlertsPreview } from './alerts-preview'
import { AttentionTable } from './attention-table'
import { Insights } from './insights'

export function Overview() {
  const meta = useMeta()
  const fibers = useFibers()
  const alerts = useAlerts()
  const asOf = meta.data?.asOf ?? fibers.data?.asOf ?? null

  return (
    <>
      <PageHeader
        eyebrow="Network overview"
        title="Optical network status"
        description="Current classification of every monitored fiber, active operational alerts and the fibers that need investigation first."
      >
        <MetaChip label="As of" value={asOf ? formatDate(asOf) : '—'} />
      </PageHeader>

      {fibers.isLoading && !fibers.data && (
        <div className="surface-card rounded-xl">
          <SignalLoader label="Loading fiber dataset" hint={FIRST_LOAD_HINT} />
        </div>
      )}

      {fibers.error && !fibers.data ? (
        <div className="surface-card rounded-xl">
          <ErrorState error={fibers.error} onRetry={() => fibers.mutate()} title="Fiber dataset unavailable" />
        </div>
      ) : (
        <KpiGrid fibers={fibers.data} alertCount={alerts.data ? alerts.data.length : null} fibersLoading={fibers.isLoading} alertsLoading={alerts.isLoading} />
      )}

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <RiskDistribution fibers={fibers.data} loading={fibers.isLoading} />
        </div>
        <div className="xl:col-span-3">
          <AlertsPreview alerts={alerts.data} error={alerts.error} loading={alerts.isLoading} onRetry={() => alerts.mutate()} />
        </div>
      </div>

      <AttentionTable fibers={fibers.data?.fibers} loading={fibers.isLoading} />
      <Insights fibers={fibers.data?.fibers} alerts={alerts.data} />
    </>
  )
}
