export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDealTier } from "@/lib/scoring";

export default async function HomePage() {
  const [featuredDeals, totalDeals, totalStores] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { score: "desc" },
      take: 6,
      include: {
        store: { select: { name: true, platform: true } },
        category: { select: { nameHe: true } },
      },
    }),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.store.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🛒 קליקלי
          </Link>
          <nav className="hidden md:flex gap-6 text-sm">
            <Link href="/deals" className="hover:text-blue-600 transition-colors font-medium">
              כל הדילים
            </Link>
            <Link href="/deals?cat=women" className="hover:text-blue-600 transition-colors">
              לנשים
            </Link>
            <Link href="/deals?cat=home" className="hover:text-blue-600 transition-colors">
              לבית
            </Link>
            <Link href="/deals?cat=health" className="hover:text-blue-600 transition-colors">
              בריאות
            </Link>
            <Link href="/deals?cat=tech" className="hover:text-blue-600 transition-colors">
              טכנולוגיה
            </Link>
          </nav>
          <Link
            href="/deals"
            className="md:hidden text-sm bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            כל הדילים
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          🔥 {totalDeals} דילים פעילים מ-{totalStores} חנויות
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
          הדילים הכי שווים מחו&quot;ל
          <br />
          <span className="bg-gradient-to-l from-blue-600 to-blue-400 bg-clip-text text-transparent">
            עם מחירים בשקלים
          </span>
        </h2>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          אנחנו סורקים את AliExpress, Temu ו-iHerb ומביאים רק את הדילים שבאמת שווים.
          <br />
          מחיר סופי כולל משלוח ומע&quot;מ. בלי הפתעות.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/deals"
            className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200"
          >
            לכל הדילים →
          </Link>
          <a
            href="https://t.me/clickli26"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-blue-200 text-blue-600 px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all"
          >
            📱 ערוץ טלגרם
          </a>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{totalDeals}</div>
            <div className="text-xs text-gray-500 mt-1">דילים פעילים</div>
          </div>
          <div className="bg-white rounded-xl p-4 border text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{totalStores}</div>
            <div className="text-xs text-gray-500 mt-1">חנויות מחוברות</div>
          </div>
          <div className="bg-white rounded-xl p-4 border text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-500">₪</div>
            <div className="text-xs text-gray-500 mt-1">מחירים בשקלים</div>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      {featuredDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">🔥 דילים חמים עכשיו</h3>
            <Link href="/deals" className="text-blue-600 text-sm hover:underline font-medium">
              הצג הכל →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featuredDeals.map((deal) => {
              const tier = getDealTier(deal.score);
              const savingsPercent = deal.priceOriginal > 0
                ? Math.round(((deal.priceOriginal - deal.priceCurrent) / deal.priceOriginal) * 100)
                : 0;

              return (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="bg-white rounded-xl border overflow-hidden hover:shadow-xl transition-all group hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {deal.imageUrl ? (
                      <img
                        src={deal.imageUrl}
                        alt={deal.titleHe || deal.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-blue-50 to-blue-100">
                        {deal.category?.nameHe === "אלקטרוניקה" ? "🎧" :
                         deal.category?.nameHe === "בריאות ויופי" ? "💊" :
                         deal.category?.nameHe === "בית וגן" ? "🏠" : "📦"}
                      </div>
                    )}
                    {savingsPercent > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                        -{savingsPercent}%
                      </span>
                    )}
                    {deal.score >= 80 && (
                      <span className="absolute top-2 left-2 text-lg drop-shadow">{tier.emoji}</span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-white/95 text-xs font-medium px-2 py-0.5 rounded shadow-sm">
                      {deal.store.name}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h4 className="text-sm font-medium line-clamp-2 mb-3 min-h-[40px]">
                      {deal.titleHe || deal.titleEn}
                    </h4>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xl font-bold text-green-600">
                        {deal.priceILS ? `₪${Math.round(deal.priceILS)}` : `$${deal.priceCurrent.toFixed(2)}`}
                      </span>
                      {savingsPercent > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          {deal.priceILS
                            ? `₪${Math.round(deal.priceOriginal * 3.65)}`
                            : `$${deal.priceOriginal.toFixed(2)}`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {deal.shippingFree ? "✅ משלוח חינם" : "📦 משלוח בתשלום"}
                      </span>
                      {deal.rating && (
                        <span>⭐ {deal.rating.toFixed(1)} ({deal.reviewCount.toLocaleString()})</span>
                      )}
                    </div>

                    {deal.couponCode && (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 text-xs text-orange-700 text-center font-medium">
                        🎟️ קופון: {deal.couponCode}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="bg-white border-t border-b">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h3 className="text-2xl font-bold text-center mb-10">למה קליקלי?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                💰
              </div>
              <h4 className="font-bold text-lg mb-2">מחיר סופי בשקלים</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                כולל משלוח, המרת מטבע ומע&quot;מ כשצריך. מה שאתם רואים זה מה שתשלמו.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🔥
              </div>
              <h4 className="font-bold text-lg mb-2">רק דילים שווים</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                מערכת ציון חכמה שמסננת ומביאה רק מוצרים עם הנחה אמיתית, דירוג גבוה ומשלוח לישראל.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                ⭐
              </div>
              <h4 className="font-bold text-lg mb-2">ביקורות אמיתיות</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                דירוג ומספר ביקורות מהחנות המקורית, כדי שתדעו בדיוק מה אתם מקבלים.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stores Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-center mb-8">החנויות שלנו</h3>
        <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
          <Link
            href="/deals?store=aliexpress"
            className="bg-white rounded-xl p-6 border text-center hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">🛍️</div>
            <div className="font-bold text-sm">AliExpress</div>
            <div className="text-xs text-gray-400 mt-1">עד 8% קומיסיה</div>
          </Link>
          <Link
            href="/deals?store=temu"
            className="bg-white rounded-xl p-6 border text-center hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">🧡</div>
            <div className="font-bold text-sm">Temu</div>
            <div className="text-xs text-gray-400 mt-1">עד 15% קומיסיה</div>
          </Link>
          <Link
            href="/deals?store=iherb"
            className="bg-white rounded-xl p-6 border text-center hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">💚</div>
            <div className="font-bold text-sm">iHerb</div>
            <div className="text-xs text-gray-400 mt-1">עד 5% קומיסיה</div>
          </Link>
        </div>
      </section>

      {/* Telegram CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-l from-blue-600 to-blue-500 rounded-2xl p-8 text-center text-white shadow-xl">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-2xl font-bold mb-3">הצטרפו לערוץ הטלגרם</h3>
          <p className="text-blue-100 mb-6 text-sm">
            דילים חמים ישירות לנייד. עד 15 דילים ביום, רק הדברים הכי שווים.
          </p>
          <a
            href="https://t.me/clickli26"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            הצטרפו עכשיו →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xl font-bold text-blue-600">🛒 קליקלי</span>
              <p className="text-xs text-gray-400 mt-1">המבצעים הכי שווים מחו&quot;ל לישראל</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/deals" className="hover:text-blue-600">כל הדילים</Link>
              <a href="https://t.me/clickli26" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">טלגרם</a>
            </div>
          </div>
          <div className="border-t mt-6 pt-6 text-center text-xs text-gray-400">
            <p>האתר משתמש בקישורי שותפים (Affiliate Links). לא עולה לכם שקל יותר.</p>
            <p className="mt-1">© {new Date().getFullYear()} קליקלי. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
