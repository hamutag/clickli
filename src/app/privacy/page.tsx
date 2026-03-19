import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description:
    "מדיניות הפרטיות של קליקלי - איך אנחנו מגנים על הפרטיות שלכם ומהו המידע שאנחנו אוספים.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
          מדיניות פרטיות
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          עדכון אחרון: מרץ 2026
        </p>

        <div className="space-y-10">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              מידע שאנחנו אוספים
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                קליקלי אוספת מידע אנונימי בלבד לצורך שיפור השירות. המידע כולל:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>נתוני צפייה בדפים (Page Views) - אילו דפים ודילים נצפים</li>
                <li>נתוני קליקים על קישורים (Clicks) - אילו דילים מעניינים אתכם</li>
                <li>מידע טכני כללי - סוג דפדפן, מכשיר, שפה</li>
              </ul>
              <p className="font-semibold text-white">
                אנחנו לא אוספים מידע אישי מזהה כמו שם, כתובת אימייל, מספר טלפון
                או כל פרט מזהה אחר.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              שימוש בקוקיז (Cookies)
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                האתר משתמש בקוקיז לצורכי אנליטיקס בלבד. הקוקיז עוזרים לנו להבין
                כיצד גולשים משתמשים באתר ואילו דילים הכי מעניינים.
              </p>
              <p>
                אנחנו לא משתמשים בקוקיז לצורכי פרסום ממוקד ולא משתפים נתוני קוקיז
                עם צדדים שלישיים.
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
                קליקלי משתמשת בקישורי שותפים (Affiliate Links). כשאתם לוחצים על
                קישור לדיל ורוכשים מוצר, אנחנו עשויים לקבל עמלה קטנה מהחנות.
              </p>
              <p className="font-semibold text-white">
                חשוב לדעת: השימוש בקישורי שותפים לא עולה לכם שקל נוסף. המחיר שאתם
                משלמים זהה לחלוטין בין אם הגעתם דרכנו או ישירות.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              שמירת מידע
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                אנחנו לא שומרים מידע אישי של משתמשים. נתוני האנליטיקס נשמרים
                באופן אנונימי ומצטבר בלבד, ומשמשים אך ורק לשיפור חווית השימוש
                באתר ובחירת הדילים שאנחנו מציגים.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              זכויות המשתמש
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                מכיוון שאנחנו לא אוספים מידע אישי, אין צורך בבקשות מחיקה או עדכון
                מידע. אם יש לכם שאלות כלשהן לגבי הפרטיות שלכם, אתם מוזמנים
                ליצור איתנו קשר.
              </p>
              <p>
                תוכלו למחוק קוקיז בכל עת דרך הגדרות הדפדפן שלכם.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-emerald-400 mb-3">
              יצירת קשר
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>
                לכל שאלה או בקשה בנוגע למדיניות הפרטיות, ניתן לפנות אלינו:
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
