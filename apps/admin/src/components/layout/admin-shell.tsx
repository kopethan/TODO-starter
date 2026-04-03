"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@todo/ui";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const items = [
  { href: "/entities", label: "Entities" },
  { href: "/reports", label: "Reports" },
  { href: "/reports/queue", label: "Moderation queue" }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <div className="grid min-h-screen lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-[var(--border-default)] bg-[var(--theme-tint)] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-5 lg:block">
            <div>
              <Link href="/entities" className="text-sm font-semibold tracking-[0.18em] text-[var(--text-primary)]">
                TODO ADMIN
              </Link>
              <p className="mt-1 hidden text-sm text-[var(--text-secondary)] lg:block">
                Canonical editing and trust review.
              </p>
            </div>
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:px-3 lg:pb-0">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-[var(--theme-tint-strong)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--theme-tint-strong)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">
          <header className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-app)] px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Admin workspace</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Entities, reports, and moderation queue.</p>
            </div>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </header>
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
