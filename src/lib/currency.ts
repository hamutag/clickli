import type { PriceCalculation } from "@/types";

const VAT_THRESHOLD_USD = Number(process.env.VAT_THRESHOLD_USD) || 75;
const VAT_RATE = Number(process.env.VAT_RATE) || 0.17;

// שער חליפין - מתעדכן אחת ליום
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 שעות

export async function getExchangeRate(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION_MS) {
    return cachedRate.rate;
  }

  try {
    // Bank of Israel API - שער דולר רשמי
    const response = await fetch(
      "https://www.boi.org.il/PublicApi/GetExchangeRates?asXml=false"
    );
    const data = await response.json();
    const usdRate = data?.exchangeRates?.find(
      (r: { key: string }) => r.key === "USD"
    );

    if (usdRate?.currentExchangeRate) {
      cachedRate = {
        rate: usdRate.currentExchangeRate,
        timestamp: Date.now(),
      };
      return cachedRate.rate;
    }
  } catch {
    // fallback
  }

  // fallback rate - עדכון ידני
  const fallbackRate = 3.65;
  cachedRate = { rate: fallbackRate, timestamp: Date.now() };
  return fallbackRate;
}

export async function calculateFinalPrice(
  priceUSD: number,
  originalPriceUSD: number,
  shippingCostUSD: number
): Promise<PriceCalculation> {
  const exchangeRate = await getExchangeRate();

  const subtotalUSD = priceUSD + shippingCostUSD;
  const subtotalILS = subtotalUSD * exchangeRate;

  // מע"מ חל על הזמנות מעל $75
  const vatApplies = subtotalUSD > VAT_THRESHOLD_USD;
  const vatAmount = vatApplies ? subtotalILS * VAT_RATE : 0;
  const finalPriceILS = Math.round((subtotalILS + vatAmount) * 100) / 100;

  const savingsPercent =
    originalPriceUSD > 0
      ? Math.round(((originalPriceUSD - priceUSD) / originalPriceUSD) * 100)
      : 0;

  return {
    originalPrice: originalPriceUSD,
    currentPrice: priceUSD,
    shippingCost: shippingCostUSD,
    subtotalUSD,
    exchangeRate,
    subtotalILS,
    vatApplies,
    vatAmount: Math.round(vatAmount * 100) / 100,
    finalPriceILS,
    savingsPercent,
  };
}

export function formatPriceILS(amount: number): string {
  return `₪${amount.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPriceUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
