import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider, ThemeProvider } from "@todo/ui";
import { PublicShell } from "@/components/layout/public-shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TODO Web",
  description: "Public trust-aware web app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <PublicShell>{children}</PublicShell>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
