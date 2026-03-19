"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface DealRequest {
  id: string;
  nickname: string;
  email: string | null;
  description: string;
  category: string | null;
  maxBudget: number | null;
  platform: string | null;
  status: string;
  adminNote: string | null;
  upvotes: number;
  ipHash: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: "OPEN", label: "פתוח" },
  { value: "IN_PROGRESS", label: "בטיפול" },
  { value: "FULFILLED", label: "מולא" },
  { value: "CLOSED", label: "נסגר" },
];

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-500/20 text-blue-400",
  IN_PROGRESS: "bg-amber-500/20 text-amber-400",
  FULFILLED: "bg-emerald-500/20 text-emerald-400",
  CLOSED: "bg-gray-500/20 text-gray-400",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<DealRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/requests");
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

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    } catch {
      console.error("Failed to update status");
    }
  }

  async function handleSaveNote(id: string) {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminNote: noteValue }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, adminNote: noteValue } : r))
        );
        setEditingNote(null);
        setNoteValue("");
      }
    } catch {
      console.error("Failed to save note");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">ניהול בקשות דילים</h1>
        <span className="text-sm text-gray-400">
          {requests.length} בקשות
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">טוען...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-500">אין בקשות</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {req.nickname}
                    </span>
                    {req.email && (
                      <span className="text-xs text-gray-500" dir="ltr">
                        ({req.email})
                      </span>
                    )}
                    <span className="text-xs text-gray-600">
                      {formatDate(req.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{req.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-gray-400">
                    &#9650; {req.upvotes}
                  </span>
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border-0 ${
                      STATUS_COLORS[req.status] || ""
                    } bg-gray-800 focus:outline-none cursor-pointer`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Metadata badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {req.category && (
                  <span className="text-[11px] bg-gray-800 text-gray-400 px-2 py-1 rounded">
                    {req.category}
                  </span>
                )}
                {req.maxBudget && (
                  <span className="text-[11px] bg-gray-800 text-gray-400 px-2 py-1 rounded">
                    &#8362;{req.maxBudget}
                  </span>
                )}
                {req.platform && (
                  <span className="text-[11px] bg-gray-800 text-gray-400 px-2 py-1 rounded">
                    {req.platform}
                  </span>
                )}
              </div>

              {/* Admin note */}
              <div className="border-t border-gray-800 pt-3 mt-3">
                {editingNote === req.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noteValue}
                      onChange={(e) => setNoteValue(e.target.value)}
                      placeholder="הערת אדמין..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveNote(req.id)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500"
                    >
                      שמור
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="text-gray-400 hover:text-white px-2 text-xs"
                    >
                      ביטול
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {req.adminNote || "ללא הערה"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingNote(req.id);
                          setNoteValue(req.adminNote || "");
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        ערוך הערה
                      </button>
                      {req.status === "FULFILLED" && (
                        <Link
                          href="/admin/deals/new"
                          className="text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          צור דיל
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
