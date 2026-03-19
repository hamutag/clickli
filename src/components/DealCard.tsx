import Link from "next/link";
import { getDealTier } from "@/lib/scoring";

interface DealCardProduct {
  id: string;
  titleHe: string | null;
  titleEn: string;
  imageUrl: string | null;
  priceCurrent: number;
  priceOriginal: number;
  priceILS: number | null;
  score: number;
  shippingFree: boolean;
  rating: number | null;
  reviewCount: number;
  couponCode: string | null;
  store: {
    name: string;
  };
}

interface DealCardProps {
  product: DealCardProduct;
}

export default function DealCard({ product }: DealCardProps) {
  const tier = getDealTier(product.score);
  const savingsPercent =
    product.priceOriginal > 0
      ? Math.round(
          ((product.priceOriginal - product.priceCurrent) /
            product.priceOriginal) *
            100
        )
      : 0;

  return (
    <Link
      href={`/deals/${product.id}`}
      className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-800 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.titleHe || product.titleEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-800 to-gray-900">
            📦
          </div>
        )}

        {/* Discount badge */}
        {savingsPercent > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
            -{savingsPercent}%
          </span>
        )}

        {/* Score tier emoji */}
        {product.score >= 60 && (
          <span className="absolute top-3 left-3 text-xl drop-shadow-lg">
            {tier.emoji}
          </span>
        )}

        {/* Store badge */}
        <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg">
          {product.store.name}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-200 line-clamp-2 mb-3 min-h-[40px] leading-relaxed">
          {product.titleHe || product.titleEn}
        </h3>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold text-emerald-400">
            {product.priceILS
              ? `₪${Math.round(product.priceILS)}`
              : `$${product.priceCurrent.toFixed(2)}`}
          </span>
          {savingsPercent > 0 && (
            <span className="text-xs text-gray-500 line-through">
              {product.priceILS
                ? `₪${Math.round(product.priceOriginal * 3.65)}`
                : `$${product.priceOriginal.toFixed(2)}`}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {product.shippingFree ? "✅ משלוח חינם" : "📦 משלוח בתשלום"}
          </span>
          {product.rating && (
            <span>
              ⭐ {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})
            </span>
          )}
        </div>

        {product.couponCode && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 text-center font-medium">
            🎟️ קופון: {product.couponCode}
          </div>
        )}

        <div className="mt-3 text-center">
          <span className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-lg group-hover:bg-emerald-500 group-hover:text-gray-950 transition-all">
            לדיל &larr;
          </span>
        </div>
      </div>
    </Link>
  );
}
