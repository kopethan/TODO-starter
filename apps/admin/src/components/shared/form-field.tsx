import { cn } from "@todo/ui";

export function FormField({
  label,
  hint,
  error,
  className,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)]">{label}</label>
        {hint ? <p className="mt-1 text-xs text-[var(--text-secondary)]">{hint}</p> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}
    </div>
  );
}
