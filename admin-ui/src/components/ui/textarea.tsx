import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn("min-h-28 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--theme-500)]", className)} {...props} />;
});
