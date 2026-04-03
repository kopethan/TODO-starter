import { Card, cn } from "@todo/ui";

export function StatGrid({ items, className }: { items: { label: string; value: React.ReactNode; hint?: string }[]; className?: string }) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item) => (
        <Card key={item.label} className="border border-[var(--border-default)] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">{item.label}</p>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</div>
          {item.hint ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.hint}</p> : null}
        </Card>
      ))}
    </div>
  );
}
