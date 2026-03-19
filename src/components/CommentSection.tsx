"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  nickname: string;
  content: string;
  rating: number | null;
  createdAt: string;
}

interface CommentSectionProps {
  productId: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "text-xl",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: string;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${size} transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${
            star <= (hover || value)
              ? "text-amber-400"
              : "text-gray-600"
          }`}
          onClick={() => onChange?.(star === value ? 0 : star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          aria-label={`${star} כוכבים`}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CommentSection({ productId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch {
      console.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          nickname: nickname.trim(),
          content: content.trim(),
          rating: rating > 0 ? rating : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "שגיאה בשליחת התגובה");
        return;
      }

      setSuccess(true);
      setNickname("");
      setContent("");
      setRating(0);
      setShowForm(false);
    } catch {
      setError("שגיאה בשליחת התגובה");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          תגובות {comments.length > 0 && `(${comments.length})`}
        </h2>
        {!showForm && !success && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-colors font-medium"
          >
            הוסף תגובה
          </button>
        )}
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-center">
          <p className="text-emerald-400 font-medium">
            התגובה נשלחה ותפורסם לאחר אישור
          </p>
        </div>
      )}

      {/* Comment form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 mb-6 space-y-4"
        >
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
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">
              דירוג (אופציונלי)
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">
              תגובה *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="מה דעתכם על המוצר?"
              maxLength={1000}
              required
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-500 text-gray-950 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {submitting ? "שולח..." : "שלח תגובה"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              ביטול
            </button>
          </div>
        </form>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">טוען תגובות...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 bg-gray-900/50 rounded-2xl border border-gray-800">
          <p className="text-gray-500 text-sm">עדיין אין תגובות. היו הראשונים!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 text-sm font-bold">
                    {comment.nickname.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {comment.nickname}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              {comment.rating && (
                <div className="mb-2">
                  <StarRating value={comment.rating} readonly size="text-sm" />
                </div>
              )}
              <p className="text-sm text-gray-300 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
