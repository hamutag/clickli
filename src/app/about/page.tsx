import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "אודות קליקלי",
  description:
    "קליקלי - פלטפורמה שמוצאת לכם את הדילים הכי שווים מחנויות בינלאומיות לקונים ישראלים. AliExpress, Temu ו-iHerb במחירים הכי טובים.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-900/30 via-gray-950 to-gray-950" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            אודות{" "}
            <span className="bg-gradient-to-l from-emerald-400 to-green-300 bg-clip-text text-transparent">
              קליקלי
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            אנחנו מוצאים לכם את הדילים הכי שווים מחנויות בינלאומיות - כדי שתוכלו
            לקנות בביטחון, במחיר הכי טוב, עם משלוח לישראל.
          </p>
        </div>
      </section>

      {/* What is Clickly */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">
            מה זה קליקלי?
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            קליקלי היא פלטפורמה ישראלית שסורקת אלפי מוצרים כל יום מחנויות
            בינלאומיות מובילות כמו AliExpress, Temu ו-iHerb, ומוצאת את ההנחות
            האמיתיות והדילים הכי משתלמים עבור קונים ישראלים.
          </p>
          <p className="text-gray-300 leading-relaxed">
            אנחנו מציגים מחירים בשקלים, בודקים זמינות משלוח לישראל, ומדרגים כל
            דיל לפי מערכת ניקוד שקופה - כדי שתדעו בדיוק מה אתם מקבלים.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-900/50 border-t border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            איך זה עובד?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">
                1
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">
                סורקים מוצרים
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                המערכת שלנו סורקת אוטומטית אלפי מוצרים כל יום מ-AliExpress, Temu
                ו-iHerb ומזהה הנחות אמיתיות.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">
                2
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">
                בודקים ומדרגים
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                כל דיל עובר בדיקה ומקבל ציון על בסיס מחיר, דירוג מוכר, ביקורות
                קונים, זמינות משלוח לישראל ועוד.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">
                3
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">
                חוסכים לכם כסף
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                אתם מקבלים רק את הדילים הכי שווים, עם מחיר סופי בשקלים, קופונים
                בלעדיים ולינק ישיר לחנות.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why trust us */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          למה לסמוך עלינו?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-4">&#x2705;</div>
            <h3 className="font-bold mb-2 text-white">בדיקה של כל דיל</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              כל מוצר עובר בדיקת איכות. אנחנו לא מפרסמים דילים בלי לוודא שהם
              באמת שווים.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-4">&#x1F4CA;</div>
            <h3 className="font-bold mb-2 text-white">ניקוד שקוף</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              מערכת הניקוד שלנו שקופה לחלוטין. אתם יכולים לראות בדיוק למה דיל
              קיבל את הציון שלו.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-4">&#x1F6AB;</div>
            <h3 className="font-bold mb-2 text-white">בלי ספאם</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              לא שולחים דואר זבל, לא מבקשים פרטים אישיים. רק דילים טובים, ישר
              לעניין.
            </p>
          </div>
        </div>
      </section>

      {/* Our stores */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          החנויות שלנו
        </h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <span className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-3 text-sm font-semibold text-gray-300">
            AliExpress
          </span>
          <span className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-3 text-sm font-semibold text-gray-300">
            Temu
          </span>
          <span className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-3 text-sm font-semibold text-gray-300">
            iHerb
          </span>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-l from-emerald-600 to-emerald-500 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-emerald-500/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            רוצים לקבל דילים ישירות לנייד?
          </h2>
          <p className="text-emerald-100 mb-8 max-w-lg mx-auto">
            הצטרפו לערוץ הטלגרם שלנו וקבלו את הדילים הכי חמים כל יום.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://t.me/clickli26"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-emerald-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-colors"
            >
              ערוץ טלגרם
            </a>
            <Link
              href="/deals"
              className="inline-block border-2 border-white/30 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/10 transition-colors"
            >
              לכל הדילים
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
