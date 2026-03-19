"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import DealsTable from "@/components/admin/DealsTable";
import {
  RefreshCw,
  Download,
  PackagePlus,
  Import,
  Clock,
  CheckCircle,
  Send,
  XCircle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface Deal {
  id: string;
  titleEn: string;
  titleHe: string | null;
  priceCurrent: number;
  priceOriginal: number;
  priceILS: number | null;
  shippingFree: boolean;
  rating: number | null;
  reviewCount: number;
  score: number;
  status: string;
  isPublished: boolean;
  imageUrl: string | null;
  couponCode: string | null;
  store: { name: string; platform: string };
  category: { nameHe: string } | null;
  createdAt: string;
  _count?: { clicks: number; conversions: number };
}

interface DealStats {
  total: number;
  pending: number;
  approved: number;
  published: number;
  rejected: number;
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/deals");
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const stats: DealStats = useMemo(() => {
    const result: DealStats = {
      total: deals.length,
      pending: 0,
      approved: 0,
      published: 0,
      rejected: 0,
    };
    for (const deal of deals) {
      switch (deal.status) {
        case "PENDING":
          result.pending++;
          break;
        case "APPROVED":
          result.approved++;
          break;
        case "PUBLISHED":
          result.published++;
          break;
        case "REJECTED":
          result.rejected++;
          break;
      }
    }
    return result;
  }, [deals]);

  const handleAction = async (id: string, action: "approve" | "reject" | "publish") => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/deals/${id}/${action}`, { method: "POST" });
      await fetchDeals();
    } catch (error) {
      console.error(`Failed to ${action} deal:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/deals/${id}`, { method: "DELETE" });
      await fetchDeals();
    } catch (error) {
      console.error("Failed to delete deal:", error);
    }
  };

  const handleBulkAction = async (ids: string[], action: "approve" | "publish" | "delete") => {
    setActionLoading("bulk");
    try {
      for (const id of ids) {
        if (action === "delete") {
          await fetch(`/api/admin/deals/${id}`, { method: "DELETE" });
        } else {
          await fetch(`/api/admin/deals/${id}/${action}`, { method: "POST" });
        }
      }
      await fetchDeals();
    } catch (error) {
      console.error(`Failed bulk ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkIngest = async () => {
    setActionLoading("ingest");
    try {
      const res = await fetch("/api/cron/ingest", { method: "POST" });
      const data = await res.json();
      alert(`סריקה הושלמה: ${data.totalNew} מוצרים חדשים`);
      await fetchDeals();
    } catch (error) {
      console.error("Ingest failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const statCards = [
    {
      label: "סה״כ דילים",
      value: stats.total,
      icon: BarChart3,
      color: "text-white",
      bg: "bg-gray-800",
    },
    {
      label: "ממתינים",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-900/20",
    },
    {
      label: "מאושרים",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-blue-400",
      bg: "bg-blue-900/20",
    },
    {
      label: "פורסמו",
      value: stats.published,
      icon: Send,
      color: "text-emerald-400",
      bg: "bg-emerald-900/20",
    },
    {
      label: "נדחו",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-900/20",
    },
  ];

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ניהול דילים</h1>
          <p className="text-gray-500 text-sm mt-1">
            אישור, דחייה ופרסום דילים
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/deals/new"
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <PackagePlus className="w-4 h-4" />
            הוסף דיל +
          </Link>
          <button
            onClick={handleBulkIngest}
            disabled={actionLoading === "ingest"}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Import className="w-4 h-4" />
            {actionLoading === "ingest" ? "סורק..." : "ייבא דיל"}
          </button>
          <button
            onClick={fetchDeals}
            disabled={loading}
            className="flex items-center gap-2 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            רענון
          </button>
          <button className="flex items-center gap-2 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" />
            ייצוא
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} border border-gray-800 rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Deals Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
          <p className="text-gray-500">טוען דילים...</p>
        </div>
      ) : (
        <DealsTable
          deals={deals}
          onApprove={(id) => handleAction(id, "approve")}
          onReject={(id) => handleAction(id, "reject")}
          onPublish={(id) => handleAction(id, "publish")}
          onDelete={handleDelete}
          onBulkApprove={(ids) => handleBulkAction(ids, "approve")}
          onBulkPublish={(ids) => handleBulkAction(ids, "publish")}
          onBulkDelete={(ids) => handleBulkAction(ids, "delete")}
        />
      )}
    </div>
  );
}
