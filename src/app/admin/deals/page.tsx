"use client";

import { useState, useEffect, useCallback } from "react";
import DealsTable from "@/components/admin/DealsTable";
import { RefreshCw, Download, Plus, PackagePlus } from "lucide-react";
import Link from "next/link";

export default function AdminDealsPage() {
  const [deals, setDeals] = useState([]);
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ניהול דילים</h1>
          <p className="text-gray-500 text-sm mt-1">
            אישור, דחייה ופרסום דילים
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/deals/new"
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <PackagePlus className="w-4 h-4" />
            הוסף דיל +
          </Link>
          <button
            onClick={handleBulkIngest}
            disabled={actionLoading === "ingest"}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {actionLoading === "ingest" ? "סורק..." : "סריקה חדשה"}
          </button>
          <button
            onClick={fetchDeals}
            disabled={loading}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            רענון
          </button>
          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            ייצוא
          </button>
        </div>
      </div>

      {/* Deals Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
          <p className="text-gray-400">טוען דילים...</p>
        </div>
      ) : (
        <DealsTable
          deals={deals}
          onApprove={(id) => handleAction(id, "approve")}
          onReject={(id) => handleAction(id, "reject")}
          onPublish={(id) => handleAction(id, "publish")}
        />
      )}
    </div>
  );
}
