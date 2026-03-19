export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Store, TrendingUp, AlertCircle, CheckCircle, Settings } from "lucide-react";

async function getPlatformStats() {
  const stores = await prisma.store.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const platformStats = await Promise.all(
    stores.map(async (store) => {
      const [published, pending, totalClicks, totalConversions] = await Promise.all([
        prisma.product.count({ where: { storeId: store.id, status: "PUBLISHED" } }),
        prisma.product.count({ where: { storeId: store.id, status: "PENDING" } }),
        prisma.click.count({
          where: { product: { storeId: store.id } },
        }),
        prisma.conversion.aggregate({
          where: { storeId: store.id, status: "APPROVED" },
          _sum: { commission: true },
          _count: true,
        }),
      ]);

      return {
        ...store,
        totalProducts: store._count.products,
        published,
        pending,
        totalClicks,
        totalConversions: totalConversions._count,
        totalCommission: totalConversions._sum.commission ?? 0,
        epc: totalClicks > 0 ? (totalConversions._sum.commission ?? 0) / totalClicks : 0,
      };
    })
  );

  return platformStats;
}

export default async function PlatformsPage() {
  const platforms = await getPlatformStats();

  const platformLogos: Record<string, string> = {
    ALIEXPRESS: "🛒",
    TEMU: "🟠",
    IHERB: "🌿",
    AMAZON: "📦",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">פלטפורמות</h1>
        <p className="text-gray-500 text-sm mt-1">ניהול ומעקב אחר חנויות האפילייט</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <div key={platform.id} className="bg-white rounded-xl border overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platformLogos[platform.platform] || "🏪"}</span>
                  <div>
                    <h3 className="font-bold text-lg">{platform.name}</h3>
                    <p className="text-xs text-gray-400">{platform.baseUrl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {platform.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-5 grid grid-cols-2 gap-4">
              <StatItem label="סה״כ מוצרים" value={platform.totalProducts} />
              <StatItem label="פורסמו" value={platform.published} color="green" />
              <StatItem label="ממתינים" value={platform.pending} color="yellow" />
              <StatItem label="קליקים" value={platform.totalClicks} />
              <StatItem label="המרות" value={platform.totalConversions} color="green" />
              <StatItem
                label="הכנסות"
                value={`$${platform.totalCommission.toFixed(2)}`}
                color="emerald"
              />
            </div>

            {/* Bottom bar */}
            <div className="px-5 py-3 bg-gray-50 border-t flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <TrendingUp className="w-3 h-3" />
                <span>
                  EPC: ${platform.epc.toFixed(3)} | עמלה: {Math.round(platform.commissionRate * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Store className="w-3 h-3" />
                <span>אמון: {platform.trustScore}/100</span>
              </div>
            </div>
          </div>
        ))}

        {platforms.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>אין פלטפורמות מוגדרות.</p>
            <p className="text-sm mt-1">הפעילו סריקה ראשונה כדי ליצור את הפלטפורמות.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  const colorClass = color
    ? `text-${color}-600`
    : "text-gray-900";

  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`font-bold ${colorClass}`}>
        {typeof value === "number" ? value.toLocaleString("he-IL") : value}
      </p>
    </div>
  );
}
