import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  return NextResponse.json({ success: true, product });
}
