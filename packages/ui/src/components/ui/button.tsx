import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "secondary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "border-[var(--button-primary-bg)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]",
        variant === "secondary" && "border-[var(--border-default)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]",
        variant === "ghost" && "border-transparent bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]",
        variant === "danger" && "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)] hover:opacity-90",
        className
      )}
      {...props}
    />
  );
});
