"use client";

import { useState, useEffect, useCallback } from "react";

interface DealRequest {
  id: string;
  nickname: string;
  description: string;
  category: string | null;
  maxBudget: number | null;
  platform: string | null;
  status: string;
  upvotes: number;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "פתוח", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  IN_PROGRESS: { label: "בטיפול", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  FULFILLED: { label: "נמצא!", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  CLOSED: { label: "נסגר", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

const CATEGORY_LABELS: Record<string, string> = {
  electronics: "אלקטרוניקה",
  fashion: "אופנה",
  home: "בית וגן",
  beauty: "יופי וטיפוח",
  sports: "ספורט",
  toys: "צעצועים וילדים",
  health: "בריאות ותוספי תזונה",
  tech: "גאדג'טים וטכנולוגיה",
  other: "אחר",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
  });
}

export default function DealRequestsList() {
  const [requests, setRequests] = useState<DealRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } catch {
      console.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleUpvote(id: string) {
    if (votingId) return;
    setVotingId(id);

    try {
      const res = await fetch(`/api/requests/${id}/upvote`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, upvotes: data.upvotes } : r
          )
        );
      }
    } catch {
      console.error("Failed to upvote");
    } finally {
      setVotingId(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">טוען בקשות...</div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
        <div className="text-4xl mb-3">&#128269;</div>
        <p className="text-gray-400">עדיין אין בקשות. היו הראשונים לבקש דיל!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.OPEN;

        return (
          <div
            key={req.id}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors"
          >
            <div className="flex gap-4">
              {/* Upvote button */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleUpvote(req.id)}
                  disabled={votingId === req.id}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800 border border-gray-700 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all text-gray-400 hover:text-emerald-400 disabled:opacity-50"
                  aria-label="גם אני רוצה"
                >
                  &#9650;
                </button>
                <span className="text-sm font-bold text-gray-300">
                  {req.upvotes}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm font-medium text-white">
                    {req.nickname}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(req.createdAt)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed mb-3">
                  {req.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {req.category && (
                    <span className="text-[11px] bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">
                      {CATEGORY_LABELS[req.category] || req.category}
                    </span>
                  )}
                  {req.maxBudget && (
                    <span className="text-[11px] bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">
                      עד &#8362;{req.maxBudget}
                    </span>
                  )}
                  {req.platform && (
                    <span className="text-[11px] bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">
                      {req.platform}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
