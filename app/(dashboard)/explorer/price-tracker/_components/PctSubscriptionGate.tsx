// app/(dashboard)/explorer/price-tracker/_components/PctSubscriptionGate.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Lock, Zap, Shield, ArrowRight, Bell, Sparkles } from "lucide-react";

export function PctSubscriptionGate() {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Lock className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
        Price Comparison Tracker
      </h1>

      <p className="text-slate-600 dark:text-slate-400 max-w-lg mb-4 text-base">
        Track up to 5 competitor ASINs per product, monitor Amazon buy-box fluctuations 24/7,
        and receive instant email drop alerts with automated notifications.
      </p>

      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 mb-8 border border-slate-200 dark:border-slate-700">
        <span>Current Plan:</span>
        <span className="capitalize text-blue-600 dark:text-blue-400 font-bold">{user?.subscriptionTier || "Free"}</span>
        <span className="text-slate-400">·</span>
        <span className="text-amber-600 dark:text-amber-400 font-medium">Requires Starter, Basic, Premium, or Enterprise</span>
      </div>

      {/* Tier Features Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-8 text-left">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-semibold text-slate-800 dark:text-slate-200">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Starter Tier</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            2 Monthly Credits + 2 Live Price Drop Alerts
          </p>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
            ₹49 / extra credit
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border-2 border-blue-500 shadow-md relative">
          <span className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Popular
          </span>
          <div className="flex items-center gap-2 mb-2 font-semibold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Premium Tier</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            10 Monthly Credits + 10 Live Price Drop Alerts
          </p>
          <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono">
            Monthly Quota
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-semibold text-slate-800 dark:text-slate-200">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span>Enterprise</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            20 Monthly Credits + 20 Live Price Drop Alerts
          </p>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
            Maximum Quota
          </span>
        </div>
      </div>

      <Link
        href="/subscription"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg"
      >
        <span>Upgrade Subscription to Unlock</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
