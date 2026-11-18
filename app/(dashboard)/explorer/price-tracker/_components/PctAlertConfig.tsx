// app/(dashboard)/explorer/price-tracker/_components/PctAlertConfig.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { pctApi } from "./pct-api";
import { Bell, Mail, Shield, Check, Loader2, AlertCircle } from "lucide-react";

interface CompetitorItem {
  asin: string;
  title: string;
  price: number | null;
  alert_active: boolean;
}

interface PctAlertConfigProps {
  trackerId: number;
  initialAlertEnabled: boolean;
  initialThreshold: number;
  initialEmails: string[];
  competitors: CompetitorItem[];
  onSaved: () => void;
}

export function PctAlertConfig({
  trackerId,
  initialAlertEnabled,
  initialThreshold,
  initialEmails,
  competitors,
  onSaved,
}: PctAlertConfigProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alertEnabled, setAlertEnabled] = useState(initialAlertEnabled);
  const [threshold, setThreshold] = useState(initialThreshold || 5.0);
  const [email, setEmail] = useState<string>(
    initialEmails.length > 0 ? initialEmails[0] : (user?.email || "")
  );

  // Track which competitor ASINs have alerts enabled
  const [activeComps, setActiveComps] = useState<Set<string>>(
    new Set(competitors.filter((c) => c.alert_active).map((c) => c.asin))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleCompetitorAlert = (asin: string) => {
    const next = new Set(activeComps);
    if (next.has(asin)) {
      next.delete(asin);
    } else {
      next.add(asin);
    }
    setActiveComps(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);

    const trimmed = email.trim();
    const validEmails = trimmed && trimmed.includes("@") ? [trimmed] : (user?.email ? [user.email] : []);

    try {
      await pctApi.updateAlert(trackerId, {
        alert_enabled: alertEnabled,
        alert_threshold: Number(threshold),
        alert_emails: validEmails,
        alert_competitor_asins: Array.from(activeComps),
      });

      setSuccess(true);
      toast({
        title: "Alert Settings Saved",
        description: `Alerts updated for ${activeComps.size} competitor(s) at ${threshold}% threshold.`,
      });
      setTimeout(() => setSuccess(false), 3000);
      onSaved();
    } catch (err: any) {
      setError(err.message || "Failed to update alert configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Master Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>Enable Price Drop Email Alerts</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Receive automated real-time email alerts when competitor prices drop below threshold
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={alertEnabled}
            onChange={(e) => setAlertEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Threshold Slider */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Price Drop Alert Threshold (% Cheaper)
          </label>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
            {threshold}% cheaper
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          step="0.5"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          disabled={!alertEnabled}
          className="w-full accent-blue-600 cursor-pointer disabled:opacity-40"
        />
        <p className="text-[11px] text-slate-500 mt-1">
          Example: If your product is ₹1,000, an alert fires if any tracked competitor drops to ₹
          {(1000 * (1 - threshold / 100)).toFixed(0)} or below.
        </p>
      </div>

      {/* Per-Competitor Toggles */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
          Assigned Competitors for Alerts
        </h4>
        <p className="text-[11px] text-slate-500 mb-3">
          Turn ON or OFF alerts for individual competitors in this tracking row.
        </p>

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {competitors.map((c) => {
            const isTurnedOn = activeComps.has(c.asin);
            return (
              <div
                key={c.asin}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs"
              >
                <div className="truncate mr-3">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.asin}
                  </span>{" "}
                  <span className="text-slate-500">
                    ({c.price ? `₹${c.price.toLocaleString("en-IN")}` : "No price"})
                  </span>
                  <div className="text-[11px] text-slate-400 truncate max-w-xs">{c.title}</div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCompetitorAlert(c.asin)}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    isTurnedOn
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {isTurnedOn ? "🔔 Alert ON" : "🔕 Alert OFF"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recipient Emails */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
          <Mail className="w-3.5 h-3.5 text-slate-500" />
          <span>Alert Recipient Email</span>
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alerts@yourcompany.com"
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <p className="text-[11px] text-slate-500 mt-2">
          Your email address is securely stored and will only be used for price drop alerts.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Alert settings saved successfully!</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Alert Settings</span>
          )}
        </button>
      </div>
    </form>
  );
}
