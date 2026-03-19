import type { IngestionResult } from "@/types";
import { prisma } from "../db";
import { calculateDealScore } from "../scoring";
import { calculateFinalPrice } from "../currency";

const AFFILIATE_CODE = process.env.IHERB_AFFILIATE_CODE || "";
const API_KEY = process.env.IHERB_API_KEY || "";

interface IHerbProduct {
  id: string;
  name: string;
  brandName: string;
  price: number;
  listPrice: number;
  discount: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  categoryName: string;
  inStock: boolean;
  url: string;
  isBestSeller: boolean;
}

// איסוף דילים מ-iHerb
export async function ingestIHerbDeals(
  category?: string,
  keywords?: string
): Promise<IngestionResult> {
  const result: IngestionResult = {
    platform: "IHERB",
    totalFetched: 0,
    totalNew: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    errors: [],
  };

  try {
    // iHerb Product API
    const apiUrl = "https://api.iherb.com/v1/products";
    const params = new URLSearchParams({
      apiKey: API_KEY,
      country: "IL",
      currency: "USD",
      language: "en",
      pageSize: "50",
      sortBy: "BestSelling",
      ...(keywords && { q: keywords }),
      ...(category && { categoryId: category }),
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`);
    const data = await response.json();

    const products: IHerbProduct[] = data?.products || [];
    result.totalFetched = products.length;

    const store = await prisma.store.upsert({
      where: { name: "iHerb" },
      update: {},
      create: {
        name: "iHerb",
        platform: "IHERB",
        baseUrl: "https://www.iherb.com",
        affiliateConfig: { affiliateCode: AFFILIATE_CODE, apiKey: API_KEY },
        trustScore: 85,
        commissionRate: 0.07, // iHerb 5-10%
      },
    });

    // iHerb - משלוח לישראל זול ($4) או חינם מעל $40
    const IHERB_SHIPPING_COST = 4;
    const IHERB_FREE_SHIPPING_THRESHOLD = 40;

    for (const product of products) {
      try {
        if (!product.inStock) {
          result.totalSkipped++;
          continue;
        }

        const priceOriginal = product.listPrice || product.price;
        const priceCurrent = product.price;
        const shippingFree = priceCurrent >= IHERB_FREE_SHIPPING_THRESHOLD;
        const shippingCost = shippingFree ? 0 : IHERB_SHIPPING_COST;

        const pricing = await calculateFinalPrice(priceCurrent, priceOriginal, shippingCost);

        const score = calculateDealScore({
          priceOriginal,
          priceCurrent,
          rating: product.rating || null,
          reviewCount: product.reviewCount || 0,
          shippingFree,
          couponValue: null,
          categoryDemandScore: 65, // בריאות/ויטמינים פופולרי בישראל
          storeTrustScore: store.trustScore,
        });

        // בונוס למוצרים Best Seller
        const finalScore = product.isBestSeller
          ? Math.min(score.total + 10, 100)
          : score.total;

        const affiliateUrl = `${product.url}?rcode=${AFFILIATE_CODE}`;

        await prisma.product.upsert({
          where: {
            externalId_storeId: {
              externalId: product.id,
              storeId: store.id,
            },
          },
          update: {
            priceCurrent,
            priceOriginal,
            shippingCost,
            shippingFree,
            priceILS: pricing.finalPriceILS,
            priceWithVat: pricing.vatApplies ? pricing.finalPriceILS : null,
            vatApplies: pricing.vatApplies,
            imageUrl: product.imageUrl,
            affiliateUrl,
            score: finalScore,
            rating: product.rating || null,
            reviewCount: product.reviewCount || 0,
            updatedAt: new Date(),
          },
          create: {
            externalId: product.id,
            storeId: store.id,
            titleEn: `${product.brandName} - ${product.name}`,
            priceOriginal,
            priceCurrent,
            currency: "USD",
            shippingCost,
            shippingFree,
            priceILS: pricing.finalPriceILS,
            priceWithVat: pricing.vatApplies ? pricing.finalPriceILS : null,
            vatApplies: pricing.vatApplies,
            imageUrl: product.imageUrl,
            productUrl: product.url,
            affiliateUrl,
            rating: product.rating || null,
            reviewCount: product.reviewCount || 0,
            score: finalScore,
            status: finalScore >= 60 ? "APPROVED" : "PENDING",
            tags: JSON.stringify(product.isBestSeller ? ["bestseller", "iherb"] : ["iherb"]),
            targetAudience: JSON.stringify(["women", "health"]),
          },
        });

        result.totalNew++;
      } catch (err) {
        result.errors.push(`Product ${product.id}: ${err}`);
        result.totalSkipped++;
      }
    }
  } catch (err) {
    result.errors.push(`iHerb API error: ${err}`);
  }

  return result;
}
