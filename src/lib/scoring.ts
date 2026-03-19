import type { DealScore } from "@/types";

interface ScoringInput {
  priceOriginal: number;
  priceCurrent: number;
  rating: number | null;
  reviewCount: number;
  shippingFree: boolean;
  couponValue: number | null;
  categoryDemandScore: number; // 0-100
  storeTrustScore: number; // 0-100
}

const WEIGHTS = {
  discount: 0.25,
  reviews: 0.20,
  reviewCount: 0.10,
  freeShipping: 0.15,
  coupon: 0.10,
  categoryDemand: 0.10,
  storeTrust: 0.10,
} as const;

// ציון דיל 0-100 - רק "יהלומים" מפורסמים
export function calculateDealScore(input: ScoringInput): DealScore {
  const {
    priceOriginal,
    priceCurrent,
    rating,
    reviewCount,
    shippingFree,
    couponValue,
    categoryDemandScore,
    storeTrustScore,
  } = input;

  // חישוב אחוז הנחה (0-100)
  const discountPercent =
    priceOriginal > 0
      ? Math.min(((priceOriginal - priceCurrent) / priceOriginal) * 100, 100)
      : 0;
  const discountScore = Math.min(discountPercent * 1.5, 100); // מכפיל - הנחות גדולות שוות יותר

  // ציון ביקורות (0-100)
  const reviewScore = rating ? Math.min((rating / 5) * 100, 100) : 30;

  // ציון כמות ביקורות (0-100) - לוגריתמי
  const reviewCountScore = reviewCount > 0
    ? Math.min((Math.log10(reviewCount) / Math.log10(10000)) * 100, 100)
    : 0;

  // משלוח חינם (0 או 100)
  const freeShippingScore = shippingFree ? 100 : 0;

  // ציון קופון (0-100)
  const couponScore = couponValue
    ? Math.min(couponValue * 5, 100) // כל דולר קופון = 5 נקודות
    : 0;

  // ציון משוקלל
  const total = Math.round(
    discountScore * WEIGHTS.discount +
    reviewScore * WEIGHTS.reviews +
    reviewCountScore * WEIGHTS.reviewCount +
    freeShippingScore * WEIGHTS.freeShipping +
    couponScore * WEIGHTS.coupon +
    categoryDemandScore * WEIGHTS.categoryDemand +
    storeTrustScore * WEIGHTS.storeTrust
  );

  return {
    total: Math.min(total, 100),
    breakdown: {
      discount: Math.round(discountScore),
      reviews: Math.round(reviewScore),
      reviewCount: Math.round(reviewCountScore),
      freeShipping: freeShippingScore,
      coupon: Math.round(couponScore),
      categoryDemand: categoryDemandScore,
      storeTrust: storeTrustScore,
    },
  };
}

// סינון - האם הדיל שווה פרסום?
export function shouldPublish(score: number): boolean {
  return score >= 60;
}

// האם הדיל "פצצה"?
export function isFireDeal(score: number): boolean {
  return score >= 80;
}

// תיאור רמת הדיל בעברית
export function getDealTier(score: number): { tier: string; emoji: string; label: string } {
  if (score >= 90) return { tier: "LEGENDARY", emoji: "💎", label: "דיל אגדי" };
  if (score >= 80) return { tier: "FIRE", emoji: "🔥", label: "פצצה" };
  if (score >= 70) return { tier: "GREAT", emoji: "⭐", label: "דיל מעולה" };
  if (score >= 60) return { tier: "GOOD", emoji: "👍", label: "דיל טוב" };
  return { tier: "SKIP", emoji: "❌", label: "לא שווה" };
}
