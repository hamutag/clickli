import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, telegramId, categories, minScore } = body;

    if (!email && !telegramId) {
      return NextResponse.json(
        { error: "יש לספק אימייל או מזהה טלגרם" },
        { status: 400 }
      );
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "כתובת אימייל לא תקינה" },
        { status: 400 }
      );
    }

    const scoreValue =
      typeof minScore === "number" && minScore >= 0 && minScore <= 100
        ? minScore
        : 70;

    const categoriesJson =
      Array.isArray(categories) && categories.length > 0
        ? JSON.stringify(categories)
        : null;

    // Upsert by email or telegramId
    const where = email
      ? { email }
      : { telegramId: telegramId as string };

    const subscriber = await prisma.subscriber.upsert({
      where,
      update: {
        categories: categoriesJson,
        minScore: scoreValue,
        isActive: true,
        ...(email && { email }),
        ...(telegramId && { telegramId }),
      },
      create: {
        email: email || null,
        telegramId: telegramId || null,
        categories: categoriesJson,
        minScore: scoreValue,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "נרשמתם בהצלחה לדילים!",
      subscriberId: subscriber.id,
    });
  } catch (error) {
    console.error("Subscribe error:", error);

    const isDuplicate =
      error instanceof Error &&
      error.message.includes("Unique constraint");

    if (isDuplicate) {
      return NextResponse.json({
        success: true,
        message: "כבר רשומים! עדכנו את ההעדפות שלכם.",
      });
    }

    return NextResponse.json(
      { error: "שגיאה ברישום. נסו שוב." },
      { status: 500 }
    );
  }
}
