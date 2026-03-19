"use client";

import { useState, type FormEvent } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = "idle" | "loading" | "success" | "error";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!EMAIL_REGEX.test(email)) {
      setFormState("error");
      setErrorMessage("כתובת אימייל לא תקינה");
      return;
    }

    setFormState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormState("error");
        setErrorMessage(data.error || "שגיאה ברישום");
        return;
      }

      setFormState("success");
      setEmail("");
    } catch {
      setFormState("error");
      setErrorMessage("שגיאה בחיבור לשרת. נסו שוב.");
    }
  }

  if (formState === "success") {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">&#x1F389;</div>
        <h3 className="text-lg font-bold text-emerald-400 mb-1">
          נרשמתם בהצלחה!
        </h3>
        <p className="text-sm text-gray-400">
          תקבלו התראות על הדילים הכי שווים ישירות למייל.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (formState === "error") {
              setFormState("idle");
              setErrorMessage("");
            }
          }}
          placeholder="הזינו אימייל..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
          dir="ltr"
          required
          disabled={formState === "loading"}
        />
        <button
          type="submit"
          disabled={formState === "loading"}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-gray-950 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
        >
          {formState === "loading" ? "..." : "הרשמו לדילים"}
        </button>
      </div>
      {formState === "error" && errorMessage && (
        <p className="text-red-400 text-xs mt-2 text-center">{errorMessage}</p>
      )}
    </form>
  );
}
