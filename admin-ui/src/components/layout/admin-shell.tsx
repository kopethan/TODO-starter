"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/admin/entities", label: "Entities" },
  { href: "/admin/reports", label: "Reports" }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--border-default)] bg-[var(--theme-tint)] lg:block">
          <div className="px-6 py-6">
            <Link href="/admin/entities" className="text-sm font-semibold tracking-[0.18em]">TODO ADMIN</Link>
          </div>
          <nav className="space-y-1 px-3">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={cn("block rounded-xl px-3 py-2 text-sm font-medium transition", active ? "bg-[var(--theme-tint-strong)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--theme-tint-strong)] hover:text-[var(--text-primary)]")}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">
          <div className="border-b border-[var(--border-default)] bg-[var(--bg-app)] px-4 py-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Admin workspace</p>
          </div>
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
