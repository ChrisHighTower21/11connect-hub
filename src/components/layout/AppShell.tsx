"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  useEffect(() => {
    closeSidebar();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="app-shell">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={openSidebar}
        aria-label="Navigation öffnen"
        aria-expanded={isSidebarOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        className={`mobile-sidebar-backdrop ${
          isSidebarOpen ? "mobile-sidebar-backdrop--visible" : ""
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <div
        className={`sidebar-wrapper ${
          isSidebarOpen ? "sidebar-wrapper--open" : ""
        }`}
      >
        <button
          type="button"
          className="mobile-menu-close"
          onClick={closeSidebar}
          aria-label="Navigation schließen"
        >
          ×
        </button>

        <Sidebar />
      </div>

      <main className="main">{children}</main>
    </div>
  );
}