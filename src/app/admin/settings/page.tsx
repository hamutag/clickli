"use client";

import { useState } from "react";
import { Save, TestTube, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const handleTestConnection = async (platform: string) => {
    setTesting(platform);
    try {
      const res = await fetch(`/api/admin/test-connection/${platform}`, {
        method: "POST",
      });
      const data = await res.json();
      alert(data.success ? `${platform}: חיבור תקין!` : `${platform}: ${data.error}`);
    } catch {
      alert(`שגיאה בבדיקת חיבור ל-${platform}`);
    } finally {
      setTesting(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">הגדרות</h1>
        <p className="text-gray-500 text-sm mt-1">הגדרות מערכת, חיבורי API ותצורה</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <SettingsSection title="הגדרות כלליות">
          <SettingField
            label="שם האתר"
            name="siteName"
            defaultValue="קליקלי"
            type="text"
          />
          <SettingField
            label="כתובת האתר"
            name="siteUrl"
            defaultValue="https://your-domain.co.il"
            type="url"
          />
          <SettingField
            label="שער דולר-שקל (ידני)"
            name="exchangeRate"
            defaultValue="3.65"
            type="number"
          />
          <SettingField
            label="רף מע״מ ($)"
            name="vatThreshold"
            defaultValue="75"
            type="number"
          />
          <SettingField
            label="אחוז מע״מ"
            name="vatRate"
            defaultValue="17"
            type="number"
          />
        </SettingsSection>

        {/* Scoring Settings */}
        <SettingsSection title="הגדרות ציון דילים">
          <SettingField
            label="ציון מינימלי לפרסום"
            name="minPublishScore"
            defaultValue="60"
            type="number"
          />
          <SettingField
            label="ציון לדיל 'פצצה'"
            name="fireScore"
            defaultValue="80"
            type="number"
          />
          <SettingField
            label="מקסימום פוסטים ביום (טלגרם)"
            name="maxDailyPosts"
            defaultValue="15"
            type="number"
          />
        </SettingsSection>

        {/* Platform Connections */}
        <SettingsSection title="חיבורי פלטפורמות">
          <div className="space-y-4">
            {[
              { key: "aliexpress", label: "AliExpress", fields: ["APP_KEY", "APP_SECRET", "TRACKING_ID"] },
              { key: "temu", label: "Temu", fields: ["API_KEY", "AFFILIATE_ID"] },
              { key: "iherb", label: "iHerb", fields: ["AFFILIATE_CODE", "API_KEY"] },
            ].map((platform) => (
              <div key={platform.key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{platform.label}</h4>
                  <button
                    onClick={() => handleTestConnection(platform.key)}
                    disabled={testing === platform.key}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    {testing === platform.key ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <TestTube className="w-3 h-3" />
                    )}
                    בדוק חיבור
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {platform.fields.map((field) => (
                    <div key={field}>
                      <label className="text-xs text-gray-500 block mb-1">
                        {field}
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>

        {/* Telegram Settings */}
        <SettingsSection title="הגדרות טלגרם">
          <SettingField
            label="Bot Token"
            name="telegramBotToken"
            defaultValue=""
            type="password"
          />
          <SettingField
            label="Channel ID"
            name="telegramChannelId"
            defaultValue="@your_channel"
            type="text"
          />
        </SettingsSection>

        {/* AI Settings */}
        <SettingsSection title="הגדרות AI">
          <SettingField
            label="Gemini API Key"
            name="geminiApiKey"
            defaultValue=""
            type="password"
          />
          <SettingField
            label="מודל לכתיבת תוכן"
            name="aiModel"
            defaultValue="gemini-2.0-flash"
            type="text"
          />
        </SettingsSection>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={async () => {
              setSaving(true);
              setTimeout(() => setSaving(false), 1000);
            }}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "שומר..." : "שמור הגדרות"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-bold text-lg mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingField({
  label,
  name,
  defaultValue,
  type,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type: string;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-3 items-center">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="md:col-span-2 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>
  );
}
