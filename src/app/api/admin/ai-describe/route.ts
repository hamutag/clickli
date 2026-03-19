import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { title, platform } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const platformName =
      platform === "ALIEXPRESS"
        ? "AliExpress"
        : platform === "TEMU"
          ? "Temu"
          : platform === "IHERB"
            ? "iHerb"
            : platform;

    const prompt = `אתה קופירייטר ישראלי מקצועי שכותב על דילים ומבצעים. כתוב תיאור קצר ומשכנע בעברית למוצר הבא:

שם המוצר: ${title}
חנות: ${platformName}

כתוב 2-3 משפטים שמסבירים למה המוצר שווה, למי הוא מתאים, ומה היתרון המרכזי שלו.
כתוב בשפה טבעית, חדה ומשכנעת. אל תשתמש בסגנון רובוטי.
החזר רק את הטקסט, בלי JSON, בלי עטיפה, בלי backticks.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const description = response.text().trim();

    return NextResponse.json({ description });
  } catch (error) {
    console.error("AI describe failed:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
