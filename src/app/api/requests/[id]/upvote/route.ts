import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const dealRequest = await prisma.dealRequest.findUnique({
      where: { id },
      select: { id: true, ipHash: true, upvotes: true },
    });

    if (!dealRequest) {
      return NextResponse.json({ error: "בקשה לא נמצאה" }, { status: 404 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);

    // Simple check: don't let the creator upvote their own request
    if (dealRequest.ipHash === ipHash) {
      return NextResponse.json(
        { error: "לא ניתן להצביע לבקשה שלך" },
        { status: 400 }
      );
    }

    // Increment upvotes (simple approach - no tracking per IP for upvotes)
    const updated = await prisma.dealRequest.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
      select: { upvotes: true },
    });

    return NextResponse.json({ upvotes: updated.upvotes });
  } catch (error) {
    console.error("Failed to upvote request:", error);
    return NextResponse.json(
      { error: "שגיאה בהצבעה" },
      { status: 500 }
    );
  }
}
