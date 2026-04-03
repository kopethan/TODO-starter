import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return <select ref={ref} className={cn("h-10 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-search)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--theme-500)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--theme-500)_12%,transparent)]", className)} {...props}>{children}</select>;
});
