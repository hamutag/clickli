import { NextResponse } from "next/server";
import { ingestAliExpressDeals } from "@/lib/platforms/aliexpress";
import { ingestTemuDeals } from "@/lib/platforms/temu";
import { ingestIHerbDeals } from "@/lib/platforms/iherb";

// POST /api/cron/ingest - הפעלת סריקה ידנית או אוטומטית
export async function POST() {
  const results = await Promise.allSettled([
    ingestAliExpressDeals(),
    ingestTemuDeals(),
    ingestIHerbDeals(),
  ]);

  const platformNames = ["AliExpress", "Temu", "iHerb"];
  const summary = results.map((r, i) => {
    if (r.status === "fulfilled") {
      return { ...r.value, displayName: platformNames[i] };
    }
    return {
      displayName: platformNames[i],
      error: String(r.reason),
    };
  });

  const totalNew = summary.reduce((sum, s) => sum + ("totalNew" in s ? s.totalNew : 0), 0);
  const totalFetched = summary.reduce((sum, s) => sum + ("totalFetched" in s ? s.totalFetched : 0), 0);

  return NextResponse.json({
    success: true,
    totalFetched,
    totalNew,
    platforms: summary,
    timestamp: new Date().toISOString(),
  });
}
