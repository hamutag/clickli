import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://affiliate-platform-teal.vercel.app";

  const [publishedDeals, activeCategories] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      select: { id: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
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
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const dealUrls: MetadataRoute.Sitemap = publishedDeals.map((deal) => ({
    url: `${baseUrl}/deals/${deal.id}`,
    lastModified: deal.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = activeCategories.map((cat) => ({
    url: `${baseUrl}/deals?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticPages, ...dealUrls, ...categoryUrls];
}
