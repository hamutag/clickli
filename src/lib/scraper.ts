/**
 * URL-based product metadata scraper.
 * Extracts Open Graph tags, JSON-LD structured data, and meta tags
 * from product pages without requiring external parsing libraries.
 */

export interface ScrapedProduct {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  platform: string | null;
  rating: number | null;
  reviewCount: number | null;
}

type Platform = "ALIEXPRESS" | "TEMU" | "IHERB";

const PLATFORM_PATTERNS: ReadonlyArray<{ pattern: RegExp; platform: Platform }> = [
  { pattern: /aliexpress\.com/i, platform: "ALIEXPRESS" },
  { pattern: /temu\.com/i, platform: "TEMU" },
  { pattern: /iherb\.com/i, platform: "IHERB" },
];

function detectPlatform(url: string): Platform | null {
  for (const { pattern, platform } of PLATFORM_PATTERNS) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return null;
}

function extractMetaContent(html: string, nameOrProperty: string): string | null {
  // Match both name="..." and property="..." attributes, with content in either order
  const patterns = [
    new RegExp(
      `<meta[^>]*(?:name|property)=["']${escapeRegex(nameOrProperty)}["'][^>]*content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${escapeRegex(nameOrProperty)}["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1].trim());
    }
  }
  return null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

interface JsonLdData {
  name?: string;
  description?: string;
  image?: string | string[];
  offers?: {
    price?: string | number;
    priceCurrency?: string;
  };
  aggregateRating?: {
    ratingValue?: string | number;
    reviewCount?: string | number;
    ratingCount?: string | number;
  };
}

function extractJsonLd(html: string): JsonLdData | null {
  const scriptPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptPattern.exec(html)) !== null) {
    try {
      const raw = match[1].trim();
      const parsed = JSON.parse(raw);

      // Handle @graph arrays
      const items: JsonLdData[] = Array.isArray(parsed) ? parsed : parsed["@graph"] ? parsed["@graph"] : [parsed];

      for (const item of items) {
        const type = item["@type" as keyof typeof item] as string | undefined;
        if (type === "Product" || type === "IndividualProduct") {
          return item as JsonLdData;
        }
      }
    } catch {
      // Invalid JSON-LD block, skip
    }
  }
  return null;
}

function parsePrice(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const num = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? null : num;
}

export async function scrapeProductUrl(url: string): Promise<ScrapedProduct> {
  const validatedUrl = new URL(url); // throws on invalid URL

  const response = await fetch(validatedUrl.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // Extract Open Graph tags
  const ogTitle = extractMetaContent(html, "og:title");
  const ogDescription = extractMetaContent(html, "og:description");
  const ogImage = extractMetaContent(html, "og:image");
  const ogPriceAmount = extractMetaContent(html, "og:price:amount")
    ?? extractMetaContent(html, "product:price:amount");
  const ogPriceCurrency = extractMetaContent(html, "og:price:currency")
    ?? extractMetaContent(html, "product:price:currency");

  // Extract standard meta tags
  const metaDescription = extractMetaContent(html, "description");
  const titleTag = extractTitleTag(html);

  // Extract JSON-LD structured data
  const jsonLd = extractJsonLd(html);

  // Resolve image from JSON-LD
  const jsonLdImage = jsonLd?.image
    ? Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image
    : null;

  // Build result with priority: JSON-LD > OG tags > standard meta
  const title = jsonLd?.name ?? ogTitle ?? titleTag ?? null;
  const description = jsonLd?.description ?? ogDescription ?? metaDescription ?? null;
  const imageUrl = ogImage ?? jsonLdImage ?? null;
  const price = parsePrice(jsonLd?.offers?.price) ?? parsePrice(ogPriceAmount);
  const currency = jsonLd?.offers?.priceCurrency ?? ogPriceCurrency ?? null;
  const platform = detectPlatform(url);

  const ratingValue = jsonLd?.aggregateRating?.ratingValue;
  const rating = ratingValue != null ? parsePrice(ratingValue) : null;

  const rawReviewCount =
    jsonLd?.aggregateRating?.reviewCount ?? jsonLd?.aggregateRating?.ratingCount;
  const reviewCount = rawReviewCount != null
    ? Math.round(parsePrice(rawReviewCount) ?? 0) || null
    : null;

  return {
    title,
    description,
    imageUrl,
    price,
    currency,
    platform,
    rating,
    reviewCount,
  };
}
