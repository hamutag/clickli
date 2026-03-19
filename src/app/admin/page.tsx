export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getChannelSubscriberCount } from "@/lib/telegram";
import DashboardCards from "@/components/admin/DashboardCards";
import QuickActions from "@/components/admin/QuickActions";
import type { AdminDashboardStats } from "@/types";

async function getDashboardStats(): Promise<AdminDashboardStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    activeDeals,
    pendingReview,
    publishedToday,
    todayClicks,
    todayConversions,
    todayRevenue,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED", isPublished: true } }),
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.product.count({
      where: { publishedAt: { gte: todayStart } },
    }),
    prisma.click.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.conversion.count({
      where: { createdAt: { gte: todayStart }, status: "APPROVED" },
    }),
    prisma.conversion.aggregate({
      where: { createdAt: { gte: todayStart }, status: "APPROVED" },
      _sum: { commission: true },
    }),
  ]);

  const revenue = todayRevenue._sum.commission ?? 0;
  const telegramSubscribers = await getChannelSubscriberCount();

  return {
    totalProducts,
    activeDeals,
    todayClicks,
    todayConversions,
    todayRevenue: revenue,
    todayEPC: todayClicks > 0 ? revenue / todayClicks : 0,
    pendingReview,
    publishedToday,
    telegramSubscribers,
    conversionRate: todayClicks > 0 ? (todayConversions / todayClicks) * 100 : 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">דשבורד</h1>
        <p className="text-gray-500 text-sm mt-1">סקירה כללית של הביצועים</p>
      </div>

      {/* Stats Cards */}
      <DashboardCards stats={stats} />

      {/* Quick Actions */}
      <div className="mt-6">
        <QuickActions />
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4">פעילות אחרונה</h2>
        <RecentActivityList />
      </div>
    </div>
  );
}

async function RecentActivityList() {
  const recentProducts = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { store: true },
  });

  if (recentProducts.length === 0) {
    return (
      <p className="text-gray-400 text-center py-8">
        אין פעילות עדיין. לחצו על &quot;סרוק עכשיו&quot; כדי להתחיל.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {recentProducts.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between py-2 border-b last:border-0"
        >
          <div className="flex items-center gap-3">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt=""
                className="w-8 h-8 rounded object-cover"
              />
            )}
            <div>
              <p className="text-sm font-medium truncate max-w-[300px]">
                {product.titleHe || product.titleEn}
              </p>
              <p className="text-xs text-gray-400">
                {product.store.name} • ציון {product.score}
              </p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-green-600">
              {product.priceILS ? `₪${Math.round(product.priceILS)}` : `$${product.priceCurrent.toFixed(2)}`}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(product.createdAt).toLocaleDateString("he-IL")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
