import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, nickname, content, rating } = body;

    if (!productId || !nickname || !content) {
      return NextResponse.json(
        { error: "חסרים שדות חובה: שם תצוגה ותוכן" },
        { status: 400 }
      );
    }

    if (typeof nickname !== "string" || nickname.trim().length < 2 || nickname.trim().length > 50) {
      return NextResponse.json(
        { error: "שם תצוגה חייב להיות בין 2 ל-50 תווים" },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || content.trim().length < 3 || content.trim().length > 1000) {
      return NextResponse.json(
        { error: "תוכן התגובה חייב להיות בין 3 ל-1000 תווים" },
        { status: 400 }
      );
    }

    if (rating !== undefined && rating !== null) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: "דירוג חייב להיות בין 1 ל-5" },
          { status: 400 }
        );
      }
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "מוצר לא נמצא" }, { status: 404 });
    }

    // Rate limiting: max 5 comments per IP per hour
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentComments = await prisma.comment.count({
      where: {
        ipHash,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentComments >= 5) {
      return NextResponse.json(
        { error: "יותר מדי תגובות. נסו שוב מאוחר יותר." },
        { status: 429 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        productId,
        nickname: nickname.trim(),
        content: content.trim(),
        rating: rating ?? null,
        ipHash,
        isApproved: false,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "שגיאה ביצירת התגובה" },
      { status: 500 }
    );
  }
}
