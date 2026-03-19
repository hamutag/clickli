import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prisma } from "@prisma/client";
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

interface TopProduct {
  productId: string;
  title: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

interface ChannelData {
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

interface StoreData {
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

interface DailySummary {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  epc: number;
  conversionRate: number;
  topProducts: TopProduct[];
  channelBreakdown: Record<string, ChannelData>;
  storeBreakdown: Record<string, StoreData>;
  insightsHe: string | null;
  recommendations: string | null;
}

async function runDailyReport() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const dateRange = { gte: todayStart, lte: todayEnd };

    // ---- Fetch all clicks and conversions for today in bulk ----
    const [totalClicks, conversions, clicksWithProduct] = await Promise.all([
      prisma.click.count({ where: { createdAt: dateRange } }),
      prisma.conversion.findMany({
        where: { createdAt: dateRange },
        include: {
          product: {
            select: {
              id: true,
              store: { select: { name: true, platform: true } },
            },
          },
          click: { select: { channel: true } },
        },
      }),
      prisma.click.findMany({
        where: { createdAt: dateRange },
        select: {
          channel: true,
          productId: true,
          product: {
            select: {
              store: { select: { name: true, platform: true } },
            },
          },
        },
      }),
    ]);

    const totalConversions = conversions.length;
    const totalRevenue = conversions.reduce((sum, c) => sum + c.orderAmount, 0);
    const totalCommission = conversions.reduce((sum, c) => sum + c.commission, 0);

    // EPC and conversion rate
    const epc = totalClicks > 0 ? totalCommission / totalClicks : 0;
    const conversionRate =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // ---- Platform / Store breakdown ----
    const storeBreakdown: Record<string, StoreData> = {};

    for (const click of clicksWithProduct) {
      const storeName = click.product.store.name;
      if (!storeBreakdown[storeName]) {
        storeBreakdown[storeName] = {
          clicks: 0,
          conversions: 0,
          revenue: 0,
          commission: 0,
        };
      }
      storeBreakdown[storeName].clicks++;
    }

    for (const conv of conversions) {
      const storeName = conv.product.store.name;
      if (!storeBreakdown[storeName]) {
        storeBreakdown[storeName] = {
          clicks: 0,
          conversions: 0,
          revenue: 0,
          commission: 0,
        };
      }
      storeBreakdown[storeName].conversions++;
      storeBreakdown[storeName].revenue += conv.orderAmount;
      storeBreakdown[storeName].commission += conv.commission;
    }

    // ---- Channel breakdown (WEB vs TELEGRAM) ----
    const channelBreakdown: Record<string, ChannelData> = {
      WEB: { clicks: 0, conversions: 0, revenue: 0, commission: 0 },
      TELEGRAM: { clicks: 0, conversions: 0, revenue: 0, commission: 0 },
    };

    for (const click of clicksWithProduct) {
      const ch = click.channel;
      if (channelBreakdown[ch]) {
        channelBreakdown[ch].clicks++;
      }
    }

    for (const conv of conversions) {
      const ch = conv.click?.channel;
      if (ch && channelBreakdown[ch]) {
        channelBreakdown[ch].conversions++;
        channelBreakdown[ch].revenue += conv.orderAmount;
        channelBreakdown[ch].commission += conv.commission;
      }
    }

    // ---- Top 5 products by clicks ----
    const topProductsRaw = await prisma.click.groupBy({
      by: ["productId"],
      where: { createdAt: dateRange },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const topProductIds = topProductsRaw.map((p) => p.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, titleHe: true, titleEn: true },
    });

    const topProducts: TopProduct[] = topProductsRaw.map((item) => {
      const product = productDetails.find((p) => p.id === item.productId);
      const productConversions = conversions.filter(
        (c) => c.productId === item.productId
      );
      return {
        productId: item.productId,
        title: product?.titleHe ?? product?.titleEn ?? "Unknown",
        clicks: item._count.id,
        conversions: productConversions.length,
        revenue: productConversions.reduce((sum, c) => sum + c.orderAmount, 0),
        commission: productConversions.reduce((sum, c) => sum + c.commission, 0),
      };
    });

    // ---- Generate AI insights with Gemini ----
    const { insightsHe, recommendations } = await generateAIInsights({
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

    // ---- Save to DailyReport table (upsert to avoid duplicates) ----
    const report = await prisma.dailyReport.upsert({
      where: { date: todayStart },
      update: {
        totalClicks,
        totalConversions,
        totalRevenue,
        totalCommission,
        epc: Math.round(epc * 1000) / 1000,
        conversionRate: Math.round(conversionRate * 100) / 100,
        topProducts: JSON.parse(JSON.stringify(topProducts)) as Prisma.InputJsonValue,
        channelBreakdown: JSON.parse(JSON.stringify(channelBreakdown)) as Prisma.InputJsonValue,
        storeBreakdown: JSON.parse(JSON.stringify(storeBreakdown)) as Prisma.InputJsonValue,
        insightsHe,
        recommendations,
      },
      create: {
        date: todayStart,
        totalClicks,
        totalConversions,
        totalRevenue,
        totalCommission,
        epc: Math.round(epc * 1000) / 1000,
        conversionRate: Math.round(conversionRate * 100) / 100,
        topProducts: JSON.parse(JSON.stringify(topProducts)) as Prisma.InputJsonValue,
        channelBreakdown: JSON.parse(JSON.stringify(channelBreakdown)) as Prisma.InputJsonValue,
        storeBreakdown: JSON.parse(JSON.stringify(storeBreakdown)) as Prisma.InputJsonValue,
        insightsHe,
        recommendations,
      },
    });

    // ---- Send summary to Telegram channel ----
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
      insightsHe,
      recommendations,
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
  } catch (error) {
    console.error("Daily report generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate daily report" },
      { status: 500 }
    );
  }
}

// ---- Gemini AI Insights ----
async function generateAIInsights(data: {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  epc: number;
  conversionRate: number;
  topProducts: TopProduct[];
  channelBreakdown: Record<string, ChannelData>;
  storeBreakdown: Record<string, StoreData>;
}): Promise<{ insightsHe: string | null; recommendations: string | null }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set, skipping AI insights");
    return { insightsHe: null, recommendations: null };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const storeLines = Object.entries(data.storeBreakdown)
      .map(
        ([name, d]) =>
          `${name}: ${d.clicks} קליקים, ${d.conversions} המרות, $${d.revenue.toFixed(2)} הכנסות, $${d.commission.toFixed(2)} עמלות`
      )
      .join("\n");

    const channelLines = Object.entries(data.channelBreakdown)
      .map(
        ([name, d]) =>
          `${name}: ${d.clicks} קליקים, ${d.conversions} המרות, $${d.revenue.toFixed(2)} הכנסות`
      )
      .join("\n");

    const topProductLines = data.topProducts
      .map(
        (p, i) =>
          `${i + 1}. ${p.title} - ${p.clicks} קליקים, ${p.conversions} המרות, $${p.revenue.toFixed(2)} הכנסות`
      )
      .join("\n");

    const prompt = `אתה אנליסט שיווק דיגיטלי מומחה. נתח את נתוני הביצועים היומיים של פלטפורמת אפילייט ישראלית וכתוב בעברית.

נתוני היום:
- סה"כ קליקים: ${data.totalClicks}
- סה"כ המרות: ${data.totalConversions}
- סה"כ הכנסות: $${data.totalRevenue.toFixed(2)}
- סה"כ עמלות: $${data.totalCommission.toFixed(2)}
- EPC: $${data.epc.toFixed(3)}
- שיעור המרה: ${data.conversionRate.toFixed(2)}%

פירוט לפי חנויות:
${storeLines || "אין נתונים"}

פירוט לפי ערוצים:
${channelLines}

טופ מוצרים:
${topProductLines || "אין נתונים"}

כתוב בפורמט JSON בלבד (בלי markdown, בלי backticks):
{
  "insights": "2-3 תובנות קצרות ומעשיות על הביצועים, מופרדות ב-\\n",
  "recommendations": "2-3 המלצות קונקרטיות לשיפור, מופרדות ב-\\n"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(text) as {
      insights: string;
      recommendations: string;
    };

    return {
      insightsHe: parsed.insights || null,
      recommendations: parsed.recommendations || null,
    };
  } catch (error) {
    console.error("AI insights generation failed:", error);
    return { insightsHe: null, recommendations: null };
  }
}

// ---- Telegram Summary ----
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
        `  ${i + 1}. ${p.title}\n     ${p.clicks} קליקים | ${p.conversions} המרות | $${p.revenue.toFixed(2)}`
    )
    .join("\n");

  const storeLines = Object.entries(summary.storeBreakdown)
    .map(
      ([name, data]) =>
        `  ${name}: ${data.clicks} קליקים, ${data.conversions} המרות, $${data.revenue.toFixed(2)} הכנסות, $${data.commission.toFixed(2)} עמלות`
    )
    .join("\n");

  const webData = summary.channelBreakdown["WEB"] ?? {
    clicks: 0,
    conversions: 0,
    revenue: 0,
  };
  const tgData = summary.channelBreakdown["TELEGRAM"] ?? {
    clicks: 0,
    conversions: 0,
    revenue: 0,
  };

  const lines = [
    `📊 <b>דוח יומי - קליקלי</b>`,
    `📅 ${today}`,
    ``,
    `📈 <b>סיכום כללי:</b>`,
    `  קליקים: ${summary.totalClicks.toLocaleString("he-IL")}`,
    `  המרות: ${summary.totalConversions.toLocaleString("he-IL")}`,
    `  הכנסות: $${summary.totalRevenue.toFixed(2)}`,
    `  עמלות: $${summary.totalCommission.toFixed(2)}`,
    `  EPC: $${summary.epc.toFixed(3)}`,
    `  שיעור המרה: ${summary.conversionRate.toFixed(2)}%`,
    ``,
    `🏆 <b>טופ 5 מוצרים:</b>`,
    topProductsList || "  אין נתונים",
    ``,
    `📱 <b>ערוצים:</b>`,
    `  🌐 אתר: ${webData.clicks} קליקים, ${webData.conversions} המרות, $${webData.revenue.toFixed(2)}`,
    `  📱 טלגרם: ${tgData.clicks} קליקים, ${tgData.conversions} המרות, $${tgData.revenue.toFixed(2)}`,
    ``,
    `🏪 <b>חנויות:</b>`,
    storeLines || "  אין נתונים",
  ];

  if (summary.insightsHe) {
    lines.push(``, `💡 <b>תובנות AI:</b>`);
    for (const line of summary.insightsHe.split("\n")) {
      lines.push(`  ${line}`);
    }
  }

  if (summary.recommendations) {
    lines.push(``, `🎯 <b>המלצות:</b>`);
    for (const line of summary.recommendations.split("\n")) {
      lines.push(`  ${line}`);
    }
  }

  const message = lines.join("\n");

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
