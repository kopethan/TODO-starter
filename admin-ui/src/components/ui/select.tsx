import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return <select ref={ref} className={cn("h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm outline-none focus:border-[var(--theme-500)]", className)} {...props}>{children}</select>;
});
