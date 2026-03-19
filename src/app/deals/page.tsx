export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import { getDealTier } from "@/lib/scoring";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "כל הדילים | קליקלי",
  description:
    "גלו את הדילים הכי שווים מ-AliExpress, Temu ו-iHerb. מחירים בשקלים כולל משלוח ומע\"מ. קופונים בלעדיים והנחות מעולות כל יום.",
  alternates: {
    canonical: "/deals",
  },
  openGraph: {
    title: "כל הדילים | קליקלי",
    description:
      "גלו את הדילים הכי שווים מ-AliExpress, Temu ו-iHerb. מחירים בשקלים, משלוח לישראל, קופונים בלעדיים.",
    type: "website",
    locale: "he_IL",
    siteName: "קליקלי",
  },
};

interface DealsPageProps {
  searchParams: Promise<{ cat?: string; store?: string; page?: string }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const perPage = 24;

  const where = {
    status: "PUBLISHED" as const,
    isPublished: true,
    ...(params.store && {
      store: { platform: params.store.toUpperCase() as any },
    }),
    ...(params.cat && {
      targetAudience: { contains: params.cat },
    }),
  };

  const [deals, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        store: { select: { name: true, platform: true } },
        category: { select: { nameHe: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            🛒 קליקלי
          </Link>
          <nav className="flex gap-4 text-sm">
            <FilterLink href="/deals" label="הכל" active={!params.cat && !params.store} />
            <FilterLink href="/deals?cat=women" label="לנשים" active={params.cat === "women"} />
            <FilterLink href="/deals?cat=home" label="לבית" active={params.cat === "home"} />
            <FilterLink href="/deals?cat=health" label="בריאות" active={params.cat === "health"} />
            <FilterLink href="/deals?store=aliexpress" label="AliExpress" active={params.store === "aliexpress"} />
            <FilterLink href="/deals?store=temu" label="Temu" active={params.store === "temu"} />
            <FilterLink href="/deals?store=iherb" label="iHerb" active={params.store === "iherb"} />
          </nav>
        </div>
      </header>

      {/* Deals Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">{total} דילים נמצאו</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {deals.map((deal) => {
            const tier = getDealTier(deal.score);
            const savingsPercent = deal.priceOriginal > 0
              ? Math.round(((deal.priceOriginal - deal.priceCurrent) / deal.priceOriginal) * 100)
              : 0;

            return (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {deal.imageUrl && (
                    <img
                      src={deal.imageUrl}
                      alt={deal.titleHe || deal.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  {savingsPercent > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      -{savingsPercent}%
                    </span>
                  )}
                  {deal.score >= 80 && (
                    <span className="absolute top-2 left-2 text-lg">{tier.emoji}</span>
                  )}
                  <span className="absolute bottom-2 right-2 bg-white/90 text-xs font-medium px-2 py-0.5 rounded">
                    {deal.store.name}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2 min-h-[40px]">
                    {deal.titleHe || deal.titleEn}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-lg font-bold text-green-600">
                      {deal.priceILS ? `₪${Math.round(deal.priceILS)}` : `$${deal.priceCurrent.toFixed(2)}`}
                    </span>
                    {savingsPercent > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        {deal.priceILS
                          ? `₪${Math.round(deal.priceOriginal * 3.65)}`
                          : `$${deal.priceOriginal.toFixed(2)}`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {deal.shippingFree ? "✅ משלוח חינם" : "📦 משלוח בתשלום"}
                    </span>
                    {deal.rating && (
                      <span>⭐ {deal.rating.toFixed(1)}</span>
                    )}
                  </div>

                  {deal.couponCode && (
                    <div className="mt-2 bg-orange-50 border border-orange-200 rounded px-2 py-1 text-xs text-orange-700 text-center">
                      🎟️ קופון: {deal.couponCode}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/deals?page=${p}${params.cat ? `&cat=${params.cat}` : ""}${params.store ? `&store=${params.store}` : ""}`}
                className={`px-3 py-1 rounded-lg text-sm ${
                  p === page
                    ? "bg-blue-600 text-white"
                    : "bg-white border hover:bg-gray-50"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}

        {deals.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">אין דילים בקטגוריה הזו כרגע</p>
            <Link href="/deals" className="text-blue-600 hover:underline">
              ← חזרה לכל הדילים
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full text-sm transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );
}
