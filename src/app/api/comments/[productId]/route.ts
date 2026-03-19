import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { productId } = await params;

    const comments = await prisma.comment.findMany({
      where: {
        productId,
        isApproved: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nickname: true,
        content: true,
        rating: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת התגובות" },
      { status: 500 }
    );
  }
}
