// app/(dashboard)/explorer/price-tracker/_components/PctQuotaBar.tsx
"use client";

import React from "react";
import { QuotaData } from "./pct-api";
import { Zap, Bell, Wallet, Plus, Crown, Sparkles, CheckCircle2 } from "lucide-react";

interface PctQuotaBarProps {
  quota: QuotaData;
  onOpenBuyModal: () => void;
}

export function PctQuotaBar({ quota, onOpenBuyModal }: PctQuotaBarProps) {
  const creditsPct =
    quota.credits_limit > 0
      ? Math.min(100, (quota.credits_used / quota.credits_limit) * 100)
      : 0;

  const alertsPct =
    quota.alerts_limit > 0
      ? Math.min(100, (quota.alerts_used / quota.alerts_limit) * 100)
      : 0;

  const creditsRemainingPct = Math.max(0, 100 - creditsPct);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Subscription Tier Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Crown className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3" />
            Active Plan
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
            Current Tier
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 capitalize tracking-tight">
            {quota.tier} Plan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracks up to 5 competitors per product
          </p>
        </div>
      </div>

      {/* 2. Monthly Credits Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-sky-500/15 dark:from-blue-500/20 dark:to-sky-500/20 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {quota.credits_remaining} of {quota.credits_limit} left
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
            Product Tracking Credits
          </span>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {quota.credits_remaining}
            </span>
            <span className="text-xs text-slate-500 font-medium">available</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${creditsRemainingPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            1 credit per tracked product row
          </p>
        </div>
      </div>

      {/* 3. Live Drop Alerts Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Bell className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Automatic Price Check
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
            Price Drop Alerts
          </span>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {quota.alerts_remaining}
            </span>
            <span className="text-xs text-slate-500 font-medium">available slots</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (quota.alerts_used / Math.max(1, quota.alerts_limit)) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            Instant email alerts on competitor price drops
          </p>
        </div>
      </div>

      {/* 4. On-Demand Wallet Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 text-white rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col justify-between border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
          <button
            onClick={onOpenBuyModal}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Top Up</span>
          </button>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
            Extra Credits
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">
              {quota.wallet_balance}
            </span>
            <span className="text-xs text-slate-400 font-medium">credits</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Never expires · Use anytime
          </p>
        </div>
      </div>
    </div>
  );
}
