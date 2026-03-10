import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TableWrapper({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">{children}</div>;
}

export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return <table className={cn("min-w-full divide-y divide-[var(--border)]", className)}>{children}</table>;
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-soft)]", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-top text-sm text-[var(--text)]", className)}>{children}</td>;
}
