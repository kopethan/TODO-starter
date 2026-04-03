export function KeyValueList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1 border-b border-[var(--border-default)] pb-3 last:border-b-0 last:pb-0">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">{item.label}</dt>
          <dd className="text-sm text-[var(--text-primary)]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
