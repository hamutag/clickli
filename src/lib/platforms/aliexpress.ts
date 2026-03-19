import type { IngestionResult } from "@/types";
import { prisma } from "../db";
import { calculateDealScore } from "../scoring";
import { calculateFinalPrice } from "../currency";

const APP_KEY = process.env.ALIEXPRESS_APP_KEY || "";
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || "";
const TRACKING_ID = process.env.ALIEXPRESS_TRACKING_ID || "";

interface AliExpressProduct {
  product_id: string;
  product_title: string;
  original_price: string;
  sale_price: string;
  discount: string;
  product_main_image_url: string;
  product_small_image_urls?: { string: string[] };
  evaluate_rate: string;
  commission_rate: string;
  shop_url: string;
  promotion_link: string;
  ship_to_days?: string;
  lastest_volume?: string;
}

// איסוף דילים מ-AliExpress Affiliate API
export async function ingestAliExpressDeals(
  categoryId?: string,
  keywords?: string
): Promise<IngestionResult> {
  const result: IngestionResult = {
    platform: "ALIEXPRESS",
    totalFetched: 0,
    totalNew: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    errors: [],
  };

  try {
    // AliExpress Affiliate API - Top Products
    const apiUrl = "https://api-sg.aliexpress.com/sync";
    const params: Record<string, string> = {
      method: "aliexpress.affiliate.product.query",
      app_key: APP_KEY,
      sign_method: "sha256",
      timestamp: new Date().toISOString(),
      format: "json",
      v: "2.0",
      target_currency: "USD",
      target_language: "EN",
      tracking_id: TRACKING_ID,
      ship_to_country: "IL",
      sort: "SALE_PRICE_ASC",
      page_size: "50",
      fields: "product_id,product_title,original_price,sale_price,discount,product_main_image_url,evaluate_rate,commission_rate,promotion_link,ship_to_days",
    };

    if (keywords) params.keywords = keywords;
    if (categoryId) params.category_ids = categoryId;

    // חתימה על הבקשה
    const sign = generateSign(params, APP_SECRET);
    params.sign = sign;

    const queryString = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    const response = await fetch(`${apiUrl}?${queryString}`);
    const data = await response.json();

    const products: AliExpressProduct[] =
      data?.aliexpress_affiliate_product_query_response?.resp_result?.result?.products?.product || [];

    result.totalFetched = products.length;

    // מציאת/יצירת חנות AliExpress
    const store = await prisma.store.upsert({
      where: { name: "AliExpress" },
      update: {},
      create: {
        name: "AliExpress",
        platform: "ALIEXPRESS",
        baseUrl: "https://www.aliexpress.com",
        affiliateConfig: { appKey: APP_KEY, trackingId: TRACKING_ID },
        trustScore: 75,
        commissionRate: 0.05,
      },
    });

    for (const product of products) {
      try {
        const priceOriginal = parseFloat(product.original_price) || 0;
        const priceCurrent = parseFloat(product.sale_price) || priceOriginal;

        // חישוב מחיר סופי בשקלים
        const pricing = await calculateFinalPrice(priceCurrent, priceOriginal, 0); // AliExpress - משלוח בד"כ חינם

        // חישוב ציון
        const score = calculateDealScore({
          priceOriginal,
          priceCurrent,
          rating: parseFloat(product.evaluate_rate) || null,
          reviewCount: parseInt(product.lastest_volume || "0", 10),
          shippingFree: true,
          couponValue: null,
          categoryDemandScore: 50,
          storeTrustScore: store.trustScore,
        });

        // Upsert מוצר
        await prisma.product.upsert({
          where: {
            externalId_storeId: {
              externalId: product.product_id,
              storeId: store.id,
            },
          },
          update: {
            priceCurrent,
            priceOriginal,
            priceILS: pricing.finalPriceILS,
            priceWithVat: pricing.vatApplies ? pricing.finalPriceILS : null,
            vatApplies: pricing.vatApplies,
            imageUrl: product.product_main_image_url,
            affiliateUrl: product.promotion_link,
            score: score.total,
            updatedAt: new Date(),
          },
          create: {
            externalId: product.product_id,
            storeId: store.id,
            titleEn: product.product_title,
            priceOriginal,
            priceCurrent,
            currency: "USD",
            shippingCost: 0,
            shippingFree: true,
            priceILS: pricing.finalPriceILS,
            priceWithVat: pricing.vatApplies ? pricing.finalPriceILS : null,
            vatApplies: pricing.vatApplies,
            imageUrl: product.product_main_image_url,
            productUrl: `https://www.aliexpress.com/item/${product.product_id}.html`,
            affiliateUrl: product.promotion_link,
            rating: parseFloat(product.evaluate_rate) || null,
            reviewCount: parseInt(product.lastest_volume || "0", 10),
            score: score.total,
            status: score.total >= 60 ? "APPROVED" : "PENDING",
          },
        });

        result.totalNew++;
      } catch (err) {
        result.errors.push(`Product ${product.product_id}: ${err}`);
        result.totalSkipped++;
      }
    }
  } catch (err) {
    result.errors.push(`AliExpress API error: ${err}`);
  }

  return result;
}

// חתימה על בקשת API
function generateSign(params: Record<string, string>, secret: string): string {
  const crypto = require("crypto");
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  return crypto
    .createHmac("sha256", secret)
    .update(sorted)
    .digest("hex")
    .toUpperCase();
}
