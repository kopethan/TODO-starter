"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-app)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold tracking-[0.18em]">TODO</Link>
          <form action="/" className="hidden flex-1 md:block">
            <Input name="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entities, services, or situations" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/reports"><Button variant="ghost">Reports</Button></Link>
            <Button variant="ghost" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{resolvedTheme === "dark" ? "Light" : "Dark"}</Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
