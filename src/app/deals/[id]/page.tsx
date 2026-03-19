export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getDealTier } from "@/lib/scoring";
import { createTrackingLink } from "@/lib/tracking";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DealPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) return { title: "דיל לא נמצא - קליקלי" };

  const post = await prisma.post.findFirst({
    where: { productId: id, channel: "WEB" },
  });

  const title = post?.titleHe || product.titleHe || product.titleEn;
  const description =
    post?.metaDescription ||
    `${title} במחיר מיוחד עם משלוח לישראל. מחיר: $${product.priceCurrent.toFixed(2)}`;

  return {
    title: `${title} | קליקלי`,
    description,
    alternates: {
      canonical: `/deals/${id}`,
    },
    openGraph: {
      title: `${title} | קליקלי`,
      description,
      type: "website",
      locale: "he_IL",
      siteName: "קליקלי",
      ...(product.imageUrl && {
        images: [
          {
            url: product.imageUrl,
            width: 800,
            height: 800,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | קליקלי`,
      description,
      ...(product.imageUrl && { images: [product.imageUrl] }),
    },
  };
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      store: true,
      category: true,
    },
  });

  if (!product) notFound();

  const post = await prisma.post.findFirst({
    where: { productId: id, channel: "WEB", isPublished: true },
  });

  const tier = getDealTier(product.score);
  const savingsPercent = product.priceOriginal > 0
    ? Math.round(((product.priceOriginal - product.priceCurrent) / product.priceOriginal) * 100)
    : 0;

  const trackingLink = createTrackingLink(product.id, post?.id ?? null, "WEB");

  const productTitle = post?.titleHe || product.titleHe || product.titleEn;
  const productDescription =
    post?.bodyHe || product.descriptionHe || product.titleEn || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productTitle,
    ...(product.imageUrl && { image: product.imageUrl }),
    description: productDescription,
    offers: {
      "@type": "Offer",
      price: product.priceCurrent,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            🛒 קליקלי
          </Link>
          <Link href="/deals" className="text-sm text-gray-500 hover:text-blue-600">
            ← חזרה לכל הדילים
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/2 bg-gray-100 relative">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={post?.titleHe || product.titleEn}
                  className="w-full h-full object-cover min-h-[300px]"
                />
              )}
              {savingsPercent > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                  -{savingsPercent}% הנחה
                </span>
              )}
              {product.score >= 80 && (
                <span className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-xl text-sm font-bold">
                  {tier.emoji} {tier.label}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="md:w-1/2 p-6">
              {/* Store badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                  {product.store.name}
                </span>
                {product.category && (
                  <span className="text-xs text-gray-400">
                    {product.category.nameHe}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-4">
                {post?.titleHe || product.titleHe || product.titleEn}
              </h1>

              {/* Price */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-bold text-green-600">
                    {product.priceILS ? `₪${Math.round(product.priceILS)}` : `$${product.priceCurrent.toFixed(2)}`}
                  </span>
                  {savingsPercent > 0 && (
                    <span className="text-lg text-gray-400 line-through">
                      {product.priceILS
                        ? `₪${Math.round(product.priceOriginal * 3.65)}`
                        : `$${product.priceOriginal.toFixed(2)}`}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 text-sm text-gray-600">
                  <span>
                    {product.shippingFree ? "✅ משלוח חינם" : `📦 משלוח: $${product.shippingCost}`}
                  </span>
                  {product.vatApplies && (
                    <span>💰 כולל מע&quot;מ</span>
                  )}
                </div>
              </div>

              {/* Coupon */}
              {product.couponCode && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-center">
                  <p className="text-xs text-orange-600 mb-1">🎟️ קוד קופון</p>
                  <p className="text-lg font-bold text-orange-700 font-mono tracking-wider">
                    {product.couponCode}
                  </p>
                </div>
              )}

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-bold">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">
                    ({product.reviewCount.toLocaleString("he-IL")} ביקורות)
                  </span>
                </div>
              )}

              {/* Body */}
              {post?.bodyHe && (
                <div className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                  {post.bodyHe}
                </div>
              )}

              {/* Pros & Cons */}
              {post?.prosHe && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm mb-2">יתרונות:</h3>
                  <ul className="space-y-1">
                    {post.prosHe.split("|").map((pro, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-center gap-1">
                        <span>✅</span> {pro.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {post?.consHe && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm mb-1">שווה לדעת:</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span>⚠️</span> {post.consHe}
                  </p>
                </div>
              )}

              {/* CTA */}
              <a
                href={trackingLink}
                className="block w-full bg-blue-600 text-white text-center py-3.5 rounded-xl text-lg font-bold hover:bg-blue-700 transition-colors mb-3"
              >
                {post?.ctaHe || "👉 לקנייה"}
              </a>
              <p className="text-xs text-center text-gray-400">
                מפנה ל-{product.store.name} • קישור שותפים
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
