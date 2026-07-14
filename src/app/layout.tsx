import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "11connect Hub",
  description: "Statistik- und Managementplattform für EA FC Clubs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}