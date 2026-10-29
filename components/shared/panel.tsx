import { cn } from '@/lib/utils'

export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <div className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">{description}</div>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </header>
  )
}

export function Panel({ title, description, action, children, className, bodyClassName, id }: {
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  id?: string
}) {
  return (
    <section aria-labelledby={title && id ? id : undefined} className={cn('surface-card flex min-w-0 flex-col rounded-xl', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 id={id} className="text-sm font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-pretty text-xs leading-relaxed text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('min-w-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  )
}

export function MetaChip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-2.5 py-1.5 text-xs">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  )
}
