"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Send,
  ExternalLink,
  ChevronDown,
  Search,
  Filter,
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
}

interface DealsTableProps {
  deals: Deal[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPublish: (id: string) => void;
}

export default function DealsTable({ deals, onApprove, onReject, onPublish }: DealsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");

  const filtered = deals.filter((deal) => {
    const matchesSearch =
      !search ||
      deal.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      deal.titleHe?.includes(search);
    const matchesStatus = statusFilter === "ALL" || deal.status === statusFilter;
    const matchesPlatform = platformFilter === "ALL" || deal.store.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="חיפוש מוצר..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pr-10 pl-8 py-2 border rounded-lg text-sm bg-white cursor-pointer"
          >
            <option value="ALL">כל הסטטוסים</option>
            <option value="PENDING">ממתינים</option>
            <option value="APPROVED">מאושרים</option>
            <option value="PUBLISHED">פורסמו</option>
            <option value="REJECTED">נדחו</option>
            <option value="EXPIRED">פגו</option>
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="appearance-none pr-4 pl-8 py-2 border rounded-lg text-sm bg-white cursor-pointer"
          >
            <option value="ALL">כל הפלטפורמות</option>
            <option value="ALIEXPRESS">AliExpress</option>
            <option value="TEMU">Temu</option>
            <option value="IHERB">iHerb</option>
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <span className="text-sm text-gray-500 self-center">
          {filtered.length} דילים
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right p-3 font-medium text-gray-500">מוצר</th>
                <th className="text-right p-3 font-medium text-gray-500">חנות</th>
                <th className="text-right p-3 font-medium text-gray-500">מחיר</th>
                <th className="text-right p-3 font-medium text-gray-500">ציון</th>
                <th className="text-right p-3 font-medium text-gray-500">דירוג</th>
                <th className="text-right p-3 font-medium text-gray-500">סטטוס</th>
                <th className="text-right p-3 font-medium text-gray-500">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((deal) => {
                const tier = getDealTier(deal.score);
                const savingsPercent = deal.priceOriginal > 0
                  ? Math.round(((deal.priceOriginal - deal.priceCurrent) / deal.priceOriginal) * 100)
                  : 0;

                return (
                  <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                    {/* מוצר */}
                    <td className="p-3 max-w-[300px]">
                      <div className="flex items-center gap-3">
                        {deal.imageUrl && (
                          <img
                            src={deal.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                        )}
                        <div>
                          <p className="font-medium truncate max-w-[220px]">
                            {deal.titleHe || deal.titleEn}
                          </p>
                          {deal.couponCode && (
                            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                              קופון: {deal.couponCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* חנות */}
                    <td className="p-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                        {deal.store.name}
                      </span>
                    </td>

                    {/* מחיר */}
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-green-600">
                          {deal.priceILS ? `₪${Math.round(deal.priceILS)}` : `$${deal.priceCurrent.toFixed(2)}`}
                        </span>
                        {savingsPercent > 0 && (
                          <span className="text-xs text-red-500 mr-1 line-through">
                            ${deal.priceOriginal.toFixed(2)}
                          </span>
                        )}
                        {savingsPercent > 0 && (
                          <span className="block text-xs text-red-500 font-medium">
                            -{savingsPercent}%
                          </span>
                        )}
                        {deal.shippingFree && (
                          <span className="text-xs text-green-500">משלוח חינם</span>
                        )}
                      </div>
                    </td>

                    {/* ציון */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span>{tier.emoji}</span>
                        <span
                          className={`font-bold ${
                            deal.score >= 80
                              ? "text-green-600"
                              : deal.score >= 60
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {deal.score}
                        </span>
                      </div>
                    </td>

                    {/* דירוג */}
                    <td className="p-3">
                      {deal.rating ? (
                        <div>
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-medium">{deal.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400 block">
                            ({deal.reviewCount.toLocaleString()})
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* סטטוס */}
                    <td className="p-3">
                      <StatusBadge status={deal.status} />
                    </td>

                    {/* פעולות */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {deal.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => onApprove(deal.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="אישור"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onReject(deal.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="דחייה"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {deal.status === "APPROVED" && !deal.isPublished && (
                          <button
                            onClick={() => onPublish(deal.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="פרסום"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <a
                          href={`/deals/${deal.id}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
                          title="צפייה"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    לא נמצאו דילים
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: "ממתין", className: "bg-yellow-100 text-yellow-700" },
    APPROVED: { label: "מאושר", className: "bg-blue-100 text-blue-700" },
    PUBLISHED: { label: "פורסם", className: "bg-green-100 text-green-700" },
    REJECTED: { label: "נדחה", className: "bg-red-100 text-red-700" },
    EXPIRED: { label: "פג תוקף", className: "bg-gray-100 text-gray-700" },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
