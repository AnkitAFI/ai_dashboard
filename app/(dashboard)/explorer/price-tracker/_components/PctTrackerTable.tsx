// app/(dashboard)/explorer/price-tracker/_components/PctTrackerTable.tsx
"use client";

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TrackerItem, pctApi } from "./pct-api";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  ExternalLink,
  Trash2,
  TrendingDown,
  TrendingUp,
  Bell,
  BellOff,
  Search,
  UploadCloud,
  Loader2,
  FileSpreadsheet,
  ChevronRight,
  Layers,
  Sparkles,
  ShieldAlert,
  Award,
  CheckCircle2,
  PackageX,
  Filter,
} from "lucide-react";

interface PctTrackerTableProps {
  trackers: TrackerItem[];
  loading: boolean;
  onSelectTracker: (id: number) => void;
  onRefreshAll: (silent?: boolean) => void;
  onOpenUpload: () => void;
}

type FilterTab = "all" | "undercut" | "lowest" | "unavailable";

export function PctTrackerTable({
  trackers,
  loading,
  onSelectTracker,
  onRefreshAll,
  onOpenUpload,
}: PctTrackerTableProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrackerItem | null>(null);
  const [optimisticAlerts, setOptimisticAlerts] = useState<Record<number, boolean>>({});

  // Compute catalog competitiveness counts
  const undercutCount = trackers.filter(
    (t) =>
      t.our_product?.price != null &&
      t.cheapest_competitor?.diff_pct != null &&
      t.cheapest_competitor.diff_pct > 0
  ).length;

  const lowestCount = trackers.filter(
    (t) =>
      t.our_product?.price != null &&
      t.cheapest_competitor?.diff_pct != null &&
      t.cheapest_competitor.diff_pct <= 0
  ).length;

  const unavailableCount = trackers.filter((t) => t.our_product?.price == null).length;

  const total = trackers.length;
  const winningPct = total > 0 ? Math.round((lowestCount / total) * 100) : 0;
  const undercutPct = total > 0 ? Math.round((undercutCount / total) * 100) : 0;
  const unavailPct = total > 0 ? Math.max(0, 100 - winningPct - undercutPct) : 0;

  // Filter trackers based on search and active tab
  const filtered = trackers.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.our_asin.toLowerCase().includes(q) ||
      (t.sheet_name || "").toLowerCase().includes(q) ||
      (t.our_product?.title || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterTab === "undercut") {
      return (
        t.our_product?.price != null &&
        t.cheapest_competitor?.diff_pct != null &&
        t.cheapest_competitor.diff_pct > 0
      );
    }
    if (filterTab === "lowest") {
      return (
        t.our_product?.price != null &&
        t.cheapest_competitor?.diff_pct != null &&
        t.cheapest_competitor.diff_pct <= 0
      );
    }
    if (filterTab === "unavailable") {
      return t.our_product?.price == null;
    }
    return true;
  });

  const handleDownloadTemplate = () => {
    const csvContent =
      "Our Product Code (ASIN),Competitor 1,Competitor 2,Competitor 3,Competitor 4,Competitor 5\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Price_Comparison_Tracker_Sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Sample Spreadsheet Downloaded",
      description: "Sample file ready. Add your Amazon product codes in Column A and competitor codes in Columns B through F.",
    });
  };

  const handleToggleAlert = async (e: React.MouseEvent, t: TrackerItem) => {
    e.stopPropagation();
    const currentStatus = optimisticAlerts[t.id] ?? t.alert_enabled;
    const nextStatus = !currentStatus;

    setOptimisticAlerts((prev) => ({ ...prev, [t.id]: nextStatus }));

    try {
      const payload: any = {
        alert_enabled: nextStatus,
        alert_competitor_asins: nextStatus
          ? ((t.alert_competitor_asins && t.alert_competitor_asins.length > 0)
              ? t.alert_competitor_asins
              : (t.competitors || []).map((c) => c.asin))
          : []
      };
      await pctApi.updateAlert(t.id, payload);
      toast({
        title: nextStatus ? "Price Drop Alerts Turned On" : "Price Drop Alerts Paused",
        description: nextStatus
          ? `We will alert you when competitors drop prices for ${t.our_asin}.`
          : `Price drop alerts paused for ${t.our_asin}.`,
      });
      onRefreshAll(true);
    } catch (err: any) {
      setOptimisticAlerts((prev) => ({ ...prev, [t.id]: currentStatus }));
      toast({
        title: "Unable to Update Alert",
        description: "Could not update alert status right now. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenDelete = (e: React.MouseEvent, t: TrackerItem) => {
    e.stopPropagation();
    setDeleteTarget(t);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    const targetAsin = deleteTarget.our_asin;
    setDeleteTarget(null);
    setActionLoadingId(targetId);

    try {
      await pctApi.deleteTracker(targetId);
      toast({
        title: "Product Removed",
        description: `Product ${targetAsin} has been removed from tracking.`,
      });
      onRefreshAll();
    } catch (err: any) {
      toast({
        title: "Unable to Remove Product",
        description: "Could not remove this product right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Controls: Search & Upload */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, Amazon code (ASIN), or list name..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            title="Download Sample Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Sample File</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Add Products</span>
          </button>
        </div>
      </div>

      {/* Smart Filter Tabs & Catalog Competitiveness Health Bar */}
      {trackers.length > 0 && (
        <div className="px-4 sm:px-5 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterTab("all")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filterTab === "all"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800"
              }`}
            >
              <span>All Products</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                {trackers.length}
              </span>
            </button>

            <button
              onClick={() => setFilterTab("undercut")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filterTab === "undercut"
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 shadow-2xs border border-rose-200 dark:border-rose-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Competitor Cheaper</span>
              {undercutCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold">
                  {undercutCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterTab("lowest")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filterTab === "lowest"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shadow-2xs border border-emerald-200 dark:border-emerald-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span>Lowest Price</span>
              {lowestCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold">
                  {lowestCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterTab("unavailable")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filterTab === "unavailable"
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shadow-2xs border border-amber-200 dark:border-amber-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50"
              }`}
            >
              <PackageX className="w-3.5 h-3.5 text-amber-500" />
              <span>Unavailable</span>
              {unavailableCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold">
                  {unavailableCount}
                </span>
              )}
            </button>
          </div>

          {/* Catalog Health Visual Segment Bar */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden lg:inline">
              Pricing Overview:
            </span>
            <div
              className="w-32 sm:w-44 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex"
              title={`${winningPct}% Lowest Price • ${undercutPct}% Competitor Cheaper • ${unavailPct}% Unavailable`}
            >
              {winningPct > 0 && (
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${winningPct}%` }}
                />
              )}
              {undercutPct > 0 && (
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${undercutPct}%` }}
                />
              )}
              {unavailPct > 0 && (
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${unavailPct}%` }}
                />
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
              {filtered.length} of {trackers.length}
            </span>
          </div>
        </div>
      )}

      {/* Table Body or Empty State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
          <span className="text-xs font-medium">Checking live Amazon prices...</span>
        </div>
      ) : filtered.length === 0 && trackers.length === 0 ? (
        /* Rich Polished Empty State */
        <div className="py-14 px-6 text-center flex flex-col items-center justify-center max-w-4xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/15 via-sky-500/20 to-indigo-500/15 border border-blue-200/80 dark:border-blue-800/40 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 shadow-sm">
            <TrendingDown className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 mb-2">
            Real-Time Amazon Price Tracking
          </span>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
            Monitor & Compare Amazon Competitor Prices
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mb-8 leading-relaxed">
            Upload your product list to monitor competitor price changes, see who has the lowest price, and get automated price drop email alerts.
          </p>

          {/* 3 Step Workflow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8 text-left">
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 hover:border-blue-200 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-xs mb-2.5">
                1
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                Add Your Products
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Put your Amazon product code in Column A, and up to 5 competitor codes across Columns B to F.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 hover:border-sky-200 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-extrabold text-xs mb-2.5">
                2
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                Daily Price Checks
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Live prices, seller details, Prime eligibility, and ratings are automatically checked every day.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 hover:border-indigo-200 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs mb-2.5">
                3
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                Price Drop Alerts
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Turn on alerts for specific competitors and get instant emails whenever they lower their price.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105"
            >
              <UploadCloud className="w-4 h-4" />
              <span>+ Add Products</span>
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download Sample File</span>
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* Search Not Found State */
        <div className="py-14 text-center text-slate-400 flex flex-col items-center justify-center p-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No matching products found
          </h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Try searching with a different product name, Amazon code (ASIN), or clear your filter.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setFilterTab("all");
            }}
            className="mt-3 text-xs text-blue-600 hover:underline font-semibold"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        /* Full Rich Data Table */
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Your Product</th>
                <th className="py-3 px-4">Your Price</th>
                <th className="py-3 px-4">Lowest Competitor</th>
                <th className="py-3 px-4">Price Comparison</th>
                <th className="py-3 px-4">Competitors</th>
                <th className="py-3 px-4">Price Drop Alerts</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => {
                const prod = t.our_product;
                const cheapest = t.cheapest_competitor;
                const isCheaper = cheapest?.diff_pct !== null && cheapest.diff_pct > 0;
                const currSym = "₹";
                const isActionBusy = actionLoadingId === t.id;
                const isAlertActive = optimisticAlerts[t.id] ?? t.alert_enabled;

                return (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTracker(t.id)}
                    className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* 1. Your Product Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1 group-hover:border-blue-300 transition-colors shadow-2xs">
                          {prod?.photo ? (
                            <img
                              src={prod.photo}
                              alt={prod.title}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">ASIN</span>
                          )}
                        </div>
                        <div className="max-w-xs min-w-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs group-hover:text-blue-600 transition-colors">
                            {prod?.title || "Checking Product Details..."}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="font-mono text-slate-500 text-[11px] font-medium">
                              {t.our_asin}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                              amazon.in
                            </span>
                            {prod?.is_prime && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                                Prime
                              </span>
                            )}
                            {prod?.price == null && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                Currently Unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Your Price */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {prod?.price != null ? (
                        <span>
                          {currSym}
                          {prod.price.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span
                          className="text-slate-400 font-mono font-normal text-sm"
                          title="No active seller price on Amazon India"
                        >
                          —
                        </span>
                      )}
                    </td>

                    {/* 3. Cheapest Competitor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cheapest?.price != null ? (
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {currSym}
                            {cheapest.price.toLocaleString("en-IN")}
                          </div>
                          <a
                            href={`https://www.amazon.in/dp/${cheapest.asin}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-mono text-blue-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>{cheapest.asin}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      ) : (
                        <span
                          className="text-slate-400 font-mono text-sm"
                          title="No active competitor price on Amazon India"
                        >
                          —
                        </span>
                      )}
                    </td>

                    {/* 4. Actionable Price Gap & Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {prod?.price == null ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">
                          — Unavailable
                        </span>
                      ) : cheapest?.diff_pct != null ? (
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                              isCheaper
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40"
                                : cheapest.diff_pct < 0
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {isCheaper ? (
                              <>
                                <TrendingDown className="w-3 h-3 text-rose-600" />
                                <span>Competitor is {cheapest.diff_pct}% lower</span>
                              </>
                            ) : cheapest.diff_pct < 0 ? (
                              <>
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                <span>You have lowest price</span>
                              </>
                            ) : (
                              <span>Price Matched</span>
                            )}
                          </span>
                          {prod.price != null && cheapest.price != null && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 pl-1">
                              {isCheaper
                                ? `₹${Math.round(prod.price - cheapest.price).toLocaleString(
                                    "en-IN"
                                  )} higher than lowest competitor`
                                : cheapest.diff_pct < 0
                                ? `₹${Math.round(cheapest.price - prod.price).toLocaleString(
                                    "en-IN"
                                  )} lower than competitors`
                                : "Matched with competitor"}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* 5. Competitors Overlapping Avatar Stack */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center -space-x-2.5 overflow-visible py-0.5">
                          {t.competitors && t.competitors.length > 0 ? (
                            t.competitors.slice(0, 3).map((comp, idx) => (
                              <div
                                key={comp.asin || idx}
                                className="relative group/avatar"
                                title={`${comp.title || comp.asin} (${
                                  comp.price ? `₹${comp.price.toLocaleString("en-IN")}` : "Unavailable"
                                })`}
                              >
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden flex items-center justify-center p-0.5 transition-transform duration-150 group-hover/avatar:scale-125 group-hover/avatar:z-20 group-hover/avatar:shadow-md">
                                  {comp.photo ? (
                                    <img
                                      src={comp.photo}
                                      alt={comp.asin}
                                      className="w-full h-full object-contain"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <span className="text-[8px] font-mono font-bold text-slate-400">
                                      {comp.asin.slice(0, 3)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">—</span>
                          )}

                          {/* Overflow Count Bubble */}
                          {t.competitors_count > 3 && (
                            <div
                              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-2xs z-0"
                              title={`${t.competitors_count} total competitors monitored`}
                            >
                              +{t.competitors_count - 3}
                            </div>
                          )}
                        </div>

                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden xl:inline">
                          {t.competitors_count} total
                        </span>
                      </div>
                    </td>

                    {/* 6. Interactive 1-Click Drop Alert Switch */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleToggleAlert(e, t)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
                          isAlertActive
                            ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700"
                        }`}
                        title={
                          isAlertActive
                            ? "Click to pause drop alerts for this product"
                            : "Click to enable drop alerts for this product"
                        }
                      >
                        {isAlertActive ? (
                          <>
                            <Bell className="w-3 h-3 text-emerald-600 dark:text-emerald-400 fill-emerald-600/30 animate-pulse" />
                            <span>Active (&lt;{t.alert_threshold}%)</span>
                          </>
                        ) : (
                          <>
                            <BellOff className="w-3 h-3 text-slate-400" />
                            <span>Muted</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* 7. Row Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectTracker(t.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View detail & history"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleOpenDelete(e, t)}
                          disabled={isActionBusy}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete tracked item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Professional In-App Confirmation Modal */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Stop Tracking This Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Are you sure you want to stop tracking{" "}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">
                {deleteTarget?.our_asin}
              </strong>
              {deleteTarget?.our_product?.title ? ` (${deleteTarget.our_product.title.slice(0, 50)}...)` : ""}? 
              This product will be removed from your dashboard and price drop notifications will be disabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex items-center gap-2 sm:justify-end">
            <AlertDialogCancel className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              Keep Tracking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20"
            >
              Remove Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
