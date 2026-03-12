import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider, ThemeProvider } from "@todo/ui";
import { AdminShell } from "@/components/layout/admin-shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TODO Admin",
  description: "Internal moderation and entity management app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <AdminShell>{children}</AdminShell>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
