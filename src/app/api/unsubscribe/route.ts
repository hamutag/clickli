import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const token = request.nextUrl.searchParams.get("token");

    if (!email && !token) {
      return NextResponse.json(
        { error: "יש לספק אימייל או טוקן" },
        { status: 400 }
      );
    }

    const identifier = email || token;

    // Try by email first, then by id (token)
    const subscriber = email
      ? await prisma.subscriber.findUnique({ where: { email } })
      : await prisma.subscriber.findUnique({ where: { id: identifier as string } });

    if (!subscriber) {
      return NextResponse.json(
        { error: "מנוי לא נמצא" },
        { status: 404 }
      );
    }

    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "הוסרתם מרשימת התפוצה בהצלחה.",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "שגיאה בביטול הרישום. נסו שוב." },
      { status: 500 }
    );
  }
}
