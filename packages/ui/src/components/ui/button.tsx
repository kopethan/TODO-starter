import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "secondary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-medium shadow-[var(--button-secondary-shadow)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-[0_12px_24px_rgba(15,23,32,0.16)] hover:bg-[var(--button-primary-hover)] dark:shadow-[0_14px_28px_rgba(0,0,0,0.32)]",
        variant === "secondary" && "bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]",
        variant === "ghost" && "bg-transparent text-[var(--text-primary)] shadow-none hover:bg-[color-mix(in_srgb,var(--bg-surface-muted)_85%,transparent)]",
        variant === "danger" && "bg-[var(--danger-bg)] text-[var(--danger-text)] shadow-none hover:opacity-90",
        className
      )}
      {...props}
    />
  );
});
