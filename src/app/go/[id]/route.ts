import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordClick, buildAffiliateUrl } from "@/lib/tracking";
import type { Channel } from "@/types";

// Tracking redirect: /go/{productId}?src=telegram&pid=postId
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);

  const source = url.searchParams.get("src") || "web";
  const postId = url.searchParams.get("pid") || undefined;
  const utmCampaign = url.searchParams.get("utm_campaign") || undefined;
  const utmMedium = url.searchParams.get("utm_medium") || undefined;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true },
  });

  if (!product || !product.affiliateUrl) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // רישום קליק
  const channel: Channel = source === "telegram" ? "TELEGRAM" : "WEB";
  const ipAddress = request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") || undefined;

  const { subId } = await recordClick({
    productId: id,
    postId,
    channel,
    source,
    medium: utmMedium,
    campaign: utmCampaign,
    ipAddress,
    userAgent: request.headers.get("user-agent") || undefined,
    referer: request.headers.get("referer") || undefined,
  });

  // בניית לינק affiliate עם SubID לתיוג
  const affiliateUrl = buildAffiliateUrl(
    product.affiliateUrl,
    subId,
    product.store.platform
  );

  return NextResponse.redirect(affiliateUrl);
}
