import { cn } from "@/lib/utils/cn";

export function Badge({ className, tone = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "theme" | "success" | "warning" | "danger" | "info" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "default" && "border-[var(--border-default)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]",
        tone === "theme" && "border-[var(--theme-tint-strong)] bg-[var(--theme-tint)] text-[var(--theme-700)] dark:text-[var(--text-secondary)]",
        tone === "success" && "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]",
        tone === "warning" && "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]",
        tone === "danger" && "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]",
        tone === "info" && "border-[var(--info-border)] bg-[var(--info-bg)] text-[var(--info-text)]",
        className
      )}
      {...props}
    />
  );
}
