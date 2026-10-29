'use client'

import { FlaskConical, ShieldQuestion } from 'lucide-react'
import { useMeta } from '@/lib/api/hooks'

export function EnvironmentBanner() {
  const { data: meta, error, isLoading } = useMeta()

  if (isLoading && !meta) {
    return (
      <div role="status" className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground" aria-hidden />
        Verifying data source…
      </div>
    )
  }

  if (error || !meta || meta.environment === 'unverified') {
    return (
      <div role="alert" className="flex items-start gap-3 rounded-lg border border-risk-failed/30 bg-risk-failed/[0.06] px-4 py-3">
        <ShieldQuestion className="mt-0.5 size-4 shrink-0 text-risk-failed" aria-hidden />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-foreground">Data source not verified</p>
          <p className="text-pretty text-muted-foreground">
            {error
              ? 'Environment metadata could not be retrieved from GET /meta. Do not treat the values shown as measurements from a real network.'
              : 'GET /meta did not state whether the data is simulated or real. Treat the values shown as unverified.'}
          </p>
        </div>
      </div>
    )
  }

  if (meta.environment !== 'simulated') return null

  return (
    <div role="note" className="relative flex items-start gap-3 overflow-hidden rounded-lg border border-risk-medium/25 bg-gradient-to-r from-risk-medium/[0.08] via-risk-medium/[0.04] to-transparent px-4 py-3">
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-risk-medium" aria-hidden />
      <div className="text-xs leading-relaxed">
        <p className="font-semibold text-foreground">
          Simulation Environment
          {meta.dataSource && <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-wider text-risk-medium">source: {meta.dataSource}</span>}
        </p>
        <p className="text-pretty text-muted-foreground">
          {meta.notice ??
            'Measurements and predictive assessments are generated from synthetic data and do not represent the live condition of a real optical fiber network.'}
        </p>
      </div>
    </div>
  )
}
