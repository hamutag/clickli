import {
  ExternalLink,
  Key,
  Clock,
  Percent,
  CheckSquare,
  ArrowLeftRight,
  DollarSign,
  BarChart3,
  Webhook,
} from "lucide-react";

export default function AffiliateGuidePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">מדריך אפילייט</h1>
        <p className="text-gray-500 text-sm mt-1">
          איך להירשם לתוכניות השותפים ולהתחיל להרוויח עמלות
        </p>
      </div>

      {/* Affiliate Platform Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* AliExpress */}
        <PlatformCard
          name="AliExpress Affiliate"
          color="emerald"
          registrationUrl="https://portals.aliexpress.com"
          commission="3-8% לכל מכירה"
          cookieDuration="3 ימים"
          steps={[
            "היכנסו ל-portals.aliexpress.com",
            "לחצו על \"Join Now\" או \"הרשמה\"",
            "מלאו פרטים אישיים ופרטי האתר/ערוץ שלכם",
            "בחרו את שיטת הקידום (אתר / רשתות חברתיות)",
            "המתינו לאישור (בדרך כלל תוך 1-3 ימי עסקים)",
            "לאחר האישור, היכנסו ללוח הבקרה וצרו App Key",
          ]}
          apiKeys={[
            { name: "App Key", description: "מזהה האפליקציה שלכם" },
            { name: "App Secret", description: "מפתח סודי לאימות API" },
            { name: "Tracking ID", description: "מזהה למעקב אחר קליקים ומכירות" },
          ]}
        />

        {/* Temu */}
        <PlatformCard
          name="Temu Affiliate"
          color="orange"
          registrationUrl="https://affiliate.temu.com"
          commission="10-20% לכל מכירה (הכי גבוה!)"
          cookieDuration="30 ימים"
          steps={[
            "היכנסו ל-affiliate.temu.com",
            "לחצו על \"Apply Now\"",
            "מלאו את פרטי האתר/ערוץ הטלגרם שלכם",
            "ציינו את כמות התנועה והקהל שלכם",
            "המתינו לאישור (בדרך כלל תוך 24-48 שעות)",
            "לאחר האישור, קבלו את מפתחות ה-API מההגדרות",
          ]}
          apiKeys={[
            { name: "API Key", description: "מפתח הגישה ל-API" },
            { name: "Affiliate ID", description: "מזהה השותף הייחודי שלכם" },
          ]}
        />

        {/* iHerb */}
        <PlatformCard
          name="iHerb Partners"
          color="green"
          registrationUrl="https://iherb.com/info/partners"
          commission="5-10% לכל מכירה"
          cookieDuration="7 ימים"
          steps={[
            "היכנסו ל-iherb.com/info/partners",
            "לחצו על \"הצטרפו עכשיו\" או \"Join Now\"",
            "מלאו פרטים אישיים ופרטי קידום",
            "בחרו את סוג השותפות (בלוגר / אתר / רשת חברתית)",
            "המתינו לאישור (בדרך כלל מיידי או עד 48 שעות)",
            "לאחר האישור, מצאו את קוד השותף ומפתח ה-API בהגדרות החשבון",
          ]}
          apiKeys={[
            { name: "Affiliate Code", description: "קוד השותף האישי (מופיע בקישורים)" },
            { name: "API Key", description: "מפתח לגישה ל-API למשיכת מוצרים" },
          ]}
        />
      </div>

      {/* How Tracking Works */}
      <div className="mt-8 bg-gray-900 border border-gray-700 rounded-xl p-6 text-white">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
          איך המעקב עובד?
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <TrackingStep
            step={1}
            icon={<ExternalLink className="w-5 h-5" />}
            title="קליק על הקישור"
            description="המשתמש לוחץ על קישור האפילייט שלכם. הקישור מכיל SubID ייחודי שמזהה את המקור"
          />
          <TrackingStep
            step={2}
            icon={<DollarSign className="w-5 h-5" />}
            title="רכישה באתר"
            description="המשתמש קונה מוצר באתר היעד. העוגייה (cookie) שומרת את הזיהוי שלכם לתקופה מוגדרת"
          />
          <TrackingStep
            step={3}
            icon={<Webhook className="w-5 h-5" />}
            title="Postback / Webhook"
            description="תוכנית השותפים שולחת התראה (conversion webhook) לשרת שלנו עם פרטי המכירה"
          />
          <TrackingStep
            step={4}
            icon={<BarChart3 className="w-5 h-5" />}
            title="עמלה בדשבורד"
            description="ההכנסה מופיעה אוטומטית בדשבורד הניהול. תוכלו לראות כמה הרווחתם בזמן אמת"
          />
        </div>
        <div className="mt-4 bg-gray-800 rounded-lg p-4 text-sm text-gray-300">
          <p className="font-medium text-emerald-400 mb-1">מה זה SubID?</p>
          <p>
            SubID הוא מזהה ייחודי שמצורף לכל קישור אפילייט. הוא מאפשר לנו לדעת
            מאיפה הגיע כל קליק ומכירה - האם מטלגרם, מהאתר, או ממקור אחר.
            כך אפשר לדעת איזה דילים וערוצים הכי רווחיים.
          </p>
        </div>
      </div>

      {/* API Keys Reminder */}
      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <h2 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
          <Key className="w-5 h-5" />
          היכן להזין את המפתחות?
        </h2>
        <p className="text-sm text-emerald-700 mb-2">
          לאחר שקיבלתם את מפתחות ה-API מכל פלטפורמה, היכנסו ל
          <a href="/admin/settings" className="font-bold underline mx-1">
            הגדרות
          </a>
          והזינו את המפתחות בשדות המתאימים. המערכת תבדוק אוטומטית שהמפתחות תקינים.
        </p>
      </div>

      {/* Getting Started Checklist */}
      <div className="mt-6 bg-white border rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-600" />
          רשימת מטלות להתחלה
        </h2>
        <div className="space-y-3">
          <ChecklistItem text="הירשמו לתוכנית השותפים של AliExpress" />
          <ChecklistItem text="הירשמו לתוכנית השותפים של Temu" />
          <ChecklistItem text="הירשמו לתוכנית השותפים של iHerb" />
          <ChecklistItem text="הזינו את מפתחות ה-API בהגדרות" />
          <ChecklistItem text="הוסיפו את הדיל הראשון שלכם" />
          <ChecklistItem text="פרסמו לטלגרם" />
          <ChecklistItem text="שתפו עם חברים" />
        </div>
      </div>
    </div>
  );
}

function PlatformCard({
  name,
  color,
  registrationUrl,
  commission,
  cookieDuration,
  steps,
  apiKeys,
}: {
  name: string;
  color: string;
  registrationUrl: string;
  commission: string;
  cookieDuration: string;
  steps: string[];
  apiKeys: Array<{ name: string; description: string }>;
}) {
  const colorMap: Record<string, { border: string; badge: string; icon: string }> = {
    emerald: {
      border: "border-emerald-200",
      badge: "bg-emerald-100 text-emerald-700",
      icon: "text-emerald-600",
    },
    orange: {
      border: "border-orange-200",
      badge: "bg-orange-100 text-orange-700",
      icon: "text-orange-600",
    },
    green: {
      border: "border-green-200",
      badge: "bg-green-100 text-green-700",
      icon: "text-green-600",
    },
  };

  const colors = colorMap[color] ?? colorMap.emerald;

  return (
    <div className={`bg-white rounded-xl border ${colors.border} overflow-hidden`}>
      {/* Header */}
      <div className="p-5 border-b">
        <h3 className="font-bold text-lg mb-2">{name}</h3>
        <a
          href={registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm ${colors.icon} hover:underline flex items-center gap-1`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {registrationUrl.replace("https://", "")}
        </a>
      </div>

      {/* Stats */}
      <div className="p-5 border-b grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">עמלה</p>
            <p className="font-bold text-sm">{commission}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">תוקף עוגייה</p>
            <p className="font-bold text-sm">{cookieDuration}</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-5 border-b">
        <h4 className="text-xs font-medium text-gray-400 mb-3">שלבי הרשמה:</h4>
        <ol className="space-y-2">
          {steps.map((step, i) => (
            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
              <span className={`${colors.badge} w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5`}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* API Keys */}
      <div className="p-5">
        <h4 className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-1">
          <Key className="w-3.5 h-3.5" />
          מפתחות API שתקבלו:
        </h4>
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div key={key.name} className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs font-mono font-bold text-gray-700">{key.name}</p>
              <p className="text-[11px] text-gray-500">{key.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackingStep({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
          {step}
        </span>
        <span className="text-emerald-400">{icon}</span>
      </div>
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-emerald-400 transition-colors flex-shrink-0" />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{text}</span>
    </label>
  );
}
