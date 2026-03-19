import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "צור קשר",
  description:
    "צרו קשר עם צוות קליקלי - שאלות, הצעות ופניות בנוגע לדילים ולאתר.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-center">
          צור קשר
        </h1>
        <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
          יש לכם שאלה, הצעה לדיל, או סתם רוצים להגיד שלום? נשמח לשמוע מכם.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
          {/* Email card */}
          <a
            href="mailto:dahanarnon@gmail.com"
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center hover:border-emerald-500/40 transition-all hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
              &#x2709;
            </div>
            <h2 className="text-lg font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">
              אימייל
            </h2>
            <p className="text-emerald-400 text-sm font-medium" dir="ltr">
              dahanarnon@gmail.com
            </p>
          </a>

          {/* Telegram card */}
          <a
            href="https://t.me/clickli26"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center hover:border-emerald-500/40 transition-all hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
              &#x1F4AC;
            </div>
            <h2 className="text-lg font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">
              טלגרם
            </h2>
            <p className="text-emerald-400 text-sm font-medium" dir="ltr">
              @clickli26
            </p>
          </a>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>זמני מענה: בדרך כלל תוך 24 שעות בימי עבודה.</p>
        </div>
      </div>
    </div>
  );
}
