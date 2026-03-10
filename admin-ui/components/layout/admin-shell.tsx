import type { ReactNode } from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-[1600px]">
        <SidebarNav />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
