import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);

    const [likes, dislikes, userReaction] = await Promise.all([
      prisma.dealReaction.count({ where: { productId, type: "LIKE" } }),
      prisma.dealReaction.count({ where: { productId, type: "DISLIKE" } }),
      prisma.dealReaction.findUnique({
        where: { productId_ipHash: { productId, ipHash } },
        select: { type: true },
      }),
    ]);

    return NextResponse.json({
      likes,
      dislikes,
      userReaction: userReaction?.type ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch reactions:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת התגובות" },
      { status: 500 }
    );
  }
}
