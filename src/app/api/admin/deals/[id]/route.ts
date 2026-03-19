import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateDealScore } from "@/lib/scoring";
import { getExchangeRate } from "@/lib/currency";

// GET single deal with relations
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const deal = await prisma.product.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true, platform: true, trustScore: true } },
        category: { select: { id: true, nameHe: true, nameEn: true, demandScore: true } },
        posts: {
          select: {
            id: true,
            channel: true,
            variant: true,
            titleHe: true,
            isPublished: true,
            publishedAt: true,
            telegramMessageId: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { clicks: true, conversions: true },
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "דיל לא נמצא" }, { status: 404 });
    }

    return NextResponse.json({ deal });
  } catch (error) {
    console.error("Failed to fetch deal:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת הדיל" },
      { status: 500 }
    );
  }
}

// PUT update deal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Fetch existing deal with store info for score recalculation
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        store: { select: { trustScore: true } },
        category: { select: { demandScore: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "דיל לא נמצא" }, { status: 404 });
    }

    const {
      titleHe,
      titleEn,
      descriptionHe,
      descriptionEn,
      imageUrl,
      priceOriginal,
      priceCurrent,
      couponCode,
      couponValue,
      couponType,
      categoryId,
      affiliateUrl,
      tags,
    } = body;

    // Get category demand score for recalculation
    let categoryDemandScore = existing.category?.demandScore ?? 50;
    if (categoryId && categoryId !== existing.categoryId) {
      const newCategory = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { demandScore: true },
      });
      if (newCategory) {
        categoryDemandScore = newCategory.demandScore;
      }
    }

    // Recalculate score
    const finalPriceOriginal = priceOriginal ?? existing.priceOriginal;
    const finalPriceCurrent = priceCurrent ?? existing.priceCurrent;

    const scoreResult = calculateDealScore({
      priceOriginal: finalPriceOriginal,
      priceCurrent: finalPriceCurrent,
      rating: existing.rating,
      reviewCount: existing.reviewCount,
      shippingFree: existing.shippingFree,
      couponValue: couponValue ?? existing.couponValue ?? null,
      categoryDemandScore,
      storeTrustScore: existing.store.trustScore,
    });

    // Calculate ILS price
    const exchangeRate = await getExchangeRate();
    const priceILS = Math.round(finalPriceCurrent * exchangeRate);

    const updateData: Record<string, unknown> = {
      score: scoreResult.total,
      priceILS,
      updatedAt: new Date(),
    };

    if (titleHe !== undefined) updateData.titleHe = titleHe;
    if (titleEn !== undefined) updateData.titleEn = titleEn;
    if (descriptionHe !== undefined) updateData.descriptionHe = descriptionHe;
    if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (priceOriginal !== undefined) updateData.priceOriginal = priceOriginal;
    if (priceCurrent !== undefined) updateData.priceCurrent = priceCurrent;
    if (couponCode !== undefined) updateData.couponCode = couponCode || null;
    if (couponValue !== undefined) updateData.couponValue = couponValue || null;
    if (couponType !== undefined) updateData.couponType = couponType || null;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (affiliateUrl !== undefined) updateData.affiliateUrl = affiliateUrl;
    if (tags !== undefined) updateData.tags = tags;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        store: { select: { name: true, platform: true } },
        category: { select: { nameHe: true } },
      },
    });

    return NextResponse.json({ deal: updated, score: scoreResult });
  } catch (error) {
    console.error("Failed to update deal:", error);
    return NextResponse.json(
      { error: "שגיאה בעדכון הדיל" },
      { status: 500 }
    );
  }
}

// DELETE deal (soft or hard)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get("hard") === "true";

    if (hard) {
      // Hard delete - remove all related records first
      await prisma.conversion.deleteMany({ where: { productId: id } });
      await prisma.click.deleteMany({ where: { productId: id } });
      await prisma.post.deleteMany({ where: { productId: id } });
      await prisma.product.delete({ where: { id } });

      return NextResponse.json({ success: true, deleted: true });
    }

    // Soft delete - set status to REJECTED
    await prisma.product.update({
      where: { id },
      data: { status: "REJECTED", isPublished: false },
    });

    return NextResponse.json({ success: true, softDeleted: true });
  } catch (error) {
    console.error("Failed to delete deal:", error);
    return NextResponse.json(
      { error: "שגיאה במחיקת הדיל" },
      { status: 500 }
    );
  }
}
