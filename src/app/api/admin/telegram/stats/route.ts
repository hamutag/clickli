import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getChannelSubscriberCount } from "@/lib/telegram";

export async function GET() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [subscribers, todayPosts, recentPosts] = await Promise.all([
    getChannelSubscriberCount(),
    prisma.post.count({
      where: {
        channel: "TELEGRAM",
        publishedAt: { gte: todayStart },
      },
    }),
    prisma.post.findMany({
      where: { channel: "TELEGRAM", isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: {
        product: { select: { titleHe: true, titleEn: true } },
        _count: { select: { clicks: true } },
      },
    }),
  ]);

  return NextResponse.json({
    subscribers,
    todayPosts,
    maxDailyPosts: 15,
    recentPosts: recentPosts.map((post) => ({
      id: post.id,
      productTitle: post.product.titleHe || post.product.titleEn,
      telegramMessageId: post.telegramMessageId,
      publishedAt: post.publishedAt,
      clicks: post._count.clicks,
    })),
  });
}
