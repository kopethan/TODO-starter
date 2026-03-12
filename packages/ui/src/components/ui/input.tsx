import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl bg-[var(--bg-search)] px-4 text-sm text-[var(--text-primary)] shadow-[var(--input-shadow)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--theme-500)_16%,transparent)]",
        className
      )}
      {...props}
    />
  );
});
