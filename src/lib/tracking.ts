import { prisma } from "./db";
import type { Channel } from "@/types";
import crypto from "crypto";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// יצירת לינק מעקב
export function createTrackingLink(
  productId: string,
  postId: string | null,
  channel: Channel
): string {
  const params = new URLSearchParams({
    src: channel.toLowerCase(),
    ...(postId && { pid: postId }),
  });
  return `${SITE_URL}/go/${productId}?${params.toString()}`;
}

// רישום קליק ויצירת SubID לאפילייט
export async function recordClick(params: {
  productId: string;
  postId?: string;
  channel: Channel;
  source?: string;
  medium?: string;
  campaign?: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
}): Promise<{ clickId: string; subId: string }> {
  // Hash של IP לפרטיות
  const ipHash = params.ipAddress
    ? crypto.createHash("sha256").update(params.ipAddress).digest("hex").slice(0, 16)
    : null;

  const click = await prisma.click.create({
    data: {
      productId: params.productId,
      postId: params.postId ?? null,
      channel: params.channel,
      source: params.source ?? null,
      medium: params.medium ?? null,
      campaign: params.campaign ?? null,
      ipHash,
      userAgent: params.userAgent?.slice(0, 500) ?? null,
      referer: params.referer?.slice(0, 500) ?? null,
      country: "IL",
    },
  });

  // SubID = click ID - זה מה שנשלח לאפילייט ומאפשר attribution
  return {
    clickId: click.id,
    subId: click.id,
  };
}

// רישום המרה (מ-webhook של אפילייט)
export async function recordConversion(params: {
  subId: string;
  orderId?: string;
  orderAmount: number;
  commission: number;
  currency?: string;
  storeId: string;
}) {
  // מציאת הקליק לפי SubID
  const click = await prisma.click.findUnique({
    where: { id: params.subId },
  });

  if (!click) {
    console.error(`Click not found for subId: ${params.subId}`);
    return null;
  }

  const conversion = await prisma.conversion.create({
    data: {
      clickId: click.id,
      productId: click.productId,
      storeId: params.storeId,
      orderId: params.orderId ?? null,
      orderAmount: params.orderAmount,
      commission: params.commission,
      currency: params.currency ?? "USD",
      status: "PENDING",
    },
  });

  return conversion;
}

// בניית affiliate URL עם SubID
export function buildAffiliateUrl(
  baseAffiliateUrl: string,
  subId: string,
  platform: string
): string {
  const url = new URL(baseAffiliateUrl);

  switch (platform) {
    case "ALIEXPRESS":
      url.searchParams.set("aff_sub", subId);
      break;
    case "TEMU":
      url.searchParams.set("sub_id", subId);
      break;
    case "IHERB":
      url.searchParams.set("subid", subId);
      break;
    case "AMAZON":
      url.searchParams.set("tag_sub", subId);
      break;
    default:
      url.searchParams.set("sub_id", subId);
  }

  return url.toString();
}

// סטטיסטיקות בסיסיות
export async function getClickStats(productId: string) {
  const [totalClicks, todayClicks, conversions] = await Promise.all([
    prisma.click.count({ where: { productId } }),
    prisma.click.count({
      where: {
        productId,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.conversion.aggregate({
      where: { productId, status: "APPROVED" },
      _sum: { commission: true },
      _count: true,
    }),
  ]);

  return {
    totalClicks,
    todayClicks,
    totalConversions: conversions._count,
    totalCommission: conversions._sum.commission ?? 0,
    epc: totalClicks > 0 ? (conversions._sum.commission ?? 0) / totalClicks : 0,
  };
}
