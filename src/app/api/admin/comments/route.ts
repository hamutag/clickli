import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "pending", "approved", "all"

    const where =
      status === "approved"
        ? { isApproved: true }
        : status === "all"
          ? {}
          : { isApproved: false }; // default: pending

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            titleHe: true,
            titleEn: true,
          },
        },
      },
    });

    const pendingCount = await prisma.comment.count({
      where: { isApproved: false },
    });

    return NextResponse.json({ comments, pendingCount });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת התגובות" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "חסרים מזהי תגובות" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "פעולה לא חוקית" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      await prisma.comment.updateMany({
        where: { id: { in: ids } },
        data: { isApproved: true },
      });
    } else {
      // Reject = delete
      await prisma.comment.deleteMany({
        where: { id: { in: ids } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to moderate comments:", error);
    return NextResponse.json(
      { error: "שגיאה בעדכון התגובות" },
      { status: 500 }
    );
  }
}
