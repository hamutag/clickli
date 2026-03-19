export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getDealTier } from "@/lib/scoring";
import { createTrackingLink } from "@/lib/tracking";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import CommentSection from "@/components/CommentSection";
import DealReactions from "@/components/DealReactions";
import DealBreadcrumb from "@/components/DealBreadcrumb";
import RelatedDeals from "@/components/RelatedDeals";
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clickly.co.il";
  const dealUrl = `${siteUrl}/deals/${product.id}`;

  const productTitle = post?.titleHe || product.titleHe || product.titleEn;
  const productDescription =
    post?.bodyHe || product.descriptionHe || product.titleEn || "";

  // Exchange rate approximation
  const exchangeRate = 3.65;
  const ilsPrice = product.priceILS ?? Math.round(product.priceCurrent * exchangeRate);
  const ilsOriginal = Math.round(product.priceOriginal * exchangeRate);

  const productJsonLd = {
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
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <DealBreadcrumb
          category={product.category}
          dealTitle={productTitle}
        />

        {/* Main deal card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="md:flex md:flex-row-reverse">
            {/* Image - right side in RTL */}
            <div className="md:w-1/2 bg-gray-800 relative">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={productTitle}
                  className="w-full h-full object-cover min-h-[300px] md:min-h-[450px]"
                />
              ) : (
                <div className="w-full min-h-[300px] md:min-h-[450px] flex items-center justify-center text-7xl bg-gradient-to-br from-gray-800 to-gray-900">
                  &#x1F4E6;
                </div>
              )}
              {savingsPercent > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg">
                  -{savingsPercent}% הנחה
                </span>
              )}
              {product.score >= 80 && (
                <span className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-bold text-white border border-gray-700">
                  {tier.emoji} {tier.label}
                </span>
              )}
            </div>

            {/* Content - left side in RTL */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
              {/* Store badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg">
                  {product.store.name}
                </span>
                {product.category && (
                  <Link
                    href={`/deals?category=${product.category.slug}`}
                    className="text-xs text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {product.category.nameHe}
                  </Link>
                )}
                {product.score >= 60 && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    {tier.emoji} {product.score}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-5 leading-snug">
                {productTitle}
              </h1>

              {/* Price comparison table */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden mb-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400">
                      <th className="px-4 py-2.5 text-right font-medium"></th>
                      <th className="px-4 py-2.5 text-center font-medium">
                        $ דולר
                      </th>
                      <th className="px-4 py-2.5 text-center font-medium">
                        &#x20AA; שקלים
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsPercent > 0 && (
                      <tr className="border-b border-gray-700/50">
                        <td className="px-4 py-2.5 text-gray-400">מחיר מקורי</td>
                        <td className="px-4 py-2.5 text-center text-gray-500 line-through">
                          ${product.priceOriginal.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-500 line-through">
                          &#x20AA;{ilsOriginal}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-700/50">
                      <td className="px-4 py-2.5 text-emerald-400 font-medium">מחיר נוכחי</td>
                      <td className="px-4 py-2.5 text-center text-emerald-400 font-bold text-lg">
                        ${product.priceCurrent.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-center text-emerald-400 font-bold text-lg">
                        &#x20AA;{ilsPrice}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-gray-400">משלוח</td>
                      <td className="px-4 py-2.5 text-center" colSpan={2}>
                        {product.shippingFree ? (
                          <span className="text-emerald-400 font-medium">חינם</span>
                        ) : (
                          <span className="text-gray-300">${product.shippingCost}</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {savingsPercent > 0 && (
                  <div className="bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-400 font-medium border-t border-gray-700">
                    חוסכים {savingsPercent}% &bull; &#x20AA;{ilsOriginal - ilsPrice} הנחה
                  </div>
                )}
              </div>

              {/* VAT notice */}
              {product.vatApplies && (
                <p className="text-xs text-gray-500 mb-3">
                  * המחיר כולל מע&quot;מ
                </p>
              )}

              {/* Coupon */}
              {product.couponCode && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 border-dashed rounded-xl p-3 mb-4 text-center">
                  <p className="text-xs text-emerald-500 mb-1">&#x1F39F;&#xFE0F; קוד קופון</p>
                  <p className="text-lg font-bold text-emerald-400 font-mono tracking-wider">
                    {product.couponCode}
                  </p>
                  {product.couponValue && (
                    <p className="text-xs text-emerald-500/70 mt-1">
                      {product.couponType === "PERCENT"
                        ? `${product.couponValue}% הנחה`
                        : `$${product.couponValue} הנחה`}
                    </p>
                  )}
                </div>
              )}

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-500">&#x2B50;</span>
                  <span className="font-bold text-white">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">
                    ({product.reviewCount.toLocaleString("he-IL")} ביקורות)
                  </span>
                </div>
              )}

              {/* Body */}
              {post?.bodyHe && (
                <div className="text-gray-300 leading-relaxed mb-4 whitespace-pre-line text-sm">
                  {post.bodyHe}
                </div>
              )}

              {/* Pros & Cons */}
              <div className="flex flex-col gap-3 mb-5">
                {post?.prosHe && (
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                    <h3 className="font-bold text-sm mb-2 text-emerald-400">&#x2705; יתרונות</h3>
                    <ul className="space-y-1.5">
                      {post.prosHe.split("|").map((pro, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">&bull;</span>
                          <span>{pro.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {post?.consHe && (
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                    <h3 className="font-bold text-sm mb-1.5 text-amber-400">&#x26A0;&#xFE0F; שווה לדעת</h3>
                    <p className="text-sm text-gray-400">{post.consHe}</p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-auto">
                <a
                  href={trackingLink}
                  className="block w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-center py-4 rounded-xl text-lg font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/25 mb-2"
                >
                  {post?.ctaHe || "\u{1F449} לקנייה"}
                </a>
                <p className="text-xs text-center text-gray-500">
                  מפנה ל-{product.store.name} &bull; קישור שותפים
                </p>

                {/* Reactions */}
                <div className="mt-4 flex justify-center">
                  <DealReactions productId={product.id} />
                </div>

                {/* Share Buttons */}
                <div className="mt-5 pt-4 border-t border-gray-800">
                  <ShareButtons
                    url={dealUrl}
                    title={productTitle}
                    description={productDescription}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <CommentSection productId={product.id} />
        </div>

        {/* Related Deals */}
        <RelatedDeals
          productId={product.id}
          categoryId={product.categoryId}
          storeId={product.storeId}
        />
      </div>
    </div>
  );
}
