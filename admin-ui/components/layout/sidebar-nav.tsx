"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { label: "Entities", href: "/entities", description: "Canonical knowledge" },
  { label: "Reports", href: "/reports", description: "Claim moderation" }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar)] lg:block">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="mb-8 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">TODO</p>
          <h1 className="text-lg font-semibold text-[var(--text-strong)]">Admin Workspace</h1>
          <p className="text-sm text-[var(--text-muted)]">Structured knowledge and report review.</p>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-2xl border px-4 py-3 transition-colors",
                  active
                    ? "border-[var(--theme-border)] bg-[var(--theme-soft)]"
                    : "border-transparent hover:border-[var(--border)] hover:bg-[var(--surface)]"
                )}
              >
                <div className="text-sm font-medium text-[var(--text-strong)]">{item.label}</div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">{item.description}</div>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)]">V1 scope</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Entities and reports only. Patterns, sources, queues, and governance modules can come later.
          </p>
        </div>
      </div>
    </aside>
  );
}
