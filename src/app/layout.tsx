import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Analytics from "@/components/Analytics";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clickly.co.il";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10B981",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "קליקלי | הדילים הכי שווים מ-AliExpress, Temu ו-iHerb",
    description:
      "מוצאים לכם את הדילים הכי שווים מחו\"ל. מחירים בשקלים, משלוח לישראל, קופונים בלעדיים.",
    type: "website",
    locale: "he_IL",
    siteName: "קליקלי",
    url: SITE_URL,
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
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
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
        <Analytics />
        {/* Top Navbar */}
        <Navbar />

        {children}
      </body>
    </html>
  );
}
