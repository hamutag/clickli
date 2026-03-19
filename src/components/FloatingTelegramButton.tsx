"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "clickly_telegram_dismissed";

export default function FloatingTelegramButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Delay entrance for smoother UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500"
      style={{
        animation: "slideUp 0.5s ease-out forwards",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `,
        }}
      />

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap border border-gray-700 shadow-lg">
          &#x1F4F1; \u05D4\u05E6\u05D8\u05E8\u05E4\u05D5 \u05DC\u05E2\u05E8\u05D5\u05E5
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-gray-800 border-b border-r border-gray-700 rotate-45" />
          </div>
        </div>
      )}

      {/* Main button */}
      <a
        href="https://t.me/clickli26"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#0088cc] hover:bg-[#0099dd] rounded-full shadow-lg shadow-[#0088cc]/30 transition-all hover:scale-110"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="\u05D4\u05E6\u05D8\u05E8\u05E4\u05D5 \u05DC\u05E2\u05E8\u05D5\u05E5 \u05D4\u05D8\u05DC\u05D2\u05E8\u05DD"
      >
        {/* Telegram SVG icon */}
        <svg
          className="w-7 h-7 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </a>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full flex items-center justify-center text-xs transition-colors"
        aria-label="\u05E1\u05D2\u05D5\u05E8"
      >
        &times;
      </button>
    </div>
  );
}
