import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateTelegramContent, generateWebContent } from "@/lib/ai-content";
import { sendTelegramPost } from "@/lib/telegram";
import { createTrackingLink } from "@/lib/tracking";
import { getExchangeRate } from "@/lib/currency";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      store: true,
      category: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const exchangeRate = await getExchangeRate();
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

  try {
    // יצירת תוכן לאתר
    const webContent = await generateWebContent(contentInput);
    const slug = `deal-${product.id}-${Date.now()}`;

    const webPost = await prisma.post.create({
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

    // יצירת תוכן לטלגרם עם tracking link
    const trackingLink = createTrackingLink(product.id, null, "TELEGRAM");
    const telegramContent = await generateTelegramContent({
      ...contentInput,
      affiliateUrl: trackingLink,
    });

    const telegramMessageId = await sendTelegramPost(telegramContent);

    const telegramPost = await prisma.post.create({
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

    // עדכון סטטוס המוצר
    await prisma.product.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        isPublished: true,
        publishedAt: new Date(),
        titleHe: webContent.titleHe,
      },
    });

    return NextResponse.json({
      success: true,
      webPost: webPost.id,
      telegramPost: telegramPost.id,
      telegramMessageId,
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { error: "Failed to publish", details: String(error) },
      { status: 500 }
    );
  }
}
