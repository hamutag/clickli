export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import DealCard from "@/components/DealCard";

const CATEGORIES = [
  { name: "אלקטרוניקה", icon: "🎧", slug: "electronics" },
  { name: "בריאות ויופי", icon: "💊", slug: "health" },
  { name: "בית וגן", icon: "🏠", slug: "home" },
  { name: "אופנה", icon: "👗", slug: "fashion" },
  { name: "ספורט", icon: "🏃", slug: "sports" },
  { name: "ילדים ותינוקות", icon: "🧸", slug: "kids" },
  { name: "כלי מטבח", icon: "🍳", slug: "kitchen" },
  { name: "אביזרי רכב", icon: "🚗", slug: "car" },
] as const;

export default async function HomePage() {
  const [featuredDeals, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { score: "desc" },
      take: 6,
      include: {
        store: { select: { name: true, platform: true } },
        category: { select: { nameHe: true, slug: true } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { demandScore: "desc" },
      take: 8,
      select: { nameHe: true, slug: true, icon: true },
    }),
  ]);

  const displayCategories = categories.length > 0
    ? categories.map((c) => ({
        name: c.nameHe,
        icon: c.icon || "📦",
        slug: c.slug,
      }))
    : CATEGORIES;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clickly.co.il";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "קליקלי",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "קליקלי - מוצאים לכם את הדילים הכי שווים מ-AliExpress, Temu ו-iHerb. מחירים בשקלים, משלוח לישראל, קופונים בלעדיים.",
    sameAs: ["https://t.me/clickli26"],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "קליקלי",
    url: siteUrl,
    inLanguage: "he-IL",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/deals?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-900/40 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-28 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium px-5 py-2 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            דילים מתעדכנים כל יום
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            הדילים הכי שווים
            <br />
            <span className="bg-gradient-to-l from-emerald-400 to-green-300 bg-clip-text text-transparent">
              מהעולם 🔥
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            חוסכים כסף על קניות מ-AliExpress, Temu ו-iHerb.
            <br className="hidden md:block" />
            מחירים בשקלים, משלוח לישראל, קופונים בלעדיים.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/deals"
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5"
            >
              לכל הדילים &larr;
            </Link>
            <a
              href="https://t.me/clickli26"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-gray-700 hover:border-emerald-500/50 text-gray-300 hover:text-emerald-400 px-8 py-4 rounded-2xl text-lg font-semibold transition-all"
            >
              📱 ערוץ טלגרם
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mt-14 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">✅ משלוח לישראל</span>
            <span className="flex items-center gap-1.5">💰 מחירים בשקלים</span>
            <span className="flex items-center gap-1.5">🎟️ קופונים בלעדיים</span>
          </div>
        </div>
      </section>

      {/* ===== FEATURED DEALS ===== */}
      {featuredDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              🔥 דילים חמים עכשיו
            </h2>
            <Link
              href="/deals"
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              הצג הכל &larr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {featuredDeals.map((deal) => (
              <DealCard key={deal.id} product={deal} />
            ))}
          </div>
        </section>
      )}

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-gray-900/50 border-t border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            איך זה עובד?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">
                🔍
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">מוצאים דיל</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                אנחנו סורקים אלפי מוצרים כל יום מ-AliExpress, Temu ו-iHerb
                ומוצאים את ההנחות האמיתיות.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">
                ⭐
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">
                בודקים ומדרגים
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                רק דילים עם ציון 60+ מגיעים אליכם. בודקים דירוגים, ביקורות,
                משלוח לישראל ומחיר סופי.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">
                💰
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">חוסכים כסף</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                קונים במחיר הכי טוב עם קופונים בלעדיים. מחיר סופי בשקלים כולל
                משלוח.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES GRID ===== */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          קטגוריות פופולריות
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {displayCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/deals?cat=${cat.slug}`}
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-emerald-500/40 hover:bg-gray-900/80 transition-all hover:-translate-y-1"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div className="font-semibold text-sm text-gray-300 group-hover:text-emerald-400 transition-colors">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== TELEGRAM CTA ===== */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden bg-gradient-to-l from-emerald-600 to-emerald-500 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-emerald-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="text-5xl mb-5">📱</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
              הצטרפו לערוץ הטלגרם שלנו
            </h2>
            <p className="text-emerald-100 mb-8 text-sm md:text-base max-w-lg mx-auto">
              דילים חמים ישירות לנייד. עד 15 דילים ביום, רק הדברים הכי שווים.
              תהיו הראשונים לדעת!
            </p>
            <a
              href="https://t.me/clickli26"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-emerald-700 px-10 py-4 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-colors hover:shadow-lg"
            >
              הצטרפו עכשיו &larr;
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right">
              <span className="text-2xl font-bold text-emerald-400">
                קליקלי
              </span>
              <p className="text-sm text-gray-500 mt-1">
                הדילים הכי שווים מחו&quot;ל לישראל
              </p>
            </div>
            <div className="flex gap-8 text-sm text-gray-400 flex-wrap justify-center md:justify-start">
              <Link
                href="/deals"
                className="hover:text-emerald-400 transition-colors"
              >
                כל הדילים
              </Link>
              <Link
                href="/about"
                className="hover:text-emerald-400 transition-colors"
              >
                אודות
              </Link>
              <a
                href="https://t.me/clickli26"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors"
              >
                טלגרם
              </a>
              <Link
                href="/privacy"
                className="hover:text-emerald-400 transition-colors"
              >
                מדיניות פרטיות
              </Link>
              <Link
                href="/terms"
                className="hover:text-emerald-400 transition-colors"
              >
                תנאי שימוש
              </Link>
              <Link
                href="/contact"
                className="hover:text-emerald-400 transition-colors"
              >
                צור קשר
              </Link>
              <Link
                href="/admin"
                className="hover:text-emerald-400 transition-colors"
              >
                אדמין
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-600">
            <p>
              האתר משתמש בקישורי שותפים (Affiliate Links). לא עולה לכם שקל
              יותר.
            </p>
            <p className="mt-2">
              &copy; {new Date().getFullYear()} קליקלי. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
