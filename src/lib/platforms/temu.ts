import type { IngestionResult } from "@/types";
import { prisma } from "../db";
import { calculateDealScore } from "../scoring";
import { calculateFinalPrice } from "../currency";

const API_KEY = process.env.TEMU_API_KEY || "";
const AFFILIATE_ID = process.env.TEMU_AFFILIATE_ID || "";

interface TemuProduct {
  goods_id: string;
  goods_name: string;
  min_price: number;
  market_price: number;
  image_url: string;
  goods_rating: number;
  sold_quantity: number;
  category_name: string;
  promotion_url: string;
  coupon_info?: {
    coupon_code: string;
    discount_amount: number;
  };
}

// איסוף דילים מ-Temu Affiliate API
export async function ingestTemuDeals(
  category?: string,
  keywords?: string
): Promise<IngestionResult> {
  const result: IngestionResult = {
    platform: "TEMU",
    totalFetched: 0,
    totalNew: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    errors: [],
  };

  try {
    // Temu Affiliate API
    const apiUrl = "https://api.temu.com/affiliate/products";
    const params = new URLSearchParams({
      api_key: API_KEY,
      affiliate_id: AFFILIATE_ID,
      ship_to: "IL",
      currency: "USD",
      page_size: "50",
      sort_by: "best_selling",
      ...(keywords && { keywords }),
      ...(category && { category }),
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`);
    const data = await response.json();

    const products: TemuProduct[] = data?.products || [];
    result.totalFetched = products.length;

    const store = await prisma.store.upsert({
      where: { name: "Temu" },
      update: {},
      create: {
        name: "Temu",
        platform: "TEMU",
        baseUrl: "https://www.temu.com",
        affiliateConfig: { apiKey: API_KEY, affiliateId: AFFILIATE_ID },
        trustScore: 70,
        commissionRate: 0.15, // Temu נותנת 10-20%
      },
    });

    for (const product of products) {
      try {
        const priceOriginal = product.market_price || product.min_price;
        const priceCurrent = product.min_price;

        const pricing = await calculateFinalPrice(priceCurrent, priceOriginal, 0); // Temu - משלוח חינם

        const score = calculateDealScore({
          priceOriginal,
          priceCurrent,
          rating: product.goods_rating || null,
          reviewCount: product.sold_quantity || 0,
          shippingFree: true,
          couponValue: product.coupon_info?.discount_amount ?? null,
          categoryDemandScore: 60, // Temu פופולרי בישראל
          storeTrustScore: store.trustScore,
        });

        await prisma.product.upsert({
          where: {
            externalId_storeId: {
              externalId: product.goods_id,
              storeId: store.id,
            },
          },
          update: {
            priceCurrent,
            priceOriginal,
            priceILS: pricing.finalPriceILS,
            priceWithVat: pricing.vatApplies ? pricing.finalPriceILS : null,
            vatApplies: pricing.vatApplies,
            imageUrl: product.image_url,
            affiliateUrl: product.promotion_url,
            score: score.total,
            rating: product.goods_rating || null,
            reviewCount: product.sold_quantity || 0,
            couponCode: product.coupon_info?.coupon_code ?? null,
            couponValue: product.coupon_info?.discount_amount ?? null,
            couponType: product.coupon_info ? "FIXED" : null,
            updatedAt: new Date(),
          },
          create: {
            externalId: product.goods_id,
            storeId: store.id,
            titleEn: product.goods_name,
            priceOriginal,
            priceCurrent,
            currency: "USD",
            shippingCost: 0,
            shippingFree: true,
            priceILS: pricing.finalPriceILS,
            priceWithVat: pricing.vatApplies ? pricing.finalPriceILS : null,
            vatApplies: pricing.vatApplies,
            imageUrl: product.image_url,
            productUrl: `https://www.temu.com/product/${product.goods_id}.html`,
            affiliateUrl: product.promotion_url,
            rating: product.goods_rating || null,
            reviewCount: product.sold_quantity || 0,
            couponCode: product.coupon_info?.coupon_code ?? null,
            couponValue: product.coupon_info?.discount_amount ?? null,
            couponType: product.coupon_info ? "FIXED" : null,
            score: score.total,
            status: score.total >= 60 ? "APPROVED" : "PENDING",
            tags: JSON.stringify(["temu"]),
          },
        });

        result.totalNew++;
      } catch (err) {
        result.errors.push(`Product ${product.goods_id}: ${err}`);
        result.totalSkipped++;
      }
    }
  } catch (err) {
    result.errors.push(`Temu API error: ${err}`);
  }

  return result;
}
