import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl bg-[var(--bg-search)] px-4 text-sm text-[var(--text-primary)] shadow-[var(--input-shadow)] outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--theme-500)_16%,transparent)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
