// ============================================
// Types for the Affiliate Platform
// ============================================

export type Platform = "ALIEXPRESS" | "TEMU" | "IHERB" | "AMAZON";
export type Channel = "WEB" | "TELEGRAM";
export type ProductStatus = "PENDING" | "APPROVED" | "PUBLISHED" | "REJECTED" | "EXPIRED";
export type PostVariant = "SEO_LONG" | "SHORT_FIRE" | "SOCIAL_PROOF";

export interface DealScore {
  total: number;
  breakdown: {
    discount: number;
    reviews: number;
    reviewCount: number;
    freeShipping: number;
    coupon: number;
    categoryDemand: number;
    storeTrust: number;
  };
}

export interface PriceCalculation {
  originalPrice: number;
  currentPrice: number;
  shippingCost: number;
  subtotalUSD: number;
  exchangeRate: number;
  subtotalILS: number;
  vatApplies: boolean;
  vatAmount: number;
  finalPriceILS: number;
  savingsPercent: number;
}

export interface GeneratedContent {
  titleHe: string;
  bodyHe: string;
  ctaHe: string;
  prosHe: string;
  consHe: string;
  metaDescription: string;
}

export interface TelegramPost {
  text: string;
  imageUrl?: string;
  affiliateUrl: string;
}

export interface DailyReportData {
  date: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  epc: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    title: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  channelBreakdown: {
    web: { clicks: number; conversions: number; revenue: number };
    telegram: { clicks: number; conversions: number; revenue: number };
  };
  storeBreakdown: Record<string, { clicks: number; conversions: number; revenue: number }>;
}

export interface IngestionResult {
  platform: Platform;
  totalFetched: number;
  totalNew: number;
  totalUpdated: number;
  totalSkipped: number;
  errors: string[];
}

export interface AdminDashboardStats {
  totalProducts: number;
  activeDeals: number;
  todayClicks: number;
  todayConversions: number;
  todayRevenue: number;
  todayEPC: number;
  pendingReview: number;
  publishedToday: number;
  telegramSubscribers: number;
  conversionRate: number;
}
