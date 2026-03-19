"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Send,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MousePointerClick,
} from "lucide-react";
import { getDealTier } from "@/lib/scoring";

interface Deal {
  id: string;
  titleEn: string;
  titleHe: string | null;
  priceCurrent: number;
  priceOriginal: number;
  priceILS: number | null;
  shippingFree: boolean;
  rating: number | null;
  reviewCount: number;
  score: number;
  status: string;
  isPublished: boolean;
  imageUrl: string | null;
  couponCode: string | null;
  store: { name: string; platform: string };
  category: { nameHe: string } | null;
  createdAt: string;
  _count?: { clicks: number; conversions: number };
}

type SortField = "score" | "createdAt" | "clicks" | "priceCurrent";
type SortDirection = "asc" | "desc";

interface DealsTableProps {
  deals: Deal[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPublish: (id: string) => void;
  onDelete?: (id: string) => void;
  onBulkApprove?: (ids: string[]) => void;
  onBulkPublish?: (ids: string[]) => void;
  onBulkDelete?: (ids: string[]) => void;
}

const ITEMS_PER_PAGE = 20;

export default function DealsTable({
  deals,
  onApprove,
  onReject,
  onPublish,
  onDelete,
  onBulkApprove,
  onBulkPublish,
  onBulkDelete,
}: DealsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const result = deals.filter((deal) => {
      const matchesSearch =
        !search ||
        deal.titleEn.toLowerCase().includes(search.toLowerCase()) ||
        deal.titleHe?.includes(search);
      const matchesStatus = statusFilter === "ALL" || deal.status === statusFilter;
      const matchesPlatform = platformFilter === "ALL" || deal.store.platform === platformFilter;
      return matchesSearch && matchesStatus && matchesPlatform;
    });

    // Sort
    result.sort((a, b) => {
      let valA: number;
      let valB: number;

      switch (sortField) {
        case "score":
          valA = a.score;
          valB = b.score;
          break;
        case "clicks":
          valA = a._count?.clicks ?? 0;
          valB = b._count?.clicks ?? 0;
          break;
        case "priceCurrent":
          valA = a.priceCurrent;
          valB = b.priceCurrent;
          break;
        case "createdAt":
        default:
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
      }

      return sortDirection === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [deals, search, statusFilter, platformFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDeals = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-gray-500" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 text-emerald-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-400" />
    );
  };

  // Selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedDeals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedDeals.map((d) => d.id)));
    }
  };

  const selectedArray = Array.from(selectedIds);

  const handleInlineDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="חיפוש מוצר..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pr-10 pl-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder-gray-500"
          />
        </div>

        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
            className="appearance-none pr-10 pl-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white cursor-pointer"
          >
            <option value="ALL">כל הסטטוסים</option>
            <option value="PENDING">ממתינים</option>
            <option value="APPROVED">מאושרים</option>
            <option value="PUBLISHED">פורסמו</option>
            <option value="REJECTED">נדחו</option>
            <option value="EXPIRED">פגו</option>
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={platformFilter}
            onChange={(e) => handleFilterChange(setPlatformFilter, e.target.value)}
            className="appearance-none pr-4 pl-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white cursor-pointer"
          >
            <option value="ALL">כל הפלטפורמות</option>
            <option value="ALIEXPRESS">AliExpress</option>
            <option value="TEMU">Temu</option>
            <option value="IHERB">iHerb</option>
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        <span className="text-sm text-gray-500 self-center">
          {filtered.length} דילים
        </span>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
          <span className="text-sm text-white font-medium">
            {selectedIds.size} נבחרו
          </span>
          <div className="h-4 w-px bg-gray-600" />
          {onBulkApprove && (
            <button
              onClick={() => {
                onBulkApprove(selectedArray);
                setSelectedIds(new Set());
              }}
              className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              אשר מסומנים
            </button>
          )}
          {onBulkPublish && (
            <button
              onClick={() => {
                onBulkPublish(selectedArray);
                setSelectedIds(new Set());
              }}
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Send className="w-4 h-4" />
              פרסם מסומנים
            </button>
          )}
          {onBulkDelete && (
            <button
              onClick={() => {
                onBulkDelete(selectedArray);
                setSelectedIds(new Set());
              }}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              מחק מסומנים
            </button>
          )}
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-400 hover:text-white mr-auto transition-colors"
          >
            בטל בחירה
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedDeals.length > 0 && selectedIds.size === paginatedDeals.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-gray-700 border-gray-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                </th>
                <th className="text-right p-3 font-medium text-gray-400">מוצר</th>
                <th className="text-right p-3 font-medium text-gray-400">חנות</th>
                <th className="text-right p-3 font-medium text-gray-400">מחיר</th>
                <th className="text-right p-3 font-medium text-gray-400">
                  <button
                    onClick={() => handleSort("score")}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    ציון {getSortIcon("score")}
                  </button>
                </th>
                <th className="text-right p-3 font-medium text-gray-400">
                  <button
                    onClick={() => handleSort("clicks")}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    קליקים {getSortIcon("clicks")}
                  </button>
                </th>
                <th className="text-right p-3 font-medium text-gray-400">סטטוס</th>
                <th className="text-right p-3 font-medium text-gray-400">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    תאריך {getSortIcon("createdAt")}
                  </button>
                </th>
                <th className="text-right p-3 font-medium text-gray-400">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedDeals.map((deal) => {
                const tier = getDealTier(deal.score);
                const savingsPercent =
                  deal.priceOriginal > 0
                    ? Math.round(
                        ((deal.priceOriginal - deal.priceCurrent) / deal.priceOriginal) * 100
                      )
                    : 0;
                const clickCount = deal._count?.clicks ?? 0;

                return (
                  <tr
                    key={deal.id}
                    className={`hover:bg-gray-800/50 transition-colors ${
                      selectedIds.has(deal.id) ? "bg-emerald-900/10" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(deal.id)}
                        onChange={() => toggleSelect(deal.id)}
                        className="rounded bg-gray-700 border-gray-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                      />
                    </td>

                    {/* Product */}
                    <td className="p-3 max-w-[280px]">
                      <div className="flex items-center gap-3">
                        {deal.imageUrl ? (
                          <img
                            src={deal.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-gray-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 text-xs">N/A</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate max-w-[200px]">
                            {deal.titleHe || deal.titleEn}
                          </p>
                          {deal.couponCode && (
                            <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-0.5 rounded">
                              קופון: {deal.couponCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Store */}
                    <td className="p-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-800 text-gray-300">
                        {deal.store.name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-emerald-400">
                          {deal.priceILS
                            ? `₪${Math.round(deal.priceILS)}`
                            : `$${deal.priceCurrent.toFixed(2)}`}
                        </span>
                        {savingsPercent > 0 && (
                          <span className="text-xs text-gray-500 mr-1 line-through">
                            ${deal.priceOriginal.toFixed(2)}
                          </span>
                        )}
                        {savingsPercent > 0 && (
                          <span className="block text-xs text-red-400 font-medium">
                            -{savingsPercent}%
                          </span>
                        )}
                        {deal.shippingFree && (
                          <span className="text-xs text-emerald-500">משלוח חינם</span>
                        )}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span>{tier.emoji}</span>
                        <span
                          className={`font-bold ${
                            deal.score >= 80
                              ? "text-emerald-400"
                              : deal.score >= 60
                              ? "text-blue-400"
                              : "text-gray-500"
                          }`}
                        >
                          {deal.score}
                        </span>
                      </div>
                    </td>

                    {/* Clicks */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-gray-400">
                        <MousePointerClick className="w-3.5 h-3.5" />
                        <span className="font-medium">{clickCount}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <StatusBadge status={deal.status} />
                    </td>

                    {/* Date */}
                    <td className="p-3">
                      <span className="text-gray-400 text-xs" dir="ltr">
                        {new Date(deal.createdAt).toLocaleDateString("he-IL")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {/* Edit button */}
                        <Link
                          href={`/admin/deals/${deal.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="ערוך"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        {deal.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => onApprove(deal.id)}
                              className="p-1.5 text-emerald-500 hover:bg-emerald-900/30 rounded-lg transition-colors"
                              title="אישור"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onReject(deal.id)}
                              className="p-1.5 text-red-500 hover:bg-red-900/30 rounded-lg transition-colors"
                              title="דחייה"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {deal.status === "APPROVED" && !deal.isPublished && (
                          <button
                            onClick={() => onPublish(deal.id)}
                            className="p-1.5 text-blue-500 hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="פרסום"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <a
                          href={`/deals/${deal.id}`}
                          target="_blank"
                          className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                          title="צפייה"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Delete button with inline confirm */}
                        {deleteConfirmId === deal.id ? (
                          <div className="flex items-center gap-1 bg-red-900/30 rounded-lg px-2 py-1">
                            <span className="text-xs text-red-400">למחוק?</span>
                            <button
                              onClick={() => handleInlineDelete(deal.id)}
                              className="text-xs text-red-400 hover:text-red-300 font-bold px-1"
                            >
                              כן
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs text-gray-400 hover:text-gray-300 px-1"
                            >
                              לא
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(deal.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                            title="מחק"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedDeals.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    לא נמצאו דילים
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <div className="text-sm text-gray-500">
              מציג {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} מתוך{" "}
              {filtered.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page: number;
                if (totalPages <= 7) {
                  page = i + 1;
                } else if (currentPage <= 4) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i;
                } else {
                  page = currentPage - 3 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-emerald-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
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
