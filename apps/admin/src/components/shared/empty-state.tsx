import { Button, Card } from "@todo/ui";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-muted)] p-8 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--text-secondary)]">{description}</p>
      {actionLabel && onAction ? (
        <div className="mt-5">
          <Button type="button" variant="secondary" onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </Card>
  );
}
