import { TrendingUp, Target, Users, Megaphone, Search, Share2, Zap } from "lucide-react";

export default function GrowthPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">צמיחה ושיווק</h1>
        <p className="text-gray-500 text-sm mt-1">אסטרטגיית צמיחה וכלי שיווק</p>
      </div>

      {/* Growth Channels */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <GrowthCard
          icon={<Search className="w-6 h-6" />}
          title="SEO אורגני"
          status="פעיל"
          statusColor="green"
          description="כל דיל שמפורסם = עמוד SEO עם מילות מפתח בעברית"
          metrics={[
            { label: "עמודים מאונדקסים", value: "—" },
            { label: "חיפושים אורגניים", value: "—" },
          ]}
          tasks={[
            "כותרות עם מילות מפתח: 'קופון AliExpress', 'מבצע iHerb'",
            "Meta descriptions אופטימליים לכל דיל",
            "Schema markup למוצרים (Product, Offer)",
            "Sitemap אוטומטי",
          ]}
        />

        <GrowthCard
          icon={<Users className="w-6 h-6" />}
          title="טלגרם אורגני"
          status="פעיל"
          statusColor="green"
          description="ערוץ דילים עם תוכן איכותי שמושך מנויים חדשים"
          metrics={[
            { label: "מנויים", value: "—" },
            { label: "צמיחה שבועית", value: "—" },
          ]}
          tasks={[
            "פרסום 10-15 דילים ביום בשעות שיא",
            "שיתוף בקבוצות דילים ישראליות",
            "דילי פלאש ייחודיים לטלגרם בלבד",
            "סקרים ואינטראקציה עם המנויים",
          ]}
        />

        <GrowthCard
          icon={<Megaphone className="w-6 h-6" />}
          title="פייסבוק ואינסטגרם"
          status="תכנון"
          statusColor="yellow"
          description="פרסום ממומן ואורגני לקהל נשים 25-45"
          metrics={[
            { label: "תקציב יומי", value: "₪50-100" },
            { label: "CPA צפוי", value: "₪2-5" },
          ]}
          tasks={[
            "מודעות לקבוצות יעד: אמהות, טיפוח, בריאות",
            "Reels עם 'הדיל של היום'",
            "Lookalike audiences מקונים קיימים",
            "Retargeting למבקרים באתר",
          ]}
        />

        <GrowthCard
          icon={<Zap className="w-6 h-6" />}
          title="TikTok / Reels"
          status="תכנון"
          statusColor="yellow"
          description="תוכן וידאו קצר: unboxing, דיל של היום, השוואות מחירים"
          metrics={[
            { label: "סרטונים בשבוע", value: "3-5" },
            { label: "צפיות צפויות", value: "—" },
          ]}
          tasks={[
            "'הדיל של היום' ב-60 שניות",
            "Unboxing מוצרים פופולריים",
            "השוואת מחירים: ישראל vs אונליין",
            "טיפים לקנייה חכמה מחו\"ל",
          ]}
        />

        <GrowthCard
          icon={<Share2 className="w-6 h-6" />}
          title="שיתופי פעולה"
          status="עתידי"
          statusColor="gray"
          description="שיתופי פעולה עם ערוצי טלגרם, בלוגרים ואינפלואנסרים"
          metrics={[
            { label: "שותפים פוטנציאליים", value: "—" },
            { label: "ROI צפוי", value: "גבוה" },
          ]}
          tasks={[
            "זיהוי 10 ערוצי טלגרם משלימים",
            "החלפת פוסטים / קרוס-פרסום",
            "מיקרו-אינפלואנסריות בנישת טיפוח/בריאות",
            "שיתוף פעולה עם בלוגרי קניות",
          ]}
        />

        <GrowthCard
          icon={<Target className="w-6 h-6" />}
          title="אימייל מרקטינג"
          status="עתידי"
          statusColor="gray"
          description="ניוזלטר שבועי עם הדילים הכי שווים"
          metrics={[
            { label: "רשימת תפוצה", value: "—" },
            { label: "Open Rate צפוי", value: "25-35%" },
          ]}
          tasks={[
            "איסוף אימיילים מהאתר (popup + footer)",
            "ניוזלטר שבועי: Top 10 דילים",
            "התראות מחיר לפי קטגוריה",
            "Welcome sequence לנרשמים חדשים",
          ]}
        />
      </div>

      {/* Growth Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h2 className="font-bold text-blue-800 mb-3">
          <TrendingUp className="w-5 h-5 inline-block ml-1" />
          טיפים לצמיחה מהירה
        </h2>
        <ul className="space-y-2 text-sm text-blue-700">
          <li>• <strong>שעות שיא לפרסום בטלגרם:</strong> 8:00-9:00, 12:00-13:00, 20:00-22:00</li>
          <li>• <strong>קהל נשי = המרה גבוהה:</strong> דילי iHerb ו-Temu (טיפוח, בריאות, בית)</li>
          <li>• <strong>10 לחודש:</strong> להגביר פרסום - ישראלים מקבלים משכורת</li>
          <li>• <strong>חגים:</strong> פסח, ראש השנה, Black Friday = טראפיק x3</li>
          <li>• <strong>יום הרווקים (11.11):</strong> הכי גדול ב-AliExpress - להתכונן חודש מראש</li>
          <li>• <strong>אמון &gt; נפח:</strong> 10 דילים מעולים ביום עדיף על 50 בינוניים</li>
        </ul>
      </div>
    </div>
  );
}

function GrowthCard({
  icon,
  title,
  status,
  statusColor,
  description,
  metrics,
  tasks,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  statusColor: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
  tasks: string[];
}) {
  const statusColors: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-5 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-blue-600">{icon}</div>
            <h3 className="font-bold">{title}</h3>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[statusColor]}`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="p-5 border-b">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-xs text-gray-400">{m.label}</p>
              <p className="font-bold">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5">
        <h4 className="text-xs font-medium text-gray-400 mb-2">משימות:</h4>
        <ul className="space-y-1.5">
          {tasks.map((task, i) => (
            <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
              <span className="text-gray-300 mt-0.5">○</span>
              {task}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
