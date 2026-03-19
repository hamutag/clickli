import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "קליקלי | הדילים הכי שווים מ-AliExpress, Temu ו-iHerb",
    template: "%s | קליקלי",
  },
  description:
    "קליקלי - מוצאים לכם את הדילים הכי שווים מ-AliExpress, Temu ו-iHerb. מחירים בשקלים, משלוח לישראל, קופונים בלעדיים והנחות אמיתיות כל יום.",
  keywords: [
    "קליקלי",
    "דילים",
    "קופונים",
    "מבצעים",
    "AliExpress",
    "Temu",
    "iHerb",
    "קניות אונליין",
    "מחירים בשקלים",
    "משלוח לישראל",
    "הנחות",
    "דילים מחו\"ל",
  ],
  openGraph: {
    title: "קליקלי | הדילים הכי שווים מ-AliExpress, Temu ו-iHerb",
    description:
      "מוצאים לכם את הדילים הכי שווים מחו\"ל. מחירים בשקלים, משלוח לישראל, קופונים בלעדיים.",
    type: "website",
    locale: "he_IL",
    siteName: "קליקלי",
  },
  twitter: {
    card: "summary_large_image",
    title: "קליקלי | הדילים הכי שווים מ-AliExpress, Temu ו-iHerb",
    description:
      "דילים מ-AliExpress, Temu ו-iHerb עם מחירים בשקלים ומשלוח לישראל",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased font-sans">
        {/* Top Navbar */}
        <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl md:text-2xl font-extrabold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              קליקלי
            </Link>
            <div className="flex items-center gap-1 md:gap-2">
              <Link
                href="/deals"
                className="text-sm text-gray-300 hover:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-gray-800/50 transition-all font-medium"
              >
                דילים
              </Link>
              <a
                href="https://t.me/clickli26"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-gray-800/50 transition-all font-medium"
              >
                טלגרם
              </a>
              <Link
                href="/admin"
                className="text-sm text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-800/50 transition-all"
              >
                אדמין
              </Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
