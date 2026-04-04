"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { PublicToolDock } from "./public-tool-dock";

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-32 sm:pb-36">
      <header className="sticky top-0 z-40 bg-[var(--header-surface)] text-[var(--header-text)] shadow-[0_14px_30px_rgba(0,0,0,0.18)]">
        <div className="mx-auto flex max-w-[64rem] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/[0.1]"
          >
            TODO
          </Link>

          <nav className="ml-auto flex items-center gap-2">
            <HeaderLink href="/" active={pathname === "/"}>Feed</HeaderLink>
            <HeaderLink href="/reports" active={pathname?.startsWith("/reports")}>Reports</HeaderLink>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-full bg-white/[0.08] px-4 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? "Light" : "Dark"}
            </button>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <PublicToolDock />
    </div>
  );
}

function HeaderLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition",
        active ? "bg-white/[0.12] text-white" : "text-[var(--header-muted)] hover:bg-white/[0.08] hover:text-white"
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
