import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "סיסמה שגויה" },
        { status: 401 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable is not set");
      return NextResponse.json(
        { error: "שגיאת שרת" },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "סיסמה שגויה" },
        { status: 401 }
      );
    }

    const token = createAdminToken();
    const isProduction = process.env.NODE_ENV === "production";
    const sevenDays = 60 * 60 * 24 * 7;

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: sevenDays,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "שגיאת שרת" },
      { status: 500 }
    );
  }
}
