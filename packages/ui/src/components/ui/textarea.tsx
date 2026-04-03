import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn("min-h-28 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-search)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--theme-500)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--theme-500)_12%,transparent)]", className)} {...props} />;
});
