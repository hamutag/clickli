export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

interface TopProduct {
  productId: string;
  title: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

interface DailyReportRow {
  id: string;
  date: Date;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  epc: number;
  conversionRate: number;
  topProducts: TopProduct[] | null;
  channelBreakdown: Record<string, ChannelData> | null;
  storeBreakdown: Record<string, StoreData> | null;
  insightsHe: string | null;
  recommendations: string | null;
  createdAt: Date;
}

// GET /api/admin/analytics - Protected by middleware (admin auth)
export async function GET() {
  try {
    const reports = await prisma.dailyReport.findMany({
      take: 30,
      orderBy: { date: "desc" },
    });

    // Aggregate summary across all returned reports
    const summary = reports.reduce(
      (acc, report) => ({
        totalClicks: acc.totalClicks + report.totalClicks,
        totalConversions: acc.totalConversions + report.totalConversions,
        totalRevenue: acc.totalRevenue + report.totalRevenue,
        totalCommission: acc.totalCommission + report.totalCommission,
      }),
      {
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        totalCommission: 0,
      }
    );

    const avgEpc =
      summary.totalClicks > 0
        ? summary.totalCommission / summary.totalClicks
        : 0;
    const avgConversionRate =
      summary.totalClicks > 0
        ? (summary.totalConversions / summary.totalClicks) * 100
        : 0;

    // Aggregate store breakdown across all reports
    const aggregatedStores: Record<string, StoreData> = {};
    for (const report of reports) {
      const storeData = report.storeBreakdown as Record<string, StoreData> | null;
      if (!storeData) continue;
      for (const [name, data] of Object.entries(storeData)) {
        if (!aggregatedStores[name]) {
          aggregatedStores[name] = {
            clicks: 0,
            conversions: 0,
            revenue: 0,
            commission: 0,
          };
        }
        aggregatedStores[name].clicks += data.clicks ?? 0;
        aggregatedStores[name].conversions += data.conversions ?? 0;
        aggregatedStores[name].revenue += data.revenue ?? 0;
        aggregatedStores[name].commission += data.commission ?? 0;
      }
    }

    // Aggregate channel breakdown across all reports
    const aggregatedChannels: Record<string, ChannelData> = {
      WEB: { clicks: 0, conversions: 0, revenue: 0, commission: 0 },
      TELEGRAM: { clicks: 0, conversions: 0, revenue: 0, commission: 0 },
    };
    for (const report of reports) {
      const chData = report.channelBreakdown as Record<string, ChannelData> | null;
      if (!chData) continue;
      for (const [name, data] of Object.entries(chData)) {
        if (!aggregatedChannels[name]) {
          aggregatedChannels[name] = {
            clicks: 0,
            conversions: 0,
            revenue: 0,
            commission: 0,
          };
        }
        aggregatedChannels[name].clicks += data.clicks ?? 0;
        aggregatedChannels[name].conversions += data.conversions ?? 0;
        aggregatedChannels[name].revenue += data.revenue ?? 0;
        aggregatedChannels[name].commission += data.commission ?? 0;
      }
    }

    // Serialize reports for JSON response
    const serializedReports: DailyReportRow[] = reports.map((r) => ({
      id: r.id,
      date: r.date,
      totalClicks: r.totalClicks,
      totalConversions: r.totalConversions,
      totalRevenue: r.totalRevenue,
      totalCommission: r.totalCommission,
      epc: r.epc,
      conversionRate: r.conversionRate,
      topProducts: (r.topProducts as TopProduct[] | null) ?? null,
      channelBreakdown:
        (r.channelBreakdown as Record<string, ChannelData> | null) ?? null,
      storeBreakdown:
        (r.storeBreakdown as Record<string, StoreData> | null) ?? null,
      insightsHe: r.insightsHe,
      recommendations: r.recommendations,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      reports: serializedReports,
      summary: {
        ...summary,
        epc: Math.round(avgEpc * 1000) / 1000,
        conversionRate: Math.round(avgConversionRate * 100) / 100,
        daysCount: reports.length,
      },
      aggregatedStores,
      aggregatedChannels,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
