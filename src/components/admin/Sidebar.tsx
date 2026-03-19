"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  BarChart3,
  Send,
  Settings,
  Globe,
  TrendingUp,
  Wallet,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "דשבורד", icon: LayoutDashboard },
  { href: "/admin/deals", label: "דילים", icon: ShoppingBag },
  { href: "/admin/platforms", label: "פלטפורמות", icon: Store },
  { href: "/admin/analytics", label: "אנליטיקס", icon: BarChart3 },
  { href: "/admin/telegram", label: "טלגרם", icon: Send },
  { href: "/admin/growth", label: "צמיחה", icon: TrendingUp },
  { href: "/admin/affiliate-guide", label: "אפילייט", icon: Wallet },
  { href: "/admin/settings", label: "הגדרות", icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Backdrop overlay - mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed right-0 top-0 z-50
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Logo + Close button */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-bold">פאנל ניהול</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="סגור תפריט"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 px-6 pt-2">קליקלי</p>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-400"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>צפייה באתר</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>התנתק</span>
          </button>
        </div>
      </aside>
    </>
  );
}
