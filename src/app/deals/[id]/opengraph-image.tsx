import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "קליקלי - דיל";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      titleHe: true,
      titleEn: true,
      priceCurrent: true,
      priceOriginal: true,
      priceILS: true,
      score: true,
      imageUrl: true,
    },
  });

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0F172A 0%, #064E3B 100%)",
            color: "white",
            fontSize: 48,
            fontFamily: "sans-serif",
          }}
        >
          קליקלי - דיל לא נמצא
        </div>
      ),
      { ...size }
    );
  }

  const title = product.titleHe || product.titleEn;
  const discountPercent =
    product.priceOriginal > 0
      ? Math.round(
          ((product.priceOriginal - product.priceCurrent) /
            product.priceOriginal) *
            100
        )
      : 0;

  const priceDisplay = product.priceILS
    ? `${Math.round(product.priceILS)}₪`
    : `$${product.priceCurrent.toFixed(2)}`;

  const scoreBadge =
    product.score >= 90
      ? "🔥 דיל מטורף"
      : product.score >= 80
        ? "⭐ דיל מעולה"
        : product.score >= 70
          ? "👍 דיל טוב"
          : "📦 דיל";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background: "linear-gradient(135deg, #0F172A 0%, #064E3B 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Right side - Content (RTL layout) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 56px",
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "#10B981",
              }}
            >
              קליקלי
            </div>
            <div
              style={{
                fontSize: 16,
                color: "#9CA3AF",
                marginTop: "4px",
              }}
            >
              דילים חכמים
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "white",
                lineHeight: 1.3,
                direction: "rtl",
                maxWidth: "600px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title.length > 60 ? `${title.slice(0, 60)}...` : title}
            </div>

            {/* Score badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: "12px",
                  padding: "6px 16px",
                  fontSize: 20,
                  color: "#34D399",
                  fontWeight: 600,
                }}
              >
                {scoreBadge}
              </div>
            </div>
          </div>

          {/* Price section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: "#10B981",
              }}
            >
              {priceDisplay}
            </div>

            {discountPercent > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    color: "#6B7280",
                    textDecoration: "line-through",
                  }}
                >
                  ${product.priceOriginal.toFixed(2)}
                </div>
                <div
                  style={{
                    background: "#EF4444",
                    color: "white",
                    borderRadius: "8px",
                    padding: "4px 12px",
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  -{discountPercent}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Left side - Product image area */}
        <div
          style={{
            width: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.05)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt=""
              width={320}
              height={320}
              style={{
                objectFit: "contain",
                borderRadius: "16px",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 120,
                opacity: 0.3,
              }}
            >
              🛒
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
