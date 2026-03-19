"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  Target,
  DollarSign,
  Percent,
  Zap,
  RefreshCw,
  Lightbulb,
  ShoppingBag,
  Monitor,
  Send,
} from "lucide-react";

// ---- Types ----

interface ChannelData {
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

interface StoreData {
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

interface TopProduct {
  productId: string;
  title: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

interface DailyReportRow {
  id: string;
  date: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  epc: number;
  conversionRate: number;
  topProducts: TopProduct[] | null;
  channelBreakdown: Record<string, ChannelData> | null;
  storeBreakdown: Record<string, StoreData> | null;
  insightsHe: string | null;
  recommendations: string | null;
}

interface AnalyticsSummary {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  epc: number;
  conversionRate: number;
  daysCount: number;
}

interface AnalyticsData {
  reports: DailyReportRow[];
  summary: AnalyticsSummary;
  aggregatedStores: Record<string, StoreData>;
  aggregatedChannels: Record<string, ChannelData>;
}

// ---- Page Component ----

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const json: AnalyticsData = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerReport = async () => {
    setTriggerLoading(true);
    setTriggerResult(null);
    try {
      const res = await fetch("/api/cron/daily-report", {
        headers: {
          Authorization: `Bearer ${prompt("הזן CRON_SECRET:") ?? ""}`,
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }
      setTriggerResult("הדוח הופק בהצלחה!");
      await fetchData();
    } catch (err) {
      setTriggerResult(
        `שגיאה: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setTriggerLoading(false);
    }
  };

  // Get latest report for AI insights and top products
  const latestReport = data?.reports[0] ?? null;
  const last7Reports = data?.reports.slice(0, 7) ?? [];

  // Summary for last 7 days
  const last7Summary = last7Reports.reduce(
    (acc, r) => ({
      totalClicks: acc.totalClicks + r.totalClicks,
      totalConversions: acc.totalConversions + r.totalConversions,
      totalRevenue: acc.totalRevenue + r.totalRevenue,
      totalCommission: acc.totalCommission + r.totalCommission,
    }),
    { totalClicks: 0, totalConversions: 0, totalRevenue: 0, totalCommission: 0 }
  );
  const last7Epc =
    last7Summary.totalClicks > 0
      ? last7Summary.totalCommission / last7Summary.totalClicks
      : 0;
  const last7CR =
    last7Summary.totalClicks > 0
      ? (last7Summary.totalConversions / last7Summary.totalClicks) * 100
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-gray-400">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">אנליטיקס</h1>
          <p className="text-gray-400 text-sm mt-1">
            ביצועים ותובנות - 7 ימים אחרונים
          </p>
        </div>
        <div className="flex items-center gap-3">
          {triggerResult && (
            <span
              className={`text-sm ${triggerResult.startsWith("שגיאה") ? "text-red-400" : "text-emerald-400"}`}
            >
              {triggerResult}
            </span>
          )}
          <button
            onClick={triggerReport}
            disabled={triggerLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {triggerLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            הפק דוח עכשיו
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SummaryCard
          label="קליקים"
          value={last7Summary.totalClicks.toLocaleString("he-IL")}
          icon={<Target className="w-5 h-5" />}
          color="blue"
        />
        <SummaryCard
          label="המרות"
          value={last7Summary.totalConversions.toLocaleString("he-IL")}
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
        />
        <SummaryCard
          label="הכנסות"
          value={`$${last7Summary.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <SummaryCard
          label="עמלות"
          value={`$${last7Summary.totalCommission.toFixed(2)}`}
          icon={<BarChart3 className="w-5 h-5" />}
          color="purple"
        />
        <SummaryCard
          label="EPC"
          value={`$${last7Epc.toFixed(3)}`}
          icon={<Zap className="w-5 h-5" />}
          color="amber"
        />
        <SummaryCard
          label="שיעור המרה"
          value={`${last7CR.toFixed(2)}%`}
          icon={<Percent className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="font-bold text-lg text-white mb-4">פירוט יומי</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-right p-3 font-medium text-gray-400">
                  תאריך
                </th>
                <th className="text-right p-3 font-medium text-gray-400">
                  קליקים
                </th>
                <th className="text-right p-3 font-medium text-gray-400">
                  המרות
                </th>
                <th className="text-right p-3 font-medium text-gray-400">
                  הכנסות
                </th>
                <th className="text-right p-3 font-medium text-gray-400">
                  עמלות
                </th>
                <th className="text-right p-3 font-medium text-gray-400">
                  EPC
                </th>
                <th className="text-right p-3 font-medium text-gray-400">
                  CR%
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {last7Reports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-800/50 transition-colors"
                >
                  <td className="p-3 text-gray-300">
                    {new Date(report.date).toLocaleDateString("he-IL")}
                  </td>
                  <td className="p-3 text-gray-300">
                    {report.totalClicks.toLocaleString()}
                  </td>
                  <td className="p-3 text-gray-300">
                    {report.totalConversions.toLocaleString()}
                  </td>
                  <td className="p-3 font-medium text-emerald-400">
                    ${report.totalRevenue.toFixed(2)}
                  </td>
                  <td className="p-3 font-medium text-green-400">
                    ${report.totalCommission.toFixed(2)}
                  </td>
                  <td className="p-3 text-gray-300">
                    ${report.epc.toFixed(3)}
                  </td>
                  <td className="p-3 text-gray-300">
                    {report.conversionRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
              {last7Reports.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-gray-500"
                  >
                    אין דוחות עדיין. לחצו על &quot;הפק דוח עכשיו&quot; ליצירת
                    הדוח הראשון.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Platform / Store Breakdown */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-lg text-white">פירוט לפי פלטפורמה</h2>
          </div>
          {data?.aggregatedStores &&
          Object.keys(data.aggregatedStores).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(data.aggregatedStores)
                .sort(([, a], [, b]) => b.clicks - a.clicks)
                .map(([name, storeData]) => {
                  const totalClicks = data.summary.totalClicks || 1;
                  const pct = Math.round(
                    (storeData.clicks / totalClicks) * 100
                  );
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-200">
                          {name}
                        </span>
                        <span className="text-gray-400">
                          {storeData.clicks.toLocaleString()} קליקים ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
                        <div
                          className="h-2 rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>{storeData.conversions} המרות</span>
                        <span>${storeData.revenue.toFixed(2)} הכנסות</span>
                        <span>${storeData.commission.toFixed(2)} עמלות</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">אין נתונים עדיין</p>
          )}
        </div>

        {/* Channel Breakdown */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-lg text-white">פירוט לפי ערוץ</h2>
          </div>
          {data?.aggregatedChannels ? (
            <div className="space-y-5">
              {Object.entries(data.aggregatedChannels).map(
                ([channel, chData]) => {
                  const totalClicks = data.summary.totalClicks || 1;
                  const pct = Math.round(
                    (chData.clicks / totalClicks) * 100
                  );
                  const isWeb = channel === "WEB";
                  return (
                    <div key={channel}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-200 flex items-center gap-2">
                          {isWeb ? (
                            <Monitor className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Send className="w-4 h-4 text-sky-400" />
                          )}
                          {isWeb ? "אתר" : "טלגרם"}
                        </span>
                        <span className="text-gray-400">
                          {chData.clicks.toLocaleString()} קליקים ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${isWeb ? "bg-blue-500" : "bg-sky-400"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>{chData.conversions} המרות</span>
                        <span>${chData.revenue.toFixed(2)} הכנסות</span>
                        <span>${chData.commission.toFixed(2)} עמלות</span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">אין נתונים עדיין</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-lg text-white">טופ מוצרים (היום)</h2>
          </div>
          {latestReport?.topProducts &&
          latestReport.topProducts.length > 0 ? (
            <div className="space-y-3">
              {latestReport.topProducts.map((product, i) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-bold w-7 text-center ${
                        i === 0
                          ? "text-amber-400"
                          : i === 1
                            ? "text-gray-300"
                            : i === 2
                              ? "text-amber-700"
                              : "text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-200 truncate max-w-[200px]">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.conversions} המרות | $
                        {product.revenue.toFixed(2)} הכנסות
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    {product.clicks} קליקים
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">אין נתונים עדיין</p>
          )}
        </div>

        {/* AI Insights */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-lg text-white">תובנות AI</h2>
          </div>
          {latestReport?.insightsHe || latestReport?.recommendations ? (
            <div className="space-y-4">
              {latestReport.insightsHe && (
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2">
                    תובנות
                  </h3>
                  <div className="space-y-1.5">
                    {latestReport.insightsHe.split("\n").map((line, i) => (
                      <p key={i} className="text-sm text-gray-300 leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {latestReport.recommendations && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-400 mb-2">
                    המלצות
                  </h3>
                  <div className="space-y-1.5">
                    {latestReport.recommendations.split("\n").map((line, i) => (
                      <p key={i} className="text-sm text-gray-300 leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">
              תובנות AI יופיעו כאן לאחר הפקת דוח יומי
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Summary Card Component ----

const colorMap: Record<string, string> = {
  blue: "text-blue-400 bg-blue-400/10",
  emerald: "text-emerald-400 bg-emerald-400/10",
  green: "text-green-400 bg-green-400/10",
  purple: "text-purple-400 bg-purple-400/10",
  amber: "text-amber-400 bg-amber-400/10",
  rose: "text-rose-400 bg-rose-400/10",
};

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = colorMap[color] ?? colorMap.emerald;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`p-2 rounded-lg ${colorClasses}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
