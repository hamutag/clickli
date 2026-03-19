import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      titleEn,
      priceCurrent,
      priceOriginal,
      couponCode,
      couponValue,
      categoryNameHe,
      storeName,
    } = body;

    if (!titleEn) {
      return NextResponse.json(
        { error: "חסרה כותרת באנגלית" },
        { status: 400 }
      );
    }

    const savingsPercent =
      priceOriginal > 0
        ? Math.round(((priceOriginal - priceCurrent) / priceOriginal) * 100)
        : 0;

    const prompt = `אתה קופירייטר ישראלי מקצועי. כתוב כותרת ותיאור קצר בעברית למוצר הבא:

שם המוצר: ${titleEn}
חנות: ${storeName || "לא ידוע"}
קטגוריה: ${categoryNameHe || "כללי"}
מחיר מקורי: $${priceOriginal}
מחיר נוכחי: $${priceCurrent}
הנחה: ${savingsPercent}%
${couponCode ? `קופון: ${couponCode} (${couponValue}$ הנחה)` : ""}

החזר בפורמט JSON בלבד (בלי markdown, בלי backticks):
{
  "titleHe": "כותרת שיווקית חזקה בעברית (עד 80 תווים)",
  "descriptionHe": "2-3 משפטים שמסבירים למה המוצר שווה, טבעי ומשכנע"
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const cleanText = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleanText);

    return NextResponse.json({
      titleHe: parsed.titleHe || null,
      descriptionHe: parsed.descriptionHe || null,
    });
  } catch (error) {
    console.error("AI regeneration error:", error);
    return NextResponse.json(
      { error: "שגיאה ביצירת תוכן AI" },
      { status: 500 }
    );
  }
}
