export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    publishedProducts,
    pendingProducts,
    totalClicks,
    totalConversions,
    todayClicks,
    todayConversions,
    revenueResult,
    activeStores,
    categories,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.click.count(),
    prisma.conversion.count(),
    prisma.click.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.conversion.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.conversion.aggregate({ _sum: { commission: true } }),
    prisma.store.count({ where: { isActive: true } }),
    prisma.category.count(),
  ]);

  return NextResponse.json({
    totalProducts,
    publishedProducts,
    pendingProducts,
    totalClicks,
    totalConversions,
    todayClicks,
    todayConversions,
    revenue: revenueResult._sum.commission ?? 0,
    activeStores,
    categories,
  });
}
