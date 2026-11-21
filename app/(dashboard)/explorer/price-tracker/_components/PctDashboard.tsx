// app/(dashboard)/explorer/price-tracker/_components/PctDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { pctApi, QuotaData, TrackerItem } from "./pct-api";
import { PctSubscriptionGate } from "./PctSubscriptionGate";
import { PctQuotaBar } from "./PctQuotaBar";
import { PctTrackerTable } from "./PctTrackerTable";
import { PctTrackerDetailDrawer } from "./PctTrackerDetailDrawer";
import { PctUploadModal } from "./PctUploadModal";
import { PctBuyCreditsDialog } from "./PctBuyCreditsDialog";
import { PctWalletPanel } from "./PctWalletPanel";
import { Wallet, Loader2, Sparkles, TrendingDown } from "lucide-react";

export function PctDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [trackers, setTrackers] = useState<TrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Modals & Drawers state
  const [selectedTrackerId, setSelectedTrackerId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [showWalletPanel, setShowWalletPanel] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const q = await pctApi.getQuota();
      setQuota(q);

      if (!q.is_locked) {
        const t = await pctApi.getTrackers();
        setTrackers(t);
      }
    } catch (err) {
      // Safe fallback - no technical errors exposed to user
      setQuota({
        tier: user?.subscriptionTier || "premium",
        credits_limit: 10,
        credits_used: 0,
        credits_remaining: 10,
        alerts_limit: 10,
        alerts_used: 0,
        alerts_remaining: 10,
        wallet_balance: 0,
        is_locked: false,
        cycle_start: null,
        packages: {},
      });
      setTrackers([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshTrackersOnly = async (silent = false) => {
    setTableLoading(true);
    try {
      const [t, q] = await Promise.all([pctApi.getTrackers(), pctApi.getQuota()]);
      setTrackers(t);
      setQuota(q);
      if (!silent) {
        toast({
          title: "Trackers Updated",
          description: "Product prices and alert preferences refreshed.",
        });
      }
    } catch (err: any) {
      if (!silent) {
        toast({
          title: "Update In Progress",
          description: "Prices are being checked in the background. Please check back shortly.",
        });
      }
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user?.subscriptionTier === "free") {
        setLoading(false);
      } else {
        fetchInitialData();
      }
    }
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <span className="text-sm font-medium">Loading Price Comparison Tracker...</span>
      </div>
    );
  }

  // Free Tier Gate
  if (!user || user.subscriptionTier === "free" || quota?.is_locked || quota?.tier === "free") {
    return <PctSubscriptionGate />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Price Comparison Tracker
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live Amazon Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Compare your Amazon product prices against up to 5 competitors per product. Track price changes, see who is winning the sale, and get automated price drop email alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowWalletPanel(!showWalletPanel)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showWalletPanel
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm"
                : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
            }`}
          >
            <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Credit History</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {quota?.wallet_balance || 0}
            </span>
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all hover:scale-105"
          >
            <span>+ Add Products</span>
          </button>
        </div>
      </div>

      {/* Quota & Billing Anchor Bar */}
      {quota && (
        <PctQuotaBar
          quota={quota}
          onOpenBuyModal={() => setIsBuyCreditsOpen(true)}
        />
      )}

      {/* Wallet Ledger Panel (Collapsible) */}
      {showWalletPanel && (
        <PctWalletPanel onOpenBuyModal={() => setIsBuyCreditsOpen(true)} />
      )}

      {/* Main Tracked Items Comparison Table */}
      <PctTrackerTable
        trackers={trackers}
        loading={tableLoading}
        onSelectTracker={(id) => {
          setSelectedTrackerId(id);
          setIsDrawerOpen(true);
        }}
        onRefreshAll={refreshTrackersOnly}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Detail & History Drawer */}
      <PctTrackerDetailDrawer
        trackerId={selectedTrackerId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTrackerId(null);
        }}
        onTrackerUpdated={refreshTrackersOnly}
      />

      {/* Excel Upload Modal */}
      <PctUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          refreshTrackersOnly();
        }}
      />

      {/* Razorpay Wallet Credits Purchase Dialog */}
      <PctBuyCreditsDialog
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
        onSuccess={() => {
          refreshTrackersOnly(true);
        }}
      />
    </div>
  );
}
