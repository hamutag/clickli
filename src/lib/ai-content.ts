import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeneratedContent, TelegramPost } from "@/types";
import { formatPriceILS } from "./currency";
import { getDealTier } from "./scoring";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ContentInput {
  titleEn: string;
  titleHe?: string;
  priceCurrent: number;
  priceOriginal: number;
  priceILS: number;
  priceOriginalILS: number;
  shippingFree: boolean;
  shippingCost: number;
  rating: number | null;
  reviewCount: number;
  couponCode: string | null;
  couponValue: number | null;
  categoryNameHe: string;
  storeName: string;
  score: number;
  vatApplies: boolean;
  imageUrl: string | null;
  affiliateUrl: string;
}

// יצירת תוכן SEO ארוך לאתר
export async function generateWebContent(input: ContentInput): Promise<GeneratedContent> {
  const { tier } = getDealTier(input.score);
  const savingsPercent = Math.round(
    ((input.priceOriginal - input.priceCurrent) / input.priceOriginal) * 100
  );

  const prompt = `אתה קופירייטר ישראלי מקצועי שכותב על דילים ומבצעים. כתוב תוכן שיווקי בעברית טבעית, חדה ומשכנעת.

פרטי המוצר:
- שם: ${input.titleEn}${input.titleHe ? ` (${input.titleHe})` : ""}
- חנות: ${input.storeName}
- קטגוריה: ${input.categoryNameHe}
- מחיר מקורי: ${formatPriceILS(input.priceOriginalILS)}
- מחיר עכשיו: ${formatPriceILS(input.priceILS)}
- הנחה: ${savingsPercent}%
- משלוח: ${input.shippingFree ? "חינם" : `${formatPriceILS(input.shippingCost * 3.65)}`}
- דירוג: ${input.rating ? `${input.rating}/5 (${input.reviewCount.toLocaleString()} ביקורות)` : "אין דירוג"}
- קופון: ${input.couponCode ? `${input.couponCode} (${input.couponValue}${input.couponValue && input.couponValue > 1 ? "$" : "%"} הנחה)` : "אין"}
- רמת דיל: ${tier}
- מע"מ: ${input.vatApplies ? "כן, המחיר כולל מע\"מ" : "לא חל (מתחת ל-$75)"}

כתוב בפורמט JSON הבא בלבד (בלי markdown, בלי קוד, בלי backticks):
{
  "titleHe": "כותרת שיווקית חזקה בעברית (עד 80 תווים, כולל מחיר)",
  "bodyHe": "3-5 משפטים שמסבירים למה המוצר שווה, למי הוא מתאים, ומה היתרון הגדול. אל תחזור על הכותרת. כתוב טבעי ולא רובוטי.",
  "ctaHe": "משפט CTA אחד חזק",
  "prosHe": "2-3 יתרונות מרכזיים, מופרדים ב-|",
  "consHe": "חסרון אחד אמיתי וקטן שמגביר אמון",
  "metaDescription": "תיאור מטא ל-SEO בעברית, עד 155 תווים"
}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Clean up potential markdown code fences
  const cleanText = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  const parsed = JSON.parse(cleanText) as GeneratedContent;
  return parsed;
}

// יצירת פוסט קצר לטלגרם
export async function generateTelegramContent(input: ContentInput): Promise<TelegramPost> {
  const { emoji } = getDealTier(input.score);
  const savingsPercent = Math.round(
    ((input.priceOriginal - input.priceCurrent) / input.priceOriginal) * 100
  );

  const prompt = `אתה קופירייטר של ערוץ דילים בטלגרם. כתוב פוסט קצר, מושך ומשכנע בעברית.

פרטי המוצר:
- שם: ${input.titleEn}
- מחיר מקורי: ${formatPriceILS(input.priceOriginalILS)}
- מחיר עכשיו: ${formatPriceILS(input.priceILS)}
- הנחה: ${savingsPercent}%
- משלוח: ${input.shippingFree ? "חינם" : `${formatPriceILS(input.shippingCost * 3.65)}`}
- דירוג: ${input.rating ? `${input.rating}/5 (${input.reviewCount.toLocaleString()} ביקורות)` : ""}
- קופון: ${input.couponCode || "אין"}
- חנות: ${input.storeName}
- מע"מ: ${input.vatApplies ? "כולל מע\"מ" : "ללא מע\"מ"}

כתוב פוסט טלגרם קצר (4-6 שורות מקסימום). השתמש באימוג'ים בחכמה.
הפורמט:
${emoji} שורת כותרת חזקה עם מחיר
✅ יתרון מרכזי | ⭐ דירוג
💰 קופון (אם יש)
👉 לקנייה: [הלינק יתווסף אוטומטית]

החזר רק את הטקסט, בלי JSON, בלי עטיפה, בלי backticks.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  let text = response.text().trim();

  // הוספת לינק בסוף אם אין
  if (!text.includes("👉")) {
    text += `\n\n👉 לקנייה: ${input.affiliateUrl}`;
  } else {
    text = text.replace(/👉.*$/m, `👉 לקנייה: ${input.affiliateUrl}`);
  }

  return {
    text,
    imageUrl: input.imageUrl ?? undefined,
    affiliateUrl: input.affiliateUrl,
  };
}
