export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "";

async function sendMessage(chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

function formatDealList(deals: Array<{
  titleHe: string | null;
  titleEn: string;
  priceILS: number | null;
  priceCurrent: number;
  priceOriginal: number;
  couponCode: string | null;
  store: { name: string };
}>): string {
  let result = "";
  for (const deal of deals) {
    const price = deal.priceILS ? `₪${Math.round(deal.priceILS)}` : `$${deal.priceCurrent}`;
    const originalPrice = deal.priceILS
      ? `₪${Math.round(deal.priceOriginal * 3.65)}`
      : `$${deal.priceOriginal}`;
    result += `• <b>${deal.titleHe || deal.titleEn}</b>\n`;
    result += `  💰 ${price} <s>${originalPrice}</s> | ${deal.store.name}\n`;
    if (deal.couponCode) {
      result += `  🎟️ קופון: <code>${deal.couponCode}</code>\n`;
    }
    result += `\n`;
  }
  return result;
}

export async function POST(request: Request) {
  // Verify webhook authenticity via secret_token header
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secretToken) {
    const headerToken = request.headers.get("x-telegram-bot-api-secret-token");
    if (headerToken !== secretToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const update = await request.json();

  // Handle bot commands from private messages
  const message = update?.message;
  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text === "/start") {
    await sendMessage(
      chatId,
      "שלום! 👋 אני הבוט של קליקלי 🔥\nאני שולח את הדילים הכי שווים מ-AliExpress, Temu ו-iHerb!\n\nפקודות:\n/deals - הדילים האחרונים\n/hot - דילים חמים (ציון 80+)\n/help - עזרה"
    );
  } else if (text === "/deals") {
    const deals = await prisma.product.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { score: "desc" },
      take: 5,
      include: { store: { select: { name: true } } },
    });

    if (deals.length === 0) {
      await sendMessage(chatId, "😅 אין דילים פעילים כרגע. חזרו מאוחר יותר!");
      return NextResponse.json({ ok: true });
    }

    let response = "🔥 <b>הדילים הכי חמים עכשיו:</b>\n\n";
    response += formatDealList(deals);
    response += `\n📱 עוד דילים בערוץ: ${CHANNEL_ID}`;

    await sendMessage(chatId, response);
  } else if (text === "/hot") {
    const hotDeals = await prisma.product.findMany({
      where: {
        isPublished: true,
        status: "PUBLISHED",
        score: { gte: 80 },
      },
      orderBy: { score: "desc" },
      take: 5,
      include: { store: { select: { name: true } } },
    });

    if (hotDeals.length === 0) {
      await sendMessage(chatId, "😅 אין דילים חמים (ציון 80+) כרגע. חזרו מאוחר יותר!");
      return NextResponse.json({ ok: true });
    }

    let response = "🔥🔥 <b>דילים חמים (ציון 80+):</b>\n\n";
    response += formatDealList(hotDeals);
    response += `\n📱 עוד דילים בערוץ: ${CHANNEL_ID}`;

    await sendMessage(chatId, response);
  } else if (text.startsWith("/search")) {
    const query = text.replace("/search", "").trim();
    if (!query) {
      await sendMessage(chatId, "🔍 שלחו /search ואחריו מילת חיפוש\nלדוגמה: /search אוזניות");
      return NextResponse.json({ ok: true });
    }

    const results = await prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { titleHe: { contains: query } },
          { titleEn: { contains: query } },
        ],
      },
      orderBy: { score: "desc" },
      take: 5,
      include: { store: { select: { name: true } } },
    });

    if (results.length === 0) {
      await sendMessage(chatId, `😕 לא מצאתי דילים עבור "${query}"\nנסו מילה אחרת!`);
      return NextResponse.json({ ok: true });
    }

    let response = `🔍 <b>תוצאות חיפוש: "${query}"</b>\n\n`;
    for (const deal of results) {
      const price = deal.priceILS ? `₪${Math.round(deal.priceILS)}` : `$${deal.priceCurrent}`;
      response += `• <b>${deal.titleHe || deal.titleEn}</b>\n`;
      response += `  💰 ${price} | ${deal.store.name}\n\n`;
    }

    await sendMessage(chatId, response);
  } else if (text === "/help") {
    await sendMessage(
      chatId,
      `ℹ️ <b>עזרה - קליקלי בוט</b>\n\n/start - התחלה\n/deals - הדילים האחרונים\n/hot - דילים חמים (ציון 80+)\n/search [מילה] - חיפוש מוצר\n/help - הודעה זו\n\n📱 ערוץ הדילים: ${CHANNEL_ID}\n🌐 אתר: ${process.env.NEXT_PUBLIC_SITE_URL || "clickly.co.il"}`
    );
  }

  return NextResponse.json({ ok: true });
}

// Verify webhook (Telegram sends GET to verify)
export async function GET() {
  return NextResponse.json({ status: "Telegram webhook active" });
}
