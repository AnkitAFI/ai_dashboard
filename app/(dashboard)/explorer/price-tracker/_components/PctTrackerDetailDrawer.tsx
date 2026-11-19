// app/(dashboard)/explorer/price-tracker/_components/PctTrackerDetailDrawer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { pctApi } from "./pct-api";
import { PctAlertConfig } from "./PctAlertConfig";
import {
  X,
  ExternalLink,
  Star,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Bell,
  Layers,
  Loader2,
  Copy,
  Check,
  Crown,
  Store,
  BellOff,
} from "lucide-react";

interface PctTrackerDetailDrawerProps {
  trackerId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackerUpdated: () => void;
}

export function PctTrackerDetailDrawer({
  trackerId,
  isOpen,
  onClose,
  onTrackerUpdated,
}: PctTrackerDetailDrawerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"comparison" | "alerts">("comparison");
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedAsin, setCopiedAsin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open to prevent duplicate window scrollbar ("two sliders")
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const fetchDetail = async () => {
    if (!trackerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await pctApi.getTrackerDetail(trackerId);
      setDetail(res);
    } catch (err: any) {
      setError(err.message || "Failed to load tracker details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && trackerId) {
      fetchDetail();
    }
  }, [isOpen, trackerId]);

  if (!isOpen || !trackerId) return null;

  const handleCopyAsin = (asin: string) => {
    navigator.clipboard.writeText(asin);
    setCopiedAsin(asin);
    toast({
      title: "ASIN Copied",
      description: `${asin} copied to clipboard.`,
    });
    setTimeout(() => setCopiedAsin(null), 2000);
  };

  const handleToggleCompetitorAlert = async (compAsin: string) => {
    if (!detail) return;
    const currentActive: string[] = detail.alert_competitor_asins || [];

    // Check if competitor is visually active right now (requires both master enabled and in list)
    const isCurrentlyActive = Boolean(detail.alert_enabled && currentActive.includes(compAsin));
    const isActivating = !isCurrentlyActive;

    let nextActive: string[];
    let nextAlertEnabled: boolean;

    if (!detail.alert_enabled) {
      // If row alerts were muted, clicking unmute on this competitor activates ONLY this competitor
      nextActive = [compAsin];
      nextAlertEnabled = true;
    } else {
      // Row alerts are already active: add or remove this specific competitor
      if (isActivating) {
        nextActive = currentActive.includes(compAsin) ? currentActive : [...currentActive, compAsin];
      } else {
        nextActive = currentActive.filter((a) => a !== compAsin);
      }
      nextAlertEnabled = nextActive.length > 0;
    }

    try {
      await pctApi.updateAlert(trackerId, {
        alert_competitor_asins: nextActive,
        alert_enabled: nextAlertEnabled,
      });
      setDetail({
        ...detail,
        alert_competitor_asins: nextActive,
        alert_enabled: nextAlertEnabled,
      });
      toast({
        title: isActivating ? "Alert Activated" : "Alert Muted",
        description: `Price drop alerts ${
          isActivating ? "activated" : "muted"
        } for ASIN ${compAsin}.`,
      });
      onTrackerUpdated();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update alert toggle.",
        variant: "destructive",
      });
    }
  };

  const ourProduct = detail?.our_product;
  const currSym = "₹";
  const activeAlertComps = new Set(detail?.alert_competitor_asins || []);

  const ourPrice = ourProduct?.price != null ? Number(ourProduct.price) : null;
  const validCompPrices: number[] = (detail?.competitors || [])
    .map((c: any) => (c.price != null ? Number(c.price) : null))
    .filter((p: any): p is number => p != null && p > 0);

  const minCompPrice = validCompPrices.length > 0 ? Math.min(...validCompPrices) : null;

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl lg:max-w-3xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="min-w-0 pr-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block truncate">
              {detail?.sheet_name || "Comparison Tracker"}
            </span>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>ASIN: {detail?.our_asin}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                  amazon.in
                </span>
              </h2>
              <button
                onClick={() => handleCopyAsin(detail?.our_asin)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                title="Copy ASIN"
              >
                {copiedAsin === detail?.our_asin ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with clean single scrollbar */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Loading product intelligence...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-red-500 text-sm">{error}</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 [scrollbar-width:thin] [scrollbar-color:rgba(156,163,175,0.4)_transparent]">
            {/* 1. Our Product Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-2xs">
                {ourProduct?.photo ? (
                  <img
                    src={ourProduct.photo}
                    alt={ourProduct.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400 font-mono">No Image</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                    Your Product
                  </span>
                  {ourProduct?.is_prime && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      Prime
                    </span>
                  )}
                  {ourProduct?.is_amazon_choice && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-white">
                      Amazon's Choice
                    </span>
                  )}
                  {ourProduct?.price == null && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Currently Unavailable
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate mb-1">
                  {ourProduct?.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                      {ourProduct?.price != null
                        ? `${currSym}${ourProduct.price.toLocaleString("en-IN")}`
                        : "—"}
                    </span>
                    {ourProduct?.original_price && (
                      <span className="text-[11px] text-slate-400 line-through">
                        M.R.P.: {ourProduct.original_price}
                      </span>
                    )}
                  </div>
                  {ourProduct?.buy_box_seller && (
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 truncate max-w-[220px]"
                      title={`Buy Box Winner on Amazon India: ${ourProduct.buy_box_seller}`}
                    >
                      <Store className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Buy Box: <strong>{ourProduct.buy_box_seller}</strong></span>
                    </span>
                  )}
                  {ourProduct?.star_rating && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {ourProduct.star_rating}
                      </span>
                      <span>({ourProduct.num_ratings?.toLocaleString()})</span>
                    </div>
                  )}
                  <a
                    href={ourProduct?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline ml-auto sm:ml-0"
                  >
                    <span>Amazon.in</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-6">
              <button
                onClick={() => setActiveTab("comparison")}
                className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === "comparison"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Competitors ({detail?.competitors?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab("alerts")}
                className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === "alerts"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Alert Configuration</span>
              </button>
            </div>

            {/* TAB 1: Responsive Competitor Cards */}
            {activeTab === "comparison" && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>
                    Up to 10 competitors monitored for this product row.
                  </span>
                  {detail?.alert_enabled && (detail?.alert_competitor_asins?.length || 0) > 0 ? (
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {detail.alert_competitor_asins.length} alert{detail.alert_competitor_asins.length === 1 ? "" : "s"} active
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-400 dark:text-slate-500">
                      Alerts Muted
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {detail?.competitors?.map((comp: any) => {
                    const isCheaper = comp.diff_pct !== null && comp.diff_pct > 0;
                    const isMoreExpensive = comp.diff_pct !== null && comp.diff_pct < 0;
                    const isLowestInGroup =
                      comp.price != null && Number(comp.price) === minCompPrice;
                    const isAlertOn = Boolean(detail?.alert_enabled && activeAlertComps.has(comp.asin));

                    return (
                      <div
                        key={comp.asin}
                        className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                          isLowestInGroup
                            ? "border-emerald-200/90 bg-emerald-50/25 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                            : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900"
                        } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                      >
                        {/* Left: Product Info */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-11 h-11 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                            {comp.photo ? (
                              <img
                                src={comp.photo}
                                alt={comp.title}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-[9px] text-slate-400 font-mono">ASIN</span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[220px] sm:max-w-md">
                                {comp.title}
                              </h5>
                              {isLowestInGroup && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-extrabold shrink-0">
                                  <Crown className="w-2.5 h-2.5" />
                                  Lowest
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px]">
                              <span className="font-mono text-slate-500 font-medium">
                                {comp.asin}
                              </span>
                              <button
                                onClick={() => handleCopyAsin(comp.asin)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Copy ASIN"
                              >
                                {copiedAsin === comp.asin ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              {comp.is_prime && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 rounded">
                                  Prime
                                </span>
                              )}
                              {comp.price == null && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800">
                                  Unavailable
                                </span>
                              )}
                              {comp.buy_box_seller && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 truncate max-w-[180px]"
                                  title={`Current Buy Box Winner on Amazon India: ${comp.buy_box_seller}`}
                                >
                                  <Store className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                                  <span>Buy Box: <strong>{comp.buy_box_seller}</strong></span>
                                </span>
                              )}
                              <a
                                href={comp.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                                title="View on Amazon India"
                              >
                                <span>Amazon</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Right: Price & Alert Toggle */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                          {/* Price */}
                          <div className="text-left sm:text-right">
                            {comp.price != null ? (
                              <div>
                                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                                  {currSym}
                                  {comp.price.toLocaleString("en-IN")}
                                </span>
                                {comp.original_price && (
                                  <div className="text-[10px] text-slate-400 line-through">
                                    {comp.original_price}
                                  </div>
                                )}
                                {comp.diff_pct != null && (
                                  <div className="flex items-center sm:justify-end gap-1 mt-0.5">
                                    <span
                                      className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                        isCheaper
                                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                          : isMoreExpensive
                                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {isCheaper
                                        ? `-${comp.diff_pct}%`
                                        : isMoreExpensive
                                        ? `+${Math.abs(comp.diff_pct)}%`
                                        : "Same"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono text-xs">—</span>
                            )}
                          </div>

                          {/* Alert Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleCompetitorAlert(comp.asin)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                              isAlertOn
                                ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs"
                                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700"
                            }`}
                            title={isAlertOn ? "Alert is active. Click to mute." : "Alert is muted. Click to activate."}
                          >
                            {isAlertOn ? (
                              <>
                                <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/30" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <BellOff className="w-3.5 h-3.5 text-slate-400" />
                                <span>Muted</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Alert Configuration */}
            {activeTab === "alerts" && (
              <PctAlertConfig
                trackerId={detail.id}
                initialAlertEnabled={detail.alert_enabled}
                initialThreshold={detail.alert_threshold}
                initialEmails={detail.alert_emails || []}
                competitors={detail.competitors || []}
                onSaved={() => {
                  fetchDetail();
                  onTrackerUpdated();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
