"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  BarChart3,
  Send,
  Settings,
  Globe,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "דשבורד", icon: LayoutDashboard },
  { href: "/admin/deals", label: "דילים", icon: ShoppingBag },
  { href: "/admin/platforms", label: "פלטפורמות", icon: Store },
  { href: "/admin/analytics", label: "אנליטיקס", icon: BarChart3 },
  { href: "/admin/telegram", label: "טלגרם", icon: Send },
  { href: "/admin/growth", label: "צמיחה", icon: TrendingUp },
  { href: "/admin/settings", label: "הגדרות", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed right-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Link href="/admin" className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-400" />
          <span className="text-lg font-bold">פאנל ניהול</span>
        </Link>
        <p className="text-xs text-gray-400 mt-1">קליקלי</p>
      </div>

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
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>צפייה באתר</span>
        </Link>
      </div>
    </aside>
  );
}
