"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface CategoryOption {
  id: string;
  nameHe: string;
  nameEn: string;
}

type CouponType = "PERCENT" | "FIXED";

interface DealFormData {
  platform: string;
  categoryId: string;
  productUrl: string;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  imageUrl: string;
  priceOriginal: string;
  priceCurrent: string;
  couponCode: string;
  couponValue: string;
  couponType: CouponType;
  rating: string;
  reviewCount: string;
  shippingFree: boolean;
  affiliateUrl: string;
}

const INITIAL_FORM: DealFormData = {
  platform: "ALIEXPRESS",
  categoryId: "",
  productUrl: "",
  titleHe: "",
  titleEn: "",
  descriptionHe: "",
  imageUrl: "",
  priceOriginal: "",
  priceCurrent: "",
  couponCode: "",
  couponValue: "",
  couponType: "PERCENT",
  rating: "",
  reviewCount: "",
  shippingFree: false,
  affiliateUrl: "",
};

const PLATFORMS = [
  { value: "ALIEXPRESS", label: "AliExpress" },
  { value: "TEMU", label: "Temu" },
  { value: "IHERB", label: "iHerb" },
];

export default function NewDealPage() {
  const router = useRouter();
  const [form, setForm] = useState<DealFormData>(INITIAL_FORM);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const discountPercent =
    Number(form.priceOriginal) > 0 && Number(form.priceCurrent) > 0
      ? Math.round(
          ((Number(form.priceOriginal) - Number(form.priceCurrent)) /
            Number(form.priceOriginal)) *
            100
        )
      : 0;

  const handleAiDescribe = async () => {
    if (!form.titleHe && !form.titleEn) {
      setError("נא להזין כותרת לפני יצירת תיאור AI");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ai-describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.titleHe || form.titleEn,
          platform: form.platform,
        }),
      });
      if (!res.ok) {
        throw new Error("AI generation failed");
      }
      const data = await res.json();
      setForm((prev) => ({ ...prev, descriptionHe: data.description }));
    } catch {
      setError("שגיאה ביצירת תיאור AI. נסה שוב.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.titleHe) {
      setError("כותרת בעברית היא שדה חובה");
      return;
    }
    if (!form.priceCurrent || !form.priceOriginal) {
      setError("נא להזין מחיר מקורי ומחיר נוכחי");
      return;
    }
    if (!form.productUrl) {
      setError("נא להזין קישור למוצר");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        platform: form.platform,
        categoryId: form.categoryId || null,
        productUrl: form.productUrl,
        titleHe: form.titleHe,
        titleEn: form.titleEn || form.titleHe,
        descriptionHe: form.descriptionHe || null,
        imageUrl: form.imageUrl || null,
        priceOriginal: Number(form.priceOriginal),
        priceCurrent: Number(form.priceCurrent),
        couponCode: form.couponCode || null,
        couponValue: form.couponValue ? Number(form.couponValue) : null,
        couponType: form.couponValue ? form.couponType : null,
        rating: form.rating ? Number(form.rating) : null,
        reviewCount: form.reviewCount ? Number(form.reviewCount) : 0,
        shippingFree: form.shippingFree,
        affiliateUrl: form.affiliateUrl || null,
      };

      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create deal");
      }

      router.push("/admin/deals?success=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירת הדיל");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/deals"
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">הוספת דיל חדש</h1>
          <p className="text-gray-500 text-sm mt-1">
            הוספה ידנית של דיל שנמצא באינטרנט
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: Basic Info */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            מידע בסיסי
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Platform */}
            <div>
              <label htmlFor="platform" className={labelClass}>
                פלטפורמה *
              </label>
              <select
                id="platform"
                name="platform"
                value={form.platform}
                onChange={handleChange}
                className={inputClass}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className={labelClass}>
                קטגוריה
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">בחר קטגוריה...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameHe} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Product URL */}
            <div className="md:col-span-2">
              <label htmlFor="productUrl" className={labelClass}>
                קישור למוצר *
              </label>
              <input
                id="productUrl"
                name="productUrl"
                type="url"
                value={form.productUrl}
                onChange={handleChange}
                placeholder="https://www.aliexpress.com/item/..."
                className={inputClass}
                dir="ltr"
              />
            </div>

            {/* Title Hebrew */}
            <div>
              <label htmlFor="titleHe" className={labelClass}>
                כותרת בעברית *
              </label>
              <input
                id="titleHe"
                name="titleHe"
                type="text"
                value={form.titleHe}
                onChange={handleChange}
                placeholder="שואב אבק רובוטי חכם"
                className={inputClass}
              />
            </div>

            {/* Title English */}
            <div>
              <label htmlFor="titleEn" className={labelClass}>
                כותרת באנגלית
              </label>
              <input
                id="titleEn"
                name="titleEn"
                type="text"
                value={form.titleEn}
                onChange={handleChange}
                placeholder="Smart Robot Vacuum Cleaner"
                className={inputClass}
                dir="ltr"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="descriptionHe" className="text-sm font-medium text-gray-300">
                  תיאור בעברית
                </label>
                <button
                  type="button"
                  onClick={handleAiDescribe}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 text-sm bg-purple-600/20 text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  יצירת תיאור AI
                </button>
              </div>
              <textarea
                id="descriptionHe"
                name="descriptionHe"
                value={form.descriptionHe}
                onChange={handleChange}
                rows={4}
                placeholder="תיאור המוצר..."
                className={inputClass + " resize-none"}
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label htmlFor="imageUrl" className={labelClass}>
                קישור לתמונה
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className={inputClass}
                dir="ltr"
              />
              {form.imageUrl && (
                <div className="mt-2">
                  <img
                    src={form.imageUrl}
                    alt="תצוגה מקדימה"
                    className="h-24 w-24 object-cover rounded-lg border border-gray-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section: Pricing */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">מחירים</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Original Price */}
            <div>
              <label htmlFor="priceOriginal" className={labelClass}>
                מחיר מקורי (USD) *
              </label>
              <input
                id="priceOriginal"
                name="priceOriginal"
                type="number"
                step="0.01"
                min="0"
                value={form.priceOriginal}
                onChange={handleChange}
                placeholder="99.99"
                className={inputClass}
                dir="ltr"
              />
            </div>

            {/* Current Price */}
            <div>
              <label htmlFor="priceCurrent" className={labelClass}>
                מחיר נוכחי (USD) *
              </label>
              <input
                id="priceCurrent"
                name="priceCurrent"
                type="number"
                step="0.01"
                min="0"
                value={form.priceCurrent}
                onChange={handleChange}
                placeholder="49.99"
                className={inputClass}
                dir="ltr"
              />
            </div>

            {/* Discount Badge */}
            <div className="flex items-end">
              {discountPercent > 0 && (
                <div className="bg-green-600/20 border border-green-700 text-green-400 px-4 py-2.5 rounded-lg text-center w-full">
                  <span className="text-2xl font-bold">{discountPercent}%</span>
                  <span className="text-sm mr-1">הנחה</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section: Coupon */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">קופון</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Coupon Code */}
            <div>
              <label htmlFor="couponCode" className={labelClass}>
                קוד קופון
              </label>
              <input
                id="couponCode"
                name="couponCode"
                type="text"
                value={form.couponCode}
                onChange={handleChange}
                placeholder="SAVE20"
                className={inputClass}
                dir="ltr"
              />
            </div>

            {/* Coupon Value */}
            <div>
              <label htmlFor="couponValue" className={labelClass}>
                ערך קופון
              </label>
              <input
                id="couponValue"
                name="couponValue"
                type="number"
                step="0.01"
                min="0"
                value={form.couponValue}
                onChange={handleChange}
                placeholder="20"
                className={inputClass}
                dir="ltr"
              />
            </div>

            {/* Coupon Type */}
            <div>
              <label className={labelClass}>סוג קופון</label>
              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="couponType"
                    value="PERCENT"
                    checked={form.couponType === "PERCENT"}
                    onChange={handleChange}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span>אחוזים (%)</span>
                </label>
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="couponType"
                    value="FIXED"
                    checked={form.couponType === "FIXED"}
                    onChange={handleChange}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span>סכום קבוע ($)</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Reviews & Shipping */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            דירוג ומשלוח
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Rating */}
            <div>
              <label htmlFor="rating" className={labelClass}>
                דירוג (1-5)
              </label>
              <input
                id="rating"
                name="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.rating}
                onChange={handleChange}
                placeholder="4.5"
                className={inputClass}
                dir="ltr"
              />
            </div>

            {/* Review Count */}
            <div>
              <label htmlFor="reviewCount" className={labelClass}>
                כמות ביקורות
              </label>
              <input
                id="reviewCount"
                name="reviewCount"
                type="number"
                min="0"
                value={form.reviewCount}
                onChange={handleChange}
                placeholder="1200"
                className={inputClass}
                dir="ltr"
              />
            </div>

            {/* Free Shipping */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 w-full hover:border-gray-600 transition-colors">
                <input
                  type="checkbox"
                  name="shippingFree"
                  checked={form.shippingFree}
                  onChange={handleChange}
                  className="w-5 h-5 accent-blue-500 rounded"
                />
                <span className="font-medium">משלוח חינם</span>
              </label>
            </div>
          </div>
        </section>

        {/* Section: Affiliate */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            קישור אפילייט
          </h2>
          <div>
            <label htmlFor="affiliateUrl" className={labelClass}>
              קישור אפילייט (tracking link)
            </label>
            <input
              id="affiliateUrl"
              name="affiliateUrl"
              type="url"
              value={form.affiliateUrl}
              onChange={handleChange}
              placeholder="https://s.click.aliexpress.com/..."
              className={inputClass}
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">
              הקישור עם tracking ID שלך. אם ריק, ישמש הקישור המקורי.
            </p>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <Link
            href="/admin/deals"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ביטול
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {loading ? "שומר..." : "שמור דיל"}
          </button>
        </div>
      </form>
    </div>
  );
}
