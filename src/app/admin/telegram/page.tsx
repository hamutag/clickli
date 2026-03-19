"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Users, Clock, RefreshCw, Trash2 } from "lucide-react";

interface TelegramStats {
  subscribers: number;
  todayPosts: number;
  maxDailyPosts: number;
  recentPosts: Array<{
    id: string;
    productTitle: string;
    telegramMessageId: string | null;
    publishedAt: string;
    clicks: number;
  }>;
}

export default function TelegramPage() {
  const [stats, setStats] = useState<TelegramStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [sendingCustom, setSendingCustom] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/telegram/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch telegram stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handlePublishAll = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/cron/publish", { method: "POST" });
      const data = await res.json();
      alert(`פורסמו ${data.published} דילים לטלגרם`);
      await fetchStats();
    } catch (error) {
      console.error("Publish failed:", error);
    } finally {
      setPublishing(false);
    }
  };

  const handleSendCustom = async () => {
    if (!customMessage.trim()) return;
    setSendingCustom(true);
    try {
      await fetch("/api/admin/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: customMessage }),
      });
      setCustomMessage("");
      alert("ההודעה נשלחה!");
      await fetchStats();
    } catch (error) {
      console.error("Send failed:", error);
    } finally {
      setSendingCustom(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ניהול טלגרם</h1>
          <p className="text-gray-500 text-sm mt-1">שליחת דילים ומעקב אחרי הערוץ</p>
        </div>
        <button
          onClick={handlePublishAll}
          disabled={publishing}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {publishing ? "מפרסם..." : "פרסם דילים מאושרים"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            מנויים
          </div>
          <p className="text-2xl font-bold">
            {stats?.subscribers?.toLocaleString("he-IL") || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Send className="w-4 h-4" />
            פוסטים היום
          </div>
          <p className="text-2xl font-bold">
            {stats?.todayPosts || 0}
            <span className="text-sm text-gray-400 font-normal"> / {stats?.maxDailyPosts || 15}</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            נותרו היום
          </div>
          <p className="text-2xl font-bold">
            {(stats?.maxDailyPosts || 15) - (stats?.todayPosts || 0)}
          </p>
        </div>
      </div>

      {/* Custom Message */}
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h2 className="font-bold mb-3">שליחת הודעה מותאמת</h2>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="כתוב הודעה לערוץ... (תומך ב-HTML)"
          className="w-full border rounded-lg p-3 text-sm min-h-[100px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          dir="rtl"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSendCustom}
            disabled={sendingCustom || !customMessage.trim()}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sendingCustom ? "שולח..." : "שלח הודעה"}
          </button>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-bold mb-4">פוסטים אחרונים</h2>
        <div className="space-y-3">
          {stats?.recentPosts?.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{post.productTitle}</p>
                <p className="text-xs text-gray-400">
                  {new Date(post.publishedAt).toLocaleString("he-IL")} •{" "}
                  {post.clicks} קליקים
                </p>
              </div>
              <div className="flex items-center gap-2">
                {post.telegramMessageId && (
                  <span className="text-xs text-gray-400">
                    #{post.telegramMessageId}
                  </span>
                )}
              </div>
            </div>
          )) || (
            <p className="text-gray-400 text-center py-4">אין פוסטים עדיין</p>
          )}
        </div>
      </div>
    </div>
  );
}
