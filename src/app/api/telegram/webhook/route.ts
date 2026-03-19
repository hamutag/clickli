export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendBotMessage,
  sendMessageWithButtons,
  answerCallbackQuery,
  getChannelSubscriberCount,
} from "@/lib/telegram";
import type { InlineKeyboardMarkup } from "@/lib/telegram";

const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clickly.co.il";

// ============================================
// Telegram Update Type Definitions
// ============================================

interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
}

interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  chat: TelegramChat;
  from?: TelegramUser;
  text?: string;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

// ============================================
// Helpers
// ============================================

function createTrackingUrl(productId: string): string {
  return `${SITE_URL}/go/${productId}?src=telegram`;
}

interface DealForDisplay {
  id: string;
  titleHe: string | null;
  titleEn: string;
  priceILS: number | null;
  priceCurrent: number;
  priceOriginal: number;
  couponCode: string | null;
  score: number;
  store: { name: string };
  category?: { nameHe: string } | null;
}

function formatDealWithLink(deal: DealForDisplay, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : "";
  const price = deal.priceILS
    ? `\u20AA${Math.round(deal.priceILS)}`
    : `$${deal.priceCurrent}`;
  const originalPrice = deal.priceILS
    ? `\u20AA${Math.round(deal.priceOriginal * 3.65)}`
    : `$${deal.priceOriginal}`;
  const discount = deal.priceOriginal > 0
    ? Math.round(((deal.priceOriginal - deal.priceCurrent) / deal.priceOriginal) * 100)
    : 0;

  let text = `${prefix}<b>${deal.titleHe || deal.titleEn}</b>\n`;
  text += `   \uD83D\uDCB0 ${price} <s>${originalPrice}</s>`;
  if (discount > 0) {
    text += ` (-${discount}%)`;
  }
  text += ` | ${deal.store.name}\n`;
  if (deal.couponCode) {
    text += `   \uD83C\uDF9F\uFE0F \u05E7\u05D5\u05E4\u05D5\u05DF: <code>${deal.couponCode}</code>\n`;
  }
  if (deal.score >= 80) {
    text += `   \uD83D\uDD25 \u05E6\u05D9\u05D5\u05DF: ${deal.score}/100\n`;
  }
  return text;
}

function buildDealButtons(deals: DealForDisplay[]): InlineKeyboardMarkup {
  const rows: { text: string; url: string }[][] = deals.map((deal, i) => [
    {
      text: `\uD83D\uDED2 ${i + 1}. ${(deal.titleHe || deal.titleEn).slice(0, 30)}`,
      url: createTrackingUrl(deal.id),
    },
  ]);

  rows.push([
    {
      text: `\uD83D\uDCF1 \u05E2\u05D5\u05D3 \u05D3\u05D9\u05DC\u05D9\u05DD \u05D1\u05E2\u05E8\u05D5\u05E5`,
      url: `https://t.me/${CHANNEL_ID.replace("@", "")}`,
    },
  ]);

  return { inline_keyboard: rows };
}

function isValidTelegramUpdate(body: unknown): body is TelegramUpdate {
  if (typeof body !== "object" || body === null) return false;
  const update = body as Record<string, unknown>;
  return typeof update.update_id === "number" && (
    update.message !== undefined || update.callback_query !== undefined
  );
}

// ============================================
// Command Handlers
// ============================================

async function handleStart(chatId: number): Promise<void> {
  const text =
    `\u05E9\u05DC\u05D5\u05DD! \uD83D\uDC4B \u05D0\u05E0\u05D9 \u05D4\u05D1\u05D5\u05D8 \u05E9\u05DC \u05E7\u05DC\u05D9\u05E7\u05DC\u05D9 \uD83D\uDD25\n\n` +
    `\u05D0\u05E0\u05D9 \u05DE\u05D5\u05E6\u05D0 \u05D0\u05EA \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD \u05D4\u05DB\u05D9 \u05E9\u05D5\u05D5\u05D9\u05DD \u05DE-AliExpress, Temu \u05D5-iHerb!\n` +
    `\u05DB\u05DC \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD \u05E0\u05D1\u05D3\u05E7\u05D9\u05DD \u05D5\u05DE\u05D3\u05D5\u05E8\u05D2\u05D9\u05DD \u05DC\u05E4\u05D9 \u05E6\u05D9\u05D5\u05DF \u05D0\u05D9\u05DB\u05D5\u05EA.\n\n` +
    `\uD83D\uDCCC <b>\u05E4\u05E7\u05D5\u05D3\u05D5\u05EA \u05D6\u05DE\u05D9\u05E0\u05D5\u05EA:</b>\n` +
    `/deals \u05D0\u05D5 /\u05D3\u05D9\u05DC\u05D9\u05DD - \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD \u05D4\u05D0\u05D7\u05E8\u05D5\u05E0\u05D9\u05DD\n` +
    `/hot \u05D0\u05D5 /\u05D7\u05DD - \u05D4\u05D3\u05D9\u05DC \u05D4\u05DB\u05D9 \u05D7\u05DD \u05E2\u05DB\u05E9\u05D9\u05D5\n` +
    `/categories \u05D0\u05D5 /\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA - \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA\n` +
    `/search <\u05DE\u05D9\u05DC\u05D4> \u05D0\u05D5 /\u05D7\u05E4\u05E9 <\u05DE\u05D9\u05DC\u05D4> - \u05D7\u05D9\u05E4\u05D5\u05E9\n` +
    `/stats \u05D0\u05D5 /\u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D4 - \u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D5\u05EA\n` +
    `/help \u05D0\u05D5 /\u05E2\u05D6\u05E8\u05D4 - \u05E2\u05D6\u05E8\u05D4\n\n` +
    `\uD83D\uDCF1 \u05D4\u05E6\u05D8\u05E8\u05E4\u05D5 \u05DC\u05E2\u05E8\u05D5\u05E5 \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD: ${CHANNEL_ID}`;

  const buttons: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: "\uD83D\uDD25 \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD \u05D4\u05D0\u05D7\u05E8\u05D5\u05E0\u05D9\u05DD", callback_data: "cmd_deals" }],
      [{ text: "\uD83C\uDF10 \u05DC\u05D0\u05EA\u05E8", url: SITE_URL }],
      [{ text: "\uD83D\uDCE2 \u05E2\u05E8\u05D5\u05E5 \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD", url: `https://t.me/${CHANNEL_ID.replace("@", "")}` }],
    ],
  };

  await sendMessageWithButtons(chatId, text, buttons);
}

async function handleDeals(chatId: number): Promise<void> {
  try {
    const deals = await prisma.product.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { score: "desc" },
      take: 5,
      include: {
        store: { select: { name: true } },
        category: { select: { nameHe: true } },
      },
    });

    if (deals.length === 0) {
      await sendBotMessage(
        chatId,
        "\uD83D\uDE05 \u05D0\u05D9\u05DF \u05D3\u05D9\u05DC\u05D9\u05DD \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD \u05DB\u05E8\u05D2\u05E2. \u05D7\u05D6\u05E8\u05D5 \u05DE\u05D0\u05D5\u05D7\u05E8 \u05D9\u05D5\u05EA\u05E8!"
      );
      return;
    }

    let response = "\uD83D\uDD25 <b>\u05D4\u05D3\u05D9\u05DC\u05D9\u05DD \u05D4\u05DB\u05D9 \u05E9\u05D5\u05D5\u05D9\u05DD \u05E2\u05DB\u05E9\u05D9\u05D5:</b>\n\n";
    for (const [i, deal] of deals.entries()) {
      response += formatDealWithLink(deal, i);
      response += "\n";
    }
    response += `\u2B07\uFE0F \u05DC\u05D7\u05E6\u05D5 \u05E2\u05DC \u05D4\u05DB\u05E4\u05EA\u05D5\u05E8 \u05DC\u05DE\u05E2\u05D1\u05E8 \u05DC\u05D3\u05D9\u05DC:`;

    await sendMessageWithButtons(chatId, response, buildDealButtons(deals));
  } catch (error) {
    console.error("handleDeals error:", error);
    await sendBotMessage(
      chatId,
      "\u274C \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD. \u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1 \u05DE\u05D0\u05D5\u05D7\u05E8 \u05D9\u05D5\u05EA\u05E8."
    );
  }
}

async function handleHot(chatId: number): Promise<void> {
  try {
    const hotDeal = await prisma.product.findFirst({
      where: {
        isPublished: true,
        status: "PUBLISHED",
      },
      orderBy: { score: "desc" },
      include: {
        store: { select: { name: true } },
        category: { select: { nameHe: true } },
      },
    });

    if (!hotDeal) {
      await sendBotMessage(
        chatId,
        "\uD83D\uDE05 \u05D0\u05D9\u05DF \u05D3\u05D9\u05DC\u05D9\u05DD \u05D7\u05DE\u05D9\u05DD \u05DB\u05E8\u05D2\u05E2. \u05D7\u05D6\u05E8\u05D5 \u05DE\u05D0\u05D5\u05D7\u05E8 \u05D9\u05D5\u05EA\u05E8!"
      );
      return;
    }

    const price = hotDeal.priceILS
      ? `\u20AA${Math.round(hotDeal.priceILS)}`
      : `$${hotDeal.priceCurrent}`;
    const originalPrice = hotDeal.priceILS
      ? `\u20AA${Math.round(hotDeal.priceOriginal * 3.65)}`
      : `$${hotDeal.priceOriginal}`;
    const discount = hotDeal.priceOriginal > 0
      ? Math.round(((hotDeal.priceOriginal - hotDeal.priceCurrent) / hotDeal.priceOriginal) * 100)
      : 0;

    let response =
      `\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25 <b>\u05D4\u05D3\u05D9\u05DC \u05D4\u05DB\u05D9 \u05D7\u05DD \u05E2\u05DB\u05E9\u05D9\u05D5!</b>\n\n` +
      `\uD83C\uDF81 <b>${hotDeal.titleHe || hotDeal.titleEn}</b>\n\n` +
      `\uD83D\uDCB0 \u05DE\u05D7\u05D9\u05E8: ${price} <s>${originalPrice}</s>`;
    if (discount > 0) {
      response += ` (-${discount}%)`;
    }
    response += `\n\uD83C\uDFEA \u05D7\u05E0\u05D5\u05EA: ${hotDeal.store.name}\n`;
    response += `\u2B50 \u05E6\u05D9\u05D5\u05DF: ${hotDeal.score}/100\n`;
    if (hotDeal.couponCode) {
      response += `\uD83C\uDF9F\uFE0F \u05E7\u05D5\u05E4\u05D5\u05DF: <code>${hotDeal.couponCode}</code>\n`;
    }
    if (hotDeal.category?.nameHe) {
      response += `\uD83D\uDCE6 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4: ${hotDeal.category.nameHe}\n`;
    }
    if (hotDeal.rating) {
      response += `\u2B50 \u05D3\u05D9\u05E8\u05D5\u05D2: ${hotDeal.rating}/5 (${hotDeal.reviewCount} \u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA)\n`;
    }

    const buttons: InlineKeyboardMarkup = {
      inline_keyboard: [
        [{ text: "\uD83D\uDED2 \u05DC\u05E7\u05E0\u05D9\u05D4 \u05E2\u05DB\u05E9\u05D9\u05D5!", url: createTrackingUrl(hotDeal.id) }],
        [{ text: "\uD83D\uDD25 \u05E2\u05D5\u05D3 \u05D3\u05D9\u05DC\u05D9\u05DD", callback_data: "cmd_deals" }],
      ],
    };

    await sendMessageWithButtons(chatId, response, buttons);
  } catch (error) {
    console.error("handleHot error:", error);
    await sendBotMessage(
      chatId,
      "\u274C \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05D4\u05D3\u05D9\u05DC \u05D4\u05D7\u05DD. \u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1 \u05DE\u05D0\u05D5\u05D7\u05E8 \u05D9\u05D5\u05EA\u05E8."
    );
  }
}

async function handleCategories(chatId: number): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { demandScore: "desc" },
      select: {
        id: true,
        nameHe: true,
        icon: true,
        _count: {
          select: {
            products: {
              where: { isPublished: true, status: "PUBLISHED" },
            },
          },
        },
      },
    });

    if (categories.length === 0) {
      await sendBotMessage(
        chatId,
        "\uD83D\uDE05 \u05D0\u05D9\u05DF \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA \u05D6\u05DE\u05D9\u05E0\u05D5\u05EA \u05DB\u05E8\u05D2\u05E2."
      );
      return;
    }

    let response = "\uD83D\uDCE6 <b>\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA \u05D6\u05DE\u05D9\u05E0\u05D5\u05EA:</b>\n\n";
    for (const cat of categories) {
      const icon = cat.icon || "\uD83D\uDCCC";
      const count = cat._count.products;
      response += `${icon} <b>${cat.nameHe}</b> (${count} \u05D3\u05D9\u05DC\u05D9\u05DD)\n`;
    }
    response += `\n\uD83D\uDD0E \u05D7\u05E4\u05E9\u05D5 \u05D3\u05D9\u05DC \u05E2\u05DD /search \u05D0\u05D5 /\u05D7\u05E4\u05E9`;

    const buttons: InlineKeyboardMarkup = {
      inline_keyboard: categories
        .filter((cat) => cat._count.products > 0)
        .slice(0, 5)
        .map((cat) => [
          {
            text: `${cat.icon || "\uD83D\uDCCC"} ${cat.nameHe}`,
            callback_data: `cat_${cat.id}`,
          },
        ]),
    };

    if (buttons.inline_keyboard.length > 0) {
      await sendMessageWithButtons(chatId, response, buttons);
    } else {
      await sendBotMessage(chatId, response);
    }
  } catch (error) {
    console.error("handleCategories error:", error);
    await sendBotMessage(
      chatId,
      "\u274C \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05D4\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA. \u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1 \u05DE\u05D0\u05D5\u05D7\u05E8 \u05D9\u05D5\u05EA\u05E8."
    );
  }
}

async function handleSearch(chatId: number, query: string): Promise<void> {
  if (!query) {
    await sendBotMessage(
      chatId,
      "\uD83D\uDD0D \u05E9\u05DC\u05D7\u05D5 /search \u05D0\u05D5 /\u05D7\u05E4\u05E9 \u05D5\u05D0\u05D7\u05E8\u05D9\u05D5 \u05DE\u05D9\u05DC\u05EA \u05D7\u05D9\u05E4\u05D5\u05E9\n\u05DC\u05D3\u05D5\u05D2\u05DE\u05D4: /search \u05D0\u05D5\u05D6\u05E0\u05D9\u05D5\u05EA"
    );
    return;
  }

  // Sanitize query - limit length
  const sanitizedQuery = query.slice(0, 100).trim();

  try {
    const results = await prisma.product.findMany({
      where: {
        isPublished: true,
        status: "PUBLISHED",
        OR: [
          { titleHe: { contains: sanitizedQuery, mode: "insensitive" } },
          { titleEn: { contains: sanitizedQuery, mode: "insensitive" } },
          { descriptionHe: { contains: sanitizedQuery, mode: "insensitive" } },
        ],
      },
      orderBy: { score: "desc" },
      take: 5,
      include: {
        store: { select: { name: true } },
        category: { select: { nameHe: true } },
      },
    });

    if (results.length === 0) {
      const buttons: InlineKeyboardMarkup = {
        inline_keyboard: [
          [{ text: "\uD83D\uDD25 \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD \u05D4\u05D0\u05D7\u05E8\u05D5\u05E0\u05D9\u05DD", callback_data: "cmd_deals" }],
          [{ text: "\uD83D\uDCE6 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA", callback_data: "cmd_categories" }],
        ],
      };
      await sendMessageWithButtons(
        chatId,
        `\uD83D\uDE15 \u05DC\u05D0 \u05DE\u05E6\u05D0\u05EA\u05D9 \u05D3\u05D9\u05DC\u05D9\u05DD \u05E2\u05D1\u05D5\u05E8 "${sanitizedQuery}"\n\u05E0\u05E1\u05D5 \u05DE\u05D9\u05DC\u05D4 \u05D0\u05D7\u05E8\u05EA!`,
        buttons
      );
      return;
    }

    let response = `\uD83D\uDD0D <b>\u05EA\u05D5\u05E6\u05D0\u05D5\u05EA \u05D7\u05D9\u05E4\u05D5\u05E9: "${sanitizedQuery}"</b>\n\n`;
    for (const [i, deal] of results.entries()) {
      response += formatDealWithLink(deal, i);
      response += "\n";
    }

    await sendMessageWithButtons(chatId, response, buildDealButtons(results));
  } catch (error) {
    console.error("handleSearch error:", error);
    await sendBotMessage(
      chatId,
      "\u274C \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D7\u05D9\u05E4\u05D5\u05E9. \u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1 \u05DE\u05D0\u05D5\u05D7\u05E8 \u05D9\u05D5\u05EA\u05E8."
    );
  }
}

async function handleHelp(chatId: number): Promise<void> {
  const text =
    `\u2139\uFE0F <b>\u05E2\u05D6\u05E8\u05D4 - \u05D1\u05D5\u05D8 \u05E7\u05DC\u05D9\u05E7\u05DC\u05D9</b>\n\n` +
    `\uD83D\uDCCC <b>\u05E4\u05E7\u05D5\u05D3\u05D5\u05EA \u05D6\u05DE\u05D9\u05E0\u05D5\u05EA:</b>\n\n` +
    `/start - \u05D4\u05EA\u05D7\u05DC\u05D4 \u05D5\u05E7\u05D1\u05DC\u05EA \u05E4\u05E0\u05D9\u05DD\n` +
    `/deals \u05D0\u05D5 /\u05D3\u05D9\u05DC\u05D9\u05DD - 5 \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD \u05D4\u05DB\u05D9 \u05E9\u05D5\u05D5\u05D9\u05DD \u05E2\u05DB\u05E9\u05D9\u05D5\n` +
    `/hot \u05D0\u05D5 /\u05D7\u05DD - \u05D4\u05D3\u05D9\u05DC \u05D4\u05DB\u05D9 \u05D7\u05DD \u05E2\u05DB\u05E9\u05D9\u05D5\n` +
    `/categories \u05D0\u05D5 /\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA - \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA \u05D6\u05DE\u05D9\u05E0\u05D5\u05EA\n` +
    `/search <\u05DE\u05D9\u05DC\u05D4> \u05D0\u05D5 /\u05D7\u05E4\u05E9 <\u05DE\u05D9\u05DC\u05D4> - \u05D7\u05D9\u05E4\u05D5\u05E9 \u05D3\u05D9\u05DC\u05D9\u05DD\n` +
    `/stats \u05D0\u05D5 /\u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D4 - \u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D5\u05EA \u05D4\u05E2\u05E8\u05D5\u05E5\n` +
    `/help \u05D0\u05D5 /\u05E2\u05D6\u05E8\u05D4 - \u05D4\u05D5\u05D3\u05E2\u05D4 \u05D6\u05D5\n\n` +
    `\uD83D\uDCF1 \u05E2\u05E8\u05D5\u05E5 \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD: ${CHANNEL_ID}\n` +
    `\uD83C\uDF10 \u05D0\u05EA\u05E8: ${SITE_URL}`;

  const buttons: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: "\uD83D\uDD25 \u05D3\u05D9\u05DC\u05D9\u05DD", callback_data: "cmd_deals" },
        { text: "\uD83D\uDD25 \u05D7\u05DD", callback_data: "cmd_hot" },
      ],
      [
        { text: "\uD83D\uDCE6 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA", callback_data: "cmd_categories" },
        { text: "\uD83D\uDCCA \u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D4", callback_data: "cmd_stats" },
      ],
    ],
  };

  await sendMessageWithButtons(chatId, text, buttons);
}

async function handleStats(chatId: number): Promise<void> {
  try {
    const [totalDeals, subscriberCount, todayDeals, totalClicks] = await Promise.all([
      prisma.product.count({
        where: { isPublished: true, status: "PUBLISHED" },
      }),
      getChannelSubscriberCount(),
      prisma.product.count({
        where: {
          isPublished: true,
          status: "PUBLISHED",
          publishedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.click.count(),
    ]);

    const topStores = await prisma.product.groupBy({
      by: ["storeId"],
      where: { isPublished: true, status: "PUBLISHED" },
      _count: { id: true },
    });

    const storeNames = await prisma.store.findMany({
      where: { id: { in: topStores.map((s) => s.storeId) } },
      select: { id: true, name: true },
    });

    const storeMap = new Map(storeNames.map((s) => [s.id, s.name]));

    let response =
      `\uD83D\uDCCA <b>\u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D5\u05EA \u05E7\u05DC\u05D9\u05E7\u05DC\u05D9</b>\n\n` +
      `\uD83D\uDCE6 \u05D3\u05D9\u05DC\u05D9\u05DD \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD: <b>${totalDeals}</b>\n` +
      `\uD83C\uDD95 \u05D3\u05D9\u05DC\u05D9\u05DD \u05D4\u05D9\u05D5\u05DD: <b>${todayDeals}</b>\n` +
      `\uD83D\uDC65 \u05DE\u05E0\u05D5\u05D9\u05D9\u05DD \u05D1\u05E2\u05E8\u05D5\u05E5: <b>${subscriberCount.toLocaleString()}</b>\n` +
      `\uD83D\uDC49 \u05E7\u05DC\u05D9\u05E7\u05D9\u05DD: <b>${totalClicks.toLocaleString()}</b>\n\n`;

    if (topStores.length > 0) {
      response += `\uD83C\uDFEA <b>\u05D3\u05D9\u05DC\u05D9\u05DD \u05DC\u05E4\u05D9 \u05D7\u05E0\u05D5\u05EA:</b>\n`;
      const sorted = [...topStores].sort((a, b) => b._count.id - a._count.id);
      for (const store of sorted) {
        const name = storeMap.get(store.storeId) || store.storeId;
        response += `   \u2022 ${name}: ${store._count.id} \u05D3\u05D9\u05DC\u05D9\u05DD\n`;
      }
    }

    const buttons: InlineKeyboardMarkup = {
      inline_keyboard: [
        [{ text: "\uD83D\uDD25 \u05DC\u05D3\u05D9\u05DC\u05D9\u05DD", callback_data: "cmd_deals" }],
        [{ text: "\uD83D\uDCE2 \u05DC\u05E2\u05E8\u05D5\u05E5", url: `https://t.me/${CHANNEL_ID.replace("@", "")}` }],
      ],
    };

    await sendMessageWithButtons(chatId, response, buttons);
  } catch (error) {
    console.error("handleStats error:", error);
    await sendBotMessage(
      chatId,
      "\u274C \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05D4\u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D5\u05EA. \u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1 \u05DE\u05D0\u05D5\u05D7\u05E8 \u05D9\u05D5\u05EA\u05E8."
    );
  }
}

async function handleCategoryDeals(chatId: number, categoryId: string): Promise<void> {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { nameHe: true },
    });

    if (!category) {
      await sendBotMessage(chatId, "\u274C \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D4.");
      return;
    }

    const deals = await prisma.product.findMany({
      where: {
        isPublished: true,
        status: "PUBLISHED",
        categoryId,
      },
      orderBy: { score: "desc" },
      take: 5,
      include: {
        store: { select: { name: true } },
        category: { select: { nameHe: true } },
      },
    });

    if (deals.length === 0) {
      await sendBotMessage(
        chatId,
        `\uD83D\uDE15 \u05D0\u05D9\u05DF \u05D3\u05D9\u05DC\u05D9\u05DD \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD \u05D1\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4 "${category.nameHe}".`
      );
      return;
    }

    let response = `\uD83D\uDCE6 <b>\u05D3\u05D9\u05DC\u05D9\u05DD \u05D1\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4: ${category.nameHe}</b>\n\n`;
    for (const [i, deal] of deals.entries()) {
      response += formatDealWithLink(deal, i);
      response += "\n";
    }

    await sendMessageWithButtons(chatId, response, buildDealButtons(deals));
  } catch (error) {
    console.error("handleCategoryDeals error:", error);
    await sendBotMessage(
      chatId,
      "\u274C \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05D4\u05D3\u05D9\u05DC\u05D9\u05DD. \u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1 \u05DE\u05D0\u05D5\u05D7\u05E8 \u05D9\u05D5\u05EA\u05E8."
    );
  }
}

// ============================================
// Command Router
// ============================================

function extractCommand(text: string): { command: string; args: string } {
  // Strip bot username suffix (e.g., /deals@ClicklyBot)
  const cleaned = text.replace(/@\w+/, "").trim();
  const spaceIndex = cleaned.indexOf(" ");

  if (spaceIndex === -1) {
    return { command: cleaned.toLowerCase(), args: "" };
  }

  return {
    command: cleaned.slice(0, spaceIndex).toLowerCase(),
    args: cleaned.slice(spaceIndex + 1).trim(),
  };
}

async function routeCommand(chatId: number, text: string): Promise<void> {
  const { command, args } = extractCommand(text);

  switch (command) {
    case "/start":
      return handleStart(chatId);

    case "/deals":
    case "/\u05D3\u05D9\u05DC\u05D9\u05DD":
      return handleDeals(chatId);

    case "/hot":
    case "/\u05D7\u05DD":
      return handleHot(chatId);

    case "/categories":
    case "/\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA":
      return handleCategories(chatId);

    case "/search":
    case "/\u05D7\u05E4\u05E9":
      return handleSearch(chatId, args);

    case "/help":
    case "/\u05E2\u05D6\u05E8\u05D4":
      return handleHelp(chatId);

    case "/stats":
    case "/\u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D4":
      return handleStats(chatId);

    default:
      // Ignore unknown commands silently in groups, respond in private
      break;
  }
}

// ============================================
// Callback Query Router
// ============================================

async function routeCallbackQuery(
  callbackQueryId: string,
  chatId: number,
  data: string
): Promise<void> {
  await answerCallbackQuery(callbackQueryId);

  if (data === "cmd_deals") {
    return handleDeals(chatId);
  }
  if (data === "cmd_hot") {
    return handleHot(chatId);
  }
  if (data === "cmd_categories") {
    return handleCategories(chatId);
  }
  if (data === "cmd_stats") {
    return handleStats(chatId);
  }
  if (data.startsWith("cat_")) {
    const categoryId = data.slice(4);
    return handleCategoryDeals(chatId, categoryId);
  }
}

// ============================================
// Route Handlers
// ============================================

export async function POST(request: Request) {
  // Verify webhook authenticity via secret_token header
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secretToken) {
    const headerToken = request.headers.get("x-telegram-bot-api-secret-token");
    if (headerToken !== secretToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate update structure
  if (!isValidTelegramUpdate(body)) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const update = body;

  try {
    // Handle callback queries (inline button presses)
    if (update.callback_query) {
      const cbQuery = update.callback_query;
      const cbChatId = cbQuery.message?.chat.id;
      const cbData = cbQuery.data;

      if (cbChatId && cbData) {
        await routeCallbackQuery(cbQuery.id, cbChatId, cbData);
      } else {
        await answerCallbackQuery(cbQuery.id);
      }

      return NextResponse.json({ ok: true });
    }

    // Handle text messages with commands
    const message = update.message;
    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    // Only process commands (messages starting with /)
    if (text.startsWith("/")) {
      await routeCommand(chatId, text);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 200 to prevent Telegram from retrying
  }

  return NextResponse.json({ ok: true });
}

// Verify webhook (Telegram sends GET to verify)
export async function GET() {
  return NextResponse.json({ status: "Telegram webhook active" });
}
