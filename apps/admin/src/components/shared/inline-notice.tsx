import { cn } from "@todo/ui";

const toneClassName = {
  neutral: "border-[var(--border-default)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]",
  info: "border-[var(--info-border)] bg-[var(--info-bg)] text-[var(--info-text)]",
  success: "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]",
  warning: "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]",
  danger: "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]"
} as const;

export function InlineNotice({
  title,
  description,
  tone = "neutral",
  className
}: {
  title: string;
  description?: string;
  tone?: keyof typeof toneClassName;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border px-4 py-3", toneClassName[tone], className)}>
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 text-sm opacity-90">{description}</p> : null}
    </div>
  );
}
