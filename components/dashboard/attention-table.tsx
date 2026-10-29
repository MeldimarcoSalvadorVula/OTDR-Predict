import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Panel } from '@/components/shared/panel'
import { EventLabel, MethodBadge, StatusBadge } from '@/components/shared/badges'
import { EmptyState, Skeleton } from '@/components/shared/states'
import { RiskValue } from '@/components/shared/risk-value'
import { LEVEL_PRIORITY } from '@/lib/labels'
import type { Fiber } from '@/types/api'

export function prioritizeFibers(fibers: Fiber[]) {
  return fibers
    .filter((f) => f.level === 'failed' || f.level === 'high' || f.level === 'medium')
    .sort((a, b) => {
      const byLevel = LEVEL_PRIORITY[a.level!] - LEVEL_PRIORITY[b.level!]
      if (byLevel !== 0) return byLevel
      return (b.score ?? -Infinity) - (a.score ?? -Infinity)
    })
}

export function AttentionTable({ fibers, loading }: { fibers: Fiber[] | undefined; loading: boolean }) {
  const priority = fibers ? prioritizeFibers(fibers) : []
  const rows = priority.slice(0, 8)

  return (
    <Panel
      title="Fibers requiring attention"
      description={fibers ? `${priority.length} fibers classified failed, high or medium` : 'Failures first, then high and medium risk'}
      action={
        <Link href="/fibers?level=attention" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          View all <ArrowRight className="size-3" aria-hidden />
        </Link>
      }
    >
      {loading && !fibers ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No fibers require attention" description="No fiber is currently classified as failed, high or medium risk." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-5 py-2.5 font-normal">Fiber</th>
                <th scope="col" className="px-3 py-2.5 font-normal">Status</th>
                <th scope="col" className="px-3 py-2.5 font-normal">Dominant event</th>
                <th scope="col" className="px-3 py-2.5 font-normal">Method</th>
                <th scope="col" className="px-3 py-2.5 text-right font-normal">Risk</th>
                <th scope="col" className="w-10 px-5 py-2.5"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((fiber) => (
                <tr key={fiber.id} className="group border-b border-border/40 transition-colors last:border-0 hover:bg-elevated/40">
                  <td className="px-5 py-2.5">
                    <Link href={`/fibers/${encodeURIComponent(fiber.id)}`} className="font-mono font-medium hover:text-primary">
                      {fiber.id}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5"><StatusBadge level={fiber.level} raw={fiber.rawLevel} /></td>
                  <td className="px-3 py-2.5 text-muted-foreground"><EventLabel type={fiber.eventType} /></td>
                  <td className="px-3 py-2.5"><MethodBadge method={fiber.method} raw={fiber.rawMethod} /></td>
                  <td className="px-3 py-2.5 text-right"><RiskValue score={fiber.score} method={fiber.method} level={fiber.level} /></td>
                  <td className="px-5 py-2.5 text-right">
                    <Link href={`/fibers/${encodeURIComponent(fiber.id)}`} aria-label={`Open fiber ${fiber.id}`} className="inline-flex text-muted-foreground hover:text-primary">
                      <ChevronRight className="size-4" aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}
