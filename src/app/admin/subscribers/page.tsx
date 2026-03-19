"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, UserCheck, UserX, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface Subscriber {
  id: string;
  email: string | null;
  telegramId: string | null;
  categories: string | null;
  minScore: number;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/subscribers?page=${pageNum}&limit=50`);
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setStats(data.stats || null);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers(page);
  }, [page, fetchSubscribers]);

  function exportCSV() {
    if (subscribers.length === 0) return;

    const headers = ["ID", "Email", "Telegram ID", "Categories", "Min Score", "Active", "Created"];
    const rows = subscribers.map((s) => [
      s.id,
      s.email || "",
      s.telegramId || "",
      s.categories || "",
      s.minScore.toString(),
      s.isActive ? "Yes" : "No",
      new Date(s.createdAt).toLocaleDateString("he-IL"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscribers_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function parseCategories(cats: string | null): string[] {
    if (!cats) return [];
    try {
      return JSON.parse(cats);
    } catch {
      return [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          \u05DE\u05E0\u05D5\u05D9\u05D9\u05DD
        </h1>
        <button
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          \u05D9\u05D9\u05E6\u05D5\u05D0 CSV
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">\u05E1\u05D4\u0022\u05DB \u05DE\u05E0\u05D5\u05D9\u05D9\u05DD</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
                <p className="text-xs text-gray-400">\u05E4\u05E2\u05D9\u05DC\u05D9\u05DD</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.inactive}</p>
                <p className="text-xs text-gray-400">\u05DC\u05D0 \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {stats && Object.keys(stats.byCategory).length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            \u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <span
                  key={cat}
                  className="bg-gray-700 text-gray-300 px-3 py-1 rounded-lg text-xs"
                >
                  {cat}: {count}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Subscribers table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            \u05D8\u05D5\u05E2\u05DF...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            \u05D0\u05D9\u05DF \u05DE\u05E0\u05D5\u05D9\u05D9\u05DD \u05E2\u05D3\u05D9\u05D9\u05DF
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-right">\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC</th>
                  <th className="px-4 py-3 text-right">\u05D8\u05DC\u05D2\u05E8\u05DD</th>
                  <th className="px-4 py-3 text-right">\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA</th>
                  <th className="px-4 py-3 text-right">\u05E6\u05D9\u05D5\u05DF \u05DE\u05D9\u05E0\u05D9\u05DE\u05D5\u05DD</th>
                  <th className="px-4 py-3 text-center">\u05E1\u05D8\u05D8\u05D5\u05E1</th>
                  <th className="px-4 py-3 text-right">\u05EA\u05D0\u05E8\u05D9\u05DA \u05D4\u05E8\u05E9\u05DE\u05D4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-white" dir="ltr">
                      {sub.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-300" dir="ltr">
                      {sub.telegramId || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {parseCategories(sub.categories).map((cat) => (
                          <span
                            key={cat}
                            className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs"
                          >
                            {cat}
                          </span>
                        ))}
                        {parseCategories(sub.categories).length === 0 && (
                          <span className="text-gray-500 text-xs">\u05D4\u05DB\u05DC</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{sub.minScore}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          sub.isActive ? "bg-emerald-400" : "bg-red-400"
                        }`}
                        title={sub.isActive ? "\u05E4\u05E2\u05D9\u05DC" : "\u05DC\u05D0 \u05E4\u05E2\u05D9\u05DC"}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(sub.createdAt).toLocaleDateString("he-IL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
            <span className="text-xs text-gray-400">
              \u05E2\u05DE\u05D5\u05D3 {page} \u05DE\u05EA\u05D5\u05DA {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
