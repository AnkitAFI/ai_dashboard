// app/(dashboard)/explorer/price-tracker/_components/PctWalletPanel.tsx
"use client";

import React, { useState, useEffect } from "react";
import { pctApi, WalletData } from "./pct-api";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Loader2, Clock } from "lucide-react";

interface PctWalletPanelProps {
  onOpenBuyModal: () => void;
}

export function PctWalletPanel({ onOpenBuyModal }: PctWalletPanelProps) {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await pctApi.getWallet();
      setData(res);
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Extra Credits
            </h3>
            <p className="text-xs text-slate-500">
              Extra credits for tracking products when monthly plan credits run out
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBuyModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Extra Credits</span>
          </button>
        </div>
      </div>

      {/* Balance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1 font-medium">Available Balance</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {data?.balance ?? 0} <span className="text-xs font-semibold text-slate-500">credits</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1 font-medium">Total Credits Added</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {data?.total_purchased ?? 0} <span className="text-xs font-semibold text-slate-500">credits</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1 font-medium">Total Credits Used</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {data?.total_used ?? 0} <span className="text-xs font-semibold text-slate-500">credits</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
        Credit Activity
      </h4>

      {loading ? (
        <div className="py-8 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : !data?.transactions || data.transactions.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          No credit activity recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Activity</th>
                <th className="py-2.5">Details</th>
                <th className="py-2.5">Credits</th>
                <th className="py-2.5">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.transactions.map((tx) => {
                const isPending = tx.status === "pending" || tx.status === "created";
                const isPurchase = tx.type === "PURCHASE" && !isPending;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 text-slate-500 font-mono">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                          isPending
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            : isPurchase
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {isPending ? (
                          <Clock className="w-3 h-3 text-amber-600" />
                        ) : isPurchase ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-slate-500" />
                        )}
                        {isPending
                          ? "Pending Payment"
                          : isPurchase
                          ? "Added Credits"
                          : "Used for Tracking"}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-2.5 font-bold">
                      {isPending ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          +{tx.credits} (Pending)
                        </span>
                      ) : isPurchase ? (
                        `+${tx.credits}`
                      ) : (
                        `-${tx.credits}`
                      )}
                    </td>
                    <td className="py-2.5 font-medium text-slate-600 dark:text-slate-400">
                      {tx.amount_inr
                        ? isPending
                          ? `₹${tx.amount_inr.toLocaleString("en-IN")} (Unpaid)`
                          : `₹${tx.amount_inr.toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
