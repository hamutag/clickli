"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  nickname: string;
  content: string;
  rating: number | null;
  isApproved: boolean;
  ipHash: string | null;
  createdAt: string;
  product: {
    id: string;
    titleHe: string | null;
    titleEn: string;
  };
}

type FilterStatus = "pending" | "approved" | "all";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setPendingCount(data.pendingCount);
      }
    } catch {
      console.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === comments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comments.map((c) => c.id)));
    }
  }

  async function handleAction(action: "approve" | "reject") {
    if (selectedIds.size === 0) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action,
        }),
      });

      if (res.ok) {
        setSelectedIds(new Set());
        await fetchComments();
      }
    } catch {
      console.error("Failed to moderate comments");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">ניהול תגובות</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-400 mt-1">
              {pendingCount} תגובות ממתינות לאישור
            </p>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { value: "pending", label: "ממתינות" },
          { value: "approved", label: "מאושרות" },
          { value: "all", label: "הכל" },
        ] as { value: FilterStatus; label: string }[]).map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setFilter(tab.value);
              setSelectedIds(new Set());
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-gray-800 rounded-xl px-4 py-3">
          <span className="text-sm text-gray-300">
            {selectedIds.size} תגובות נבחרו
          </span>
          <button
            onClick={() => handleAction("approve")}
            disabled={actionLoading}
            className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            אשר
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={actionLoading}
            className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            דחה
          </button>
        </div>
      )}

      {/* Comments table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">טוען...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-500">אין תגובות להצגה</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="p-3 text-right">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === comments.length && comments.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-3 text-right">מוצר</th>
                <th className="p-3 text-right">שם</th>
                <th className="p-3 text-right">תגובה</th>
                <th className="p-3 text-right">דירוג</th>
                <th className="p-3 text-right">תאריך</th>
                <th className="p-3 text-right">סטטוס</th>
                <th className="p-3 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr
                  key={comment.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(comment.id)}
                      onChange={() => toggleSelect(comment.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-3 text-gray-300 max-w-[150px] truncate">
                    {comment.product.titleHe || comment.product.titleEn}
                  </td>
                  <td className="p-3 text-white font-medium">
                    {comment.nickname}
                  </td>
                  <td className="p-3 text-gray-300 max-w-[250px] truncate">
                    {comment.content}
                  </td>
                  <td className="p-3 text-amber-400">
                    {comment.rating
                      ? "&#9733;".repeat(comment.rating)
                      : "-"}
                  </td>
                  <td className="p-3 text-gray-500 text-xs">
                    {formatDate(comment.createdAt)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        comment.isApproved
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {comment.isApproved ? "מאושר" : "ממתין"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {!comment.isApproved && (
                        <button
                          onClick={() => {
                            setSelectedIds(new Set([comment.id]));
                            handleAction("approve");
                          }}
                          className="text-emerald-400 hover:text-emerald-300 text-xs px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors"
                        >
                          אשר
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedIds(new Set([comment.id]));
                          handleAction("reject");
                        }}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                      >
                        {comment.isApproved ? "מחק" : "דחה"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
