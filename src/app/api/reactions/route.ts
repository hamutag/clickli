import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type } = body;

    if (!productId || !type) {
      return NextResponse.json(
        { error: "חסרים שדות חובה" },
        { status: 400 }
      );
    }

    if (type !== "LIKE" && type !== "DISLIKE") {
      return NextResponse.json(
        { error: "סוג תגובה לא חוקי" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "מוצר לא נמצא" }, { status: 404 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);

    // Check existing reaction
    const existing = await prisma.dealReaction.findUnique({
      where: {
        productId_ipHash: { productId, ipHash },
      },
    });

    if (existing) {
      if (existing.type === type) {
        // Same reaction: remove it (toggle off)
        await prisma.dealReaction.delete({
          where: { id: existing.id },
        });
      } else {
        // Different reaction: switch
        await prisma.dealReaction.update({
          where: { id: existing.id },
          data: { type },
        });
      }
    } else {
      // No existing reaction: create new
      await prisma.dealReaction.create({
        data: { productId, type, ipHash },
      });
    }

    // Get updated counts
    const [likes, dislikes] = await Promise.all([
      prisma.dealReaction.count({ where: { productId, type: "LIKE" } }),
      prisma.dealReaction.count({ where: { productId, type: "DISLIKE" } }),
    ]);

    // Check current user's reaction
    const userReaction = await prisma.dealReaction.findUnique({
      where: { productId_ipHash: { productId, ipHash } },
      select: { type: true },
    });

    return NextResponse.json({
      likes,
      dislikes,
      userReaction: userReaction?.type ?? null,
    });
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return NextResponse.json(
      { error: "שגיאה בעדכון התגובה" },
      { status: 500 }
    );
  }
}
