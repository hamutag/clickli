"use client";

import { useState, useEffect, useCallback } from "react";

interface DealReactionsProps {
  productId: string;
}

export default function DealReactions({ productId }: DealReactionsProps) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState<"LIKE" | "DISLIKE" | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/reactions/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setUserReaction(data.userReaction);
      }
    } catch {
      console.error("Failed to fetch reactions");
    }
  }, [productId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  async function handleReaction(type: "LIKE" | "DISLIKE") {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, type }),
      });

      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setUserReaction(data.userReaction);
      }
    } catch {
      console.error("Failed to toggle reaction");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleReaction("LIKE")}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          userReaction === "LIKE"
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-emerald-500/30 hover:text-emerald-400"
        } disabled:opacity-50`}
        aria-label="אהבתי"
      >
        <span>&#128077;</span>
        {likes > 0 && <span>{likes}</span>}
      </button>
      <button
        onClick={() => handleReaction("DISLIKE")}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          userReaction === "DISLIKE"
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-red-500/30 hover:text-red-400"
        } disabled:opacity-50`}
        aria-label="לא אהבתי"
      >
        <span>&#128078;</span>
        {dislikes > 0 && <span>{dislikes}</span>}
      </button>
    </div>
  );
}
