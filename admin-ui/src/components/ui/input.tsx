import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--theme-500)]", className)} {...props} />;
});
