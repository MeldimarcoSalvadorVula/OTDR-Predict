import { formatScore } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { RiskLevel, RiskMethod } from '@/types/api'

export function RiskValue({ score, method, level, className }: { score: number | null; method: RiskMethod | null; level: RiskLevel | null; className?: string }) {
  const formatted = formatScore(score, method, level)
  return (
    <span className={cn('inline-flex flex-col items-end leading-tight', className)} title={formatted.label}>
      <span className={cn('font-mono text-sm font-medium tabular', formatted.kind === 'observed' && 'text-risk-failed', formatted.kind === 'unavailable' && 'text-muted-foreground')}>
        {formatted.value}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {formatted.kind === 'probability' ? '7-day prob.' : formatted.kind === 'index' ? 'index' : formatted.kind === 'observed' ? 'confirmed' : ''}
      </span>
    </span>
  )
}
