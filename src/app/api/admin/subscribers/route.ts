import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const [subscribers, total, activeCount] = await Promise.all([
      prisma.subscriber.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { isActive: true } }),
    ]);

    // Build category stats from active subscribers
    const activeSubscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
      select: { categories: true },
    });

    const categoryStats: Record<string, number> = {};
    for (const sub of activeSubscribers) {
      if (sub.categories) {
        try {
          const cats: string[] = JSON.parse(sub.categories);
          for (const cat of cats) {
            categoryStats[cat] = (categoryStats[cat] || 0) + 1;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        active: activeCount,
        inactive: total - activeCount,
        byCategory: categoryStats,
      },
    });
  } catch (error) {
    console.error("Admin subscribers error:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת מנויים" },
      { status: 500 }
    );
  }
}
