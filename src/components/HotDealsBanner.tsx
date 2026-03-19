"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface HotDeal {
  id: string;
  titleHe: string | null;
  titleEn: string;
  imageUrl: string | null;
  priceCurrent: number;
  priceOriginal: number;
  priceILS: number | null;
  score: number;
}

interface HotDealsBannerProps {
  deals: HotDeal[];
}

export default function HotDealsBanner({ deals }: HotDealsBannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollNext = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + 16
      : 280;

    const maxScroll = container.scrollWidth - container.clientWidth;

    if (container.scrollLeft >= maxScroll - 10) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (isPaused || deals.length <= 1) return;

    intervalRef.current = setInterval(scrollNext, 3500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, scrollNext, deals.length]);

  if (deals.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 pt-8 pb-4">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">&#x1F525;</span>
        <h2 className="text-xl md:text-2xl font-bold text-white">
          דילים לוהטים
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {deals.map((deal) => {
          const savingsPercent =
            deal.priceOriginal > 0
              ? Math.round(
                  ((deal.priceOriginal - deal.priceCurrent) /
                    deal.priceOriginal) *
                    100
                )
              : 0;

          const displayPrice = deal.priceILS
            ? `\u20AA${Math.round(deal.priceILS)}`
            : `$${deal.priceCurrent.toFixed(2)}`;

          return (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}`}
              className="group flex-shrink-0 w-[260px] md:w-[300px] bg-gradient-to-br from-gray-900 to-gray-800 border border-orange-500/20 rounded-2xl overflow-hidden hover:border-orange-400/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div className="relative h-40 bg-gray-800 overflow-hidden">
                {deal.imageUrl ? (
                  <img
                    src={deal.imageUrl}
                    alt={deal.titleHe || deal.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-800 to-gray-900">
                    &#x1F4E6;
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                  <span>&#x1F525;</span>
                  {savingsPercent > 0 && <span>-{savingsPercent}%</span>}
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-200 line-clamp-1 mb-2">
                  {deal.titleHe || deal.titleEn}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-emerald-400">
                    {displayPrice}
                  </span>
                  {savingsPercent > 0 && (
                    <span className="text-xs text-gray-500 line-through">
                      {deal.priceILS
                        ? `\u20AA${Math.round(deal.priceOriginal * 3.65)}`
                        : `$${deal.priceOriginal.toFixed(2)}`}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
