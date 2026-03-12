import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-2xl bg-[var(--bg-search)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-[var(--input-shadow)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--theme-500)_16%,transparent)]",
        className
      )}
      {...props}
    />
  );
});
