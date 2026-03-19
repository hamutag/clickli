import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { scrapeProductUrl } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "נא לספק כתובת URL תקינה" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "כתובת URL לא תקינה" },
        { status: 400 }
      );
    }

    const product = await scrapeProductUrl(url);

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Scrape error:", error);
    const message = error instanceof Error ? error.message : "שגיאה בסריקת הכתובת";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
