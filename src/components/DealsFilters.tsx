"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

interface CategoryOption {
  nameHe: string;
  slug: string;
}

interface DealsFiltersProps {
  categories: CategoryOption[];
  totalCount: number;
}

const PLATFORM_OPTIONS = [
  { value: "", label: "כל הפלטפורמות" },
  { value: "ALIEXPRESS", label: "AliExpress" },
  { value: "TEMU", label: "Temu" },
  { value: "IHERB", label: "iHerb" },
] as const;

const SORT_OPTIONS = [
  { value: "score", label: "לפי ציון דיל" },
  { value: "price", label: "מחיר: מהנמוך לגבוה" },
  { value: "date", label: "החדשים ביותר" },
] as const;

export default function DealsFilters({
  categories,
  totalCount,
}: DealsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentPlatform = searchParams.get("platform") || "";
  const currentSort = searchParams.get("sort") || "score";

  const [searchValue, setSearchValue] = useState(currentQ);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      // Reset page on filter change
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      startTransition(() => {
        router.push(`/deals?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateParams({ q: searchValue });
    },
    [searchValue, updateParams]
  );

  const activeFilterCount = [currentQ, currentCategory, currentPlatform].filter(
    Boolean
  ).length + (currentSort !== "score" ? 1 : 0);

  const clearAllFilters = useCallback(() => {
    setSearchValue("");
    startTransition(() => {
      router.push("/deals");
    });
  }, [router]);

  return (
    <div className="space-y-4">
      {/* Search + Filters Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="חיפוש דילים..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 pr-11 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
            />
            <button
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            >
              חפש
            </button>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
              🔍
            </span>
          </div>
        </form>

        {/* Category Filter */}
        <select
          value={currentCategory}
          onChange={(e) => updateParams({ category: e.target.value })}
          className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50 transition-colors min-w-[160px] appearance-none cursor-pointer"
        >
          <option value="">כל הקטגוריות</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.nameHe}
            </option>
          ))}
        </select>

        {/* Platform Filter */}
        <select
          value={currentPlatform}
          onChange={(e) => updateParams({ platform: e.target.value })}
          className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50 transition-colors min-w-[160px] appearance-none cursor-pointer"
        >
          {PLATFORM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50 transition-colors min-w-[160px] appearance-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results count + Active filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {isPending ? (
              <span className="text-emerald-400">מחפש...</span>
            ) : (
              <>
                <span className="font-bold text-emerald-400">{totalCount}</span>{" "}
                דילים נמצאו
              </>
            )}
          </span>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors border border-gray-700 rounded-lg px-2 py-1"
            >
              נקה פילטרים ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Active filter tags */}
        <div className="flex gap-2 flex-wrap">
          {currentQ && (
            <FilterTag
              label={`חיפוש: ${currentQ}`}
              onRemove={() => {
                setSearchValue("");
                updateParams({ q: "" });
              }}
            />
          )}
          {currentCategory && (
            <FilterTag
              label={
                categories.find((c) => c.slug === currentCategory)?.nameHe ||
                currentCategory
              }
              onRemove={() => updateParams({ category: "" })}
            />
          )}
          {currentPlatform && (
            <FilterTag
              label={
                PLATFORM_OPTIONS.find((p) => p.value === currentPlatform)
                  ?.label || currentPlatform
              }
              onRemove={() => updateParams({ platform: "" })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full px-3 py-1">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-red-400 transition-colors mr-1"
        aria-label="הסר פילטר"
      >
        ✕
      </button>
    </span>
  );
}
