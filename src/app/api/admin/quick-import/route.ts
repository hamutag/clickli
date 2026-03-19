import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scrapeProductUrl } from "@/lib/scraper";
import { calculateDealScore, getDealTier } from "@/lib/scoring";
import { calculateFinalPrice } from "@/lib/currency";
import { generateWebContent } from "@/lib/ai-content";
import type { Platform } from "@/types";

const PLATFORM_DETECT: ReadonlyArray<{ pattern: RegExp; platform: Platform; storeName: string; baseUrl: string }> = [
  { pattern: /aliexpress\.com/i, platform: "ALIEXPRESS", storeName: "AliExpress", baseUrl: "https://www.aliexpress.com" },
  { pattern: /temu\.com/i, platform: "TEMU", storeName: "Temu", baseUrl: "https://www.temu.com" },
  { pattern: /iherb\.com/i, platform: "IHERB", storeName: "iHerb", baseUrl: "https://www.iherb.com" },
  { pattern: /amazon\./i, platform: "AMAZON", storeName: "Amazon", baseUrl: "https://www.amazon.com" },
];

function detectPlatformFromUrl(url: string): { platform: Platform; storeName: string; baseUrl: string } | null {
  for (const entry of PLATFORM_DETECT) {
    if (entry.pattern.test(url)) {
      return { platform: entry.platform, storeName: entry.storeName, baseUrl: entry.baseUrl };
    }
  }
  return null;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s\u0590-\u05FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/-$/, "")
    + "-" + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { url, categoryId } = body as { url?: string; categoryId?: string };

    // --- Input Validation ---
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "נא לספק כתובת URL" },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "כתובת URL לא תקינה" },
        { status: 400 }
      );
    }

    // --- Detect Platform ---
    const platformInfo = detectPlatformFromUrl(url);
    if (!platformInfo) {
      return NextResponse.json(
        { error: "לא זוהתה פלטפורמה נתמכת. נתמכות: AliExpress, Temu, iHerb, Amazon" },
        { status: 400 }
      );
    }

    // --- Scrape Product ---
    const scraped = await scrapeProductUrl(url);

    if (!scraped.title) {
      return NextResponse.json(
        { error: "לא הצלחנו לחלץ מידע מהעמוד. נסה קישור אחר." },
        { status: 422 }
      );
    }

    const priceCurrent = scraped.price ?? 0;
    const priceOriginal = scraped.price ?? 0; // Same as current when no original price found

    // --- Find or Create Store ---
    let store = await prisma.store.findFirst({
      where: { platform: platformInfo.platform },
    });

    if (!store) {
      store = await prisma.store.create({
        data: {
          name: platformInfo.storeName,
          platform: platformInfo.platform,
          baseUrl: platformInfo.baseUrl,
          affiliateConfig: {},
          trustScore: 70,
        },
      });
    }

    // --- Category demand score ---
    let categoryDemandScore = 50;
    let categoryNameHe = "כללי";
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { demandScore: true, nameHe: true },
      });
      if (category) {
        categoryDemandScore = category.demandScore;
        categoryNameHe = category.nameHe;
      }
    }

    // --- Calculate Deal Score ---
    const scoreResult = calculateDealScore({
      priceOriginal,
      priceCurrent,
      rating: scraped.rating,
      reviewCount: scraped.reviewCount ?? 0,
      shippingFree: true, // Default assumption for most platforms
      couponValue: null,
      categoryDemandScore,
      storeTrustScore: store.trustScore,
    });

    // --- Convert Price to ILS ---
    const priceCalc = await calculateFinalPrice(
      priceCurrent,
      priceOriginal,
      0 // shipping cost
    );

    // --- Determine Status ---
    const status = scoreResult.total >= 60 ? "APPROVED" : "PENDING";

    // --- Create Product ---
    const externalId = `quick_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const product = await prisma.product.create({
      data: {
        externalId,
        storeId: store.id,
        categoryId: categoryId || null,
        titleEn: scraped.title,
        titleHe: null,
        descriptionHe: scraped.description,
        imageUrl: scraped.imageUrl,
        productUrl: url,
        affiliateUrl: url,
        priceOriginal,
        priceCurrent,
        currency: scraped.currency ?? "USD",
        shippingFree: true,
        shippingCost: 0,
        rating: scraped.rating,
        reviewCount: scraped.reviewCount ?? 0,
        score: scoreResult.total,
        status,
        priceILS: priceCalc.finalPriceILS,
        priceWithVat: priceCalc.vatApplies ? priceCalc.finalPriceILS : null,
        vatApplies: priceCalc.vatApplies,
      },
      include: {
        store: { select: { name: true, platform: true } },
        category: { select: { nameHe: true } },
      },
    });

    // --- Generate AI Content ---
    let generatedContent = null;
    let post = null;

    try {
      generatedContent = await generateWebContent({
        titleEn: scraped.title,
        priceCurrent,
        priceOriginal,
        priceILS: priceCalc.finalPriceILS,
        priceOriginalILS: priceCalc.subtotalILS, // Original in ILS (before VAT)
        shippingFree: true,
        shippingCost: 0,
        rating: scraped.rating,
        reviewCount: scraped.reviewCount ?? 0,
        couponCode: null,
        couponValue: null,
        categoryNameHe,
        storeName: platformInfo.storeName,
        score: scoreResult.total,
        vatApplies: priceCalc.vatApplies,
        imageUrl: scraped.imageUrl,
        affiliateUrl: url,
      });

      // Update product with Hebrew title from AI
      await prisma.product.update({
        where: { id: product.id },
        data: { titleHe: generatedContent.titleHe },
      });

      // --- Create Post ---
      const slug = generateSlug(generatedContent.titleHe);

      post = await prisma.post.create({
        data: {
          productId: product.id,
          channel: "WEB",
          variant: "SEO_LONG",
          titleHe: generatedContent.titleHe,
          bodyHe: generatedContent.bodyHe,
          ctaHe: generatedContent.ctaHe,
          prosHe: generatedContent.prosHe,
          consHe: generatedContent.consHe,
          slug,
          metaDescription: generatedContent.metaDescription,
        },
      });
    } catch (aiError) {
      console.error("AI content generation failed (product saved without content):", aiError);
    }

    // --- Build Response ---
    const dealTier = getDealTier(scoreResult.total);

    return NextResponse.json(
      {
        product: {
          ...product,
          titleHe: generatedContent?.titleHe ?? product.titleHe,
        },
        post,
        score: scoreResult,
        dealTier,
        priceCalc: {
          priceILS: priceCalc.finalPriceILS,
          exchangeRate: priceCalc.exchangeRate,
          vatApplies: priceCalc.vatApplies,
          vatAmount: priceCalc.vatAmount,
        },
        aiContent: generatedContent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Quick import error:", error);
    const message = error instanceof Error ? error.message : "שגיאה בייבוא המהיר";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
