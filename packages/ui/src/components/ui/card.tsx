import { cn } from "../../lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)]", className)} {...props} />;
}
