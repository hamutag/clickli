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
  couponValue: number | null;
  couponType: string | null;
  store: {
    name: string;
    platform: string;
  };
  category?: {
    nameHe: string;
    slug: string;
  } | null;
}

interface DealCardProps {
  product: DealCardProduct;
}

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

function getPlatformColor(platform: string): string {
  switch (platform) {
    case "ALIEXPRESS":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "TEMU":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "IHERB":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
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

  const displayPrice = product.priceILS
    ? `₪${Math.round(product.priceILS)}`
    : `$${product.priceCurrent.toFixed(2)}`;

  const originalDisplayPrice = product.priceILS
    ? `₪${Math.round(product.priceOriginal * 3.65)}`
    : `$${product.priceOriginal.toFixed(2)}`;

  const platformColor = getPlatformColor(product.store.platform);

  return (
    <div className="group relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col">
      {/* Image Section */}
      <Link href={`/deals/${product.id}`} className="block">
        <div className="relative aspect-square bg-gray-800 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.titleHe || product.titleEn}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
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

          {/* Score tier badge */}
          {product.score >= 60 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-sm">{tier.emoji}</span>
              <span className="text-[10px] font-bold text-white">{product.score}</span>
            </div>
          )}

          {/* Store/Platform badge */}
          <span
            className={`absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-md border backdrop-blur-sm ${platformColor}`}
          >
            {product.store.name}
          </span>

          {/* Free shipping badge */}
          {product.shippingFree && (
            <span className="absolute bottom-3 left-3 bg-emerald-500/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              משלוח חינם
            </span>
          )}
        </div>
      </Link>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/deals/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-200 line-clamp-2 mb-3 min-h-[40px] leading-relaxed hover:text-emerald-400 transition-colors">
            {product.titleHe || product.titleEn}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold text-emerald-400">
            {displayPrice}
          </span>
          {savingsPercent > 0 && (
            <span className="text-xs text-gray-500 line-through">
              {originalDisplayPrice}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating != null && product.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-amber-400 text-xs tracking-tight">
              {renderStars(product.rating)}
            </span>
            <span className="text-[10px] text-gray-500">
              {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})
            </span>
          </div>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-3 mt-auto">
          {!product.shippingFree && (
            <span className="text-[10px] text-gray-500 bg-gray-800 rounded px-1.5 py-0.5">
              📦 משלוח בתשלום
            </span>
          )}
        </div>

        {/* Coupon */}
        {product.couponCode && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 border-dashed rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 text-center font-medium mb-3">
            🎟️ קופון: <span className="font-bold tracking-wide">{product.couponCode}</span>
            {product.couponValue && (
              <span className="text-emerald-500 mr-1">
                {" "}({product.couponType === "PERCENT" ? `${product.couponValue}%` : `$${product.couponValue}`} הנחה)
              </span>
            )}
          </div>
        )}

        {/* CTA Button */}
        <Link
          href={`/go/${product.id}`}
          className="block w-full text-center bg-emerald-500/10 text-emerald-400 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-500 hover:text-gray-950 transition-all duration-300 mt-auto"
        >
          לקנייה &larr;
        </Link>
      </div>
    </div>
  );
}
