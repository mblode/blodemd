import type { Metadata } from "next";
import { DM_Serif_Display, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import { DashboardShell } from "@/components/dashboard-shell";

const bodyFont = Sora({
  subsets: ["latin"],
  variable: "--font-body",
});

const headingFont = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Atlas Dashboard",
  description: "Manage tenants, domains, and deployments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${headingFont.variable} ${monoFont.variable}`}
      >
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
