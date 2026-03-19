"use client";

import { useState } from "react";

interface QuickActionProps {
  title: string;
  description: string;
  action: string;
  buttonText: string;
  color: string;
}

export default function QuickActions() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <QuickAction
        title="איסוף דילים"
        description="הפעלת סריקה ידנית של כל הפלטפורמות"
        action="/api/cron/ingest"
        buttonText="סרוק עכשיו"
        color="blue"
      />
      <QuickAction
        title="פרסום אוטומטי"
        description="פרסום כל הדילים המאושרים לטלגרם ולאתר"
        action="/api/cron/publish"
        buttonText="פרסם עכשיו"
        color="green"
      />
      <QuickAction
        title="דוח יומי"
        description="יצירת דוח יומי עם תובנות ושליחה לטלגרם"
        action="/api/cron/report"
        buttonText="הפק דוח"
        color="purple"
      />
    </div>
  );
}

function QuickAction({ title, description, action, buttonText, color }: QuickActionProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300",
    green: "bg-green-600 hover:bg-green-700 disabled:bg-green-300",
    purple: "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300",
  };

  const handleClick = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(action, { method: "POST" });
      const data = await res.json();
      if (data.success || data.totalNew !== undefined) {
        setResult(`✅ הושלם בהצלחה`);
      } else if (data.error) {
        setResult(`❌ ${data.error}`);
      } else {
        setResult("✅ הושלם");
      }
    } catch {
      setResult("❌ שגיאה בהפעלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full text-white py-2 rounded-lg text-sm font-medium transition-colors ${colorClasses[color]}`}
      >
        {loading ? "⏳ מבצע..." : buttonText}
      </button>
      {result && (
        <p className="text-xs mt-2 text-center text-gray-600">{result}</p>
      )}
    </div>
  );
}
