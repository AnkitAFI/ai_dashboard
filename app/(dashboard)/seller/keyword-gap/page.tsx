"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSessionState } from "@/hooks/use-session-state";
import { API_BASE_URL } from "@/lib/config";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import {
  Lock, Crown, RefreshCw, Menu, X, Package,
  Search, TrendingUp, CheckCircle, AlertTriangle,
  Zap, Target, BarChart2, ChevronDown, ChevronUp,
  Lightbulb, FileText, Star, ArrowRight, Info,
  Sparkles, Eye, EyeOff, Filter, Layers, Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSelectedProduct } from "@/lib/selected-product-context";

const BASE_URL = API_BASE_URL;

// ── Cluster icon + colour map ─────────────────────────────────────────────────
const CLUSTER_META: Record<string, { color: string; colorDark: string; bg: string; bgDark: string; border: string; borderDark: string; emoji: string }> = {
  "Speed & Performance":   { color: "text-red-600",    colorDark: "text-red-400",    bg: "bg-red-50",    bgDark: "bg-red-900/30",    border: "border-red-200",    borderDark: "border-red-800/50",    emoji: "⚡" },
  "Storage Capacity":      { color: "text-blue-600",   colorDark: "text-blue-400",   bg: "bg-blue-50",   bgDark: "bg-blue-900/30",   border: "border-blue-200",   borderDark: "border-blue-800/50",   emoji: "💾" },
  "Compatibility":         { color: "text-violet-600", colorDark: "text-violet-400", bg: "bg-violet-50", bgDark: "bg-violet-900/30", border: "border-violet-200", borderDark: "border-violet-800/50", emoji: "🔌" },
  "Durability & Build":    { color: "text-emerald-600",colorDark: "text-emerald-400",bg: "bg-emerald-50",bgDark: "bg-emerald-900/30",border: "border-emerald-200",borderDark: "border-emerald-800/50",emoji: "🛡️" },
  "Format & Standard":     { color: "text-amber-600",  colorDark: "text-amber-400",  bg: "bg-amber-50",  bgDark: "bg-amber-900/30",  border: "border-amber-200",  borderDark: "border-amber-800/50",  emoji: "📋" },
  "Brand & Certification": { color: "text-sky-600",    colorDark: "text-sky-400",    bg: "bg-sky-50",    bgDark: "bg-sky-900/30",    border: "border-sky-200",    borderDark: "border-sky-800/50",    emoji: "✅" },
  "Use Case":              { color: "text-pink-600",   colorDark: "text-pink-400",   bg: "bg-pink-50",   bgDark: "bg-pink-900/30",   border: "border-pink-200",   borderDark: "border-pink-800/50",   emoji: "🎯" },
  "Gap Keywords":          { color: "text-slate-600",  colorDark: "text-slate-400",  bg: "bg-slate-50",  bgDark: "bg-slate-800",     border: "border-slate-200",  borderDark: "border-slate-700",     emoji: "🔑" },
  "Other":                 { color: "text-slate-500",  colorDark: "text-slate-500",  bg: "bg-slate-50",  bgDark: "bg-slate-800",     border: "border-slate-100",  borderDark: "border-slate-700",     emoji: "📦" },
};

function clusterMeta(name: string) {
  return CLUSTER_META[name] || CLUSTER_META["Other"];
}

// ── Placement badge ───────────────────────────────────────────────────────────
function PlacementBadge({ placement, isDark }: { placement: string; isDark: boolean }) {
  const map: Record<string, string> = {
    title:   isDark ? "bg-violet-900/30 text-violet-400 border-violet-800/50" : "bg-violet-100 text-violet-700 border-violet-200",
    bullets: isDark ? "bg-amber-900/30 text-amber-400 border-amber-800/50" : "bg-amber-100 text-amber-700 border-amber-200",
    backend: isDark ? "bg-sky-900/30 text-sky-400 border-sky-800/50" : "bg-sky-100 text-sky-700 border-sky-200",
  };
  const label: Record<string, string> = {
    title:   "→ Title",
    bullets: "→ Bullets",
    backend: "→ Backend",
  };
  const key = (placement || "backend").toLowerCase();
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[key] || map.backend}`}>
      {label[key] || "→ Backend"}
    </span>
  );
}

// ── Semantic distance indicator ───────────────────────────────────────────────
function SemanticBadge({ sim, isDark }: { sim: number; isDark: boolean }) {
  if (sim == null) return null;
  if (sim >= 0.5)
    return <span title="Semantically close — easy to add" className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>≈ Similar</span>;
  if (sim >= 0.25)
    return <span title="Partially related concept" className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isDark ? 'text-amber-400 bg-amber-900/30 border-amber-800/50' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>~ Partial</span>;
  return <span title="Genuinely new concept — high discovery value" className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isDark ? 'text-red-400 bg-red-900/30 border-red-800/50' : 'text-red-600 bg-red-50 border-red-200'}`}>✦ New concept</span>;
}

// ── Tier Gate ─────────────────────────────────────────────────────────────────
function TierGate({ tier, feature, isDark }: { tier: "basic" | "premium" | "enterprise"; feature: string; isDark: boolean }) {
  const router = useRouter();
  return (
    <div className={`absolute inset-0 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3 ${isDark ? 'bg-slate-900/85' : 'bg-white/88'}`}>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "bg-blue-900/50" : "bg-blue-50" : isDark ? "bg-amber-900/50" : "bg-amber-50"}`}>
        <Lock className={`w-5 h-5 ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "text-blue-400" : "text-blue-500" : isDark ? "text-amber-400" : "text-amber-500"}`} />
      </div>
      <div className="text-center px-4">
        <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{feature}</p>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
          {tier === "premium" ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}
        </p>
      </div>
      <button
        onClick={() => router.push("/subscription")}
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${tier === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}
      >
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

// ── Coverage Score Ring ───────────────────────────────────────────────────────
function CoverageRing({ score, isDark }: { score: number; isDark: boolean }) {
  const r = 32, circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Strong" : score >= 40 ? "Moderate" : "Weak";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke={isDark ? "#334155" : "#f1f5f9"} strokeWidth="7" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{score}</span>
          <span className={`text-[9px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/100</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label} Coverage</span>
    </div>
  );
}

// ── Priority Pill ─────────────────────────────────────────────────────────────
function PriorityPill({ priority, isDark }: { priority: string; isDark: boolean }) {
  const map: Record<string, string> = {
    High:   isDark ? "bg-red-900/30 text-red-400 border-red-800/50" : "bg-red-50 text-red-600 border-red-200",
    Medium: isDark ? "bg-amber-900/30 text-amber-400 border-amber-800/50" : "bg-amber-50 text-amber-600 border-amber-200",
    Low:    isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-50 text-slate-500 border-slate-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[priority] || map.Low}`}>
      {priority}
    </span>
  );
}

// ── Opportunity Score Bar ─────────────────────────────────────────────────────
function OpportunityBar({ score, keyword, reason, add_to, is_spec, isDark }: {
  score: number; keyword: string; reason: string; add_to?: string; is_spec?: boolean; isDark: boolean;
}) {
  const color = score >= 8 ? "#ef4444" : score >= 6 ? "#f59e0b" : score >= 4 ? "#3b82f6" : "#94a3b8";
  return (
    <div className={`flex items-start gap-3 py-2.5 border-b last:border-0 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-sm font-bold font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{keyword}</span>
          <span className="text-xs font-black tabular-nums" style={{ color }}>{score}/10</span>
          {add_to && <PlacementBadge placement={add_to} isDark={isDark} />}
          {is_spec && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isDark ? 'text-violet-400 bg-violet-900/30 border-violet-800/50' : 'text-violet-600 bg-violet-50 border-violet-200'}`}>SPEC</span>
          )}
        </div>
        <div className={`h-1.5 rounded-full overflow-hidden mb-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score * 10}%`, background: color }}
          />
        </div>
        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{reason}</p>
      </div>
    </div>
  );
}

// ── Keyword Pill ──────────────────────────────────────────────────────────────
function KwPill({ kw, variant, isDark }: { kw: string; variant: "gap" | "shared" | "unique" | "review"; isDark: boolean }) {
  const styles = {
    gap:    isDark ? "bg-red-900/30 text-red-400 border-red-800/50" : "bg-red-50 text-red-700 border-red-200",
    shared: isDark ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-700 border-emerald-200",
    unique: isDark ? "bg-purple-900/30 text-purple-400 border-purple-800/50" : "bg-purple-50 text-purple-700 border-purple-200",
    review: isDark ? "bg-blue-900/30 text-blue-400 border-blue-800/50" : "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[11px] font-semibold font-mono ${styles[variant]}`}>
      {kw}
    </span>
  );
}

// ── Heatmap Row ───────────────────────────────────────────────────────────────
function HeatmapRow({ item, maxFreq, isDark }: { item: any; maxFreq: number; isDark: boolean }) {
  const pct  = Math.max((item.freq / maxFreq) * 100, 3);
  const color = item.in_yours ? "#0ea5e9" : item.freq / maxFreq >= 0.5 ? "#ef4444" : "#f59e0b";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className={`text-xs font-mono w-36 shrink-0 truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.keyword}</span>
      <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={`text-xs w-14 text-right shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {item.freq} title{item.freq !== 1 ? "s" : ""}
      </span>
      <span className="w-16 text-right shrink-0">
        {item.in_yours
          ? <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDark ? 'text-sky-400 bg-sky-900/30' : 'text-sky-600 bg-sky-50'}`}>✓ Yours</span>
          : <span className={`text-[10px] font-semibold ${isDark ? 'text-red-500' : 'text-red-400'}`}>Missing</span>
        }
      </span>
    </div>
  );
}

// ── Expandable Section ────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = true, count, accent, isDark }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent || (isDark ? "bg-sky-900/30" : "bg-sky-50")}`}>
            <Icon className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          </div>
          <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{title}</span>
          {count != null && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-400 bg-slate-100'}`}>{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ── Semantic Gap Clusters ────────────────────────────────────────────────
function GapClusters({ clusters, isDark }: { clusters: Record<string, string[]>; isDark: boolean }) {
  const entries = Object.entries(clusters).filter(([, kws]) => kws.length > 0);
  if (entries.length === 0) return null;

  return (
    <Section title="Semantic Keyword Clusters" icon={Layers} defaultOpen={true} accent={isDark ? "bg-violet-900/30" : "bg-violet-50"} isDark={isDark}>
      <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
        Gap keywords grouped by concept. Each cluster represents a content area your listing is missing.
        Focus on clusters with the most keywords first.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entries
          .sort(([, a], [, b]) => b.length - a.length)
          .map(([name, kws]) => {
            const meta = clusterMeta(name);
            return (
              <div key={name} className={`rounded-xl border p-3 ${isDark ? meta.bgDark : meta.bg} ${isDark ? meta.borderDark : meta.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black flex items-center gap-1.5 ${isDark ? meta.colorDark : meta.color}`}>
                    <span>{meta.emoji}</span> {name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDark ? 'bg-slate-900/50' : 'bg-white/70'} ${isDark ? meta.borderDark : meta.border} ${isDark ? meta.colorDark : meta.color}`}>
                    {kws.length} keyword{kws.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {kws.slice(0, 6).map((kw, i) => (
                    <span key={i} className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded-md border ${isDark ? 'bg-slate-900/60' : 'bg-white/60'} ${isDark ? meta.borderDark : meta.border} ${isDark ? meta.colorDark : meta.color}`}>
                      {kw}
                    </span>
                  ))}
                  {kws.length > 6 && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-slate-900/40' : 'bg-white/40'} ${isDark ? meta.colorDark : meta.color}`}>
                      +{kws.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </Section>
  );
}

// ── Gap Keywords Table ───────────────────
function GapKeywordsTable({ items, isDark }: { items: any[]; isDark: boolean }) {
  const [filter, setFilter]       = useState<"All" | "High" | "Medium" | "Low">("All");
  const [showBigrams, setShowBigrams] = useState(true);
  const [showSemantic, setShowSemantic] = useState(true);

  const filtered = useMemo(() => {
    return items.filter((k) => {
      if (filter !== "All" && k.priority !== filter) return false;
      if (!showBigrams && k.is_bigram) return false;
      return true;
    });
  }, [items, filter, showBigrams]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["All", "High", "Medium", "Low"] as const).map((f) => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
              filter === f
                ? f === "High" ? "bg-red-500 text-white border-red-500"
                : f === "Medium" ? "bg-amber-400 text-white border-amber-400"
                : f === "All" ? "bg-sky-500 text-white border-sky-500"
                : "bg-slate-500 text-white border-slate-500"
                : isDark ? "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowSemantic(!showSemantic)}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
              showSemantic ? isDark ? "bg-violet-900/30 text-violet-400 border-violet-800/50" : "bg-violet-50 text-violet-600 border-violet-200" : isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            <Cpu className="w-3 h-3" /> Semantic
          </button>
          <button
            onClick={() => setShowBigrams(!showBigrams)}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
              showBigrams ? isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-white text-slate-600 border-slate-200" : isDark ? "bg-slate-900 text-slate-500 border-slate-800" : "bg-slate-100 text-slate-400 border-slate-200"
            }`}
          >
            {showBigrams ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            2-word
          </button>
        </div>
      </div>

      {/* Legend for semantic badges */}
      {showSemantic && (
        <div className={`flex flex-wrap gap-2 mb-3 p-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <span className={`text-[10px] font-semibold mr-1 self-center ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Semantic distance:</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>≈ Similar</span>
          <span className={`text-[9px] self-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>easy to rephrase into title</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isDark ? 'text-red-400 bg-red-900/30 border-red-800/50' : 'text-red-600 bg-red-50 border-red-200'}`}>✦ New concept</span>
          <span className={`text-[9px] self-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>genuinely missing content area</span>
        </div>
      )}

      {/* Table */}
      <div className="space-y-1">
        {filtered.slice(0, 30).map((item, i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors flex-wrap ${
            item.priority === "High" ? isDark ? "bg-red-900/10 border border-red-900/30" : "bg-red-50 border border-red-100" : isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-slate-50 border border-slate-100"
          }`}>
            <span className={`text-xs font-mono font-bold flex-1 min-w-0 truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {item.keyword}
              {item.is_partial && (
                <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded font-semibold ${isDark ? 'text-amber-400 bg-amber-900/30' : 'text-amber-600 bg-amber-50'}`}>words exist</span>
              )}
            </span>
            <span className={`text-xs shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{item.comp_freq} comp</span>
            {showSemantic && item.semantic_sim_to_yours != null && (
              <SemanticBadge sim={item.semantic_sim_to_yours} isDark={isDark} />
            )}
            <PriorityPill priority={item.priority} isDark={isDark} />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className={`text-sm text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No keywords match this filter.</p>
        )}
        {filtered.length > 30 && (
          <p className={`text-xs text-center pt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Showing top 30 of {filtered.length} — narrow filter to see more
          </p>
        )}
      </div>
    </div>
  );
}

function KeywordGapContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const { selected } = useSelectedProduct();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const asin     = searchParams.get("asin")      || selected?.asin     || "";
  const sellerId = searchParams.get("seller_id") || selected?.sellerId || user?.seller_id || "";

  const [data, setData]         = useSessionState<any>("seller_keyword_gap_data", null);
  const [lastFetchedAsin, setLastFetchedAsin] = useSessionState<string>("seller_keyword_gap_asin", "");
  const [loading, setLoading]   = useState(false);

  const tier      = data?.tier || user?.subscriptionTier || "free";
  const isBasic   = tier === "basic" || tier === "premium" || tier === "enterprise";
  const isPremium = tier === "premium" || tier === "enterprise";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!asin || !sellerId) return;
    if (data && lastFetchedAsin === asin) return; // Already have data for this ASIN
    
    setLoading(true);
    const params = new URLSearchParams({ asin, seller_id: sellerId });
    fetch(`${BASE_URL}/api/keyword-gap/analyse?${params}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          setData(d);
          setLastFetchedAsin(asin);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin, sellerId, user?.email, data, lastFetchedAsin]);

  const gapKeywords    = data?.gap_keywords    || [];
  const sharedKeywords = data?.shared_keywords || [];
  const uniqueKeywords = data?.unique_keywords || [];
  const reviewKeywords = data?.review_keywords || [];
  const heatmap        = data?.heatmap         || [];
  const aiScores       = data?.ai_opportunity_scores || [];
  const actionPlan     = data?.ai_action_plan  || [];
  const competitors    = data?.competitors_analysed || [];
  const gapClusters    = data?.gap_clusters    || {};
  const maxHeatFreq    = heatmap.length ? Math.max(...heatmap.map((h: any) => h.freq)) : 1;
  const embeddingModel = data?.embedding_model || null;

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
        <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-sky-900/50' : 'border-sky-100/80'}`}>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-sky-100'}`}>
              <Menu className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-sky-900'}`} />
            </button>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
              <Search className={`w-6 h-6 animate-pulse ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                {t('sellerPages.keywordGapTitle', 'Keyword Gap Analysis')}
              </h1>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('sellerPages.keywordGapSubtitle', 'Discover keywords your competitors use that are absent from your listing.')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {embeddingModel && embeddingModel !== "jaccard_fallback" && (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border ${isDark ? 'text-violet-400 bg-violet-900/30 border-violet-800/50' : 'text-violet-600 bg-violet-50 border-violet-200'}`}>
                <Cpu className="w-3 h-3" /> Semantic AI
              </span>
            )}
            <Badge className={`text-xs font-bold ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700" : tier === "basic" ? isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700" : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
              {tier.toUpperCase()}
            </Badge>
            {!isPremium && (
              <button onClick={() => router.push("/subscription")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all">
                <Crown className="w-3 h-3" /> Upgrade
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 py-6 space-y-5">
          {!asin && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-sky-900/30' : 'bg-sky-100'}`}>
                <Search className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{t('sellerPages.noProductSelected', 'No product selected')}</p>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{t('sellerPages.keywordGapSub', 'Select a product from My Products to analyse its keyword gaps.')}</p>
              </div>
              <button onClick={() => router.push("/seller/my-products")}
                className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors">
                {t('sellerPages.goToMyProducts', 'Go to My Products')}
              </button>
            </div>
          )}

          {asin && loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
              <div className="text-center">
                <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Analysing keyword gaps…</p>
                <p className={`text-xs animate-pulse mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>We are analyzing the data. This may take 1–2 minutes.</p>
              </div>
            </div>
          )}

          {asin && !loading && data && (
            <>
              {/* Product card */}
              <div className={`rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className={`w-16 h-16 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  {data.product_photo
                    ? <img src={data.product_photo} alt={data.product_title} className="w-full h-full object-contain p-1" />
                    : <Package className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-base line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{data.product_title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{data.asin}</span>
                    {data.is_prime && <Badge className={`text-[10px] px-1.5 py-0 ${isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>PRIME</Badge>}
                    {data.is_best_seller && <Badge className={`text-[10px] px-1.5 py-0 ${isDark ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>BEST SELLER</Badge>}
                    {data.data_quality === "live" && (
                      <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {data.competitor_count} competitors analysed
                      </span>
                    )}
                    {data.data_quality === "limited" && (
                      <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'text-amber-400 bg-amber-900/30 border-amber-800/50' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                        <AlertTriangle className="w-3 h-3" /> Limited data ({data.competitor_count})
                      </span>
                    )}
                    {embeddingModel && embeddingModel !== "jaccard_fallback" && (
                      <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'text-violet-400 bg-violet-900/30 border-violet-800/50' : 'text-violet-600 bg-violet-50 border-violet-200'}`}>
                        <Cpu className="w-3 h-3" /> Semantic similarity
                      </span>
                    )}
                  </div>
                </div>

                {isBasic && data.coverage_score != null && (
                  <div className="flex-shrink-0">
                    <CoverageRing score={data.coverage_score} isDark={isDark} />
                  </div>
                )}

                {!isBasic && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-3xl font-black text-red-500">{data.gap_count_teaser ?? "—"}</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>keyword gaps found</p>
                    <button onClick={() => router.push("/subscription")}
                      className={`mt-2 text-xs font-bold px-3 py-1 rounded-full border transition-colors ${isDark ? 'text-amber-400 bg-amber-900/30 border-amber-800/50 hover:bg-amber-900/50' : 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100'}`}>
                      Unlock all →
                    </button>
                  </div>
                )}
              </div>

              {/* Your keywords */}
              <Section title="Your Title Keywords" icon={FileText} count={data.your_keyword_count} defaultOpen={true} isDark={isDark}>
                <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Every keyword extracted from your current product title</p>
                <div className="flex flex-wrap gap-1.5">
                  {(data.your_keywords || []).map((kw: string, i: number) => (
                    <KwPill key={i} kw={kw} variant="shared" isDark={isDark} />
                  ))}
                  {(data.your_keywords || []).length === 0 && (
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No keywords found in title.</p>
                  )}
                </div>
              </Section>

              {/* teaser gate */}
              {!isBasic && (
                <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <TierGate tier="basic" feature="Full Keyword Gap Analysis" isDark={isDark} />
                  <div className="blur-sm pointer-events-none">
                    <div className="grid grid-cols-3 gap-4 mb-5">
                      {[
                        { label: "Gap Keywords", value: data.gap_count_teaser ?? "—", color: "text-red-500" },
                        { label: "Coverage Score", value: "—/100", color: "text-amber-500" },
                        { label: "Competitors Scanned", value: "—", color: isDark ? "text-sky-400" : "text-sky-600" },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-xl p-3 text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {["memory card", "high speed", "4k uhd", "class 10", "waterproof"].map((kw, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${isDark ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-100'}`}>
                          <span className={`text-xs font-mono font-bold flex-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{kw}</span>
                          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>3 competitors</span>
                          <PriorityPill priority="High" isDark={isDark} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats bar */}
              {isBasic && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Gap Keywords",    value: String(data.gap_count_teaser ?? "—"), sub: "not in your title", color: isDark ? "text-red-400" : "text-red-500" },
                    { label: "Shared Keywords", value: String(sharedKeywords.length),        sub: "matching competitors", color: isDark ? "text-emerald-400" : "text-emerald-600" },
                    { label: "Your Unique KWs", value: String(uniqueKeywords.length),        sub: "only in your title", color: isDark ? "text-purple-400" : "text-purple-600" },
                    { label: "Coverage Score",  value: `${data.coverage_score ?? "—"}/100`,  sub: "vs top 40 competitor KWs", color: isDark ? "text-sky-400" : "text-sky-600" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-2xl p-4 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{s.label}</p>
                      <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.sub}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Gap keywords */}
              {isBasic && (
                <Section title="Missing Keywords (Gap)" icon={AlertTriangle} count={gapKeywords.length}
                  accent={isDark ? "bg-red-900/30" : "bg-red-50"} defaultOpen={true} isDark={isDark}>
                  <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    Keywords your competitors use that are absent from your title.
                    <span className={`ml-1 font-semibold ${isDark ? 'text-red-400' : 'text-red-500'}`}>Red = High priority</span> (50%+ of competitors).
                    Semantic badges show whether the concept is new or just rephrased.
                  </p>
                  {gapKeywords.length > 0
                    ? <GapKeywordsTable items={gapKeywords} isDark={isDark} />
                    : <p className={`text-sm text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No gap keywords — excellent coverage!</p>
                  }
                </Section>
              )}

              {/* Semantic Gap Clusters */}
              {isBasic && Object.keys(gapClusters).length > 0 && (
                <GapClusters clusters={gapClusters} isDark={isDark} />
              )}

              {/* Keyword heatmap */}
              {isBasic && (
                <Section title="Competitor Keyword Heatmap" icon={BarChart2} defaultOpen={false} isDark={isDark}>
                  <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    How often each keyword appears across competitor titles.
                    <span className={`ml-1 font-semibold ${isDark ? 'text-sky-400' : 'text-sky-500'}`}>Blue = in your title</span>,
                    <span className={`ml-1 font-semibold ${isDark ? 'text-red-400' : 'text-red-500'}`}>Red = high-frequency gap</span>.
                  </p>
                  <div className="space-y-0.5 max-h-80 overflow-y-auto pr-1">
                    {heatmap.map((item: any, i: number) => (
                      <HeatmapRow key={i} item={item} maxFreq={maxHeatFreq} isDark={isDark} />
                    ))}
                    {heatmap.length === 0 && <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No heatmap data.</p>}
                  </div>
                </Section>
              )}

              {/* Shared + Unique */}
              {isBasic && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <Section title="Shared Keywords" icon={CheckCircle} count={sharedKeywords.length} accent={isDark ? "bg-emerald-900/30" : "bg-emerald-50"} defaultOpen={false} isDark={isDark}>
                    <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Keywords you share with competitors — good coverage here.</p>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {sharedKeywords.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-1">
                          <KwPill kw={s.keyword} variant="shared" isDark={isDark} />
                          {s.comp_freq > 1 && <span className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>×{s.comp_freq}</span>}
                        </div>
                      ))}
                      {sharedKeywords.length === 0 && <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>None found.</p>}
                    </div>
                  </Section>

                  <Section title="Your Unique Keywords" icon={Star} count={uniqueKeywords.length} accent={isDark ? "bg-purple-900/30" : "bg-purple-50"} defaultOpen={false} isDark={isDark}>
                    <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Keywords only in your title — your differentiators. Keep them.</p>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {uniqueKeywords.map((kw: string, i: number) => (
                        <KwPill key={i} kw={kw} variant="unique" isDark={isDark} />
                      ))}
                      {uniqueKeywords.length === 0 && <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Closely aligned with competitors.</p>}
                    </div>
                  </Section>
                </div>
              )}

              {/* Competitors analysed */}
              {isBasic && competitors && (
                <Section title="Competitors Analysed" icon={Eye} count={competitors.length} defaultOpen={false} isDark={isDark}>
                  <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    Products ranked by semantic similarity to your title.
                    {embeddingModel && embeddingModel !== "jaccard_fallback" &&
                      <span className={`ml-1 font-semibold ${isDark ? 'text-violet-400' : 'text-violet-500'}`}>Scores use AI embeddings.</span>
                    }
                  </p>
                  <div className="space-y-2">
                    {competitors.map((c: any, i: number) => (
                      <div key={i} className={`flex items-center gap-3 p-3 border rounded-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                          {c.photo
                            ? <img src={c.photo} alt="" className="w-full h-full object-contain p-0.5" />
                            : <Package className={`w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.asin}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              c.similarity >= 0.5 ? isDark ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : c.similarity >= 0.3 ? isDark ? "bg-amber-900/30 text-amber-400 border-amber-800/50" : "bg-amber-50 text-amber-700 border-amber-200"
                              : isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}>
                              {Math.round(c.similarity * 100)}% match
                            </span>
                            {c.is_prime && <span className={`text-[10px] font-bold px-1 rounded ${isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50'}`}>P</span>}
                          </div>
                        </div>
                        {c.star_rating && (
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-amber-500">{c.star_rating}★</p>
                            {c.num_ratings && <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.num_ratings.toLocaleString()}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                    {competitors.length === 0 && (
                      <div className={`p-4 text-center rounded-xl border border-dashed ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                        <p className="text-xs">No direct competitors found matching your specific product keywords.</p>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Review keywords */}
              <div className={`relative rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {!isPremium && <TierGate tier="premium" feature="Customer Review Keyword Mining" isDark={isDark} />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                      <Lightbulb className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                    </div>
                    <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Customer Review Keyword Mining</span>
                    {isPremium && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-400 bg-slate-100'}`}>{reviewKeywords.length}</span>}
                  </div>
                  <div className="px-5 pb-5 pt-3">
                    <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                      Keywords your customers actually use in reviews — often missed in titles but highly converting.
                    </p>
                    {reviewKeywords.length > 0 ? (
                      <div className="space-y-2">
                        {reviewKeywords.map((rk: any, i: number) => (
                          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl ${isDark ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
                            <span className={`text-xs font-mono font-bold flex-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{rk.keyword}</span>
                            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{rk.review_freq} reviews</span>
                            {rk.in_competitors > 0 && (
                              <span className={`text-[10px] border px-1.5 py-0.5 rounded font-semibold ${isDark ? 'text-sky-400 bg-sky-900/30 border-sky-800/50' : 'text-sky-600 bg-sky-50 border-sky-200'}`}>
                                {rk.in_competitors} comp
                              </span>
                            )}
                            <PriorityPill priority={rk.priority} isDark={isDark} />
                          </div>
                        ))}
                      </div>
                    ) : isPremium ? (
                      <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No review-specific keywords found.</p>
                    ) : (
                      <div className="space-y-2">
                        {["fast delivery", "works great", "easy setup", "good value", "highly recommend"].map((kw, i) => (
                          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl ${isDark ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
                            <span className={`text-xs font-mono font-bold flex-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{kw}</span>
                            <PriorityPill priority={i < 2 ? "High" : "Medium"} isDark={isDark} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI opportunity scores */}
              <div className={`relative rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {!isPremium && <TierGate tier="premium" feature="AI Keyword Opportunity Scores" isDark={isDark} />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AI Keyword Opportunity Scores</span>
                  </div>
                  <div className="px-5 pb-5 pt-3">
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                      AI-ranked by opportunity value (1–10). Includes placement advice — where to add each keyword.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <PlacementBadge placement="title" isDark={isDark} />
                      <PlacementBadge placement="bullets" isDark={isDark} />
                      <PlacementBadge placement="backend" isDark={isDark} />
                    </div>
                    {aiScores.length > 0 ? (
                      aiScores.map((s: any, i: number) => (
                        <OpportunityBar key={i} score={s.score} keyword={s.keyword} reason={s.reason} add_to={s.add_to} is_spec={s.is_spec} isDark={isDark} />
                      ))
                    ) : isPremium ? (
                      <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>AI scoring not available — no gap keywords found.</p>
                    ) : (
                      [{ score: 9, keyword: "high speed", reason: "Used by 4/5 competitors; core search term", add_to: "title" },
                       { score: 8, keyword: "class 10",   reason: "Specification term buyers search directly", add_to: "title" },
                       { score: 6, keyword: "waterproof", reason: "Feature differentiator", add_to: "bullets" }].map((s, i) => (
                        <OpportunityBar key={i} {...s} isDark={isDark} />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* AI listing rewrite */}
              <div className={`relative rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {!isPremium && <TierGate tier="premium" feature="AI Listing Rewrite Suggestion" isDark={isDark} />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AI-Suggested Title Rewrite</span>
                  </div>
                  <div className="px-5 pb-5 pt-4">
                    {data.ai_listing_rewrite ? (
                      <>
                        <div className="mb-3">
                          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Title</p>
                          <p className={`text-sm rounded-xl px-4 py-3 border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>{data.product_title}</p>
                        </div>
                        <ArrowRight className={`w-4 h-4 mx-auto my-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-violet-400' : 'text-violet-500'}`}>AI Suggested Title</p>
                          <p className={`text-sm font-semibold rounded-xl px-4 py-3 border leading-relaxed ${isDark ? 'bg-violet-900/20 border-violet-800/50 text-slate-200' : 'bg-violet-50 border-violet-200 text-slate-800'}`}>
                            {data.ai_listing_rewrite}
                          </p>
                        </div>
                        <p className={`text-[10px] mt-3 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Info className="w-3 h-3" /> Always verify this complies with Amazon's title policy before using.
                        </p>
                      </>
                    ) : isPremium ? (
                      <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rewrite not available — insufficient gap data.</p>
                    ) : (
                      <div>
                        <div className="mb-3">
                          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Title</p>
                          <p className={`text-sm rounded-xl px-4 py-3 border line-clamp-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>{data.product_title}</p>
                        </div>
                        <ArrowRight className={`w-4 h-4 mx-auto my-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-violet-400' : 'text-violet-500'}`}>AI Suggested Title</p>
                          <p className={`text-sm font-semibold rounded-xl px-4 py-3 border blur-sm select-none ${isDark ? 'bg-violet-900/20 border-violet-800/50 text-slate-400' : 'bg-violet-50 border-violet-100 text-slate-400'}`}>
                            SANDISK 64GB Extreme PRO SDXC Memory Card High Speed Class 10 U3 V30 4K UHD Waterproof — SDSDXXU-064G
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action plan */}
              <div className={`relative rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {!isPremium && <TierGate tier="premium" feature="AI Prioritised Action Plan" isDark={isDark} />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                      <Target className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Prioritised Action Plan</span>
                  </div>
                  <div className="px-5 pb-5 pt-4">
                    {actionPlan.length > 0 ? (
                      <div className="space-y-3">
                        {actionPlan.map((step: string, i: number) => (
                          <div key={i} className={`flex items-start gap-3 p-3 border rounded-xl ${isDark ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-black text-white">{i + 1}</span>
                            </div>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{step}</p>
                          </div>
                        ))}
                      </div>
                    ) : isPremium ? (
                      <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Action plan not available.</p>
                    ) : (
                      <div className="space-y-3">
                        {[
                          "Add high-priority gap keywords to your title: \"high speed\", \"class 10\", \"4k uhd\"",
                          "Use backend search terms in Seller Central for keywords that don't fit the title",
                          "Keep your differentiators — they are unique to your listing",
                        ].map((step, i) => (
                          <div key={i} className={`flex items-start gap-3 p-3 border rounded-xl ${isDark ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-black text-white">{i + 1}</span>
                            </div>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upgrade CTA */}
              {!isPremium && (
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-base">Unlock Full Keyword Intelligence</p>
                    <p className="text-blue-100 text-sm mt-0.5">
                      {!isBasic
                        ? "Get gap keywords, semantic clusters, coverage score & heatmap — Basic · ₹1,999/mo"
                        : "Get AI opportunity scores, listing rewrite, placement advice & action plan — Premium · ₹2,999/mo"}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {(!isBasic
                        ? ["Gap keywords", "Semantic clusters", "Coverage score", "Keyword heatmap"]
                        : ["AI opportunity scores", "Placement advice", "Listing rewrite", "Action plan"]
                      ).map((f) => (
                        <span key={f} className="flex items-center gap-1 text-xs text-blue-100">
                          <CheckCircle className="w-3 h-3 text-blue-200" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => router.push("/subscription")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all flex-shrink-0">
                    <Crown className="w-4 h-4" /> Upgrade Now
                  </button>
                </div>
              )}
            </>
          )}
        </main>
    </div>
  );
}

export default function KeywordGapAnalysisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <KeywordGapContent />
    </Suspense>
  );
}
