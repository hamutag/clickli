export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import DealCard from "@/components/DealCard";
import DealsFilters from "@/components/DealsFilters";

export const metadata: Metadata = {
  title: "כל הדילים | קליקלי",
  description:
    'גלו את הדילים הכי שווים מ-AliExpress, Temu ו-iHerb. מחירים בשקלים כולל משלוח ומע"מ. קופונים בלעדיים והנחות מעולות כל יום.',
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
  searchParams: Promise<{
    q?: string;
    category?: string;
    platform?: string;
    sort?: string;
    page?: string;
  }>;
}

const PER_PAGE = 12;

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const sortParam = params.sort || "score";

  let deals: Awaited<ReturnType<typeof fetchDeals>> = [];
  let total = 0;
  let categories: Array<{ nameHe: string; slug: string }> = [];

  try {
    // Build where clause
    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
      isPublished: true,
    };

    // Search query
    if (params.q) {
      where.OR = [
        { titleHe: { contains: params.q, mode: "insensitive" } },
        { titleEn: { contains: params.q, mode: "insensitive" } },
        { descriptionHe: { contains: params.q, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (params.category) {
      where.category = { slug: params.category };
    }

    // Platform filter
    if (params.platform) {
      where.store = {
        platform: params.platform.toUpperCase() as Prisma.EnumPlatformFilter,
      };
    }

    // Sort order
    const orderBy = buildOrderBy(sortParam);

    [deals, total, categories] = await Promise.all([
      fetchDeals(where, orderBy, page),
      prisma.product.count({ where }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { demandScore: "desc" },
        select: { nameHe: true, slug: true },
      }),
    ]);
  } catch (error) {
    console.error("Failed to fetch deals:", error);
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            קליקלי
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/"
              className="text-gray-400 hover:text-emerald-400 transition-colors"
            >
              ראשי
            </Link>
            <Link
              href="/deals"
              className="text-emerald-400 font-medium"
            >
              דילים
            </Link>
            <a
              href="https://t.me/clickli26"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-emerald-400 transition-colors"
            >
              טלגרם
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">כל הדילים</h1>
          <p className="text-sm text-gray-500">
            הדילים הכי שווים מ-AliExpress, Temu ו-iHerb - מעודכן כל יום
          </p>
        </div>

        {/* Filters */}
        <DealsFilters categories={categories} totalCount={total} />

        {/* Deals Grid */}
        {deals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} product={deal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">
              לא נמצאו דילים
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {params.q
                ? `לא נמצאו תוצאות עבור "${params.q}". נסו לחפש במילים אחרות.`
                : "אין דילים בפילטרים שבחרתם. נסו לשנות את הסינון."}
            </p>
            <Link
              href="/deals"
              className="inline-block bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-gray-950 px-6 py-3 rounded-xl text-sm font-bold transition-all"
            >
              הצג את כל הדילים
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {page > 1 && (
              <PaginationLink
                page={page - 1}
                params={params}
                label="הקודם"
              />
            )}
            {Array.from(
              { length: Math.min(totalPages, 10) },
              (_, i) => i + 1
            ).map((p) => (
              <PaginationLink
                key={p}
                page={p}
                params={params}
                label={String(p)}
                isActive={p === page}
              />
            ))}
            {page < totalPages && (
              <PaginationLink
                page={page + 1}
                params={params}
                label="הבא"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function buildOrderBy(
  sort: string
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price":
      return { priceCurrent: "asc" };
    case "date":
      return { publishedAt: "desc" };
    case "score":
    default:
      return { score: "desc" };
  }
}

async function fetchDeals(
  where: Prisma.ProductWhereInput,
  orderBy: Prisma.ProductOrderByWithRelationInput,
  page: number
) {
  return prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
    include: {
      store: { select: { name: true, platform: true } },
      category: { select: { nameHe: true, slug: true } },
    },
  });
}

function PaginationLink({
  page,
  params,
  label,
  isActive = false,
}: {
  page: number;
  params: Record<string, string | undefined>;
  label: string;
  isActive?: boolean;
}) {
  const urlParams = new URLSearchParams();
  urlParams.set("page", String(page));
  if (params.q) urlParams.set("q", params.q);
  if (params.category) urlParams.set("category", params.category);
  if (params.platform) urlParams.set("platform", params.platform);
  if (params.sort) urlParams.set("sort", params.sort);

  return (
    <Link
      href={`/deals?${urlParams.toString()}`}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? "bg-emerald-500 text-gray-950"
          : "bg-gray-900 border border-gray-700 text-gray-400 hover:border-emerald-500/40 hover:text-emerald-400"
      }`}
    >
      {label}
    </Link>
  );
}
