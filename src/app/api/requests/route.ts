import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function GET() {
  try {
    const requests = await prisma.dealRequest.findMany({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS", "FULFILLED"] },
      },
      orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        nickname: true,
        description: true,
        category: true,
        maxBudget: true,
        platform: true,
        status: true,
        upvotes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Failed to fetch deal requests:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת הבקשות" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, email, description, category, maxBudget, platform } = body;

    if (!nickname || !description) {
      return NextResponse.json(
        { error: "חסרים שדות חובה: שם תצוגה ותיאור" },
        { status: 400 }
      );
    }

    if (typeof nickname !== "string" || nickname.trim().length < 2 || nickname.trim().length > 50) {
      return NextResponse.json(
        { error: "שם תצוגה חייב להיות בין 2 ל-50 תווים" },
        { status: 400 }
      );
    }

    if (typeof description !== "string" || description.trim().length < 5 || description.trim().length > 500) {
      return NextResponse.json(
        { error: "תיאור חייב להיות בין 5 ל-500 תווים" },
        { status: 400 }
      );
    }

    if (email && typeof email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "כתובת אימייל לא חוקית" },
          { status: 400 }
        );
      }
    }

    if (maxBudget !== undefined && maxBudget !== null) {
      if (typeof maxBudget !== "number" || maxBudget <= 0) {
        return NextResponse.json(
          { error: "תקציב חייב להיות מספר חיובי" },
          { status: 400 }
        );
      }
    }

    // Rate limiting: max 3 requests per IP per hour
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentRequests = await prisma.dealRequest.count({
      where: {
        ipHash,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentRequests >= 3) {
      return NextResponse.json(
        { error: "יותר מדי בקשות. נסו שוב מאוחר יותר." },
        { status: 429 }
      );
    }

    const dealRequest = await prisma.dealRequest.create({
      data: {
        nickname: nickname.trim(),
        email: email?.trim() || null,
        description: description.trim(),
        category: category?.trim() || null,
        maxBudget: maxBudget ?? null,
        platform: platform?.trim() || null,
        ipHash,
      },
    });

    return NextResponse.json({ request: dealRequest }, { status: 201 });
  } catch (error) {
    console.error("Failed to create deal request:", error);
    return NextResponse.json(
      { error: "שגיאה ביצירת הבקשה" },
      { status: 500 }
    );
  }
}
