import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const deals = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      store: { select: { name: true, platform: true } },
      category: { select: { nameHe: true } },
    },
  });

  return NextResponse.json({ deals });
}
