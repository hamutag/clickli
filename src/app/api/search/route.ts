export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const results = await prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [
        { titleHe: { contains: q } },
        { titleEn: { contains: q } },
        { descriptionHe: { contains: q } },
        { descriptionEn: { contains: q } },
      ],
    },
    orderBy: { score: "desc" },
    take: 20,
    include: {
      store: { select: { name: true } },
      category: { select: { nameHe: true } },
    },
  });

  return NextResponse.json({ results });
}
