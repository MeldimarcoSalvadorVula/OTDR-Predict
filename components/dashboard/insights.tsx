import { Brain, ShieldAlert, Waypoints } from 'lucide-react'
import { Panel } from '@/components/shared/panel'
import { eventLabel } from '@/lib/labels'
import type { Alert, Fiber } from '@/types/api'

interface Insight {
  icon: typeof Brain
  tone: string
  title: string
  body: string
}

export function Insights({ fibers, alerts }: { fibers: Fiber[] | undefined; alerts: Alert[] | undefined }) {
  const insights: Insight[] = []

  if (fibers) {
    const elevated = fibers.filter((f) => f.level === 'high' || f.level === 'medium')
    const byEvent = new Map<string, number>()
    for (const f of elevated) if (f.eventType && f.eventType !== 'normal') byEvent.set(f.eventType, (byEvent.get(f.eventType) ?? 0) + 1)
    const top = [...byEvent.entries()].sort((a, b) => b[1] - a[1])[0]
    if (top) {
      insights.push({
        icon: Waypoints,
        tone: 'text-risk-high',
        title: `${eventLabel(top[0])} dominates elevated risk`,
        body: `${top[1]} of ${elevated.length} medium- or high-risk fibers report ${eventLabel(top[0])?.toLowerCase()} as their dominant event.`,
      })
    }

    const ai = fibers.filter((f) => f.method === 'ml_model').length
    const rules = fibers.filter((f) => f.method === 'rules').length
    if (ai + rules > 0) {
      insights.push({
        icon: Brain,
        tone: 'text-violet',
        title: 'Assessment methods in use',
        body: `${ai} fibers are scored by the AI model (7-day probability) and ${rules} by the rules engine (risk index). The two scores are not directly comparable.`,
      })
    }
  }

  if (alerts) {
    const tapping = alerts.filter((a) => a.type === 'tapping').length
    if (tapping > 0) {
      insights.push({
        icon: ShieldAlert,
        tone: 'text-violet',
        title: `${tapping} possible tapping ${tapping === 1 ? 'event' : 'events'}`,
        body: 'Flagged as security-relevant rather than degradation. Review the affected fibers for unauthorized access.',
      })
    }
  }

  if (insights.length === 0) return null

  return (
    <Panel title="Operational insights" description="Derived only from the current API responses" bodyClassName="grid gap-px bg-border/50 sm:grid-cols-2 xl:grid-cols-3 rounded-b-xl overflow-hidden">
      {insights.map((insight) => (
        <div key={insight.title} className="flex gap-3 bg-card p-5">
          <insight.icon className={`mt-0.5 size-4 shrink-0 ${insight.tone}`} aria-hidden />
          <div>
            <p className="text-sm font-medium">{insight.title}</p>
            <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">{insight.body}</p>
          </div>
        </div>
      ))}
    </Panel>
  )
}
