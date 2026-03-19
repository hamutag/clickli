import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const publishedDeals = await prisma.product.findMany({
    where: { isPublished: true, status: "PUBLISHED" },
    select: { id: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 1000,
  });

  const dealUrls: MetadataRoute.Sitemap = publishedDeals.map((deal) => ({
    url: `${baseUrl}/deals/${deal.id}`,
    lastModified: deal.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...dealUrls,
  ];
}
