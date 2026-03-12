import { cn } from "../../lib/cn";

export function Badge({ className, tone = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "theme" | "success" | "warning" | "danger" | "info" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-[inset_0_0_0_1px_rgba(15,23,32,0.04)] dark:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]",
        tone === "default" && "bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]",
        tone === "theme" && "bg-[var(--theme-tint)] text-[var(--theme-700)]",
        tone === "success" && "bg-[var(--success-bg)] text-[var(--success-text)]",
        tone === "warning" && "bg-[var(--warning-bg)] text-[var(--warning-text)]",
        tone === "danger" && "bg-[var(--danger-bg)] text-[var(--danger-text)]",
        tone === "info" && "bg-[var(--info-bg)] text-[var(--info-text)]",
        className
      )}
      {...props}
    />
  );
}
