import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Panel } from '@/components/shared/panel'
import { Skeleton } from '@/components/shared/states'
import { LEVEL_LABEL, LEVEL_TONE } from '@/lib/labels'
import { cn } from '@/lib/utils'
import type { FiberCollection, RiskLevel } from '@/types/api'

const ORDER: RiskLevel[] = ['low', 'medium', 'high', 'failed']

export function RiskDistribution({ fibers, loading }: { fibers: FiberCollection | undefined; loading: boolean }) {
  const counts = fibers?.counts
  const classified = counts ? ORDER.reduce((sum, level) => sum + counts[level], 0) : 0
  const max = counts ? Math.max(1, ...ORDER.map((level) => counts[level])) : 1

  return (
    <Panel
      title="Risk distribution"
      description={
        fibers
          ? `${classified.toLocaleString('en-US')} classified fibers · ${fibers.countsSource === 'api' ? 'counts reported by API' : 'computed from the complete dataset'}`
          : 'Fibers by current classification'
      }
      bodyClassName="p-5"
    >
      {!counts && loading ? (
        <div className="space-y-5">
          {ORDER.map((level) => (
            <Skeleton key={level} className="h-9 w-full" />
          ))}
        </div>
      ) : counts ? (
        <>
          <div className="mb-6 flex h-2 w-full overflow-hidden rounded-full bg-elevated" role="img" aria-label={ORDER.map((l) => `${LEVEL_LABEL[l]}: ${counts[l]}`).join(', ')}>
            {ORDER.map((level) =>
              counts[level] > 0 ? (
                <div key={level} className={cn('h-full transition-[width] duration-700', LEVEL_TONE[level].fill)} style={{ width: `${(counts[level] / Math.max(classified, 1)) * 100}%` }} />
              ) : null,
            )}
          </div>
          <ul className="space-y-1">
            {ORDER.map((level) => {
              const count = counts[level]
              const pct = classified > 0 ? (count / classified) * 100 : 0
              return (
                <li key={level}>
                  <Link
                    href={`/fibers?level=${level}`}
                    className="group grid grid-cols-[7.5rem_1fr_auto] items-center gap-4 rounded-md px-2 py-2 transition-colors hover:bg-elevated/60"
                    title={`${LEVEL_LABEL[level]}: ${count} fibers (${pct.toFixed(1)}%)`}
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <span className={cn('size-2 rounded-sm', LEVEL_TONE[level].fill)} aria-hidden />
                      {LEVEL_LABEL[level]}
                    </span>
                    <span className="relative h-1.5 overflow-hidden rounded-full bg-elevated">
                      <span
                        className={cn('absolute inset-y-0 left-0 rounded-full transition-[width] duration-700', LEVEL_TONE[level].fill)}
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </span>
                    <span className="flex items-center gap-3 text-right">
                      <span className="w-10 text-sm font-semibold tabular">{count.toLocaleString('en-US')}</span>
                      <span className="w-12 text-xs text-muted-foreground tabular">{pct.toFixed(1)}%</span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Distribution unavailable.</p>
      )}
    </Panel>
  )
}
