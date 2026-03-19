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

export async function POST(request: Request) {
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
      `🛒 <b>ברוכים הבאים לקליקלי!</b>\n\nאני הבוט של ערוץ הדילים הכי שווים מחו"ל 🇮🇱\n\n📱 <b>הצטרפו לערוץ:</b> ${CHANNEL_ID}\n\n<b>פקודות:</b>\n/deals - הדילים החמים עכשיו\n/search מילת חיפוש - חיפוש מוצר\n/help - עזרה`
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
    for (const deal of deals) {
      const price = deal.priceILS ? `₪${Math.round(deal.priceILS)}` : `$${deal.priceCurrent}`;
      const originalPrice = deal.priceILS
        ? `₪${Math.round(deal.priceOriginal * 3.65)}`
        : `$${deal.priceOriginal}`;
      response += `• <b>${deal.titleHe || deal.titleEn}</b>\n`;
      response += `  💰 ${price} <s>${originalPrice}</s> | ${deal.store.name}\n`;
      if (deal.couponCode) {
        response += `  🎟️ קופון: <code>${deal.couponCode}</code>\n`;
      }
      response += `\n`;
    }
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
      `ℹ️ <b>עזרה - קליקלי בוט</b>\n\n/deals - הדילים הכי חמים\n/search [מילה] - חיפוש מוצר\n/help - הודעה זו\n\n📱 ערוץ הדילים: ${CHANNEL_ID}\n🌐 אתר: ${process.env.NEXT_PUBLIC_SITE_URL || "clickly.co.il"}`
    );
  }

  return NextResponse.json({ ok: true });
}

// Verify webhook (Telegram sends GET to verify)
export async function GET() {
  return NextResponse.json({ status: "Telegram webhook active" });
}
