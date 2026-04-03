import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("h-10 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-search)] px-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--theme-500)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--theme-500)_12%,transparent)]", className)} {...props} />;
});
