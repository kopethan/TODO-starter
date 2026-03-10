import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ className, variant = "secondary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--text-inverse)]",
        variant === "secondary" && "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]",
        variant === "ghost" && "border-transparent bg-transparent text-[var(--text-primary)] hover:bg-[var(--theme-tint)]",
        variant === "danger" && "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]",
        className
      )}
      {...props}
    />
  );
});
