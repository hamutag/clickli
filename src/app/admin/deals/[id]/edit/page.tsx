"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Save,
  Send,
  Trash2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
  Tag,
  X,
} from "lucide-react";
import { getDealTier } from "@/lib/scoring";

interface DealCategory {
  id: string;
  nameHe: string;
  nameEn: string;
  demandScore: number;
}

interface DealStore {
  id: string;
  name: string;
  platform: string;
  trustScore: number;
}

interface DealPost {
  id: string;
  channel: string;
  variant: string;
  titleHe: string;
  isPublished: boolean;
  publishedAt: string | null;
  telegramMessageId: string | null;
}

interface DealData {
  id: string;
  externalId: string;
  titleEn: string;
  titleHe: string | null;
  descriptionEn: string | null;
  descriptionHe: string | null;
  imageUrl: string | null;
  productUrl: string;
  affiliateUrl: string | null;
  priceOriginal: number;
  priceCurrent: number;
  priceILS: number | null;
  shippingFree: boolean;
  couponCode: string | null;
  couponValue: number | null;
  couponType: string | null;
  rating: number | null;
  reviewCount: number;
  score: number;
  status: string;
  isPublished: boolean;
  publishedAt: string | null;
  tags: string | null;
  categoryId: string | null;
  store: DealStore;
  category: DealCategory | null;
  posts: DealPost[];
  _count: { clicks: number; conversions: number };
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  descriptionEn: string;
  imageUrl: string;
  priceOriginal: string;
  priceCurrent: string;
  couponCode: string;
  couponValue: string;
  couponType: string;
  categoryId: string;
  affiliateUrl: string;
  tags: string;
}

interface Category {
  id: string;
  nameHe: string;
}

export default function EditDealPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<DealData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<FormData>({
    titleHe: "",
    titleEn: "",
    descriptionHe: "",
    descriptionEn: "",
    imageUrl: "",
    priceOriginal: "",
    priceCurrent: "",
    couponCode: "",
    couponValue: "",
    couponType: "",
    categoryId: "",
    affiliateUrl: "",
    tags: "",
  });

  const fetchDeal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/deals/${dealId}`);
      if (!res.ok) {
        throw new Error("דיל לא נמצא");
      }
      const data = await res.json();
      const d: DealData = data.deal;
      setDeal(d);

      // Parse tags from JSON string
      let tagsStr = "";
      if (d.tags) {
        try {
          const parsed = JSON.parse(d.tags);
          tagsStr = Array.isArray(parsed) ? parsed.join(", ") : d.tags;
        } catch {
          tagsStr = d.tags;
        }
      }

      setForm({
        titleHe: d.titleHe ?? "",
        titleEn: d.titleEn,
        descriptionHe: d.descriptionHe ?? "",
        descriptionEn: d.descriptionEn ?? "",
        imageUrl: d.imageUrl ?? "",
        priceOriginal: d.priceOriginal.toString(),
        priceCurrent: d.priceCurrent.toString(),
        couponCode: d.couponCode ?? "",
        couponValue: d.couponValue?.toString() ?? "",
        couponType: d.couponType ?? "",
        categoryId: d.categoryId ?? "",
        affiliateUrl: d.affiliateUrl ?? "",
        tags: tagsStr,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת הדיל");
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      // Categories are optional - fail silently
    }
  }, []);

  useEffect(() => {
    fetchDeal();
    fetchCategories();
  }, [fetchDeal, fetchCategories]);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // Build tags as JSON array
      let tagsJson: string | null = null;
      if (form.tags.trim()) {
        const tagsArray = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
        tagsJson = JSON.stringify(tagsArray);
      }

      const payload = {
        titleHe: form.titleHe || null,
        titleEn: form.titleEn,
        descriptionHe: form.descriptionHe || null,
        descriptionEn: form.descriptionEn || null,
        imageUrl: form.imageUrl || null,
        priceOriginal: parseFloat(form.priceOriginal) || 0,
        priceCurrent: parseFloat(form.priceCurrent) || 0,
        couponCode: form.couponCode || null,
        couponValue: form.couponValue ? parseFloat(form.couponValue) : null,
        couponType: form.couponType || null,
        categoryId: form.categoryId || null,
        affiliateUrl: form.affiliateUrl || null,
        tags: tagsJson,
      };

      const res = await fetch(`/api/admin/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה בשמירה");
      }

      const data = await res.json();
      setDeal((prev) => (prev ? { ...prev, ...data.deal, score: data.score?.total ?? data.deal.score } : prev));
      setSuccessMessage("הדיל נשמר בהצלחה");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      // Save first
      await handleSave();

      // Then publish
      const res = await fetch(`/api/admin/deals/${dealId}/publish`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה בפרסום");
      }

      setSuccessMessage("הדיל פורסם בהצלחה!");
      await fetchDeal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בפרסום");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/deals/${dealId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה במחיקה");
      }

      router.push("/admin/deals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה במחיקה");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleRegenerate = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/deals/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: form.titleEn,
          priceCurrent: parseFloat(form.priceCurrent) || 0,
          priceOriginal: parseFloat(form.priceOriginal) || 0,
          couponCode: form.couponCode || null,
          couponValue: form.couponValue ? parseFloat(form.couponValue) : null,
          categoryNameHe: deal?.category?.nameHe ?? "כללי",
          storeName: deal?.store.name ?? "",
        }),
      });

      if (!res.ok) {
        throw new Error("שגיאה ביצירת תוכן AI");
      }

      const data = await res.json();
      if (data.titleHe) {
        updateField("titleHe", data.titleHe);
      }
      if (data.descriptionHe) {
        updateField("descriptionHe", data.descriptionHe);
      }
      setSuccessMessage("תוכן חדש נוצר בהצלחה");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת תוכן");
    } finally {
      setAiLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-emerald-500 mb-3" />
          <p className="text-gray-400 text-lg">טוען דיל...</p>
        </div>
      </div>
    );
  }

  // Error state (no deal)
  if (error && !deal) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <Link
            href="/admin/deals"
            className="text-emerald-400 hover:text-emerald-300 underline"
          >
            חזרה לרשימת הדילים
          </Link>
        </div>
      </div>
    );
  }

  if (!deal) return null;

  const tier = getDealTier(deal.score);
  const savingsPercent =
    deal.priceOriginal > 0
      ? Math.round(
          ((deal.priceOriginal - deal.priceCurrent) / deal.priceOriginal) * 100
        )
      : 0;

  return (
    <div className="max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/deals"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">עריכת דיל</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {deal.store.name} / {deal.titleEn.slice(0, 50)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600/30 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${aiLoading ? "animate-pulse" : ""}`} />
            {aiLoading ? "יוצר..." : "חדש מחדש עם AI"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "שומר..." : "שמור"}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing || deal.status === "PUBLISHED"}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {publishing ? "מפרסם..." : "פרסם"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            מחק
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Titles */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">כותרות</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  כותרת בעברית
                </label>
                <input
                  type="text"
                  value={form.titleHe}
                  onChange={(e) => updateField("titleHe", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="כותרת בעברית..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  כותרת באנגלית
                </label>
                <input
                  type="text"
                  value={form.titleEn}
                  onChange={(e) => updateField("titleEn", e.target.value)}
                  dir="ltr"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="English title..."
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">תיאורים</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  תיאור בעברית
                </label>
                <textarea
                  value={form.descriptionHe}
                  onChange={(e) => updateField("descriptionHe", e.target.value)}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  placeholder="תיאור המוצר בעברית..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  תיאור באנגלית
                </label>
                <textarea
                  value={form.descriptionEn}
                  onChange={(e) => updateField("descriptionEn", e.target.value)}
                  rows={3}
                  dir="ltr"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  placeholder="English description..."
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">מחירים</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  מחיר מקורי ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.priceOriginal}
                  onChange={(e) => updateField("priceOriginal", e.target.value)}
                  dir="ltr"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  מחיר נוכחי ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.priceCurrent}
                  onChange={(e) => updateField("priceCurrent", e.target.value)}
                  dir="ltr"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">קופון</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  קוד קופון
                </label>
                <input
                  type="text"
                  value={form.couponCode}
                  onChange={(e) => updateField("couponCode", e.target.value)}
                  dir="ltr"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="SAVE20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  ערך קופון
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.couponValue}
                  onChange={(e) => updateField("couponValue", e.target.value)}
                  dir="ltr"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  סוג קופון
                </label>
                <select
                  value={form.couponType}
                  onChange={(e) => updateField("couponType", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none"
                >
                  <option value="">ללא</option>
                  <option value="PERCENT">אחוז (%)</option>
                  <option value="FIXED">סכום קבוע ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image & Links */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">תמונה וקישורים</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  <ImageIcon className="w-4 h-4 inline ml-1" />
                  כתובת תמונה
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                  dir="ltr"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  <ExternalLink className="w-4 h-4 inline ml-1" />
                  קישור אפילייט
                </label>
                <input
                  type="url"
                  value={form.affiliateUrl}
                  onChange={(e) => updateField("affiliateUrl", e.target.value)}
                  dir="ltr"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">קטגוריה ותגיות</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  קטגוריה
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none"
                >
                  <option value="">ללא קטגוריה</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameHe}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  <Tag className="w-4 h-4 inline ml-1" />
                  תגיות (מופרדות בפסיק)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => updateField("tags", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="אלקטרוניקה, גאדג'טים, מבצע..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">ציון הדיל</h2>
            <div className="text-center">
              <div className="text-5xl mb-2">{tier.emoji}</div>
              <div
                className={`text-4xl font-bold mb-1 ${
                  deal.score >= 80
                    ? "text-emerald-400"
                    : deal.score >= 60
                    ? "text-blue-400"
                    : "text-gray-400"
                }`}
              >
                {deal.score}
              </div>
              <div className="text-gray-400 text-sm">{tier.label}</div>
            </div>
          </div>

          {/* Status & Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">סטטוס ונתונים</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">סטטוס</span>
                <StatusBadge status={deal.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">קליקים</span>
                <span className="text-white font-medium">{deal._count.clicks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">המרות</span>
                <span className="text-white font-medium">{deal._count.conversions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">חנות</span>
                <span className="text-white font-medium text-sm">{deal.store.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">פלטפורמה</span>
                <span className="text-white font-medium text-sm">{deal.store.platform}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">תאריך יצירה</span>
                <span className="text-white font-medium text-sm" dir="ltr">
                  {new Date(deal.createdAt).toLocaleDateString("he-IL")}
                </span>
              </div>
              {deal.publishedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">תאריך פרסום</span>
                  <span className="text-white font-medium text-sm" dir="ltr">
                    {new Date(deal.publishedAt).toLocaleDateString("he-IL")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Posts */}
          {deal.posts.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">פוסטים</h2>
              <div className="space-y-2">
                {deal.posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                  >
                    <div>
                      <span className="text-xs font-medium text-gray-400">
                        {post.channel === "WEB" ? "אתר" : "טלגרם"}
                      </span>
                      <p className="text-white text-sm truncate max-w-[160px]">
                        {post.titleHe}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        post.isPublished
                          ? "bg-emerald-900/50 text-emerald-400"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {post.isPublished ? "פורסם" : "טיוטה"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">תצוגה מקדימה</h2>
            <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="תמונת מוצר"
                  className="w-full h-40 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <h3 className="text-white font-bold text-sm mb-1">
                {form.titleHe || form.titleEn || "ללא כותרת"}
              </h3>
              {form.descriptionHe && (
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                  {form.descriptionHe}
                </p>
              )}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-400 font-bold text-lg">
                  ${parseFloat(form.priceCurrent) ? parseFloat(form.priceCurrent).toFixed(2) : "0.00"}
                </span>
                {parseFloat(form.priceOriginal) > parseFloat(form.priceCurrent) && (
                  <>
                    <span className="text-gray-500 line-through text-sm">
                      ${parseFloat(form.priceOriginal).toFixed(2)}
                    </span>
                    <span className="text-red-400 text-xs font-medium">
                      -{savingsPercent}%
                    </span>
                  </>
                )}
              </div>
              {form.couponCode && (
                <div className="inline-block bg-orange-900/30 text-orange-400 text-xs px-2 py-1 rounded mt-1">
                  קופון: {form.couponCode}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-bold mb-2">מחיקת דיל</h3>
            <p className="text-gray-400 mb-6">
              האם למחוק את הדיל &quot;{deal.titleHe || deal.titleEn}&quot;? פעולה זו תסמן
              את הדיל כנדחה.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "מוחק..." : "מחק"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: "ממתין", className: "bg-yellow-900/50 text-yellow-400" },
    APPROVED: { label: "מאושר", className: "bg-blue-900/50 text-blue-400" },
    PUBLISHED: { label: "פורסם", className: "bg-emerald-900/50 text-emerald-400" },
    REJECTED: { label: "נדחה", className: "bg-red-900/50 text-red-400" },
    EXPIRED: { label: "פג תוקף", className: "bg-gray-700 text-gray-400" },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
