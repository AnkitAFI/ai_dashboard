"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Clock, RefreshCw, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";

interface SyncPendingBannerProps {
  connectedAt: string | null;
  syncStatus: string;
  onSyncComplete: () => void;
  pollFn: () => Promise<string>;
  featureName: string;
}

const TOTAL_SYNC_HOURS = 24;

function getElapsedMinutes(connectedAt: string | null): number {
  if (!connectedAt) return 0;
  const connected = new Date(connectedAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - connected) / 60000));
}

function formatElapsed(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h ago`;
  return `${hours}h ${mins}m ago`;
}

function getProgressPercent(minutes: number): number {
  const totalMinutes = TOTAL_SYNC_HOURS * 60;
  const raw = Math.min(minutes / totalMinutes, 1);
  return Math.max(3, Math.min(95, Math.round(Math.sqrt(raw) * 95)));
}

function getEstimatedLabel(minutes: number): string {
  const remaining = Math.max(0, TOTAL_SYNC_HOURS * 60 - minutes);
  if (remaining <= 5) return "almost done";
  if (remaining < 60) return `~${Math.ceil(remaining / 10) * 10} min left`;
  const hours = Math.ceil(remaining / 60);
  return hours === 1 ? "~1 hour left" : `up to ${hours} hours left`;
}

const SYNC_STEPS = [
  { at: 0,  label: "Authenticating with Amazon SP-API" },
  { at: 5,  label: "Fetching your order history" },
  { at: 20, label: "Pulling inventory & catalog data" },
  { at: 40, label: "Calculating financial metrics" },
  { at: 70, label: "Building profitability models" },
  { at: 90, label: "Finalising your dashboard data" },
];

function getCurrentStep(progress: number): string {
  let current = SYNC_STEPS[0].label;
  for (const step of SYNC_STEPS) {
    if (progress >= step.at) current = step.label;
  }
  return current;
}

export default function SyncPendingBanner({ connectedAt, syncStatus, onSyncComplete, pollFn, featureName }: SyncPendingBannerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [elapsed, setElapsed] = useState(() => getElapsedMinutes(connectedAt));
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(getElapsedMinutes(connectedAt)), 30_000);
    return () => clearInterval(interval);
  }, [connectedAt]);

  const poll = useCallback(async () => {
    try {
      const status = await pollFn();
      if (status === "COMPLETED") {
        setJustCompleted(true);
        setTimeout(() => onSyncComplete(), 2000);
      }
    } catch (_) {}
  }, [pollFn, onSyncComplete]);

  useEffect(() => {
    const interval = setInterval(poll, 45_000);
    return () => clearInterval(interval);
  }, [poll]);

  const progress = getProgressPercent(elapsed);
  const currentStep = getCurrentStep(progress);
  const estimatedLabel = getEstimatedLabel(elapsed);

  if (justCompleted) {
    return (
      <div className={`mt-8 rounded-2xl border p-12 flex flex-col items-center justify-center text-center gap-4 ${isDark ? "bg-emerald-950/30 border-emerald-800" : "bg-emerald-50 border-emerald-200"}`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-emerald-900/60" : "bg-emerald-100"}`}>
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Sync Complete!</h2>
        <p className="text-muted-foreground">Loading your {featureName}...</p>
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className={`mt-8 rounded-2xl border ${isDark ? "bg-gradient-to-br from-slate-900 to-indigo-950/20 border-indigo-900/40" : "bg-gradient-to-br from-white to-indigo-50/60 border-indigo-100"}`}>
      <div className="flex flex-col items-center px-8 pt-10 pb-6 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-lg ${isDark ? "bg-indigo-900/40" : "bg-indigo-100"}`}>
          <Loader2 className={`w-8 h-8 animate-spin ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Syncing Your {featureName.charAt(0).toUpperCase() + featureName.slice(1)}</h2>
        <p className={`text-sm max-w-md ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Your Amazon Seller account is connected and we are pulling in your data.
          First-time syncs can take up to 24 hours — you will see data here as soon as it is ready.
        </p>
      </div>

      <div className="px-8 pb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Sync Progress</span>
          <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>{progress}%</span>
        </div>
        <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <p className={`text-xs mt-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{currentStep}...</p>
      </div>

      <div className={`mx-8 mb-6 grid grid-cols-3 divide-x rounded-xl border ${isDark ? "bg-slate-900/60 border-slate-800 divide-slate-800" : "bg-white border-slate-100 divide-slate-100"}`}>
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>Status</span>
          </div>
          <p className="text-sm font-bold text-emerald-500">Connected</p>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Clock className={`w-3 h-3 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>Connected</span>
          </div>
          <p className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{formatElapsed(elapsed)}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <RefreshCw className={`w-3 h-3 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>ETA</span>
          </div>
          <p className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{estimatedLabel}</p>
        </div>
      </div>

      <div className={`mx-8 mb-8 p-4 rounded-xl text-sm ${isDark ? "bg-indigo-950/30 border border-indigo-900/40 text-indigo-300" : "bg-indigo-50 border border-indigo-100 text-indigo-700"}`}>
        <p className="font-semibold mb-2">What happens during sync?</p>
        <ul className={`space-y-1.5 text-xs list-disc list-inside ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          <li>We fetch up to 12 months of orders, refunds, and inventory events from Amazon</li>
          <li>Amazon rate-limits access — we process your data in batches to stay compliant</li>
          <li>This page checks automatically every 45 seconds and will update when ready</li>
          <li>You do not need to keep this tab open — come back anytime</li>
        </ul>
      </div>
    </div>
  );
}
