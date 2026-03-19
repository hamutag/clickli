import { NextRequest, NextResponse } from "next/server";
import { ingestAliExpressDeals } from "@/lib/platforms/aliexpress";
import { ingestTemuDeals } from "@/lib/platforms/temu";
import { ingestIHerbDeals } from "@/lib/platforms/iherb";

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is not set");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET /api/cron/ingest - Vercel Cron invokes GET by default
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runIngest();
}

// POST /api/cron/ingest - manual trigger
export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runIngest();
}

async function runIngest() {
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
