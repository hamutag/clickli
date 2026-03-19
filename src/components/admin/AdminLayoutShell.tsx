"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Mobile top bar with toggle */}
      <div className="lg:hidden sticky top-0 z-30 bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 text-gray-300 hover:text-white transition-colors"
          aria-label="פתח תפריט צד"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-sm font-semibold text-white">פאנל ניהול</span>
      </div>

      <main className="lg:mr-64 p-4 md:p-6">{children}</main>
    </div>
  );
}
