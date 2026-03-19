import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "קליקלי - הדילים הכי שווים מחו\"ל לישראל",
    template: "%s | קליקלי",
  },
  description:
    "קליקלי - דילים, קופונים ומבצעים מ-AliExpress, Temu ו-iHerb עם מחירים בשקלים כולל משלוח ומע\"מ",
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
  ],
  openGraph: {
    title: "קליקלי - הדילים הכי שווים מחו\"ל לישראל",
    description:
      "דילים מ-AliExpress, Temu ו-iHerb עם מחירים בשקלים כולל משלוח ומע\"מ",
    type: "website",
    locale: "he_IL",
    siteName: "קליקלי",
  },
  twitter: {
    card: "summary_large_image",
    title: "קליקלי - הדילים הכי שווים מחו\"ל",
    description: "דילים מ-AliExpress, Temu ו-iHerb עם מחירים בשקלים",
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
      <body className="min-h-screen antialiased font-sans">{children}</body>
    </html>
  );
}
