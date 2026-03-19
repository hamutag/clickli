import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateDealScore } from "@/lib/scoring";

export async function GET() {
  const deals = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      store: { select: { name: true, platform: true } },
      category: { select: { nameHe: true } },
      _count: { select: { clicks: true, conversions: true } },
    },
  });

  return NextResponse.json({ deals });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      platform,
      categoryId,
      productUrl,
      titleHe,
      titleEn,
      descriptionHe,
      imageUrl,
      priceOriginal,
      priceCurrent,
      couponCode,
      couponValue,
      couponType,
      rating,
      reviewCount,
      shippingFree,
      affiliateUrl,
    } = body;

    // Validation
    if (!titleHe || !priceOriginal || !priceCurrent || !productUrl) {
      return NextResponse.json(
        { error: "חסרים שדות חובה: כותרת, מחירים וקישור למוצר" },
        { status: 400 }
      );
    }

    // Find or create store for the platform
    const store = await prisma.store.findFirst({
      where: { platform },
    });

    if (!store) {
      return NextResponse.json(
        { error: `לא נמצאה חנות לפלטפורמה ${platform}` },
        { status: 400 }
      );
    }

    // Get category demand score if category is provided
    let categoryDemandScore = 50;
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { demandScore: true },
      });
      if (category) {
        categoryDemandScore = category.demandScore;
      }
    }

    // Calculate deal score
    const scoreResult = calculateDealScore({
      priceOriginal,
      priceCurrent,
      rating: rating ?? null,
      reviewCount: reviewCount ?? 0,
      shippingFree: shippingFree ?? false,
      couponValue: couponValue ?? null,
      categoryDemandScore,
      storeTrustScore: store.trustScore,
    });

    // Generate a unique external ID for manual deals
    const externalId = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const product = await prisma.product.create({
      data: {
        externalId,
        storeId: store.id,
        categoryId: categoryId || null,
        titleEn: titleEn || titleHe,
        titleHe,
        descriptionHe: descriptionHe || null,
        imageUrl: imageUrl || null,
        productUrl,
        affiliateUrl: affiliateUrl || productUrl,
        priceOriginal,
        priceCurrent,
        shippingFree: shippingFree ?? false,
        couponCode: couponCode || null,
        couponValue: couponValue ?? null,
        couponType: couponType || null,
        rating: rating ?? null,
        reviewCount: reviewCount ?? 0,
        score: scoreResult.total,
        status: "PENDING",
      },
      include: {
        store: { select: { name: true, platform: true } },
        category: { select: { nameHe: true } },
      },
    });

    return NextResponse.json({ product, score: scoreResult }, { status: 201 });
  } catch (error) {
    console.error("Failed to create deal:", error);
    return NextResponse.json(
      { error: "שגיאה ביצירת הדיל" },
      { status: 500 }
    );
  }
}
