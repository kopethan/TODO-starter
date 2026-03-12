"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-20 sm:pb-0">
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

      <nav className="fixed inset-x-0 bottom-0 z-40 bg-[color-mix(in_srgb,var(--bg-app)_94%,transparent)] px-4 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-2 rounded-full bg-[var(--bg-surface)] px-2 py-2 shadow-[var(--shadow-card)] dark:bg-[var(--bg-surface-muted)]">
          <MobileNavLink href="/" active={pathname === "/"}>Feed</MobileNavLink>
          <MobileNavLink href="/reports" active={pathname?.startsWith("/reports")}>Reports</MobileNavLink>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-medium text-[var(--text-secondary)]"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Search
          </button>
        </div>
      </nav>
    </div>
  );
}

function HeaderLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
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

function MobileNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        active ? "bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-[0_10px_24px_rgba(15,23,32,0.12)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]" : "text-[var(--text-secondary)]"
      }`}
    >
      {children}
    </Link>
  );
}
