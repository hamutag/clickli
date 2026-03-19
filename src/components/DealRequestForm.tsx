"use client";

import { useState } from "react";

interface DealRequestFormProps {
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: "", label: "בחרו קטגוריה (אופציונלי)" },
  { value: "electronics", label: "אלקטרוניקה" },
  { value: "fashion", label: "אופנה" },
  { value: "home", label: "בית וגן" },
  { value: "beauty", label: "יופי וטיפוח" },
  { value: "sports", label: "ספורט" },
  { value: "toys", label: "צעצועים וילדים" },
  { value: "health", label: "בריאות ותוספי תזונה" },
  { value: "tech", label: "גאדג'טים וטכנולוגיה" },
  { value: "other", label: "אחר" },
];

const PLATFORMS = [
  { value: "", label: "בחרו פלטפורמה (אופציונלי)" },
  { value: "AliExpress", label: "AliExpress" },
  { value: "Temu", label: "Temu" },
  { value: "iHerb", label: "iHerb" },
  { value: "Amazon", label: "Amazon" },
  { value: "any", label: "לא משנה" },
];

export default function DealRequestForm({ onSuccess }: DealRequestFormProps) {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [platform, setPlatform] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          email: email.trim() || undefined,
          description: description.trim(),
          category: category || undefined,
          maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
          platform: platform || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "שגיאה בשליחת הבקשה");
        return;
      }

      setSuccess(true);
      setNickname("");
      setEmail("");
      setDescription("");
      setCategory("");
      setMaxBudget("");
      setPlatform("");
      onSuccess?.();
    } catch {
      setError("שגיאה בשליחת הבקשה");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">&#10003;</div>
        <h3 className="text-lg font-bold text-emerald-400 mb-2">
          הבקשה נשלחה בהצלחה!
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          נחפש לכם את הדיל המושלם. תודה!
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm text-emerald-400 hover:text-emerald-300 underline transition-colors"
        >
          שלח בקשה נוספת
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">
            שם תצוגה *
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="הכינוי שלכם"
            maxLength={50}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">
            אימייל (אופציונלי)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="לקבלת עדכון כשנמצא"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
            dir="ltr"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1.5">
          מה אתם מחפשים? *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="תארו את המוצר או הדיל שאתם מחפשים..."
          maxLength={500}
          required
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">
            קטגוריה
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1.5">
            תקציב מקסימלי (&#8362;)
          </label>
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="למשל: 200"
            min="0"
            step="10"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1.5">
            פלטפורמה מועדפת
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-emerald-500 text-gray-950 py-3 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50"
      >
        {submitting ? "שולח..." : "שלח בקשה"}
      </button>
    </form>
  );
}
