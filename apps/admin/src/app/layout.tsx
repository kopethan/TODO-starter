import type { Metadata } from "next";
import { QueryProvider, ThemeProvider } from "@todo/ui";
import { AdminShell } from "@/components/layout/admin-shell";
import { ToastProvider } from "@/components/shared/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TODO Admin",
  description: "Internal moderation and entity management app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <AdminShell>{children}</AdminShell>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
