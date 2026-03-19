import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is not set");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET /api/cron/daily-report - Vercel Cron invokes GET by default
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runDailyReport();
}

async function runDailyReport() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const dateRange = { gte: todayStart, lte: todayEnd };

  // Total clicks today
  const totalClicks = await prisma.click.count({
    where: { createdAt: dateRange },
  });

  // Total conversions today
  const conversions = await prisma.conversion.findMany({
    where: { createdAt: dateRange },
  });

  const totalConversions = conversions.length;
  const totalRevenue = conversions.reduce((sum, c) => sum + c.orderAmount, 0);
  const totalCommission = conversions.reduce((sum, c) => sum + c.commission, 0);

  // EPC and conversion rate
  const epc = totalClicks > 0 ? totalCommission / totalClicks : 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  // Top 5 products by clicks
  const topProductsRaw = await prisma.click.groupBy({
    by: ["productId"],
    where: { createdAt: dateRange },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  const topProducts = await Promise.all(
    topProductsRaw.map(async (item) => {
      const productConversions = conversions.filter(
        (c) => c.productId === item.productId
      );
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { titleHe: true, titleEn: true },
      });
      return {
        productId: item.productId,
        title: product?.titleHe ?? product?.titleEn ?? "Unknown",
        clicks: item._count.id,
        conversions: productConversions.length,
        revenue: productConversions.reduce((sum, c) => sum + c.orderAmount, 0),
      };
    })
  );

  // Channel breakdown (WEB vs TELEGRAM)
  const webClicks = await prisma.click.count({
    where: { createdAt: dateRange, channel: "WEB" },
  });
  const telegramClicks = await prisma.click.count({
    where: { createdAt: dateRange, channel: "TELEGRAM" },
  });

  const webConversions = await prisma.conversion.count({
    where: {
      createdAt: dateRange,
      click: { channel: "WEB" },
    },
  });
  const telegramConversions = await prisma.conversion.count({
    where: {
      createdAt: dateRange,
      click: { channel: "TELEGRAM" },
    },
  });

  const channelBreakdown = {
    web: { clicks: webClicks, conversions: webConversions },
    telegram: { clicks: telegramClicks, conversions: telegramConversions },
  };

  // Store breakdown
  const storeClicksRaw = await prisma.click.findMany({
    where: { createdAt: dateRange },
    select: {
      product: {
        select: { store: { select: { name: true } } },
      },
    },
  });

  const storeBreakdown: Record<string, { clicks: number; conversions: number; revenue: number }> = {};

  for (const click of storeClicksRaw) {
    const storeName = click.product.store.name;
    if (!storeBreakdown[storeName]) {
      storeBreakdown[storeName] = { clicks: 0, conversions: 0, revenue: 0 };
    }
    storeBreakdown[storeName].clicks++;
  }

  for (const conv of conversions) {
    const product = await prisma.product.findUnique({
      where: { id: conv.productId },
      select: { store: { select: { name: true } } },
    });
    if (product) {
      const storeName = product.store.name;
      if (!storeBreakdown[storeName]) {
        storeBreakdown[storeName] = { clicks: 0, conversions: 0, revenue: 0 };
      }
      storeBreakdown[storeName].conversions++;
      storeBreakdown[storeName].revenue += conv.orderAmount;
    }
  }

  // Save to DailyReport table (upsert to avoid duplicates)
  const report = await prisma.dailyReport.upsert({
    where: { date: todayStart },
    update: {
      totalClicks,
      totalConversions,
      totalRevenue,
      totalCommission,
      epc: Math.round(epc * 1000) / 1000,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topProducts,
      channelBreakdown,
      storeBreakdown,
    },
    create: {
      date: todayStart,
      totalClicks,
      totalConversions,
      totalRevenue,
      totalCommission,
      epc: Math.round(epc * 1000) / 1000,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topProducts,
      channelBreakdown,
      storeBreakdown,
    },
  });

  // Optionally send summary to Telegram
  await sendTelegramSummary({
    totalClicks,
    totalConversions,
    totalRevenue,
    totalCommission,
    epc,
    conversionRate,
    topProducts,
    channelBreakdown,
    storeBreakdown,
  });

  return NextResponse.json({
    success: true,
    reportId: report.id,
    summary: {
      totalClicks,
      totalConversions,
      totalRevenue,
      totalCommission,
      epc: Math.round(epc * 1000) / 1000,
      conversionRate: Math.round(conversionRate * 100) / 100,
    },
    timestamp: new Date().toISOString(),
  });
}

interface DailySummary {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  epc: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    title: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  channelBreakdown: {
    web: { clicks: number; conversions: number };
    telegram: { clicks: number; conversions: number };
  };
  storeBreakdown: Record<string, { clicks: number; conversions: number; revenue: number }>;
}

async function sendTelegramSummary(summary: DailySummary): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    console.warn("Telegram credentials not configured, skipping daily summary");
    return;
  }

  const today = new Date().toLocaleDateString("he-IL");

  const topProductsList = summary.topProducts
    .map(
      (p, i) =>
        `  ${i + 1}. ${p.title} - ${p.clicks} קליקים, ${p.conversions} המרות`
    )
    .join("\n");

  const storeLines = Object.entries(summary.storeBreakdown)
    .map(
      ([name, data]) =>
        `  ${name}: ${data.clicks} קליקים, ${data.conversions} המרות, $${data.revenue.toFixed(2)}`
    )
    .join("\n");

  const message = [
    `📊 דוח יומי - ${today}`,
    ``,
    `📈 סיכום:`,
    `  קליקים: ${summary.totalClicks}`,
    `  המרות: ${summary.totalConversions}`,
    `  הכנסות: $${summary.totalRevenue.toFixed(2)}`,
    `  עמלות: $${summary.totalCommission.toFixed(2)}`,
    `  EPC: $${summary.epc.toFixed(3)}`,
    `  שיעור המרה: ${summary.conversionRate.toFixed(2)}%`,
    ``,
    `🏆 טופ מוצרים:`,
    topProductsList || "  אין נתונים",
    ``,
    `📱 ערוצים:`,
    `  אתר: ${summary.channelBreakdown.web.clicks} קליקים, ${summary.channelBreakdown.web.conversions} המרות`,
    `  טלגרם: ${summary.channelBreakdown.telegram.clicks} קליקים, ${summary.channelBreakdown.telegram.conversions} המרות`,
    ``,
    `🏪 חנויות:`,
    storeLines || "  אין נתונים",
  ].join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: channelId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Failed to send Telegram daily summary:", errorBody);
    }
  } catch (error) {
    console.error("Error sending Telegram daily summary:", error);
  }
}
