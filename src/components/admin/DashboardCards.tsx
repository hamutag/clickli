"use client";

import {
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  Users,
  Zap,
} from "lucide-react";
import type { AdminDashboardStats } from "@/types";

interface DashboardCardsProps {
  stats: AdminDashboardStats;
}

export default function DashboardCards({ stats }: DashboardCardsProps) {
  const cards = [
    {
      label: "קליקים היום",
      value: stats.todayClicks.toLocaleString("he-IL"),
      icon: MousePointerClick,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "המרות היום",
      value: stats.todayConversions.toLocaleString("he-IL"),
      icon: ShoppingCart,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "הכנסות היום",
      value: `$${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "EPC",
      value: `$${stats.todayEPC.toFixed(3)}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      tooltip: "Earnings Per Click - הכנסה לקליק",
    },
    {
      label: "דילים פעילים",
      value: stats.activeDeals.toLocaleString("he-IL"),
      icon: Zap,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "ממתינים לאישור",
      value: stats.pendingReview.toLocaleString("he-IL"),
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "פורסמו היום",
      value: stats.publishedToday.toLocaleString("he-IL"),
      icon: Eye,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "מנויי טלגרם",
      value: stats.telegramSubscribers.toLocaleString("he-IL"),
      icon: Users,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
            title={card.tooltip}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
