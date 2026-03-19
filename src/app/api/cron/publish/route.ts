import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateTelegramContent, generateWebContent } from "@/lib/ai-content";
import { sendTelegramPost, canPostToday } from "@/lib/telegram";
import { createTrackingLink } from "@/lib/tracking";
import { getExchangeRate } from "@/lib/currency";

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is not set");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET /api/cron/publish - Vercel Cron invokes GET by default
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runPublish();
}

// POST /api/cron/publish - manual trigger
export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runPublish();
}

async function runPublish() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // בדיקה כמה פוסטים כבר שלחנו היום
  const todayPostCount = await prisma.post.count({
    where: {
      channel: "TELEGRAM",
      publishedAt: { gte: todayStart },
    },
  });

  const canPost = await canPostToday(todayPostCount);
  if (!canPost) {
    return NextResponse.json({
      success: false,
      message: "הגעת למגבלת הפוסטים היומית",
      published: 0,
    });
  }

  // מוצרים מאושרים שעוד לא פורסמו, ממוינים לפי ציון
  const remainingSlots = 15 - todayPostCount;
  const approvedProducts = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      isPublished: false,
      score: { gte: 60 },
    },
    orderBy: { score: "desc" },
    take: remainingSlots,
    include: {
      store: true,
      category: true,
    },
  });

  const exchangeRate = await getExchangeRate();
  let publishedCount = 0;
  const errors: string[] = [];

  for (const product of approvedProducts) {
    try {
      const priceOriginalILS = Math.round(product.priceOriginal * exchangeRate);

      const contentInput = {
        titleEn: product.titleEn,
        titleHe: product.titleHe ?? undefined,
        priceCurrent: product.priceCurrent,
        priceOriginal: product.priceOriginal,
        priceILS: product.priceILS ?? Math.round(product.priceCurrent * exchangeRate),
        priceOriginalILS,
        shippingFree: product.shippingFree,
        shippingCost: product.shippingCost,
        rating: product.rating,
        reviewCount: product.reviewCount,
        couponCode: product.couponCode,
        couponValue: product.couponValue,
        categoryNameHe: product.category?.nameHe ?? "כללי",
        storeName: product.store.name,
        score: product.score,
        vatApplies: product.vatApplies,
        imageUrl: product.imageUrl,
        affiliateUrl: product.affiliateUrl ?? product.productUrl,
      };

      // יצירת תוכן
      const webContent = await generateWebContent(contentInput);
      const slug = `deal-${product.id}-${Date.now()}`;

      // פוסט לאתר
      await prisma.post.create({
        data: {
          productId: product.id,
          channel: "WEB",
          variant: "SEO_LONG",
          titleHe: webContent.titleHe,
          bodyHe: webContent.bodyHe,
          ctaHe: webContent.ctaHe,
          prosHe: webContent.prosHe,
          consHe: webContent.consHe,
          metaDescription: webContent.metaDescription,
          slug,
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      // פוסט לטלגרם
      const trackingLink = createTrackingLink(product.id, null, "TELEGRAM");
      const telegramContent = await generateTelegramContent({
        ...contentInput,
        affiliateUrl: trackingLink,
      });

      const telegramMessageId = await sendTelegramPost(telegramContent);

      await prisma.post.create({
        data: {
          productId: product.id,
          channel: "TELEGRAM",
          variant: "SHORT_FIRE",
          titleHe: webContent.titleHe,
          bodyHe: telegramContent.text,
          telegramMessageId,
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      // עדכון מוצר
      await prisma.product.update({
        where: { id: product.id },
        data: {
          status: "PUBLISHED",
          isPublished: true,
          publishedAt: new Date(),
          titleHe: webContent.titleHe,
        },
      });

      publishedCount++;

      // השהייה בין פוסטים למניעת ספאם
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      errors.push(`${product.id}: ${error}`);
    }
  }

  return NextResponse.json({
    success: true,
    published: publishedCount,
    total: approvedProducts.length,
    errors,
  });
}
