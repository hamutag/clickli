export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { BarChart3, TrendingUp, Target } from "lucide-react";

async function getAnalytics() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    weeklyClicks,
    weeklyConversions,
    topProducts,
    channelBreakdown,
    categoryBreakdown,
    recentReports,
  ] = await Promise.all([
    prisma.click.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.conversion.aggregate({
      where: { createdAt: { gte: weekAgo }, status: "APPROVED" },
      _sum: { commission: true },
      _count: true,
    }),
    prisma.click.groupBy({
      by: ["productId"],
      _count: true,
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
    prisma.click.groupBy({
      by: ["channel"],
      where: { createdAt: { gte: weekAgo } },
      _count: true,
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { status: "PUBLISHED" },
      _count: true,
      orderBy: { _count: { categoryId: "desc" } },
      take: 5,
    }),
    prisma.dailyReport.findMany({
      take: 7,
      orderBy: { date: "desc" },
    }),
  ]);

  // Fetch product details for top products
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProducts.map((p) => p.productId) } },
    include: { store: true },
  });

  return {
    weeklyClicks,
    weeklyConversions: weeklyConversions._count,
    weeklyRevenue: weeklyConversions._sum.commission ?? 0,
    weeklyEPC: weeklyClicks > 0 ? (weeklyConversions._sum.commission ?? 0) / weeklyClicks : 0,
    topProducts: topProducts.map((p) => {
      const product = topProductDetails.find((d) => d.id === p.productId);
      return {
        id: p.productId,
        title: product?.titleHe || product?.titleEn || "Unknown",
        store: product?.store.name || "—",
        clicks: p._count,
      };
    }),
    channelBreakdown: channelBreakdown.map((c) => ({
      channel: c.channel,
      clicks: c._count,
    })),
    recentReports,
  };
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">אנליטיקס</h1>
        <p className="text-gray-500 text-sm mt-1">ביצועים ותובנות - 7 ימים אחרונים</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="קליקים (שבוע)"
          value={analytics.weeklyClicks.toLocaleString("he-IL")}
          icon={<Target className="w-5 h-5 text-blue-600" />}
        />
        <SummaryCard
          label="המרות (שבוע)"
          value={analytics.weeklyConversions.toLocaleString("he-IL")}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        />
        <SummaryCard
          label="הכנסות (שבוע)"
          value={`$${analytics.weeklyRevenue.toFixed(2)}`}
          icon={<BarChart3 className="w-5 h-5 text-emerald-600" />}
        />
        <SummaryCard
          label="EPC (שבוע)"
          value={`$${analytics.weeklyEPC.toFixed(3)}`}
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-lg mb-4">מוצרים מובילים</h2>
          <div className="space-y-3">
            {analytics.topProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-4">אין נתונים עדיין</p>
            ) : (
              analytics.topProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-300 w-6">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-400">{product.store}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">{product.clicks} קליקים</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-lg mb-4">התפלגות ערוצים</h2>
          <div className="space-y-4">
            {analytics.channelBreakdown.map((ch) => {
              const total = analytics.weeklyClicks || 1;
              const percent = Math.round((ch.clicks / total) * 100);
              const isWeb = ch.channel === "WEB";
              return (
                <div key={ch.channel}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">
                      {isWeb ? "🌐 אתר" : "📱 טלגרם"}
                    </span>
                    <span>
                      {ch.clicks.toLocaleString()} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isWeb ? "bg-blue-500" : "bg-sky-400"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {analytics.channelBreakdown.length === 0 && (
              <p className="text-gray-400 text-center py-4">אין נתונים עדיין</p>
            )}
          </div>
        </div>

        {/* Recent Daily Reports */}
        <div className="bg-white rounded-xl border p-5 md:col-span-2">
          <h2 className="font-bold text-lg mb-4">דוחות יומיים</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right p-3 font-medium text-gray-500">תאריך</th>
                  <th className="text-right p-3 font-medium text-gray-500">קליקים</th>
                  <th className="text-right p-3 font-medium text-gray-500">המרות</th>
                  <th className="text-right p-3 font-medium text-gray-500">הכנסות</th>
                  <th className="text-right p-3 font-medium text-gray-500">EPC</th>
                  <th className="text-right p-3 font-medium text-gray-500">CR%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analytics.recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(report.date).toLocaleDateString("he-IL")}
                    </td>
                    <td className="p-3">{report.totalClicks.toLocaleString()}</td>
                    <td className="p-3">{report.totalConversions.toLocaleString()}</td>
                    <td className="p-3 font-medium text-green-600">
                      ${report.totalCommission.toFixed(2)}
                    </td>
                    <td className="p-3">${report.epc.toFixed(3)}</td>
                    <td className="p-3">{report.conversionRate.toFixed(1)}%</td>
                  </tr>
                ))}
                {analytics.recentReports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      אין דוחות עדיין. הפעילו את הדוח היומי מהדשבורד.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
