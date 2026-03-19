import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תנאי שימוש",
  description:
    "תנאי השימוש של אתר קליקלי - כל מה שצריך לדעת על השימוש באתר ובקישורי השותפים שלנו.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
          תנאי שימוש
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          עדכון אחרון: מרץ 2026
        </p>

        <div className="space-y-10">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              הסכמה לתנאים
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                השימוש באתר קליקלי (clickly.co.il) מהווה הסכמה לתנאי השימוש
                המפורטים להלן. אם אינכם מסכימים לתנאים אלו, אנא הימנעו משימוש
                באתר.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              שימוש באתר
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                קליקלי מספקת שירות השוואת מחירים ואיסוף דילים מחנויות מקוונות
                בינלאומיות. השימוש באתר כולל:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>צפייה בדילים ומבצעים מחנויות שונות</li>
                <li>לחיצה על קישורים שמובילים לחנויות חיצוניות</li>
                <li>שימוש בקופונים ובקודי הנחה</li>
                <li>הצטרפות לערוץ הטלגרם לקבלת דילים</li>
              </ul>
              <p>
                השימוש באתר מיועד למטרות אישיות ולא מסחריות. אין לעשות שימוש
                אוטומטי באתר (סריקה, בוטים וכדומה) ללא אישור מראש.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              קישורי שותפים (Affiliate Links)
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                האתר מכיל קישורי שותפים לחנויות מקוונות. כשאתם לוחצים על קישור
                ורוכשים מוצר, קליקלי עשויה לקבל עמלה מהחנות.
              </p>
              <p>
                עמלה זו לא משפיעה על המחיר שאתם משלמים - המחיר זהה בין אם הגעתם
                דרך קליקלי או ישירות לחנות. העמלות עוזרות לנו להמשיך לתפעל את
                האתר ולמצוא עבורכם דילים חדשים.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              אחריות
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                חשוב להדגיש: קליקלי אינה מוכרת מוצרים ואינה חנות מקוונת. אנחנו
                מספקים קישורים לחנויות חיצוניות בלבד.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>
                  הרכישה מתבצעת ישירות מול החנות (AliExpress, Temu, iHerb
                  וכדומה)
                </li>
                <li>
                  כל נושא של החזרות, החלפות, אחריות ושירות לקוחות הוא מול החנות
                  עצמה
                </li>
                <li>
                  מחירים ומבצעים עשויים להשתנות - אנחנו משתדלים לעדכן אך לא
                  יכולים להבטיח דיוק בזמן אמת
                </li>
                <li>
                  קליקלי אינה אחראית לאיכות המוצרים, זמני המשלוח או כל עניין
                  הקשור לעסקה עצמה
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              שינויים בתנאים
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                קליקלי שומרת לעצמה את הזכות לעדכן ולשנות את תנאי השימוש מעת
                לעת. שינויים יפורסמו בדף זה עם תאריך העדכון. המשך השימוש באתר
                לאחר עדכון התנאים מהווה הסכמה לתנאים המעודכנים.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              יצירת קשר
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                לכל שאלה בנוגע לתנאי השימוש, ניתן לפנות אלינו:
              </p>
              <ul className="space-y-1 text-gray-400">
                <li>
                  אימייל:{" "}
                  <a
                    href="mailto:dahanarnon@gmail.com"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    dahanarnon@gmail.com
                  </a>
                </li>
                <li>
                  טלגרם:{" "}
                  <a
                    href="https://t.me/clickli26"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    @clickli26
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
