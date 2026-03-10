import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="block text-sm font-medium text-[var(--text-strong)]">{children}</label>;
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-[var(--text-muted)]">{children}</p>;
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="text-sm text-[var(--danger)]">{children}</p>;
}
